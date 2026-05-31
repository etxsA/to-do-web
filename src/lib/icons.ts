import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Dumbbell,
  Flag,
  GraduationCap,
  Heart,
  Home,
  ListTodo,
  Plane,
  ShoppingCart,
  Star,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { Icon } from '@/types/api'

/** Backend icon catalog (androidName) → lucide component. */
const BY_ANDROID: Record<string, LucideIcon> = {
  home: Home,
  work: Briefcase,
  school: GraduationCap,
  shopping_cart: ShoppingCart,
  favorite: Heart,
  star: Star,
  calendar_today: Calendar,
  schedule: Clock,
  notifications: Bell,
  flag: Flag,
  fitness_center: Dumbbell,
  menu_book: BookOpen,
  restaurant: Utensils,
  flight: Plane,
  attach_money: DollarSign,
}

/** Resolve a backend Icon to a lucide component, with a safe fallback. */
export function iconComponent(icon?: Icon): LucideIcon {
  if (!icon) return ListTodo
  return BY_ANDROID[icon.androidName] ?? ListTodo
}
