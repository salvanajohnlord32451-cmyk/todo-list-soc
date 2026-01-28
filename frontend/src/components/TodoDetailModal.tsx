'use client';

import { useState } from 'react';
import { Todo, UpdateTodoRequest } from '@/common';
import { Modal } from './Modal';

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoDetailModal({ todo, isOpen, onClose, onUpdate, onDelete }: TodoDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDeadline(todo.deadline ? todo.deadline.split('T')[0] : '');
      setIsEditing(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!todo) return;
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { completed: !todo.completed });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!todo) return;
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { title, description, deadline: deadline || undefined });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todo) return;
    if (!confirm('Are you sure you want to delete this todo?')) return;
    setIsLoading(true);
    try {
      await onDelete(todo.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!todo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit TO DO' : 'TO DO Details'}>
      <div onTransitionEnd={handleOpen}>
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description"
              rows={4}
            />
            <div>
              <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline (optional)
              </label>
              <input
                id="edit-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggleComplete}
                disabled={isLoading}
                className="mt-1 h-5 w-5 rounded border-gray-300 cursor-pointer flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className={`text-xl font-semibold mb-2 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={`text-sm mb-3 whitespace-pre-wrap ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {todo.description}
                  </p>
                )}
                {todo.deadline && (
                  <div className={`text-sm flex items-center gap-2 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>📅 Deadline:</span>
                    <span className="font-medium">
                      {new Date(todo.deadline).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="flex-1 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
