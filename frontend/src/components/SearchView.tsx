'use client';

import { useState, useMemo } from 'react';
import { Todo, UpdateTodoRequest } from '@/common';
import { TodoItem } from './TodoItem';

interface SearchViewProps {
  todos: Todo[];
  onUpdate: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SearchView({ todos, onUpdate, onDelete }: SearchViewProps) {
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateFilter, setDateFilter] = useState<'exact' | 'before' | 'after'>('exact');

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (searchTitle && !todo.title.toLowerCase().includes(searchTitle.toLowerCase())) {
        return false;
      }

      if (filterStatus === 'completed' && !todo.completed) return false;
      if (filterStatus === 'incomplete' && todo.completed) return false;

      if (filterDate && todo.deadline) {
        const todoDate = new Date(todo.deadline);
        const filterDateObj = new Date(filterDate);
        
        todoDate.setHours(0, 0, 0, 0);
        filterDateObj.setHours(0, 0, 0, 0);

        if (dateFilter === 'exact' && todoDate.getTime() !== filterDateObj.getTime()) return false;
        if (dateFilter === 'before' && todoDate.getTime() > filterDateObj.getTime()) return false;
        if (dateFilter === 'after' && todoDate.getTime() < filterDateObj.getTime()) return false;
      } else if (filterDate && !todo.deadline) {
        return false;
      }

      return true;
    });
  }, [todos, searchTitle, filterStatus, filterDate, dateFilter]);

  const clearFilters = () => {
    setSearchTitle('');
    setFilterStatus('all');
    setFilterDate('');
    setDateFilter('exact');
  };

  const hasActiveFilters = searchTitle || filterStatus !== 'all' || filterDate;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Search & Filter Tasks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Title
            </label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'incomplete')}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="incomplete">Incomplete</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'exact' | 'before' | 'after')}
                className="border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exact">On</option>
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredTodos.length}</span> of{' '}
          <span className="font-semibold">{todos.length}</span> tasks
        </p>
        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap">
            {searchTitle && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Title: "{searchTitle}"
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {filterStatus === 'completed' ? 'Completed' : 'Incomplete'}
              </span>
            )}
            {filterDate && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {dateFilter === 'exact' ? 'On' : dateFilter === 'before' ? 'Before' : 'After'}: {filterDate}
              </span>
            )}
          </div>
        )}
      </div>

      {filteredTodos.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border-2 border-dashed">
          <p>No tasks match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
