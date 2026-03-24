// Priority levels
export type TaskPriority = 'normal' | 'important' | 'urgent';

// Recurring frequency types
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

// Recurring task configuration
export interface RecurringConfig {
  frequency: RecurringFrequency;
  interval?: number; // for custom: every N days/weeks
  daysOfWeek?: number[]; // for weekly: [0,6] = Sun, Sat
  dayOfMonth?: number; // for monthly: 1-31
  endDate?: Date; // optional: stop recurring after this date
  occurrenceCount?: number; // optional: stop after N completions
  forever?: boolean; // true = never stop (default)
  // Precedence: forever=true → infinite. If forever=false/unset, occurrenceCount takes priority over endDate.
  // If both endDate and occurrenceCount are set, whichever occurs first stops the recurrence.
}

// Task interface
export interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  categoryId: string;
  dueDate?: Date; // Local time only (no timezone)
  recurring?: RecurringConfig | null; // null if one-time task
  createdAt: Date;
  completedAt?: Date;
  nextOccurrence?: Date; // for recurring tasks (local time)
}

// Category interface
export interface Category {
  id: string; // UUID
  name: string;
  color: string; // hex color
  icon?: string; // emoji
}

// App settings interface
export interface AppSettings {
  aiProvider: 'openai' | 'anthropic';
  apiKey: string; // Encrypted at rest, decrypted in memory
  aiEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;
  theme: 'light' | 'dark';
}

// Schema version for migrations
export interface SchemaMetadata {
  key: number;
  version: number;
  lastMigration?: string; // ISO timestamp
}

// AI Suggestion types
export interface AISuggestion {
  id: string;
  type: 'recurring' | 'priority' | 'productivity' | 'overdue' | 'custom';
  message: string;
  action?: () => void; // Function to execute if user accepts
  timestamp: Date;
  dismissed?: boolean;
}

// Natural language parsing result
export interface ParsedTaskInput {
  title: string;
  priority?: TaskPriority;
  dueDate?: Date;
  recurring?: RecurringConfig;
  originalInput: string;
}

// Zod schemas for runtime validation
import { z } from 'zod';

export const TaskPrioritySchema = z.enum(['normal', 'important', 'urgent']);
export const RecurringFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'custom']);

export const RecurringConfigSchema = z.object({
  frequency: RecurringFrequencySchema,
  interval: z.number().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  endDate: z.date().optional(),
  occurrenceCount: z.number().optional(),
  forever: z.boolean().optional(),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  completed: z.boolean(),
  priority: TaskPrioritySchema,
  categoryId: z.string().uuid(),
  dueDate: z.date().optional(),
  recurring: RecurringConfigSchema.nullable(),
  createdAt: z.date(),
  completedAt: z.date().optional(),
  nextOccurrence: z.date().optional(),
});

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().emoji().optional(),
});

export const AppSettingsSchema = z.object({
  aiProvider: z.enum(['openai', 'anthropic']),
  apiKey: z.string().min(1),
  aiEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  theme: z.enum(['light', 'dark']),
});

export const SchemaMetadataSchema = z.object({
  version: z.number().int().positive(),
  lastMigration: z.string().datetime().optional(),
});
