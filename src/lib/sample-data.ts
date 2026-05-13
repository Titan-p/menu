import type { ComponentType } from "react";
import {
  Beef,
  Carrot,
  Clock3,
  FlameKindling,
  Leaf,
  Soup,
  Star,
  Wheat,
} from "lucide-react";

export type Recipe = {
  id: string;
  title: string;
  category: string;
  cookTime: string;
  difficulty: string;
  image: string;
  imageAlt: string;
  ingredients: string[];
  tags: string[];
  lastCooked: string;
  note: string;
};

export type Category = {
  name: string;
  count: number;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

export const featuredRecipe: Recipe = {
  id: "tomato-beef",
  title: "番茄牛腩",
  category: "家常菜",
  cookTime: "55 分钟",
  difficulty: "中等",
  image:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "一锅番茄炖牛肉",
  ingredients: ["牛腩", "番茄", "土豆", "洋葱"],
  tags: ["下饭", "周末", "炖菜"],
  lastCooked: "18 天前",
  note: "酸甜开胃，适合配米饭，第二天带饭口感稳定。",
};

export const recipes: Recipe[] = [
  featuredRecipe,
  {
    id: "shrimp-egg",
    title: "虾仁滑蛋",
    category: "快手菜",
    cookTime: "12 分钟",
    difficulty: "简单",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    imageAlt: "盛在碗里的鸡蛋米饭料理",
    ingredients: ["虾仁", "鸡蛋", "小葱"],
    tags: ["高蛋白", "儿童", "快手"],
    lastCooked: "6 天前",
    note: "蛋液加少量水淀粉，口感更嫩。",
  },
  {
    id: "mushroom-noodle",
    title: "菌菇汤面",
    category: "主食",
    cookTime: "20 分钟",
    difficulty: "简单",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
    imageAlt: "一碗热汤面",
    ingredients: ["挂面", "香菇", "青菜", "鸡蛋"],
    tags: ["早餐", "清淡", "汤面"],
    lastCooked: "11 天前",
    note: "适合早上和下雨天，汤底可用昨晚高汤。",
  },
  {
    id: "air-fryer-chicken",
    title: "空气炸锅鸡腿",
    category: "便当",
    cookTime: "28 分钟",
    difficulty: "简单",
    image:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "烤鸡腿与配菜",
    ingredients: ["鸡腿", "土豆", "甜椒"],
    tags: ["空气炸锅", "少油", "便当"],
    lastCooked: "23 天前",
    note: "提前腌制一晚，第二天直接进炸锅。",
  },
];

export const categories: Category[] = [
  { name: "家常菜", count: 18, icon: Soup, tone: "bg-emerald-100 text-emerald-800" },
  { name: "快手菜", count: 12, icon: Clock3, tone: "bg-sky-100 text-sky-800" },
  { name: "主食", count: 9, icon: Wheat, tone: "bg-amber-100 text-amber-800" },
  { name: "便当", count: 7, icon: Beef, tone: "bg-rose-100 text-rose-800" },
  { name: "轻食", count: 6, icon: Leaf, tone: "bg-lime-100 text-lime-800" },
  { name: "清库存", count: 5, icon: Carrot, tone: "bg-orange-100 text-orange-800" },
];

export const quickFilters = [
  "20 分钟内",
  "下饭",
  "儿童爱吃",
  "少油",
  "冰箱清库存",
  "早餐",
];

export const stats = [
  { label: "菜谱", value: "57" },
  { label: "分类", value: "8" },
  { label: "本月做过", value: "16" },
];

export const navItems = [
  { label: "灵感", icon: FlameKindling },
  { label: "菜谱", icon: Soup },
  { label: "收藏", icon: Star },
  { label: "分类", icon: Carrot },
];
