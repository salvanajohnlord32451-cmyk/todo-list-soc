'use client';

import { useState, useEffect, useCallback } from 'react';
import { Todo, CreateTodoRequest, UpdateTodoRequest, User, LoginRequest, SignupRequest } from '@/common';
import { authService } from '@/services/auth.service';
import { todoService } from '@/services/todo.service';
import { TodoForm, TodoSection, AuthForm, Modal, CalendarView, SearchView, ProfileView, ForgotPassword } from '@/components';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeTab, setActiveTab] = useState<'tasks' | 'search' | 'profile'>('tasks');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      const data = await todoService.getAll();
      setTodos(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = authService.getUser();
      if (storedUser && authService.isAuthenticated()) {
        setUser(storedUser);
        await loadTodos();
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [loadTodos]);

  const handleAuth = async (data: LoginRequest | SignupRequest) => {
    let result;
    if (authMode === 'signup') {
      result = await authService.signup(data as SignupRequest);
    } else {
      result = await authService.login(data as LoginRequest);
    }
    setUser(result.user);
    await loadTodos();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setTodos([]);
    setActiveTab('tasks');
  };

  const handleCreateTodo = async (data: CreateTodoRequest) => {
    const newTodo = await todoService.create(data);
    setTodos((prev) => [newTodo, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdateTodo = async (id: string, data: UpdateTodoRequest) => {
    const updated = await todoService.update(id, data);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDeleteTodo = async (id: string) => {
    await todoService.delete(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-600 animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  if (!user) {
    if (showForgotPassword) {
      return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
    }
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        onModeChange={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const overdueTodos = todos
    .filter((t) => !t.completed && t.deadline && new Date(t.deadline) < now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const dueSoonTodos = todos
    .filter((t) => !t.completed && t.deadline && new Date(t.deadline) >= now && new Date(t.deadline) <= threeDaysFromNow)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const incompleteTodos = todos
    .filter((t) => !t.completed && !overdueTodos.includes(t) && !dueSoonTodos.includes(t))
    .sort((a, b) => {
      if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const completedTodos = todos
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const noTasks = incompleteTodos.length === 0 && overdueTodos.length === 0 && dueSoonTodos.length === 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setActiveTab('tasks')}
          >
            TO DO List
          </h1>
          
          <div className="flex items-center gap-6">
            {activeTab === 'tasks' && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  Calendar
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 border-l pl-6">
              <button
                onClick={() => setActiveTab(activeTab === 'search' ? 'tasks' : 'search')}
                className={`text-sm font-semibold transition-colors ${
                  activeTab === 'search' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🔍 Search
              </button>
              <button 
                onClick={() => setActiveTab(activeTab === 'profile' ? 'tasks' : 'profile')}
                className={`text-sm font-semibold transition-colors ${
                  activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👤 {user.name}
              </button>
              
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'profile' ? (
          <ProfileView user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />
        ) : activeTab === 'search' ? (
          <SearchView todos={todos} onUpdate={handleUpdateTodo} onDelete={handleDeleteTodo} />
        ) : (
          <div>
            {viewMode === 'grid' ? (
              <div className="space-y-8">
                <TodoSection
                  title="Overdue"
                  todos={overdueTodos}
                  icon="🚨"
                  badge={{ bg: 'bg-red-200', text: 'text-red-800' }}
                  containerClass="bg-red-50 rounded-xl p-4 border border-red-200"
                  titleClass="text-red-700"
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />

                <TodoSection
                  title="Due Soon (Next 3 Days)"
                  todos={dueSoonTodos}
                  icon="⏰"
                  badge={{ bg: 'bg-yellow-200', text: 'text-yellow-800' }}
                  containerClass="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
                  titleClass="text-yellow-700"
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />

                <TodoSection
                  title="Pending Tasks"
                  todos={incompleteTodos}
                  badge={{ bg: 'bg-blue-100', text: 'text-blue-700' }}
                  emptyMessage={noTasks ? 'No pending tasks!' : 'No other tasks'}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />

                <TodoSection
                  title="Completed"
                  todos={completedTodos}
                  badge={{ bg: 'bg-gray-200', text: 'text-gray-600' }}
                  titleClass="text-gray-500"
                  containerClass="opacity-75"
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              </div>
            ) : (
              <CalendarView
                todos={todos}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            )}
          </div>
        )}
      </main>

      {activeTab === 'tasks' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-3xl font-light"
          aria-label="Add new TO DO"
        >
          +
        </button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New TO DO"
      >
        <TodoForm onSubmit={handleCreateTodo} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}