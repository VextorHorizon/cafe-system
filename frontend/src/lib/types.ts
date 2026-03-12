export type Category = 'coffee' | 'tea' | 'other';

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: Category;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'unfinished' | 'finished';

export interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  source: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  orders: Order[];
}

export interface CreateMenuPayload {
  name: string;
  price: number;
  category: Category;
}

// isActive intentionally excluded — backend UpdateMenuDto rejects it (forbidNonWhitelisted)
export interface UpdateMenuPayload {
  name?: string;
  price?: number;
  category?: Category;
}

export interface CreateOrderPayload {
  items: { menuItemId: string; quantity: number }[];
}
