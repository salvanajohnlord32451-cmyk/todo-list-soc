'use client';

import { Todo, UpdateTodoRequest } from '@/common';
import { useState } from 'react';
import { TodoDetailModal } from './TodoDetailModal';

interface CalendarViewProps {
  todos: Todo[];
  onUpdate: (id: string, data: UpdateTodoRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CalendarView({ todos, onUpdate, onDelete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTodosForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return todos.filter(todo => {
      if (!todo.deadline) return false;
      const todoDate = new Date(todo.deadline).toISOString().split('T')[0];
      return todoDate === dateStr;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedTodo(null);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-24 p-2 bg-gray-50" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayTodos = getTodosForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <div
        key={day}
        className={`min-h-24 p-2 border ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
      >
        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayTodos.map(todo => (
            <div
              key={todo.id}
              className="text-xs p-1 rounded bg-gray-100 hover:bg-blue-100 cursor-pointer transition-colors"
              onClick={() => handleTodoClick(todo)}
            >
              <div className={`truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {todo.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
        >
          Next →
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-100">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-700 border">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>

    <TodoDetailModal
      todo={selectedTodo}
      isOpen={isDetailModalOpen}
      onClose={handleCloseDetail}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
    </>
  );
}
