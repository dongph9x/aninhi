import fs from 'fs';
import path from 'path';

const MAINTENANCE_FILE = path.join(process.cwd(), 'data', 'maintenance-mode.json');

export interface MaintenanceConfig {
  enabled: boolean;
  lastUpdated: number;
  updatedBy?: string;
  reason?: string;
}

const defaultMaintenanceConfig: MaintenanceConfig = {
  enabled: true, // Mặc định bật chế độ bảo trì
  lastUpdated: Date.now(),
  updatedBy: 'system',
  reason: 'Default maintenance mode on startup'
};

export class MaintenanceStorage {
  /**
   * Lưu trạng thái maintenance mode vào file JSON
   */
  static save(config: MaintenanceConfig): boolean {
    try {
      // Đảm bảo thư mục data tồn tại
      const dataDir = path.dirname(MAINTENANCE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Lưu vào file
      fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving maintenance mode:', error);
      return false;
    }
  }

  /**
   * Load trạng thái maintenance mode từ file JSON
   */
  static load(): MaintenanceConfig {
    try {
      if (!fs.existsSync(MAINTENANCE_FILE)) {
        // Nếu file không tồn tại, tạo file mặc định
        this.save(defaultMaintenanceConfig);
        return defaultMaintenanceConfig;
      }

      const data = fs.readFileSync(MAINTENANCE_FILE, 'utf8');
      const config = JSON.parse(data) as MaintenanceConfig;
      
      // Validate và merge với default nếu cần
      return this.validateAndMerge(config);
    } catch (error) {
      console.error('Error loading maintenance mode:', error);
      return defaultMaintenanceConfig;
    }
  }

  /**
   * Validate và merge config với default
   */
  private static validateAndMerge(config: any): MaintenanceConfig {
    const validated: MaintenanceConfig = {
      enabled: typeof config.enabled === 'boolean' ? config.enabled : defaultMaintenanceConfig.enabled,
      lastUpdated: typeof config.lastUpdated === 'number' ? config.lastUpdated : Date.now(),
      updatedBy: typeof config.updatedBy === 'string' ? config.updatedBy : defaultMaintenanceConfig.updatedBy,
      reason: typeof config.reason === 'string' ? config.reason : defaultMaintenanceConfig.reason,
    };

    return validated;
  }

  /**
   * Bật chế độ bảo trì
   */
  static enable(updatedBy?: string, reason?: string): boolean {
    const config: MaintenanceConfig = {
      enabled: true,
      lastUpdated: Date.now(),
      updatedBy: updatedBy || 'admin',
      reason: reason || 'Maintenance mode enabled by admin'
    };

    return this.save(config);
  }

  /**
   * Tắt chế độ bảo trì
   */
  static disable(updatedBy?: string, reason?: string): boolean {
    const config: MaintenanceConfig = {
      enabled: false,
      lastUpdated: Date.now(),
      updatedBy: updatedBy || 'admin',
      reason: reason || 'Maintenance mode disabled by admin'
    };

    return this.save(config);
  }

  /**
   * Lấy trạng thái hiện tại
   */
  static getStatus(): MaintenanceConfig {
    return this.load();
  }

  /**
   * Reset về cấu hình mặc định
   */
  static reset(): boolean {
    try {
      this.save(defaultMaintenanceConfig);
      console.log('Maintenance mode reset to default');
      return true;
    } catch (error) {
      console.error('Error resetting maintenance mode:', error);
      return false;
    }
  }

  /**
   * Backup maintenance config
   */
  static backup(): boolean {
    try {
      const config = this.load();
      const backupFile = path.join(process.cwd(), 'backups', `maintenance-mode-${Date.now()}.json`);
      
      // Đảm bảo thư mục backups tồn tại
      const backupDir = path.dirname(backupFile);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      fs.writeFileSync(backupFile, JSON.stringify(config, null, 2));
      console.log(`Maintenance mode backed up to: ${backupFile}`);
      return true;
    } catch (error) {
      console.error('Error backing up maintenance mode:', error);
      return false;
    }
  }

  /**
   * Restore maintenance config từ backup
   */
  static restore(backupFile: string): boolean {
    try {
      if (!fs.existsSync(backupFile)) {
        console.error('Backup file not found:', backupFile);
        return false;
      }

      const data = fs.readFileSync(backupFile, 'utf8');
      const config = JSON.parse(data);
      const validated = this.validateAndMerge(config);
      
      this.save(validated);
      console.log('Maintenance mode restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring maintenance mode:', error);
      return false;
    }
  }
} 