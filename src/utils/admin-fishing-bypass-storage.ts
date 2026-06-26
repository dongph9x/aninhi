import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'admin-fishing-bypass.json');

export interface AdminFishingBypassConfig {
  enabled: boolean;
  lastUpdated: number;
  updatedBy?: string;
}

const defaultConfig: AdminFishingBypassConfig = {
  enabled: true, // Mặc định bật - giữ hành vi cũ (admin bypass cooldown/cần/mồi)
  lastUpdated: Date.now(),
  updatedBy: 'system',
};

export class AdminFishingBypassStorage {
  static save(config: AdminFishingBypassConfig): boolean {
    try {
      const dataDir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving admin fishing bypass config:', error);
      return false;
    }
  }

  static load(): AdminFishingBypassConfig {
    try {
      if (!fs.existsSync(STORAGE_FILE)) {
        this.save(defaultConfig);
        return defaultConfig;
      }

      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const config = JSON.parse(data);

      return {
        enabled: typeof config.enabled === 'boolean' ? config.enabled : defaultConfig.enabled,
        lastUpdated: typeof config.lastUpdated === 'number' ? config.lastUpdated : Date.now(),
        updatedBy: typeof config.updatedBy === 'string' ? config.updatedBy : defaultConfig.updatedBy,
      };
    } catch (error) {
      console.error('Error loading admin fishing bypass config:', error);
      return defaultConfig;
    }
  }

  static set(enabled: boolean, updatedBy?: string): boolean {
    return this.save({
      enabled,
      lastUpdated: Date.now(),
      updatedBy: updatedBy || 'admin',
    });
  }
}
