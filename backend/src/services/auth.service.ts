import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  UserDTO,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  JWTPayload,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  SALT_ROUNDS,
} from '../common';
import { User, IUser } from '../models/user.model';
import { Todo } from '../models/todo.model';

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const newUser = await User.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    const token = this.generateToken(newUser);
    const userDTO = this.toUserDTO(newUser);

    return { user: userDTO, token };
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);
    const userDTO = this.toUserDTO(user);

    return { user: userDTO, token };
  },

  generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  },

  async findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  },

  toUserDTO(user: IUser): UserDTO {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  },
  async updateAccount(userId: string, data: { name?: string; password?: string }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(data.password, salt);
    }

    return await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  },
  async deleteAccount(userId: string) {
    await Todo.deleteMany({ userId });
    return await User.findByIdAndDelete(userId);
  },
};