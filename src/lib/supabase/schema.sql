create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id),
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
  created_by uuid references auth.users(id),
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

alter table households alter column created_by drop not null;
alter table recipes alter column created_by drop not null;

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

create or replace function is_household_owner(target_household_id uuid)
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
      and role = 'owner'
  );
$$;

create or replace function create_household(household_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  insert into households (name, created_by)
  values (household_name, auth.uid())
  returning id into new_household_id;

  insert into household_members (household_id, user_id, role)
  values (new_household_id, auth.uid(), 'owner');

  return new_household_id;
end;
$$;

create or replace function join_household(invite text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
begin
  select household_id into target_household_id
  from household_invites
  where invite_code = invite
    and (expires_at is null or expires_at > now())
  limit 1;

  if target_household_id is null then
    raise exception 'invalid invite code';
  end if;

  insert into household_members (household_id, user_id, role)
  values (target_household_id, auth.uid(), 'member')
  on conflict (household_id, user_id) do update
    set role = household_members.role;

  return target_household_id;
end;
$$;

drop policy if exists "members can read households" on households;
create policy "members can read households"
  on households for select
  using (is_household_member(id));

drop policy if exists "users can create households" on households;
create policy "users can create households"
  on households for insert
  with check (created_by = auth.uid());

drop policy if exists "owners can update households" on households;
create policy "owners can update households"
  on households for update
  using (is_household_owner(id));

drop policy if exists "owners can delete households" on households;
create policy "owners can delete households"
  on households for delete
  using (is_household_owner(id));

drop policy if exists "members can read household members" on household_members;
create policy "members can read household members"
  on household_members for select
  using (is_household_member(household_id));

drop policy if exists "owners can manage household members" on household_members;
create policy "owners can manage household members"
  on household_members for all
  using (is_household_owner(household_id))
  with check (is_household_owner(household_id));

drop policy if exists "members can read categories" on categories;
create policy "members can read categories"
  on categories for select
  using (is_household_member(household_id));

drop policy if exists "members can create categories" on categories;
create policy "members can create categories"
  on categories for insert
  with check (is_household_member(household_id));

drop policy if exists "members can update categories" on categories;
create policy "members can update categories"
  on categories for update
  using (is_household_member(household_id));

drop policy if exists "members can delete categories" on categories;
create policy "members can delete categories"
  on categories for delete
  using (is_household_member(household_id));

drop policy if exists "members can read tags" on tags;
create policy "members can read tags"
  on tags for select
  using (is_household_member(household_id));

drop policy if exists "members can create tags" on tags;
create policy "members can create tags"
  on tags for insert
  with check (is_household_member(household_id));

drop policy if exists "members can update tags" on tags;
create policy "members can update tags"
  on tags for update
  using (is_household_member(household_id));

drop policy if exists "members can delete tags" on tags;
create policy "members can delete tags"
  on tags for delete
  using (is_household_member(household_id));

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

drop policy if exists "members can read recipe tags" on recipe_tags;
create policy "members can read recipe tags"
  on recipe_tags for select
  using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_tags.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "members can create recipe tags" on recipe_tags;
create policy "members can create recipe tags"
  on recipe_tags for insert
  with check (
    exists (
      select 1 from recipes
      where recipes.id = recipe_tags.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "members can delete recipe tags" on recipe_tags;
create policy "members can delete recipe tags"
  on recipe_tags for delete
  using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_tags.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "users can read own favorites" on recipe_favorites;
create policy "users can read own favorites"
  on recipe_favorites for select
  using (
    user_id = auth.uid()
    and exists (
      select 1 from recipes
      where recipes.id = recipe_favorites.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "users can create own favorites" on recipe_favorites;
create policy "users can create own favorites"
  on recipe_favorites for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from recipes
      where recipes.id = recipe_favorites.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "users can delete own favorites" on recipe_favorites;
create policy "users can delete own favorites"
  on recipe_favorites for delete
  using (user_id = auth.uid());

drop policy if exists "members can read recipe events" on recipe_events;
create policy "members can read recipe events"
  on recipe_events for select
  using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_events.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "users can create own recipe events" on recipe_events;
create policy "users can create own recipe events"
  on recipe_events for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from recipes
      where recipes.id = recipe_events.recipe_id
        and is_household_member(recipes.household_id)
    )
  );

drop policy if exists "owners can read invites" on household_invites;
create policy "owners can read invites"
  on household_invites for select
  using (is_household_owner(household_id));

drop policy if exists "owners can create invites" on household_invites;
create policy "owners can create invites"
  on household_invites for insert
  with check (is_household_owner(household_id) and created_by = auth.uid());

drop policy if exists "owners can delete invites" on household_invites;
create policy "owners can delete invites"
  on household_invites for delete
  using (is_household_owner(household_id));

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', false)
on conflict (id) do nothing;

drop policy if exists "members can read recipe images" on storage.objects;
create policy "members can read recipe images"
  on storage.objects for select
  using (
    bucket_id = 'recipe-images'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "members can upload recipe images" on storage.objects;
create policy "members can upload recipe images"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "members can delete recipe images" on storage.objects;
create policy "members can delete recipe images"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-images'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );
