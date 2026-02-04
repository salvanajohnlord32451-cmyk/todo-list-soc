'use client';

import { Todo, UpdateTodoRequest } from '@/common';
import { TodoItem } from './TodoItem';

interface TodoSectionProps {
  title: string;
  todos: Todo[];
  icon?: string;
  badge?: {
    bg: string;
    text: string;
  };
  containerClass?: string;
  titleClass?: string;
  emptyMessage?: string;
  onUpdate: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoSection({
  title,
  todos,
  icon,
  badge = { bg: 'bg-blue-100', text: 'text-blue-700' },
  containerClass = '',
  titleClass = 'text-gray-800',
  emptyMessage,
  onUpdate,
  onDelete,
}: TodoSectionProps) {
  if (todos.length === 0 && !emptyMessage) return null;

  return (
    <section className={containerClass}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-xl">{icon}</span>}
        <h2 className={`text-lg font-bold ${titleClass}`}>{title}</h2>
        <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-xs font-bold`}>
          {todos.length}
        </span>
      </div>

      {todos.length === 0 ? (
        <div className="text-center py-6 text-gray-400 bg-white rounded-xl border-2 border-dashed">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
