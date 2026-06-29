import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  imageUrl: string;

  @IsString()
  @MinLength(2)
  category: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;
}
