import { IsString, IsNotEmpty, IsNumber, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsIn(['coffee', 'tea', 'other'])
  category: string;
}
