export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  deadline?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  deadline?: string;
}

export interface TodoResponse {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
