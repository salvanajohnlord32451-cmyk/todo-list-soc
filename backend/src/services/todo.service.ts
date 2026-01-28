import {
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoResponse,
} from '../common';
import { Todo, ITodo } from '../models/todo.model';

export const todoService = {
  async getAll(userId: string): Promise<TodoResponse[]> {
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    return todos.map(this.toTodoResponse);
  },

  async getById(id: string, userId: string): Promise<TodoResponse | null> {
    const todo = await Todo.findOne({ _id: id, userId });
    return todo ? this.toTodoResponse(todo) : null;
  },

  async create(userId: string, data: CreateTodoRequest): Promise<TodoResponse> {
    const newTodo = await Todo.create({
      userId,
      title: data.title,
      description: data.description || '',
      completed: false,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    return this.toTodoResponse(newTodo);
  },

  async update(id: string, userId: string, data: UpdateTodoRequest): Promise<TodoResponse | null> {
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    return updatedTodo ? this.toTodoResponse(updatedTodo) : null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await Todo.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  },

  toTodoResponse(todo: ITodo): TodoResponse {
    return {
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      deadline: todo.deadline,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  },
};
