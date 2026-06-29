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
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type JwtPayload } from '../auth/decorators/current-user.decorator';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-session')
  createSession(@CurrentUser() user: JwtPayload) {
    return this.checkoutService.createSession(user.sub);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.checkoutService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
