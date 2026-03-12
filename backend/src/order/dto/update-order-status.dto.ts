import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['unfinished', 'finished'])
  status: 'unfinished' | 'finished';
}
