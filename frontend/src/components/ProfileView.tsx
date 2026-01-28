'use client';

import { useState, useEffect } from 'react';
import { User } from '@/common';
import { todoService } from '@/services/todo.service';
import { authService } from '@/services/auth.service';

interface ProfileViewProps {
  user: User;
}

export const ProfileView = ({ user }: ProfileViewProps) => {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const todos = await todoService.getAll();
        const completed = todos.filter((t) => t.completed).length;
        setStats({ total: todos.length, completed, pending: todos.length - completed });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile({ 
        name, 
        password: password || undefined 
      });
      setStatus({ type: 'success', msg: 'Profile updated!' });
      setIsEditing(false);
      setPassword('');
    } catch (err) {
      setStatus({ type: 'error', msg: 'Update failed.' });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Settings' : 'Profile'}
        </h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {isEditing ? 'Cancel' : 'Edit Account'}
        </button>
      </div>

      {status.msg && (
        <div className={`p-3 mb-4 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.msg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave blank to keep current"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition-all"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Email</p>
            <p className="text-lg text-gray-800">{user.email}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-xs font-bold text-blue-600 uppercase">Total</p>
              <p className="text-2xl font-black text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-xs font-bold text-green-600 uppercase">Done</p>
              <p className="text-2xl font-black text-green-900">{stats.completed}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-xs font-bold text-yellow-600 uppercase">Pending</p>
              <p className="text-2xl font-black text-yellow-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};