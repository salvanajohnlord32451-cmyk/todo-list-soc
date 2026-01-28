'use client';

import { useState, useEffect, useCallback } from 'react';
import { Todo, CreateTodoRequest, UpdateTodoRequest, User, LoginRequest, SignupRequest } from '@/common';
import { authService } from '@/services/auth.service';
import { todoService } from '@/services/todo.service';
import { TodoItem, TodoForm, AuthForm, Modal, CalendarView, ProfileView } from '@/components';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile'>('tasks');

  const loadTodos = useCallback(async () => {
    try {
      const data = await todoService.getAll();
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        onModeChange={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    );
  }

  const sortedTodos = [...todos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
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
          <ProfileView user={user} />
        ) : (
          <div>
            {viewMode === 'grid' ? (
              <div>
                {todos.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 bg-white rounded-xl border-2 border-dashed">
                    <p className="text-lg mb-2">No TO DOs yet</p>
                    <p className="text-sm">Click the + button to create your first one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onUpdate={handleUpdateTodo}
                        onDelete={handleDeleteTodo}
                      />
                    ))}
                  </div>
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