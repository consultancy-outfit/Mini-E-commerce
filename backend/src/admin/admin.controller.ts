import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  @ApiOperation({ summary: '[Admin] List all orders across all users' })
  @ApiResponse({ status: 200, description: 'All orders with items' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  @ApiResponse({ status: 403, description: 'Forbidden â€” admin only' })
  findAllOrders() {
    return this.adminService.findAllOrders();
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: '[Admin] Update the status of an order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Updated order' })
  @ApiResponse({ status: 403, description: 'Forbidden â€” admin only' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, dto);
  }

  @Get('analytics')
  @ApiOperation({ summary: '[Admin] Sales analytics â€” revenue, orders, top products' })
  @ApiResponse({ status: 200, description: 'Analytics summary' })
  @ApiResponse({ status: 403, description: 'Forbidden â€” admin only' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
