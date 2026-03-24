import { db } from './db';
import { Category, CategorySchema } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class CategoryRepository {
  /**
   * Create a new category
   */
  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
    };

    // Validate with Zod
    const validated = CategorySchema.parse(newCategory);

    await db.categories.add(validated);
    return validated;
  }

  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    return await db.categories.toArray();
  }

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  }

  /**
   * Update a category
   */
  async update(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const existing = await db.categories.get(id);
    if (!existing) {
      throw new Error(`Category ${id} not found`);
    }

    const updated: Category = {
      ...existing,
      ...updates,
    };

    // Validate with Zod
    const validated = CategorySchema.parse(updated);

    await db.categories.put(validated);
    return validated;
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    await db.categories.delete(id);
  }

  /**
   * Get category by name
   */
  async getByName(name: string): Promise<Category | undefined> {
    return await db.categories.where('name').equals(name).first();
  }

  /**
   * Count all categories
   */
  async count(): Promise<number> {
    return await db.categories.count();
  }

  /**
   * Clear all categories
   */
  async clear(): Promise<void> {
    await db.categories.clear();
  }

  /**
   * Seed default categories
   */
  async seedDefaults(): Promise<void> {
    const count = await this.count();
    if (count > 0) {
      return; // Already seeded
    }

    const defaults: Omit<Category, 'id'>[] = [
      { name: 'All Tasks', color: '#3b82f6', icon: '📋' },
      { name: 'Work', color: '#ef4444', icon: '💼' },
      { name: 'Personal', color: '#22c55e', icon: '🏠' },
      { name: 'Ideas', color: '#f59e0b', icon: '💡' },
    ];

    for (const category of defaults) {
      await this.create(category);
    }
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
