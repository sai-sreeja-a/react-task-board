# React Task Board

A full-stack task management application built with **React, TypeScript, Node.js, Express.js, and PostgreSQL**. The application provides task management, project organization, REST API integration, database migrations, and automated backend testing.

## Features

- Create, edit, delete, and manage tasks
- Move tasks between projects
- Manage task statuses: To Do, In Progress, and Done
- Search tasks by title
- Filter tasks by status
- Sort tasks by creation date
- Persist frontend tasks using local storage
- REST API integration
- Request validation and centralized error handling
- Pagination, filtering, sorting, and searching
- PostgreSQL database integration
- Database migrations and seed scripts
- Transactional database operations
- Audit logging
- Automated backend tests

## Technologies Used

### Frontend
- React 19
- TypeScript
- CSS
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- Zod
- Jest
- Supertest

### Database
- PostgreSQL
- pg (node-postgres)
- SQL migrations

## Project Structure

```text
set-03-react-basics/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── server/
│   ├── docs/
│   ├── migrations/
│   ├── seeds/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── scripts/
│   │   ├── services/
│   │   └── types/
│   └── tests/
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/sai-sreeja-a/react-task-board.git
cd react-task-board
```

### 2. Install Frontend Dependencies

From the project root:

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Add your local PostgreSQL configuration:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker_db
PGUSER=postgres
PGPASSWORD=your_local_password
PGTESTDATABASE=task_tracker_test_db
```

Replace the values with your own PostgreSQL configuration.

**Important:** Never commit your `.env` file or expose database credentials on GitHub.

### 5. Run Database Migrations

From the `server` directory:

```bash
npm run migrate
```

### 6. Seed the Database

```bash
npm run seed
```

### 7. Start the Backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 8. Start the Frontend

Open another terminal, navigate to the project root, and run:

```bash
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## API Documentation

Base URL:

`http://localhost:5000/api/tasks`

### Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/:id` | Retrieve a task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/tasks/:id/move` | Move a task to another project |

### Query Parameters

| Parameter | Description |
|---|---|
| `page` | Page number |
| `limit` | Number of tasks per page |
| `status` | Filter by task status |
| `search` | Search tasks by title |
| `sortBy` | Sort field |
| `order` | Sort order: `asc` or `desc` |

Example:

```text
GET /api/tasks?page=1&limit=10&status=todo&sortBy=createdAt&order=desc
```

## PostgreSQL Database Features

- Relational database schema
- Users, projects, tasks, comments, and tags
- Versioned SQL migrations
- Database seed scripts
- Parameterized SQL queries
- Database indexes for query optimization
- Transactional operations
- Audit logging

## SQL Injection Prevention

Database queries use parameterized SQL statements to help prevent SQL injection attacks.

**Unsafe example (do not use):**

```ts
const query = `SELECT * FROM tasks WHERE id = ${id}`;
const result = await pool.query(query);
```

Directly inserting user input into SQL queries can allow malicious input to alter the query.

**Safe example:**

```ts
const result = await pool.query(
  "SELECT * FROM tasks WHERE id = $1",
  [id]
);
```

Parameterized queries keep user-provided values separate from SQL query structure.

## Automated Testing

Backend tests use Jest and Supertest.

From the `server` directory, run:

```bash
npm test
```

The backend tests cover CRUD operations, request validation, invalid IDs, pagination, filtering, sorting, and searching.

## Production Build

### Frontend

From the project root:

```bash
npm run build
```

This runs the TypeScript build and creates the production frontend bundle using Vite.

### Backend

From the `server` directory:

```bash
npm run build
```

## Project Documentation

Additional database documentation is available in `server/docs/`, including:

- Database ERD
- Database normalization
- Performance analysis
- Transaction testing

## Learning Outcomes

- React state management and hooks
- TypeScript interfaces and types
- Reusable component architecture
- Custom hooks
- REST API integration
- Backend development with Express
- PostgreSQL schema design
- SQL migrations and query optimization
- Database transaction management
- Automated API testing

---

Built as part of my React and TypeScript learning journey.

**GitHub:** https://github.com/sai-sreeja-a

**Repository:** https://github.com/sai-sreeja-a/react-task-board
