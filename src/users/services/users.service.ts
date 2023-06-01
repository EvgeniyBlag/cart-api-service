import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Client } from 'pg';

import { User } from '../models';
import { databaseConfig } from 'src/database/config';

@Injectable()
export class UsersService {
  private databaseClient: Client;

  constructor() {
    this.databaseClient = new Client(databaseConfig);
  }

  async findOne(userId: string): Promise<User> {
    await this.databaseClient.connect();

    const query = 'SELECT * FROM users WHERE id = $1';

    const queryResult = await this.databaseClient.query(query, [ userId ]);
    
    await this.databaseClient.end();
    
    return queryResult.rows[0];
  }

  async findAll(): Promise<User[]> {
    await this.databaseClient.connect();

    const query = 'SELECT * FROM users';

    const queryResult = await this.databaseClient.query(query);
    
    await this.databaseClient.end();
    
    return queryResult.rows;
  }

  async createOne({name, email, password}: User): Promise<User> {
    await this.databaseClient.connect();

    const id = v4();
    const user: User = {
      id,
      name: name,
      email: email,
      password: await bcrypt.hash(password, 10)
    };

    const query = 'INSERT INTO users(id, name, email, password) VALUES ($1, $2, $3, $4)';
    
    await this.databaseClient.query(query, [ user.id, user.name, user.email, user.password ]);
    await this.databaseClient.end();
    
    return user;
  }
}
