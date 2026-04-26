export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  subcategory?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  allergens?: string[];
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  extras?: string[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  total: number;
  tax: number;
  createdAt: Date;
  specialInstructions?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  currentOrder?: Order;
  position: { x: number; y: number };
  area: 'terrace' | 'indoor';
}

export type Category = 'vorspeisen' | 'hauptgerichte' | 'desserts' | 'getraenke' | 'znueni-zmittag';

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'vorspeisen', name: 'Vorspeisen', icon: 'Salad', description: 'Frische Salate & Suppen' },
  { id: 'hauptgerichte', name: 'Hauptgerichte', icon: 'ChefHat', description: 'Herzhafte Spezialitäten' },
  { id: 'desserts', name: 'Desserts', icon: 'IceCream', description: 'Süsse Verführungen' },
  { id: 'getraenke', name: 'Getränke', icon: 'GlassWater', description: 'Erfrischende Drinks' },
  { id: 'znueni-zmittag', name: 'Znüni & Zmittag', icon: 'Coffee', description: 'Zwischenmahlzeiten' },
];
