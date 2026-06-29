import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Over-ear noise-cancelling headphones with 30h battery.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 79.99, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://example.com/headphones.jpg' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @MinLength(2)
  category: string;

  @ApiProperty({ example: 50, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;
}
