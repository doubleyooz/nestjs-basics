import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BILLING_SERVICE } from './constants/service.constant';
import { CreateOrderRequest } from './dto/create-order-request.dto';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(request: CreateOrderRequest, authentication: string) {
    const session = await this.ordersRepository.startTransaction();
    try {
      const order = await this.ordersRepository.startTransaction();
      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
          jid: authentication
        }),
      );
      await session.commitTransaction();
      return order;
      
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }

    return this.ordersRepository.create(request);
  }

  async getOrders() {
    return this.ordersRepository.find({});
  }

  getHello(): string {
    return 'Hello World!';
  }
}
