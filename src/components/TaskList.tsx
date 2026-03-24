import React, { useEffect, useState } from 'react';
import { taskRepository } from '@/repositories/TaskRepository';
import { useOffline } from '@/hooks/useOffline';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import './TaskList.css';

interface TaskListProps {
  categoryId?: string;
  filter?: 'today' | 'week' | 'recurring' | 'completed';
}

export function TaskList({ categoryId, filter }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const isOffline = useOffline();

  useEffect(() => {
    loadTasks();
  }, [categoryId, filter]);

  async function loadTasks() {
    setLoading(true);
    try {
      let loadedTasks: Task[] = [];

      if (filter === 'today') {
        loadedTasks = await taskRepository.getDueToday();
      } else if (filter === 'week') {
        loadedTasks = await taskRepository.getDueThisWeek();
      } else if (filter === 'recurring') {
        loadedTasks = await taskRepository.getRecurring();
      } else if (filter === 'completed') {
        loadedTasks = await taskRepository.getCompleted();
      } else if (categoryId) {
        loadedTasks = await taskRepository.getByCategory(categoryId);
      } else {
        loadedTasks = await taskRepository.getIncomplete();
      }

      setTasks(loadedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTask(task: Task) {
    try {
      await taskRepository.update(task.id, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined,
      });
      await loadTasks(); // Reload to update next occurrence
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await taskRepository.delete(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  if (loading) {
    return <div className="task-list-loading">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      ))}
    </div>
  );
}
