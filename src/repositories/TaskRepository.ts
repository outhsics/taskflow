import { db } from './db';
import { Task, TaskSchema } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class TaskRepository {
  /**
   * Create a new task
   */
  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
    };

    // Validate with Zod
    const validated = TaskSchema.parse(newTask);

    await db.tasks.add(validated);
    return validated;
  }

  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    return await db.tasks.toArray();
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<Task | undefined> {
    return await db.tasks.get(id);
  }

  /**
   * Update a task
   */
  async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> {
    const existing = await db.tasks.get(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }

    const updated: Task = {
      ...existing,
      ...updates,
    };

    // Validate with Zod
    const validated = TaskSchema.parse(updated);

    await db.tasks.put(validated);
    return validated;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  }

  /**
   * Get tasks by category
   */
  async getByCategory(categoryId: string): Promise<Task[]> {
    return await db.tasks.where('categoryId').equals(categoryId).toArray();
  }

  /**
   * Get completed tasks
   */
  async getCompleted(): Promise<Task[]> {
    return await db.tasks.where('completed').equals(true).toArray();
  }

  /**
   * Get incomplete tasks
   */
  async getIncomplete(): Promise<Task[]> {
    return await db.tasks.where('completed').equals(false).toArray();
  }

  /**
   * Get tasks due today
   */
  async getDueToday(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.tasks
      .where('dueDate')
      .between(today, tomorrow, true, false)
      .and((task) => !task.completed)
      .toArray();
  }

  /**
   * Get tasks due this week
   */
  async getDueThisWeek(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return await db.tasks
      .where('dueDate')
      .between(today, nextWeek, true, false)
      .and((task) => !task.completed)
      .toArray();
  }

  /**
   * Get recurring tasks
   */
  async getRecurring(): Promise<Task[]> {
    return await db.tasks
      .filter((task) => task.recurring !== null && task.recurring !== undefined)
      .toArray();
  }

  /**
   * Get tasks by priority
   */
  async getByPriority(priority: Task['priority']): Promise<Task[]> {
    return await db.tasks.where('priority').equals(priority).toArray();
  }

  /**
   * Search tasks by title or description
   */
  async search(query: string): Promise<Task[]> {
    const lowerQuery = query.toLowerCase();
    return await db.tasks
      .filter((task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  }

  /**
   * Count all tasks
   */
  async count(): Promise<number> {
    return await db.tasks.count();
  }

  /**
   * Count completed tasks
   */
  async countCompleted(): Promise<number> {
    return await db.tasks.where('completed').equals(true).count();
  }

  /**
   * Count incomplete tasks
   */
  async countIncomplete(): Promise<number> {
    return await db.tasks.where('completed').equals(false).count();
  }

  /**
   * Clear all tasks (for testing or data reset)
   */
  async clear(): Promise<void> {
    await db.tasks.clear();
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
