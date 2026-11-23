# React Task Board

A full-stack task management application built with React, TypeScript, Node.js, Express.js, and PostgreSQL.

## Features

- Create, edit, delete, and manage tasks
- Move tasks between To Do, In Progress, and Done
- Search tasks by title
- Filter tasks by status
- Sort tasks by creation date
- Persist frontend tasks using local storage
- REST API integration
- Request validation and error handling
- Pagination, filtering, sorting, and searching
- PostgreSQL database integration
- Database migrations and seed scripts
- Transactional operations and audit logging
- Automated backend tests

## Technologies Used

### Frontend
- React
- TypeScript
- CSS
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
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

### 1. Install Frontend Dependencies

From the project root:

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Configure your local PostgreSQL connection:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker_db
PGUSER=postgres
PGPASSWORD=your_local_password
PGTESTDATABASE=task_tracker_test_db
```

Replace the values with your own local database configuration.

**Important:** Never commit your `.env` file or expose database credentials on GitHub.

### 4. Run Database Migrations

From the `server` directory:

```bash
npm run migrate
```

### 5. Seed the Database

```bash
npm run seed
```

### 6. Start the Backend

```bash
npm run dev
```

Backend runs at:

http://localhost:5000

### 7. Start the Frontend

Open another terminal, navigate to the project root, and run:

```bash
npm run dev
```

Frontend runs at:

http://localhost:5173

## API Endpoints

Base URL: `http://localhost:5000/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/:id` | Retrieve a task by ID |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Query Parameters

| Parameter | Description |
|---|---|
| `page` | Page number |
| `limit` | Number of tasks per page |
| `status` | Filter by task status |
| `search` | Search by task title |
| `sortBy` | Sort by title, createdAt, or updatedAt |
| `order` | Sort order: asc or desc |

Example:

```text
GET /api/tasks?page=1&limit=10&status=todo&sortBy=createdAt&order=desc
```

## PostgreSQL Database Features

- Normalized relational database schema
- Users, projects, tasks, comments, and tags
- Versioned SQL migrations
- Seed script generating 100,000 tasks
- Parameterized SQL queries
- Database indexes for query optimization
- Transactional operations and audit logging

## SQL Injection Prevention

Database queries use parameterized SQL statements.

Example:

```ts
const result = await pool.query(
  "SELECT * FROM tasks WHERE id = $1",
  [id]
);
```

This keeps user-provided values separate from SQL query structure.

## Automated Testing

Navigate to the server directory:

```bash
cd server
```

Run:

```bash
npm test
```

The backend tests cover CRUD operations, validation, invalid IDs, pagination, filtering, sorting, and searching.

The previously reported test result was 23 passing tests.

## Production Build

From the project root, run:

```bash
npm run build
```

For the backend, navigate to `server` and run its configured build script.

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
- Automated API testing

---

Built as part of my React and TypeScript learning journey.

GitHub: https://github.com/sai-sreeja-a
