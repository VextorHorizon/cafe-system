import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsMongoId,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class OrderItemDto {
  @IsMongoId()
  menuItemId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
