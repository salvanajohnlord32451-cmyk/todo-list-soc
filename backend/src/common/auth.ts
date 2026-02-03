
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export const JWT_SECRET = process.env.JWT_SECRET!;
export const JWT_EXPIRES_IN = '24h';
export const SALT_ROUNDS = 10;
