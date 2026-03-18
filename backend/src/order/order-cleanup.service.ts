import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderCleanupService {
  private readonly logger = new Logger(OrderCleanupService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Automatically delete orders older than 3 days.
   * Runs every night at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOrderCleanup(): Promise<number> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    this.logger.log(
      `Running order cleanup — deleting orders older than ${threeDaysAgo.toISOString()}`,
    );

    const result = await this.orderModel.deleteMany({
      createdAt: { $lt: threeDaysAgo },
    });

    const deletedCount = result.deletedCount ?? 0;
    this.logger.log(`Order cleanup complete — deleted ${deletedCount} orders`);

    return deletedCount;
  }
}
