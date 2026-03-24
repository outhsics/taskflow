import { describe, it, expect, beforeEach } from 'vitest';
import { TaskRepository } from '../../TaskRepository';
import { CategoryRepository } from '../../CategoryRepository';
import { SettingsRepository } from '../../SettingsRepository';
import { db } from '../../db';
import { Task, TaskPriority } from '../../types';

describe('TaskRepository', () => {
  let taskRepo: TaskRepository;

  beforeEach(async () => {
    taskRepo = new TaskRepository();
    await taskRepo.clear();
  });

  describe('create', () => {
    it('should create a new task with generated ID', async () => {
      const task = await taskRepo.create({
        title: 'Test Task',
        completed: false,
        priority: 'normal',
        categoryId: 'cat-1',
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should create task with optional fields', async () => {
      const dueDate = new Date('2025-01-15T10:00:00');
      const task = await taskRepo.create({
        title: 'Task with due date',
        description: 'Description here',
        completed: false,
        priority: 'urgent',
        categoryId: 'cat-1',
        dueDate,
      });

      expect(task.dueDate).toEqual(dueDate);
      expect(task.description).toBe('Description here');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await taskRepo.getAll();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks', async () => {
      await taskRepo.create({
        title: 'Task 1',
        completed: false,
        priority: 'normal',
        categoryId: 'cat-1',
      });
      await taskRepo.create({
        title: 'Task 2',
        completed: false,
        priority: 'important',
        categoryId: 'cat-1',
      });

      const tasks = await taskRepo.getAll();
      expect(tasks).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const task = await taskRepo.create({
        title: 'Original Title',
        completed: false,
        priority: 'normal',
        categoryId: 'cat-1',
      });

      const updated = await taskRepo.update(task.id, {
        title: 'Updated Title',
        priority: 'urgent',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.priority).toBe('urgent');
    });

    it('should throw error when updating non-existent task', async () => {
      await expect(
        taskRepo.update('non-existent', { title: 'New Title' })
      ).rejects.toThrow('Task non-existent not found');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const task = await taskRepo.create({
        title: 'To Delete',
        completed: false,
        priority: 'normal',
        categoryId: 'cat-1',
      });

      await taskRepo.delete(task.id);

      const retrieved = await taskRepo.getById(task.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getByPriority', () => {
    it('should return tasks with specified priority', async () => {
      await taskRepo.create({
        title: 'Normal Task',
        completed: false,
        priority: 'normal',
        categoryId: 'cat-1',
      });
      await taskRepo.create({
        title: 'Urgent Task',
        completed: false,
        priority: 'urgent',
        categoryId: 'cat-1',
      });

      const urgentTasks = await taskRepo.getByPriority('urgent');
      expect(urgentTasks).toHaveLength(1);
      expect(urgentTasks[0].title).toBe('Urgent Task');
    });
  });
});

describe('CategoryRepository', () => {
  let categoryRepo: CategoryRepository;

  beforeEach(async () => {
    categoryRepo = new CategoryRepository();
    await categoryRepo.clear();
  });

  it('should seed default categories', async () => {
    await categoryRepo.seedDefaults();

    const categories = await categoryRepo.getAll();
    expect(categories.length).toBeGreaterThan(0);

    const workCategory = categories.find((c) => c.name === 'Work');
    expect(workCategory).toBeDefined();
    expect(workCategory?.icon).toBe('💼');
  });
});

describe('SettingsRepository', () => {
  let settingsRepo: SettingsRepository;

  beforeEach(async () => {
    settingsRepo = new SettingsRepository();
    await settingsRepo.clearApiKey();
  });

  describe('encryptAndStoreApiKey', () => {
    it('should encrypt and store API key', async () => {
      await settingsRepo.encryptAndStoreApiKey('sk-test-key', 'my-passphrase-123');

      const hasKey = await settingsRepo.hasApiKey();
      expect(hasKey).toBe(true);
    });

    it('should reject weak passphrase', async () => {
      await expect(
        settingsRepo.encryptAndStoreApiKey('sk-test-key', 'weak')
      ).rejects.toThrow('Passphrase must be at least 8 characters');
    });

    it('should decrypt API key with correct passphrase', async () => {
      const originalKey = 'sk-test-key-12345';
      const passphrase = 'my-passphrase-123';

      await settingsRepo.encryptAndStoreApiKey(originalKey, passphrase);
      const decrypted = await settingsRepo.decryptApiKey(passphrase);

      expect(decrypted).toBe(originalKey);
    });

    it('should return null with wrong passphrase', async () => {
      await settingsRepo.encryptAndStoreApiKey('sk-test-key', 'correct-pass');
      const decrypted = await settingsRepo.decryptApiKey('wrong-pass');

      expect(decrypted).toBeNull();
    });
  });

  describe('export and import', () => {
    it('should export and import data', async () => {
      // Setup: Create some test data
      await settingsRepo.update({
        aiProvider: 'openai',
        apiKey: 'test-key',
        aiEnabled: true,
        theme: 'light',
      });

      // Export
      const exported = await settingsRepo.exportData();
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      // Clear
      await settingsRepo.clearAllData();

      // Import
      await settingsRepo.importData(exported);

      // Verify
      const settings = await settingsRepo.get();
      expect(settings?.aiProvider).toBe('openai');
    });
  });
});
