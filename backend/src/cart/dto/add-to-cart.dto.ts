import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: '6a42929a224bbb761a132485', description: 'MongoDB ObjectId' })
  @IsString()
  @Matches(/^[a-f\d]{24}$/i, { message: 'productId must be a valid MongoDB ObjectId' })
  productId: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number = 1;
}
