import React, { useState } from 'react';
import { taskRepository } from '@/repositories/TaskRepository';
import { categoryRepository } from '@/repositories/CategoryRepository';
import { TaskPriority } from '@/types';
import './AddTaskForm.css';

export function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);

  // Load categories on mount
  React.useEffect(() => {
    categoryRepository.getAll().then(cats => {
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      await taskRepository.create({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        priority,
        categoryId: categoryId || (categories[0]?.id ?? ''),
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('normal');
      setDueDate('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        placeholder="Add a task... (e.g., 'Call mom every Sunday at 6pm')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={500}
      />

      <div className="task-options">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="task-select"
        >
          <option value="normal">Normal</option>
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="task-select"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="task-datetime"
        />

        <button type="submit" className="btn btn-primary">
          + Add Task
        </button>
      </div>
    </form>
  );
}
