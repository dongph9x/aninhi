#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { jsonMigration } from '../src/utils/migrate-json-to-db';
import { databaseService } from '../src/utils/database';

// Load environment variables
const envFolder = path.join(process.cwd(), 'env');
config({ path: path.resolve(envFolder, '.env') });
config({ path: path.resolve(envFolder, '.env.local') });

async function main() {
  console.log('🚀 Starting JSON to Database Migration...\n');

  try {
    // Initialize database connection
    await databaseService.initialize();

    // Create backup of JSON files
    await jsonMigration.createBackup();

    // Run migration
    await jsonMigration.migrateAll();

    // Verify migration
    await jsonMigration.verifyMigration();

    console.log('\n🎉 Migration completed successfully!');
    console.log('📁 JSON files have been backed up to data/backup/');
    console.log('💾 All data is now stored in SQLite database');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await databaseService.disconnect();
  }
}

main(); 