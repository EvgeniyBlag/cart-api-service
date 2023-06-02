import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { Client } from 'pg';

import { Order } from '../models';
import { databaseConfig } from 'src/database/config';

@Injectable()
export class OrderService {

  async findById(orderId: string): Promise<Order> {
    const dbClient = new Client(databaseConfig);
    await dbClient.connect();

    const query = `SELECT * FROM orders WHERE id = $1;`;

    const queryResult = await dbClient.query(query, [ orderId ]);

    dbClient.end();

    return queryResult.rows[0];
  }

  async create(data: any) {
    const dbClient = new Client(databaseConfig);
    await dbClient.connect();

    const id = v4();
    const order = {
      ...data,
      id,
      status: 'inProgress',
    };

    const query = `
      INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    await dbClient.query(query, [
      order.id,
      order.user_id,
      order.cart_id,
      order.payment,
      order.delivery,
      order.comments,
      order.status,
      order.total
    ]);
    
    await dbClient.end();
    
    return order;
  }

  // update(orderId, data) {
  //   const order = this.findById(orderId);

  //   if (!order) {
  //     throw new Error('Order does not exist.');
  //   }

  //   this.orders[ orderId ] = {
  //     ...data,
  //     id: orderId,
  //   }
  // }
}
