import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../generated/prisma';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
