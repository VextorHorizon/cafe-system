import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.schema';
import { MenuItem } from '../menu/menu.schema';

const mockMenuItemCoffee = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Latte',
  price: 65,
  category: 'coffee',
  isActive: true,
};

const mockMenuItemTea = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Green Tea',
  price: 40,
  category: 'tea',
  isActive: true,
};

const mockOrder = {
  _id: '507f1f77bcf86cd799439099',
  items: [{ menuItemId: mockMenuItemCoffee._id, name: 'Latte', quantity: 2, unitPrice: 65 }],
  totalPrice: 130,
  source: null,
  status: 'unfinished',
  createdAt: new Date(),
};

const mockOrderModel = {
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockMenuItemModel = {
  findOne: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getModelToken(Order.name),
          useValue: Object.assign(
            jest.fn().mockImplementation(() => ({
              save: jest.fn().mockResolvedValue(mockOrder),
            })),
            mockOrderModel,
          ),
        },
        {
          provide: getModelToken(MenuItem.name),
          useValue: mockMenuItemModel,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  // --- create ---

  describe('create', () => {
    it('should snapshot price from DB and calculate totalPrice correctly (single item)', async () => {
      mockMenuItemModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItemCoffee),
      });
      const result = await service.create({
        items: [{ menuItemId: mockMenuItemCoffee._id, quantity: 2 }],
      });
      // totalPrice = 65 * 2 = 130
      expect(result.totalPrice).toBe(130);
    });

    it('should calculate totalPrice for multiple items', async () => {
      mockMenuItemModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockMenuItemCoffee) }) // 65
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockMenuItemTea) });   // 40

      const savedOrder = {
        ...mockOrder,
        items: [
          { menuItemId: mockMenuItemCoffee._id, name: 'Latte', quantity: 1, unitPrice: 65 },
          { menuItemId: mockMenuItemTea._id, name: 'Green Tea', quantity: 3, unitPrice: 40 },
        ],
        totalPrice: 185, // 65*1 + 40*3
      };

      // override save mock for this test
      const module = await Test.createTestingModule({
        providers: [
          OrderService,
          {
            provide: getModelToken(Order.name),
            useValue: Object.assign(
              jest.fn().mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(savedOrder),
              })),
              mockOrderModel,
            ),
          },
          { provide: getModelToken(MenuItem.name), useValue: mockMenuItemModel },
        ],
      }).compile();
      const svc = module.get<OrderService>(OrderService);

      const result = await svc.create({
        items: [
          { menuItemId: mockMenuItemCoffee._id, quantity: 1 },
          { menuItemId: mockMenuItemTea._id, quantity: 3 },
        ],
      });
      expect(result.totalPrice).toBe(185);
    });

    it('should throw NotFoundException when menuItemId does not exist', async () => {
      mockMenuItemModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.create({ items: [{ menuItemId: 'nonexistent', quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when menu item is inactive', async () => {
      mockMenuItemModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.create({ items: [{ menuItemId: mockMenuItemCoffee._id, quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
      expect(mockMenuItemModel.findOne).toHaveBeenCalledWith({
        _id: mockMenuItemCoffee._id,
        isActive: true,
      });
    });
  });

  // --- findAll ---

  describe('findAll', () => {
    it('should return all orders sorted by newest first', async () => {
      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockOrder]) }),
      });
      const result = await service.findAll();
      expect(mockOrderModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockOrder]);
    });
  });

  // --- updateStatus ---

  describe('updateStatus', () => {
    it('should update status to finished', async () => {
      const updated = { ...mockOrder, status: 'finished' };
      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });
      const result = await service.updateStatus(mockOrder._id, { status: 'finished' });
      expect(mockOrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrder._id,
        { status: 'finished' },
        { new: true },
      );
      expect(result.status).toBe('finished');
    });

    it('should update status to unfinished', async () => {
      const updated = { ...mockOrder, status: 'unfinished' };
      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });
      const result = await service.updateStatus(mockOrder._id, { status: 'unfinished' });
      expect(result.status).toBe('unfinished');
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(
        service.updateStatus('nonexistent', { status: 'finished' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- getSummary ---

  describe('getSummary', () => {
    it('should return totalOrders, totalRevenue, and orders', async () => {
      const orders = [
        { ...mockOrder, totalPrice: 130 },
        { ...mockOrder, _id: 'id2', totalPrice: 80 },
      ];
      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(orders) }),
      });
      const result = await service.getSummary();
      expect(result.totalOrders).toBe(2);
      expect(result.totalRevenue).toBe(210); // 130 + 80
      expect(result.orders).toHaveLength(2);
    });

    it('should return zeros when no orders exist', async () => {
      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      });
      const result = await service.getSummary();
      expect(result.totalOrders).toBe(0);
      expect(result.totalRevenue).toBe(0);
    });
  });
});
