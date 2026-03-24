import React, { useEffect, useState } from 'react';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { Category } from '@/types';
import './CategorySidebar.css';

interface CategorySidebarProps {
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function CategorySidebar({ selectedCategoryId, onCategorySelect }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      await categoryRepository.seedDefaults();
      const loaded = await categoryRepository.getAll();
      setCategories(loaded);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="category-sidebar-loading">Loading...</div>;
  }

  return (
    <aside className="category-sidebar">
      <div className="category-section">
        <h3 className="category-header">Categories</h3>
        <ul className="category-list">
          {categories.map((category) => (
            <li
              key={category.id}
              className={`category-item ${
                selectedCategoryId === category.id ? 'active' : ''
              }`}
              onClick={() => onCategorySelect?.(category.id)}
              style={{ cursor: 'pointer' }}
            >
              {category.icon && <span className="category-icon">{category.icon}</span>}
              <span className="category-name">{category.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="category-section">
        <h3 className="category-header">Views</h3>
        <ul className="category-list">
          <li
            className={`category-item ${selectedCategoryId === undefined ? 'active' : ''}`}
            onClick={() => onCategorySelect?.(undefined)}
            style={{ cursor: 'pointer' }}
          >
            📋 All Tasks
          </li>
          <li
            className="category-item"
            onClick={() => onCategorySelect?.('today')}
            style={{ cursor: 'pointer' }}
          >
            📅 Today
          </li>
          <li
            className="category-item"
            onClick={() => onCategorySelect?.('week')}
            style={{ cursor: 'pointer' }}
          >
            📆 This Week
          </li>
          <li
            className="category-item"
            onClick={() => onCategorySelect?.('recurring')}
            style={{ cursor: 'pointer' }}
          >
            🔄 Recurring
          </li>
          <li
            className="category-item"
            onClick={() => onCategorySelect?.('completed')}
            style={{ cursor: 'pointer' }}
          >
            ✅ Completed
          </li>
        </ul>
      </div>
    </aside>
  );
}
