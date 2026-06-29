import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type JwtPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's cart" })
  @ApiResponse({ status: 200, description: 'Cart with items' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  getCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart (increments quantity if already present)' })
  @ApiResponse({ status: 201, description: 'Item added / quantity updated' })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  addItem(@CurrentUser() user: JwtPayload, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update quantity for a cart item (set to 0 to remove)' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  @ApiResponse({ status: 404, description: 'Item not in cart' })
  updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.sub, productId, dto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a single product from the cart' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Item removed' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.sub, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from the cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  clearCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.clearCart(user.sub);
  }
}
