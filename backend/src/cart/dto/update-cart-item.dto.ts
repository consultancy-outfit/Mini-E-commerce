import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, minimum: 0, description: 'Set to 0 to remove the item' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity: number;
}
