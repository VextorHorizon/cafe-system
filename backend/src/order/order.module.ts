import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { OrderService } from './order.service';
import { OrderCleanupService } from './order-cleanup.service';
import { OrderController } from './order.controller';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MenuModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderCleanupService],
})
export class OrderModule {}
