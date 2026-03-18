import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderCleanupService } from './order-cleanup.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderCleanupService: OrderCleanupService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, dto);
  }

  @Get('summary')
  getSummary() {
    return this.orderService.getSummary();
  }

  /**
   * Manual trigger for order cleanup.
   * Deletes all orders older than 3 days.
   * Useful for testing the cleanup logic without waiting for the cron schedule.
   */
  @Delete('cleanup')
  async cleanup() {
    const deletedCount = await this.orderCleanupService.handleOrderCleanup();
    return { deletedCount };
  }
}
