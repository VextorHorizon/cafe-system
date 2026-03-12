import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuItem } from './menu.schema';

const mockMenuItem = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Latte',
  price: 65,
  category: 'coffee',
  isActive: true,
  createdAt: new Date(),
};

const mockMenuItemModel = {
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getModelToken(MenuItem.name),
          useValue: Object.assign(
            jest.fn().mockImplementation(() => ({
              save: jest.fn().mockResolvedValue(mockMenuItem),
            })),
            mockMenuItemModel,
          ),
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    jest.clearAllMocks();
  });

  // --- findAll ---

  describe('findAll', () => {
    it('should return active menu items only', async () => {
      mockMenuItemModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockMenuItem]) });
      const result = await service.findAll();
      expect(mockMenuItemModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual([mockMenuItem]);
    });

    it('should return empty array when no active items', async () => {
      mockMenuItemModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  // --- create ---

  describe('create', () => {
    it('should create and return a new menu item', async () => {
      const dto = { name: 'Latte', price: 65, category: 'coffee' as const };
      const result = await service.create(dto);
      expect(result).toEqual(mockMenuItem);
    });
  });

  // --- update ---

  describe('update', () => {
    it('should update and return the updated menu item', async () => {
      const updated = { ...mockMenuItem, name: 'Oat Latte' };
      mockMenuItemModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });
      const result = await service.update(mockMenuItem._id, { name: 'Oat Latte' });
      expect(mockMenuItemModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMenuItem._id,
        { name: 'Oat Latte' },
        { new: true },
      );
      expect(result.name).toBe('Oat Latte');
    });

    it('should throw NotFoundException when item not found', async () => {
      mockMenuItemModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // --- remove ---

  describe('remove', () => {
    it('should delete and return the deleted menu item', async () => {
      mockMenuItemModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMenuItem),
      });
      const result = await service.remove(mockMenuItem._id);
      expect(mockMenuItemModel.findByIdAndDelete).toHaveBeenCalledWith(mockMenuItem._id);
      expect(result).toEqual(mockMenuItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      mockMenuItemModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
