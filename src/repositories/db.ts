import Dexie, { Table } from 'dexie';
import { Task, Category, AppSettings, SchemaMetadata } from '@/types';

export const DB_VERSION = 1;

export class TaskFlowDatabase extends Dexie {
  tasks!: Table<Task, string>;
  categories!: Table<Category, string>;
  settings!: Table<AppSettings, string>;
  metadata!: Table<SchemaMetadata, number>;

  constructor() {
    super('TaskFlowDB');

    // Define tables and indexes
    this.version(DB_VERSION).stores({
      tasks: 'id, categoryId, completed, priority, dueDate, createdAt, nextOccurrence',
      categories: 'id, name',
      settings: 'id',
      metadata: 'version',
    });
  }
}

export const db = new TaskFlowDatabase();

// Database schema version metadata
export const SCHEMA_KEY = 'schema_metadata';

// Helper to get/set schema version
export async function getSchemaVersion(): Promise<number> {
  const meta = await db.metadata.get(SCHEMA_KEY);
  return meta?.version ?? 0;
}

export async function setSchemaVersion(version: number, migrationName?: string): Promise<void> {
  await db.metadata.put({
    version: SCHEMA_KEY,
    version: version,
    lastMigration: migrationName ? new Date().toISOString() : undefined,
  });
}
