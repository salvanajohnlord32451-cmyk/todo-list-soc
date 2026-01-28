# Todo List Application

A full-stack todo list application built with **Separation of Concerns (SoC)** architecture.

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication

## Project Structure

```
todo-list-soc/
├── frontend/                 # Next.js frontend
│   └── src/
│       ├── app/             # Next.js pages
│       ├── common/          # Types, interfaces, constants
│       ├── components/      # React components
│       └── services/        # API client services
│
└── backend/                  # Express.js backend
    └── src/
        ├── common/          # Types, interfaces, constants
        ├── controllers/     # HTTP request handlers
        ├── middleware/      # Express middleware
        ├── routes/          # API routes
        └── services/        # Business logic
```

## Separation of Concerns Architecture

This project follows SoC principles:

- **Types & Interfaces**: Declared in `common/` directory
- **Constants**: Declared alongside types in `common/` directory
- **Business Logic**: Lives in service files
- **HTTP Handling**: Controllers handle requests/responses
- **No mixing**: Each file has a single responsibility

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Todos
- `GET /api/todos` - Get all todos (requires auth)
- `GET /api/todos/:id` - Get single todo (requires auth)
- `POST /api/todos` - Create todo (requires auth)
- `PUT /api/todos/:id` - Update todo (requires auth)
- `DELETE /api/todos/:id` - Delete todo (requires auth)

## Features

- User signup and login with JWT authentication
- Create, read, update, delete todos
- Mark todos as completed/incomplete
- Edit todo title and description
- Responsive UI with Tailwind CSS

## Note

This is a demo application using in-memory storage. Data will be lost when the server restarts.
