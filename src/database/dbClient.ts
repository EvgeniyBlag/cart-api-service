import { databaseConfig } from 'src/database/config';
import { Client } from 'pg';

export const dbClient = new Client(databaseConfig);