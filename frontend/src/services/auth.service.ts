
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  User,
  TOKEN_KEY,
  USER_KEY,
  API_BASE_URL,
  API_ENDPOINTS,
} from '@/common';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const result: AuthResponse = await response.json();
    this.setToken(result.token);
    this.setUser(result.user);
    return result;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const result: AuthResponse = await response.json();
    this.setToken(result.token);
    this.setUser(result.user);
    return result;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
  async updateProfile(data: { name?: string; password?: string }): Promise<User> {
  const token = this.getToken();
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Update failed');
  
  const updatedUser = await response.json();
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
},
async deleteProfile(): Promise<void> {
  const token = this.getToken();
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Delete failed');
  this.logout();
},
};
