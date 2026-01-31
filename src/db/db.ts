import * as SQLite from 'expo-sqlite';

import { SCHEMA_VERSION, schemaV1, schemaV2 } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(schemaV1);
    version = 1;
  }

  if (version < 2) {
    await db.execAsync(schemaV2);
    version = 2;
  }

  if (version !== SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('repolog.db');
      await db.withTransactionAsync(async () => {
        await migrate(db);
      });
      return db;
    })();
  }
  return dbPromise;
}
