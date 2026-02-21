import {
  Globe, Mail, Landmark, ShoppingBag, Briefcase, Gamepad2, Key,
  Home, GraduationCap, Heart, Car, Plane, Music, Smartphone, Laptop,
  Monitor, Camera, Film, BookOpen, Utensils, Coffee, Dumbbell, Trophy,
  Palette, Lock, CreditCard, FileText, FolderOpen, ShoppingCart, MessageCircle,
  Phone, Earth, Building2, Gift, Lightbulb, Wrench, BarChart3, Target,
  Star, Shield, Wifi, Cloud, Database, Headphones, Tv, Rocket,
} from 'lucide-react';

export const ICON_MAP = {
  Globe, Mail, Landmark, ShoppingBag, Briefcase, Gamepad2, Key,
  Home, GraduationCap, Heart, Car, Plane, Music, Smartphone, Laptop,
  Monitor, Camera, Film, BookOpen, Utensils, Coffee, Dumbbell, Trophy,
  Palette, Lock, CreditCard, FileText, FolderOpen, ShoppingCart, MessageCircle,
  Phone, Earth, Building2, Gift, Lightbulb, Wrench, BarChart3, Target,
  Star, Shield, Wifi, Cloud, Database, Headphones, Tv, Rocket,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function getIconComponent(name) {
  return ICON_MAP[name] || Key;
}
