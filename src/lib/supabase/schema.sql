create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  description text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  cook_time_minutes int,
  servings int,
  image_path text,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recipe_tags (
  recipe_id uuid not null references recipes(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create table if not exists recipe_favorites (
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, user_id)
);

create table if not exists recipe_events (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('cooked', 'viewed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  invite_code text not null unique,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists recipes_household_updated_idx
  on recipes (household_id, updated_at desc);

create index if not exists recipes_household_category_idx
  on recipes (household_id, category_id);

create index if not exists recipe_events_recipe_created_idx
  on recipe_events (recipe_id, created_at desc);

create index if not exists recipe_events_user_created_idx
  on recipe_events (user_id, created_at desc);

create index if not exists tags_household_name_idx
  on tags (household_id, name);

alter table households enable row level security;
alter table household_members enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table recipes enable row level security;
alter table recipe_tags enable row level security;
alter table recipe_favorites enable row level security;
alter table recipe_events enable row level security;
alter table household_invites enable row level security;

create or replace function is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from household_members
    where household_id = target_household_id
      and user_id = auth.uid()
  );
$$;

drop policy if exists "members can read recipes" on recipes;
create policy "members can read recipes"
  on recipes for select
  using (is_household_member(household_id));

drop policy if exists "members can create recipes" on recipes;
create policy "members can create recipes"
  on recipes for insert
  with check (is_household_member(household_id) and created_by = auth.uid());

drop policy if exists "members can update recipes" on recipes;
create policy "members can update recipes"
  on recipes for update
  using (is_household_member(household_id));

drop policy if exists "members can delete recipes" on recipes;
create policy "members can delete recipes"
  on recipes for delete
  using (is_household_member(household_id));
