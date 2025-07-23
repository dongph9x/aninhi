import { PrismaClient } from '@prisma/client';

// Khởi tạo Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./data/database.db',
    },
  },
});

// Middleware để log queries trong development
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params: any, next: any) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

export { prisma };

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  private client: PrismaClient;

  private constructor() {
    this.client = prisma;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  // Khởi tạo database và tạo các bảng
  async initialize(): Promise<void> {
    try {
      await this.client.$connect();
      console.log('✅ Database connected successfully');
      
      // Tạo default settings nếu chưa có
      await this.initializeDefaultSettings();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  // Khởi tạo cài đặt mặc định
  private async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      { key: 'dailyBaseAmount', value: '2000', description: 'Số tiền cơ bản mỗi ngày' },
      { key: 'dailyStreakBonus', value: '100', description: 'Tiền thưởng streak mỗi ngày' },
      { key: 'maxStreakBonus', value: '1000', description: 'Tiền thưởng streak tối đa' },
      { key: 'dailyCooldownHours', value: '24', description: 'Thời gian chờ daily (giờ)' },
    ];

    for (const setting of defaultSettings) {
      await this.client.systemSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }
  }

  // Đóng kết nối database
  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance(); 