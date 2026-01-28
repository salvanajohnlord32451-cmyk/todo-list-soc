import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  API_BASE_URL,
  API_ENDPOINTS,
} from '@/common';
import { authService } from './auth.service';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authService.getToken()}`,
});

export const todoService = {
  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TODOS.BASE}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todos');
    }

    return response.json();
  },

  async getById(id: string): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TODOS.BY_ID(id)}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch todo');
    }

    return response.json();
  },

  async create(data: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TODOS.BASE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create todo');
    }

    return response.json();
  },

  async update(id: string, data: UpdateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TODOS.BY_ID(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TODOS.BY_ID(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  },

  async toggleComplete(id: string, completed: boolean): Promise<Todo> {
    return this.update(id, { completed });
  },
};
