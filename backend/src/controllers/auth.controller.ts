import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { LoginRequest, SignupRequest } from '../common';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const data: SignupRequest = req.body;

      if (!data.email || !data.password || !data.name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
      }

      const result = await authService.signup(data);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      res.status(400).json({ error: message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginRequest = req.body;

      if (!data.email || !data.password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const user = await authService.findUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(authService.toUserDTO(user));
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  },
  async updateMe(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { name, password } = req.body;

      if (!name && !password) {
        res.status(400).json({ error: 'Nothing to update' });
        return;
      }

      const updatedUser = await authService.updateAccount(userId, { name, password });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Update failed' });
    }
  },
};