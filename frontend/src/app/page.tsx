'use client';

import { useState, useEffect, useCallback } from 'react';
import { Todo, CreateTodoRequest, UpdateTodoRequest, User, LoginRequest, SignupRequest } from '@/common';
import { authService } from '@/services/auth.service';
import { todoService } from '@/services/todo.service';
import { TodoItem, TodoForm, AuthForm, Modal, CalendarView, ProfileView, ForgotPassword } from '@/components';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile'>('tasks');
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

  const incompleteTodos = todos
    .filter((t) => !t.completed)
    .sort((a, b) => {
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const completedTodos = todos
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                onClick={() => setActiveTab(activeTab === 'tasks' ? 'profile' : 'tasks')}
                className={`text-sm font-semibold transition-colors ${
                  activeTab === 'profile' ? 'text-gray-900' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                {activeTab === 'tasks' ? `Hello, ${user.name}` : 'Back to Dashboard'}
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
        ) : (
          <div>
            {viewMode === 'grid' ? (
              <div className="space-y-12">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Priority (By Deadline)</h2>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {incompleteTodos.length}
                    </span>
                  </div>
                  
                  {incompleteTodos.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white rounded-xl border-2 border-dashed">
                      <p>No pending tasks!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {incompleteTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onUpdate={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {completedTodos.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-bold text-gray-500">Completed</h2>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {completedTodos.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                      {completedTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onUpdate={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                        />
                      ))}
                    </div>
                  </section>
                )}
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