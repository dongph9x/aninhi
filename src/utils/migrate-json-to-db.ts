import fs from 'fs';
import path from 'path';
import { prisma } from './database';
import { ecommerceDB } from './ecommerce-db';
import { banDB } from './ban-db';

export class JsonToDatabaseMigration {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data');
  }

  /**
   * Chạy migration toàn bộ
   */
  async migrateAll(): Promise<void> {
    console.log('🚀 Bắt đầu migration từ JSON sang Database...');

    try {
      // Migrate ecommerce data
      await this.migrateEcommerceData();
      
      // Migrate ban data
      await this.migrateBanData();
      
      console.log('✅ Migration hoàn thành thành công!');
    } catch (error) {
      console.error('❌ Migration thất bại:', error);
      throw error;
    }
  }

  /**
   * Migrate dữ liệu ecommerce
   */
  private async migrateEcommerceData(): Promise<void> {
    console.log('📊 Migrating ecommerce data...');
    
    const ecommercePath = path.join(this.dataPath, 'ecommerce.json');
    
    if (!fs.existsSync(ecommercePath)) {
      console.log('⚠️  File ecommerce.json không tồn tại, bỏ qua...');
      return;
    }

    try {
      const ecommerceData = JSON.parse(fs.readFileSync(ecommercePath, 'utf-8'));
      
      // Migrate users
      if (ecommerceData.users && Array.isArray(ecommerceData.users)) {
        console.log(`👥 Migrating ${ecommerceData.users.length} users...`);
        
        for (const user of ecommerceData.users) {
          await prisma.user.upsert({
            where: {
              userId_guildId: {
                userId: user.userId,
                guildId: user.guildId,
              },
            },
            update: {
              balance: user.balance,
              dailyStreak: user.dailyStreak,
              updatedAt: new Date(user.updatedAt),
            },
            create: {
              userId: user.userId,
              guildId: user.guildId,
              balance: user.balance,
              dailyStreak: user.dailyStreak,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            },
          });
        }
        console.log('✅ Users migrated successfully');
      }

      // Migrate daily claims
      if (ecommerceData.dailyClaims && typeof ecommerceData.dailyClaims === 'object') {
        console.log(`📅 Migrating daily claims...`);
        
        for (const [key, timestamp] of Object.entries(ecommerceData.dailyClaims)) {
          const [userId, guildId] = key.split('_');
          if (userId && guildId) {
            // Đảm bảo user tồn tại trước khi tạo daily claim
            await prisma.user.upsert({
              where: {
                userId_guildId: {
                  userId,
                  guildId,
                },
              },
              update: {},
              create: {
                userId,
                guildId,
                balance: 0,
                dailyStreak: 0,
              },
            });

            // Tạo daily claim
            await prisma.dailyClaim.upsert({
              where: {
                userId_guildId_claimedAt: {
                  userId,
                  guildId,
                  claimedAt: new Date(timestamp as string),
                },
              },
              update: {},
              create: {
                userId,
                guildId,
                claimedAt: new Date(timestamp as string),
              },
            });
          }
        }
        console.log('✅ Daily claims migrated successfully');
      }

      // Migrate settings
      if (ecommerceData.settings && typeof ecommerceData.settings === 'object') {
        console.log('⚙️  Migrating settings...');
        
        const settings = ecommerceData.settings;
        const settingMappings = [
          { key: 'dailyBaseAmount', value: settings.dailyBaseAmount },
          { key: 'dailyStreakBonus', value: settings.dailyStreakBonus },
          { key: 'maxStreakBonus', value: settings.maxStreakBonus },
          { key: 'dailyCooldownHours', value: settings.dailyCooldownHours },
        ];

        for (const mapping of settingMappings) {
          if (mapping.value !== undefined) {
            await prisma.systemSettings.upsert({
              where: { key: mapping.key },
              update: {
                value: mapping.value.toString(),
                updatedAt: new Date(),
              },
              create: {
                key: mapping.key,
                value: mapping.value.toString(),
                description: `Migrated from JSON`,
              },
            });
          }
        }
        console.log('✅ Settings migrated successfully');
      }

      console.log('✅ Ecommerce data migration completed');
    } catch (error) {
      console.error('❌ Error migrating ecommerce data:', error);
      throw error;
    }
  }

  /**
   * Migrate dữ liệu ban
   */
  private async migrateBanData(): Promise<void> {
    console.log('🚫 Migrating ban data...');
    
    const banPath = path.join(this.dataPath, 'bans.json');
    
    if (!fs.existsSync(banPath)) {
      console.log('⚠️  File bans.json không tồn tại, bỏ qua...');
      return;
    }

    try {
      const banData = JSON.parse(fs.readFileSync(banPath, 'utf-8'));
      
      if (Array.isArray(banData)) {
        console.log(`🚫 Migrating ${banData.length} ban records...`);
        
        for (const ban of banData) {
          await prisma.banRecord.upsert({
            where: {
              userId_guildId: {
                userId: ban.userId,
                guildId: ban.guildId,
              },
            },
            update: {
              moderatorId: ban.moderatorId,
              reason: ban.reason,
              banAt: new Date(ban.banAt),
              expiresAt: ban.expiresAt ? new Date(ban.expiresAt) : null,
              type: ban.type,
              isActive: true,
            },
            create: {
              userId: ban.userId,
              guildId: ban.guildId,
              moderatorId: ban.moderatorId,
              reason: ban.reason,
              banAt: new Date(ban.banAt),
              expiresAt: ban.expiresAt ? new Date(ban.expiresAt) : null,
              type: ban.type,
              isActive: true,
            },
          });
        }
        console.log('✅ Ban records migrated successfully');
      }

      console.log('✅ Ban data migration completed');
    } catch (error) {
      console.error('❌ Error migrating ban data:', error);
      throw error;
    }
  }

  /**
   * Tạo backup của dữ liệu JSON
   */
  async createBackup(): Promise<void> {
    console.log('💾 Creating backup of JSON files...');
    
    const backupPath = path.join(this.dataPath, 'backup');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Backup ecommerce.json
    const ecommercePath = path.join(this.dataPath, 'ecommerce.json');
    if (fs.existsSync(ecommercePath)) {
      const backupEcommercePath = path.join(backupPath, `ecommerce-${timestamp}.json`);
      fs.copyFileSync(ecommercePath, backupEcommercePath);
      console.log(`✅ Backup created: ${backupEcommercePath}`);
    }

    // Backup bans.json
    const banPath = path.join(this.dataPath, 'bans.json');
    if (fs.existsSync(banPath)) {
      const backupBanPath = path.join(backupPath, `bans-${timestamp}.json`);
      fs.copyFileSync(banPath, backupBanPath);
      console.log(`✅ Backup created: ${backupBanPath}`);
    }
  }

  /**
   * Verify migration
   */
  async verifyMigration(): Promise<void> {
    console.log('🔍 Verifying migration...');
    
    // Verify users
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Verify daily claims
    const dailyClaimCount = await prisma.dailyClaim.count();
    console.log(`📅 Daily claims in database: ${dailyClaimCount}`);
    
    // Verify settings
    const settingsCount = await prisma.systemSettings.count();
    console.log(`⚙️  Settings in database: ${settingsCount}`);
    
    // Verify ban records
    const banCount = await prisma.banRecord.count();
    console.log(`🚫 Ban records in database: ${banCount}`);
    
    console.log('✅ Verification completed');
  }
}

// Export migration service
export const jsonMigration = new JsonToDatabaseMigration(); 