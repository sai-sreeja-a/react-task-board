# React Task Board

A full-stack task management application built with **React, TypeScript, Node.js, Express.js, and PostgreSQL**. The application provides task management, project organization, user authentication, role-based access control, REST API integration, database migrations, and automated backend testing.

## Features

### Task Management
- Create, edit, delete, and manage tasks
- Move tasks between projects
- Manage task statuses: To Do, In Progress, and Done
- Search tasks by title
- Filter tasks by status
- Sort tasks by creation date
- Pagination, filtering, sorting, and searching

### Authentication and Security
- User registration and login
- Secure password hashing using bcrypt
- Session-based authentication using HTTP-only cookies
- User logout and session revocation
- Protected API routes
- Forgot-password and password-reset functionality
- Password reset tokens with expiration
- Login and password-reset rate limiting
- Password validation, including bcrypt's 72-byte limit
- Cross-user data access protection

### Project Authorization
- Project membership management
- Role-based access control
- Owner, member, and viewer roles
- Server-side permission enforcement
- Viewers cannot modify tasks
- Users cannot access another user's protected project data

### Backend and Database
- REST API integration
- Request validation and centralized error handling
- PostgreSQL database integration
- Database migrations and seed scripts
- Transactional database operations
- Parameterized SQL queries
- Audit logging
- Automated backend tests

## Current Application Architecture

The repository contains the original React + Vite frontend, a newer Next.js frontend, and the Express.js backend.

The current Task Board frontend is being developed in the `next-app/` directory.

### Next.js Frontend

The Next.js application is built using:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL integration

The frontend provides authentication, project management, task management, and user settings.

### Next.js Application Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/login` | User login |
| `/signup` | User registration |
| `/projects` | View projects |
| `/projects/new` | Create a project |
| `/projects/[projectId]` | View project details |
| `/projects/[projectId]/tasks/new` | Create a task |
| `/tasks/[taskId]` | View task details |
| `/settings` | User settings |

### Frontend Development

Navigate to the Next.js application:

```bash
cd next-app
npm install
npm run dev
```

The development server displays the local URL in the terminal.

### Frontend TypeScript Validation

```bash
npx tsc --noEmit
```

### Frontend Production Build

```bash
npm run build
```

### Start the Production Server

```bash
npm run start
```

### Original React + Vite Frontend

The repository also contains the original React + Vite frontend at the project root.

It uses React, TypeScript, and Vite.

The root-level frontend can be started using:

```bash
npm install
npm run dev
```

The original Vite frontend is retained separately from the newer Next.js application.


## Technologies Used


### Frontend
- React 19
- Next.js 16
- TypeScript
- Tailwind CSS
- CSS
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- bcryptjs
- express-rate-limit
- cookie-parser
- Jest
- Supertest

### Database
- PostgreSQL
- node-postgres (`pg`)
- SQL migrations


## Project Structure

set-03-react-basics/
|
|-- public/                    # Original Vite public assets
|
|-- src/                       # Original Vite frontend
|   |-- components/
|   |-- hooks/
|   |-- services/
|   |-- types/
|
|-- next-app/                  # Next.js frontend
|   |-- public/
|   |-- src/
|   |   |-- app/
|   |   |   |-- login/
|   |   |   |-- signup/
|   |   |   |-- projects/
|   |   |   |-- tasks/
|   |   |   |-- settings/
|   |-- package.json
|
|-- server/                    # Express backend
|   |-- docs/
|   |-- migrations/
|   |-- seeds/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- schemas/
|   |   |-- scripts/
|   |   |-- services/
|   |   |-- types/
|   |-- tests/
|   |-- package.json
|
|-- .gitignore
|-- package.json               # Original Vite frontend
|-- README.md
|-- README-backup.md


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

Vite displays the frontend's local URL in the terminal.

## API Documentation

Base URL:

`http://localhost:5000/api`

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/logout` | Log out and revoke the session |
| GET | `/auth/me` | Retrieve the authenticated user |
| POST | `/auth/forgot-password` | Request a password reset |
| POST | `/auth/reset-password` | Reset a password using a valid token |

Authentication uses HTTP-only session cookies. Protected endpoints require a valid session.

**Password reset note:** In the current development implementation, the reset link is logged to the server console. Production email delivery requires an email provider integration.

### Task Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Retrieve tasks |
| GET | `/tasks/:id` | Retrieve a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/move` | Move a task to another project |

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

## Authentication and Authorization

### Password Security
- Passwords are hashed using bcrypt before database storage.
- Passwords are never stored as plain text.
- Passwords must contain at least 8 characters.
- Passwords are limited to 72 bytes to respect bcrypt's input limit.

### Session Security
- Authentication uses randomly generated session tokens.
- Session tokens are stored as SHA-256 hashes in the database.
- Sessions have expiration dates.
- HTTP-only cookies help protect session tokens from JavaScript access.
- Logging out revokes the current session.
- Password resets revoke existing user sessions.

### Role-Based Access Control

The application supports three project roles:

| Role | Permissions |
|---|---|
| Owner | Full project management permissions |
| Member | Project access and permitted task operations |
| Viewer | Read-only access |

Permissions are enforced on the backend, not just through frontend controls.

### Rate Limiting
- Login attempts are limited to help prevent brute-force attacks.
- Password-reset requests are rate limited.
- Password-reset responses avoid revealing whether an email address is registered.

## PostgreSQL Database Features

- Relational database schema
- Users, projects, project memberships, tasks, comments, and tags
- User sessions and password-reset tokens
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

The backend currently has **34 passing automated tests** across two test suites.

### Task API Tests
- Task CRUD operations
- Request validation
- Invalid IDs
- Pagination, filtering, and sorting
- Cross-user access protection
- Viewer permission enforcement
- Expired-session protection

### Authentication API Tests
- User registration
- Duplicate-email rejection
- Invalid signup input
- Password length validation
- Login and incorrect credentials
- Logout and session revocation
- Forgot-password response privacy
- Password reset and session revocation

### Test Results

- Authentication tests: 8 passed
- Task API tests: 26 passed
- Total: 34 passed

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

This compiles the backend TypeScript code.

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
- User authentication and session management
- Password security and rate limiting
- Role-based access control
- PostgreSQL schema design
- SQL migrations and query optimization
- Database transaction management
- Automated API and security testing

---

Built as part of my React and TypeScript learning journey.

**GitHub:** https://github.com/sai-sreeja-a

**Repository:** https://github.com/sai-sreeja-a/react-task-board
