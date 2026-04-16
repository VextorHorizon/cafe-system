import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { MenuItem, MenuItemDocument } from '../menu/menu.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const orderItems = [];
    let totalPrice = 0;

    for (const item of createOrderDto.items) {
      const menuItem = await this.menuItemModel
        .findOne({ _id: item.menuItemId, isActive: true })
        .exec();

      if (!menuItem) {
        throw new NotFoundException(
          `Menu item "${item.menuItemId}" not found or unavailable`,
        );
      }

      // Snapshot name and price from DB — never trust client
      const unitPrice = menuItem.price;
      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice,
      });

      totalPrice += item.quantity * unitPrice;
    }

    const order = new this.orderModel({
      items: orderItems,
      totalPrice,
      source: null,
    });

    return order.save();
  }

  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderDocument> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .exec();

    if (!order) throw new NotFoundException(`Order "${id}" not found`);
    return order;
  }

  async getSummary() {
    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );

    return {
      totalOrders,
      totalRevenue,
      orders,
    };
  }
}
