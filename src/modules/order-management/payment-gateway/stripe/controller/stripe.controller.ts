import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Res,
  RawBody,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeService } from '../service/stripe.service';
import {
  StripePaymentIntentDto,
  StripeCheckoutSessionDto,
  StripeRefundDto,
} from '../dto/stripe-payment.dto';
import { Public } from 'src/core/auth/decorator/auth.decorator';

@Controller('payment-gateway/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  async createPaymentIntent(@Body() paymentData: StripePaymentIntentDto) {
    const result = await this.stripeService.createPaymentIntent(paymentData);
    return {
      clientSecret: result.client_secret,
      paymentIntentId: result.id,
      status: result.status,
    };
  }

  @Post('checkout-session')
  async createCheckoutSession(@Body() sessionData: StripeCheckoutSessionDto) {
    const result = await this.stripeService.createCheckoutSession(sessionData);
    return {
      sessionId: result.id,
      url: result.url,
      paymentStatus: result.payment_status,
    };
  }

  @Get('payment-intent/:id')
  async getPaymentIntent(@Param('id') paymentIntentId: string) {
    return await this.stripeService.retrievePaymentIntent(paymentIntentId);
  }

  @Get('checkout-session/:id')
  async getCheckoutSession(@Param('id') sessionId: string) {
    return await this.stripeService.retrieveCheckoutSession(sessionId);
  }

  @Post('refund')
  async createRefund(@Body() refundData: StripeRefundDto) {
    return this.stripeService.createRefund(refundData);
  }

  @Post('payment-intent/:id/confirm')
  async confirmPaymentIntent(
    @Param('id') paymentIntentId: string,
    @Body() confirmData: { paymentMethodId?: string },
  ) {
    return this.stripeService.confirmPaymentIntent(
      paymentIntentId,
      confirmData.paymentMethodId,
    );
  }

  @Post('payment-intent/:id/cancel')
  async cancelPaymentIntent(@Param('id') paymentIntentId: string) {
    return await this.stripeService.cancelPaymentIntent(paymentIntentId);
  }

  @Get('customer/:id/payment-methods')
  async getCustomerPaymentMethods(@Param('id') customerId: number) {
    return this.stripeService.listPaymentMethods(customerId);
  }

  @Get('status')
  getPaymentStatus() {
    return this.stripeService.getPaymentStatus();
  }

  // Webhook endpoint
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @RawBody() body: Buffer,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      const event = await this.stripeService.constructWebhookEvent(
        body.toString(),
        signature,
      );

      console.log('Stripe webhook event received:', event.type);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          const paymentIntent = event.data.object;
          console.log('Payment succeeded:', paymentIntent.id);
          // Here you would typically:
          // 1. Update order status to paid
          // 2. Update inventory
          // 3. Send confirmation emails
          // 4. Trigger any other business logic
          break;

        case 'payment_intent.payment_failed':
          // Handle failed payment
          const failedPayment = event.data.object;
          console.log('Payment failed:', failedPayment.id);
          // Update order status to failed
          break;

        case 'checkout.session.completed':
          // Handle completed checkout session
          const session = event.data.object;
          console.log('Checkout session completed:', session.id);
          break;

        case 'invoice.payment_succeeded':
          // Handle successful invoice payment
          const invoice = event.data.object;
          console.log('Invoice payment succeeded:', invoice.id);
          break;

        default:
          console.log('Unhandled Stripe event type:', event.type);
      }

      return res.status(200).send('OK');
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      return res.status(400).send('Webhook signature verification failed');
    }
  }
}
