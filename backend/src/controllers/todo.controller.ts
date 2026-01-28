import { Request, Response } from 'express';
import { todoService } from '../services/todo.service';
import { CreateTodoRequest, UpdateTodoRequest } from '../common';

export const todoController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const todos = await todoService.getAll(userId);
      res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get todos' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const id = req.params.id as string;

      const todo = await todoService.getById(id, userId);
      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.status(200).json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get todo' });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const data: CreateTodoRequest = req.body;

      if (!data.title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const todo = await todoService.create(userId, data);
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create todo' });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const id = req.params.id as string;
      const data: UpdateTodoRequest = req.body;

      const todo = await todoService.update(id, userId, data);
      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.status(200).json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update todo' });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const id = req.params.id as string;

      const deleted = await todoService.delete(id, userId);
      if (!deleted) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  },
};