'use client';

import { useState } from 'react';
import { Todo, UpdateTodoRequest } from '@/common';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [deadline, setDeadline] = useState(todo.deadline ? todo.deadline.split('T')[0] : '');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { title, description, deadline: deadline || undefined });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description);
    setDeadline(todo.deadline ? todo.deadline.split('T')[0] : '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg p-4 bg-white shadow-md h-full flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Description"
          rows={3}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Deadline"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isLoading || !title.trim()}
            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow h-full flex flex-col ${todo.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2 mb-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          disabled={isLoading}
          className="mt-1 h-5 w-5 rounded border-gray-300 cursor-pointer flex-shrink-0"
        />
        <h3 className={`font-semibold text-lg flex-1 break-words ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {todo.title}
        </h3>
      </div>
      {todo.description && (
        <p className={`text-sm mb-2 break-words ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
          {todo.description}
        </p>
      )}
      {todo.deadline && (
        <div className={`text-xs mb-4 flex items-center gap-1 ${todo.completed ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>📅</span>
          <span>{new Date(todo.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )}
      <div className="flex gap-2 mt-auto pt-2 border-t">
        <button
          onClick={() => setIsEditing(true)}
          disabled={isLoading}
          className="flex-1 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="flex-1 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
