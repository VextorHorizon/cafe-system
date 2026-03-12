/**
 * API / Integration Tests
 * Uses supertest against the live backend on http://localhost:3001
 * Requires: backend running (npm run start:dev)
 */
import supertest from 'supertest';

const api = supertest('http://localhost:3001');

// IDs created during this test run — cleaned up at end
const createdMenuIds: string[] = [];
const createdOrderIds: string[] = [];

describe('Menu API', () => {
  // --- GET /menu ---

  describe('GET /menu', () => {
    it('should return 200 with an array', async () => {
      const res = await api.get('/menu');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should only return isActive: true items', async () => {
      const res = await api.get('/menu');
      expect(res.body.every((item: { isActive: boolean }) => item.isActive === true)).toBe(true);
    });

    it('each item should have required fields', async () => {
      const res = await api.get('/menu');
      if (res.body.length > 0) {
        const item = res.body[0];
        expect(item).toHaveProperty('_id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('isActive');
      }
    });
  });

  // --- POST /menu ---

  describe('POST /menu', () => {
    it('should create a menu item and return 201', async () => {
      const res = await api.post('/menu').send({
        name: 'Test Coffee',
        price: 55,
        category: 'coffee',
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Coffee');
      expect(res.body.price).toBe(55);
      expect(res.body.category).toBe('coffee');
      expect(res.body.isActive).toBe(true);
      createdMenuIds.push(res.body._id);
    });

    it('should reject invalid category with 400', async () => {
      const res = await api.post('/menu').send({
        name: 'Bad Item',
        price: 10,
        category: 'invalid_category',
      });
      expect(res.status).toBe(400);
    });

    it('should reject missing name with 400', async () => {
      const res = await api.post('/menu').send({ price: 10, category: 'coffee' });
      expect(res.status).toBe(400);
    });

    it('should reject negative price with 400', async () => {
      const res = await api.post('/menu').send({ name: 'X', price: -1, category: 'coffee' });
      expect(res.status).toBe(400);
    });
  });

  // --- PATCH /menu/:id ---

  describe('PATCH /menu/:id', () => {
    it('should update a menu item', async () => {
      const create = await api.post('/menu').send({ name: 'To Update', price: 30, category: 'tea' });
      createdMenuIds.push(create.body._id);

      const res = await api.patch(`/menu/${create.body._id}`).send({ price: 45 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(45);
      expect(res.body.name).toBe('To Update');
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await api.patch('/menu/000000000000000000000000').send({ price: 10 });
      expect(res.status).toBe(404);
    });
  });

  // --- DELETE /menu/:id ---

  describe('DELETE /menu/:id', () => {
    it('should delete a menu item and return it', async () => {
      const create = await api.post('/menu').send({ name: 'To Delete', price: 20, category: 'other' });
      const res = await api.delete(`/menu/${create.body._id}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(create.body._id);
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await api.delete('/menu/000000000000000000000000');
      expect(res.status).toBe(404);
    });
  });
});

describe('Orders API', () => {
  let testMenuId: string;

  beforeAll(async () => {
    const res = await api.post('/menu').send({ name: 'Order Test Item', price: 50, category: 'coffee' });
    testMenuId = res.body._id;
    createdMenuIds.push(testMenuId);
  });

  // --- POST /orders ---

  describe('POST /orders', () => {
    it('should create an order and calculate totalPrice server-side', async () => {
      const res = await api.post('/orders').send({
        items: [{ menuItemId: testMenuId, quantity: 2 }],
      });
      expect(res.status).toBe(201);
      expect(res.body.totalPrice).toBe(100); // 50 * 2
      expect(res.body.items[0].unitPrice).toBe(50);
      expect(res.body.items[0].name).toBe('Order Test Item');
      expect(res.body.status).toBe('unfinished');
      createdOrderIds.push(res.body._id);
    });

    it('should snapshot name and price from DB, not from client', async () => {
      const res = await api.post('/orders').send({
        items: [{ menuItemId: testMenuId, quantity: 1 }],
      });
      expect(res.status).toBe(201);
      expect(res.body.items[0].name).toBe('Order Test Item');
      expect(res.body.items[0].unitPrice).toBe(50);
      createdOrderIds.push(res.body._id);
    });

    it('should reject invalid menuItemId with 404', async () => {
      const res = await api.post('/orders').send({
        items: [{ menuItemId: '000000000000000000000000', quantity: 1 }],
      });
      expect(res.status).toBe(404);
    });

    it('should reject quantity = 0 with 400', async () => {
      const res = await api.post('/orders').send({
        items: [{ menuItemId: testMenuId, quantity: 0 }],
      });
      expect(res.status).toBe(400);
    });

    it('should reject quantity > 20 with 400', async () => {
      const res = await api.post('/orders').send({
        items: [{ menuItemId: testMenuId, quantity: 21 }],
      });
      expect(res.status).toBe(400);
    });

    it('should reject empty items array with 400', async () => {
      const res = await api.post('/orders').send({ items: [] });
      expect(res.status).toBe(400);
    });
  });

  // --- GET /orders ---

  describe('GET /orders', () => {
    it('should return 200 with an array', async () => {
      const res = await api.get('/orders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('each order should have required fields including status', async () => {
      const res = await api.get('/orders');
      if (res.body.length > 0) {
        const order = res.body[0];
        expect(order).toHaveProperty('_id');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('totalPrice');
        expect(order).toHaveProperty('status');
        expect(['finished', 'unfinished']).toContain(order.status);
      }
    });
  });

  // --- PATCH /orders/:id/status ---

  describe('PATCH /orders/:id/status', () => {
    let orderId: string;

    beforeAll(async () => {
      const res = await api.post('/orders').send({
        items: [{ menuItemId: testMenuId, quantity: 1 }],
      });
      orderId = res.body._id;
      createdOrderIds.push(orderId);
    });

    it('should update status to finished', async () => {
      const res = await api.patch(`/orders/${orderId}/status`).send({ status: 'finished' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('finished');
    });

    it('should toggle back to unfinished', async () => {
      const res = await api.patch(`/orders/${orderId}/status`).send({ status: 'unfinished' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('unfinished');
    });

    it('should reject invalid status value with 400', async () => {
      const res = await api.patch(`/orders/${orderId}/status`).send({ status: 'pending' });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await api.patch('/orders/000000000000000000000000/status').send({ status: 'finished' });
      expect(res.status).toBe(404);
    });
  });

  // --- GET /orders/summary ---

  describe('GET /orders/summary', () => {
    it('should return totalOrders, totalRevenue, and orders array', async () => {
      const res = await api.get('/orders/summary');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalOrders');
      expect(res.body).toHaveProperty('totalRevenue');
      expect(res.body).toHaveProperty('orders');
      expect(typeof res.body.totalOrders).toBe('number');
      expect(typeof res.body.totalRevenue).toBe('number');
      expect(Array.isArray(res.body.orders)).toBe(true);
    });

    it('totalRevenue should equal sum of all order totalPrices', async () => {
      const summary = await api.get('/orders/summary');
      const orders = await api.get('/orders');
      const expected = orders.body.reduce((sum: number, o: { totalPrice: number }) => sum + o.totalPrice, 0);
      expect(summary.body.totalRevenue).toBe(expected);
    });
  });

  // --- Cleanup ---

  afterAll(async () => {
    for (const id of createdMenuIds) {
      await api.delete(`/menu/${id}`).catch(() => {});
    }
  });
});
