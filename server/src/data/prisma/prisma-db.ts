import { PrismaClient } from '@prisma/client';
import colors from 'colors';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export class Database {
  static async connect() {
    try {
      await prisma.$connect();
      console.log(colors.magenta.bold('✓ Database connected successfully'));
    } catch (error) {
      console.error(colors.red.bold('✗ Error connecting to database:'), error);
      process.exit(1);
    }
  }

  static async disconnect() {
    try {
      await prisma.$disconnect();
      console.log(colors.yellow.bold('Database disconnected'));
    } catch (error) {
      console.error(
        colors.red.bold('Error disconnecting from database:'),
        error
      );
      process.exit(1);
    }
  }
}
