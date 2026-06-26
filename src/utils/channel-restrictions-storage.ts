import fs from 'fs';
import path from 'path';
import type { ChannelRestrictions } from '@/config';
import { defaultChannelRestrictions } from '@/config';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'channel-restrictions.json');

export class ChannelRestrictionsStorage {
  /**
   * Lưu channel restrictions vào file JSON
   */
  static save(restrictions: ChannelRestrictions): boolean {
    try {
      // Đảm bảo thư mục data tồn tại
      const dataDir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Lưu vào file
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(restrictions, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving channel restrictions:', error);
      return false;
    }
  }

  /**
   * Load channel restrictions từ file JSON
   */
  static load(): ChannelRestrictions {
    try {
      if (!fs.existsSync(STORAGE_FILE)) {
        // Nếu file không tồn tại, tạo file mặc định
        this.save(defaultChannelRestrictions);
        return defaultChannelRestrictions;
      }

      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const restrictions = JSON.parse(data) as ChannelRestrictions;
      
      // Validate và merge với default nếu cần
      return this.validateAndMerge(restrictions);
    } catch (error) {
      console.error('Error loading channel restrictions:', error);
      return defaultChannelRestrictions;
    }
  }

  /**
   * Validate và merge restrictions với default
   */
  private static validateAndMerge(restrictions: any): ChannelRestrictions {
    const validated: ChannelRestrictions = {
      allowedChannels: Array.isArray(restrictions.allowedChannels) ? restrictions.allowedChannels : [],
      blockedChannels: Array.isArray(restrictions.blockedChannels) ? restrictions.blockedChannels : [],
      allowedCategories: Array.isArray(restrictions.allowedCategories) ? restrictions.allowedCategories : [],
      blockedCategories: Array.isArray(restrictions.blockedCategories) ? restrictions.blockedCategories : [],
      useWhitelistMode: Boolean(restrictions.useWhitelistMode),
      useBlacklistMode: Boolean(restrictions.useBlacklistMode),
      checkCategories: Boolean(restrictions.checkCategories),
      exemptCommands: Array.isArray(restrictions.exemptCommands) 
        ? restrictions.exemptCommands 
        : defaultChannelRestrictions.exemptCommands,
      exemptAdminCommands: Array.isArray(restrictions.exemptAdminCommands) 
        ? restrictions.exemptAdminCommands 
        : defaultChannelRestrictions.exemptAdminCommands,
    };

    return validated;
  }

  /**
   * Backup channel restrictions
   */
  static backup(): boolean {
    try {
      const restrictions = this.load();
      const backupFile = path.join(process.cwd(), 'backups', `channel-restrictions-${Date.now()}.json`);
      
      // Đảm bảo thư mục backups tồn tại
      const backupDir = path.dirname(backupFile);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      fs.writeFileSync(backupFile, JSON.stringify(restrictions, null, 2));
      console.log(`Channel restrictions backed up to: ${backupFile}`);
      return true;
    } catch (error) {
      console.error('Error backing up channel restrictions:', error);
      return false;
    }
  }

  /**
   * Restore channel restrictions từ backup
   */
  static restore(backupFile: string): boolean {
    try {
      if (!fs.existsSync(backupFile)) {
        console.error('Backup file not found:', backupFile);
        return false;
      }

      const data = fs.readFileSync(backupFile, 'utf8');
      const restrictions = JSON.parse(data);
      const validated = this.validateAndMerge(restrictions);
      
      this.save(validated);
      console.log('Channel restrictions restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring channel restrictions:', error);
      return false;
    }
  }

  /**
   * Reset về cấu hình mặc định
   */
  static reset(): boolean {
    try {
      this.save(defaultChannelRestrictions);
      console.log('Channel restrictions reset to default');
      return true;
    } catch (error) {
      console.error('Error resetting channel restrictions:', error);
      return false;
    }
  }

  /**
   * Lấy danh sách các file backup
   */
  static getBackupFiles(): string[] {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        return [];
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('channel-restrictions-') && file.endsWith('.json'))
        .map(file => path.join(backupDir, file))
        .sort((a, b) => {
          // Sắp xếp theo thời gian tạo (mới nhất trước)
          const statA = fs.statSync(a);
          const statB = fs.statSync(b);
          return statB.mtime.getTime() - statA.mtime.getTime();
        });

      return files;
    } catch (error) {
      console.error('Error getting backup files:', error);
      return [];
    }
  }

  /**
   * Export channel restrictions ra file
   */
  static export(outputFile?: string): boolean {
    try {
      const restrictions = this.load();
      const exportFile = outputFile || path.join(process.cwd(), 'exports', `channel-restrictions-${Date.now()}.json`);
      
      // Đảm bảo thư mục exports tồn tại
      const exportDir = path.dirname(exportFile);
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      fs.writeFileSync(exportFile, JSON.stringify(restrictions, null, 2));
      console.log(`Channel restrictions exported to: ${exportFile}`);
      return true;
    } catch (error) {
      console.error('Error exporting channel restrictions:', error);
      return false;
    }
  }

  /**
   * Import channel restrictions từ file
   */
  static import(importFile: string): boolean {
    try {
      if (!fs.existsSync(importFile)) {
        console.error('Import file not found:', importFile);
        return false;
      }

      const data = fs.readFileSync(importFile, 'utf8');
      const restrictions = JSON.parse(data);
      const validated = this.validateAndMerge(restrictions);
      
      this.save(validated);
      console.log('Channel restrictions imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing channel restrictions:', error);
      return false;
    }
  }
} 