import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import { Client } from 'pg';
import AWS from 'aws-sdk';

import { Cart } from '../models';
import { databaseConfig } from 'src/database/config';

@Injectable()
export class CartService {

  async findByUserId(userId: string): Promise<Cart> {
    const lambda = new AWS.Lambda();

    const dbClient = new Client(databaseConfig);
    await dbClient.connect();

    const query = 'SELECT * FROM carts WHERE user_id = $1';

    const { rows } = await dbClient.query(query, [ userId ]);

    if (rows.length === 0) { 
      return null;
    }

    const cartItemsQuery = 'SELECT * FROM cart_items WHERE cart_id = $1';
    const { rows: cartItems } = await dbClient.query(cartItemsQuery, [ rows[0].id ]);

    const response = await lambda.invoke({
      FunctionName: process.env.PRODUCTS_LAMBDA_FUNCTION
    }).promise();

    const payload = JSON.parse(response.Payload as string);
    const products = JSON.parse(payload.body);


    const productsList = cartItems.map((cartItem) => {
      const { count, ...productInfo } = products.data.find(({ id }) => id === cartItem.product_id);

      return {
        product: productInfo,
        count: cartItem.count
      };
    });

    await dbClient.end();

    return {
      ...rows[0],
      items: productsList
    }
  }

  async createByUserId(userId: string) {
    const dbClient = new Client(databaseConfig);
    await dbClient.connect();

    const id = v4();
    const userCart = {
      id,
      items: []
    };

    const query = 'INSERT INTO carts (id, user_id, status) VALUES ($1, $2, $3);'

    await dbClient.query(query, [ id, userId, 'OPEN' ]);
    await dbClient.end();

    return userCart;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const { id, ...rest } = await this.findOrCreateByUserId(userId);

    const dbClient = new Client(databaseConfig);
    await dbClient.connect();

    const deleteQuery = 'DELETE FROM cart_items WHERE cart_id = $1';
    await dbClient.query(deleteQuery, [ id ]);

    const insertQuery = `
      INSERT INTO cart_items (cart_id, product_id, count) VALUES  
      ${items.map(item => `('${id}','${item.product.id}',${item.count})`).join(',')};
    `;

    await dbClient.query(insertQuery);

    const updatedCart = await this.findByUserId(userId);
    await dbClient.end();

    return updatedCart;
  }

  async removeByUserId(userId): Promise<void> {
    const dbClient = new Client(databaseConfig);
    dbClient.connect();

    const userCart = await this.findByUserId(userId);

    const query = 'DELETE FROM cart_items WHERE cart_id = $1';
    await dbClient.query(query, [ userCart.id ]);
    await dbClient.end();
  }
}
