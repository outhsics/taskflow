import React from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const priorityClass = `priority-${task.priority}`;
  const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          <span className={`priority-badge ${priorityClass}`}>
            {priorityLabel}
          </span>

          {task.recurring && (
            <span className="recurring-badge" title="Recurring task">
              🔄
              {task.recurring.frequency === 'daily' && ' Daily'}
              {task.recurring.frequency === 'weekly' && ' Weekly'}
              {task.recurring.frequency === 'monthly' && ' Monthly'}
            </span>
          )}

          {task.dueDate && (
            <span className="due-date">
              📅 {format(task.dueDate, 'MMM d, h:mm a')}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          className="icon-button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
