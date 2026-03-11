import { IsString, IsNotEmpty, IsNumber, Min, IsIn } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsIn(['coffee', 'tea', 'other'])
  category: string;
}
