import type {
  MenuItem,
  Order,
  OrderSummary,
  OrderStatus,
  CreateMenuPayload,
  UpdateMenuPayload,
  CreateOrderPayload,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`API error ${res.status}: ${body}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`fetch ${path} error:`, error);
    throw error;
  }
}

// --- Menu ---

export async function fetchMenu(): Promise<MenuItem[]> {
  return request<MenuItem[]>('/menu');
}

export async function createMenu(payload: CreateMenuPayload): Promise<MenuItem> {
  return request<MenuItem>('/menu', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMenu(id: string, payload: UpdateMenuPayload): Promise<MenuItem> {
  return request<MenuItem>(`/menu/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteMenu(id: string): Promise<MenuItem> {
  return request<MenuItem>(`/menu/${id}`, { method: 'DELETE' });
}

// --- Orders ---

export async function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/orders');
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return request<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchOrderSummary(): Promise<OrderSummary> {
  return request<OrderSummary>('/orders/summary');
}
