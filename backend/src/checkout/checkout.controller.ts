import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-session')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a Stripe Checkout session from the current cart' })
  @ApiResponse({ status: 201, description: 'Returns Stripe session URL to redirect the user to' })
  @ApiResponse({ status: 400, description: 'Cart is empty' })
  @ApiResponse({ status: 401, description: 'Unauthorised' })
  createSession(@CurrentUser() user: JwtPayload) {
    return this.checkoutService.createSession(user.sub);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook — receives checkout.session.completed events' })
  @ApiHeader({ name: 'stripe-signature', description: 'Stripe HMAC signature', required: true })
  @ApiResponse({ status: 200, description: 'Webhook received and processed' })
  @ApiResponse({ status: 400, description: 'Invalid Stripe signature' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.checkoutService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
