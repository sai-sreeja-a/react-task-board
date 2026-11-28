# React Task Board

A task management application built with React, TypeScript, Next.js, Node.js, Express, and PostgreSQL.

The repository contains an original React + Vite frontend, a Next.js application, and an Express backend. The current task-board frontend is being developed in `next-app/`.

The application supports authentication, project organization, task management, comments, and role-based access control.

## Features

### Authentication and Security

- User registration, login, and logout
- Password hashing using bcrypt
- Session-based authentication
- HTTP-only authentication cookies
- Protected routes and operations
- Forgot-password and password-reset functionality in the Express backend
- Password-reset tokens with expiration
- Login and password-reset rate limiting
- Password validation, including bcrypt's 72-byte limit
- Cross-user data access protection

### Project Management

- View and create projects
- Project membership management
- Owner, member, and viewer roles
- Role-based project access
- Server-side permission enforcement

### Task Management

- Create, view, edit, and delete tasks
- Move tasks between projects
- Manage task statuses: To Do, In Progress, and Done
- Mark tasks as completed
- Search tasks by title
- Filter tasks by status
- Sort and paginate task results

### Collaboration

- Add and view task comments
- Project-membership-based comment access
- Viewers can read and post comments
- Viewers cannot modify tasks
- Owners and members can perform permitted task operations

### User Experience

- Loading and pending states
- Form validation and error feedback
- Custom 404 page
- Route-level error boundaries
- Server-side authentication and data fetching

## Application Architecture

### Next.js Application

The current frontend is located in `next-app/`.

It uses the Next.js App Router and includes:

- React Server Components for server-side rendering and data fetching
- Client Components for interactive forms and browser-side behavior
- Server Actions for data mutations
- Server-side PostgreSQL access
- Authentication and authorization checks on the server

The Next.js application handles its database operations through server-side services and Server Actions.

### Express Backend

The Express backend is located in `server/`.

It provides a REST API with authentication, task operations, request validation, centralized error handling, PostgreSQL integration, and automated API tests.

The Express backend is maintained separately from the Next.js application.

### Original React + Vite Frontend

The original React + Vite frontend is located at the repository root.

It is retained separately from the newer Next.js application.

## Next.js Routes

| Route | Description |
|---|---|
| `/` | Home page |
| `/login` | User login |
| `/signup` | User registration |
| `/projects` | View available projects |
| `/projects/new` | Create a project |
| `/projects/[projectId]` | View project details and tasks |
| `/projects/[projectId]/tasks/new` | Create a task |
| `/tasks/[taskId]` | View task details and comments |
| `/settings` | User settings |

## Server and Browser Responsibilities

### Server-side responsibilities

- Authenticate the current user
- Fetch projects, tasks, and comments
- Check project membership and permissions
- Validate submitted data
- Perform database operations
- Revalidate pages after data changes
- Handle missing resources and access restrictions

### Browser-side responsibilities

- Display rendered page content
- Handle navigation
- Provide interactive forms
- Display validation errors and pending states
- Allow users to submit comments and task updates

This architecture keeps authentication, authorization, and database operations on the server while providing interactive user experiences through Client Components.

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vite for the original frontend

### Backend

- Node.js
- Express
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
- Database seed scripts

## Project Structure

```text
set-03-react-basics/
|
|-- src/                       # Original React + Vite frontend
|   |-- components/
|   |-- hooks/
|   |-- services/
|   |-- types/
|
|-- next-app/                  # Current Next.js application
|   |-- public/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- lib/
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
|   |   |-- services/
|   |-- tests/
|   |-- package.json
|
|-- package.json               # Original Vite frontend
|-- README.md
```

## Getting Started

### Prerequisites

Install the following:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/sai-sreeja-a/react-task-board.git
cd react-task-board
```

### 2. Set Up the Next.js Application

```bash
cd next-app
npm install
```

Create a `.env.local` file in the `next-app/` directory and configure the PostgreSQL connection and any other required environment variables.

Use the variable names expected by the application's database configuration.

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### 3. Set Up the Express Backend

Open another terminal from the repository root:

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory and configure your local PostgreSQL connection.

Example:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker_db
PGUSER=postgres
PGPASSWORD=your_local_password
PGTESTDATABASE=task_tracker_test_db
```

Replace these values with your own PostgreSQL configuration.

Never commit `.env` files or expose database credentials.

### 4. Run Backend Database Migrations

From the `server/` directory:

```bash
npm run migrate
```

### 5. Seed the Backend Database

```bash
npm run seed
```

### 6. Start the Express Backend

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

The Next.js application and Express backend are separate applications. Start each one from its own directory when working with both.

## Next.js Validation and Production Build

Run these commands from `next-app/`.

### TypeScript Validation

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

### Start the Production Server

```bash
npm run start
```

Build the application before starting the production server.

## Express API Documentation

The Express API base URL is:

```text
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| POST | `/auth/logout` | Log out and revoke the session |
| GET | `/auth/me` | Retrieve the authenticated user |
| POST | `/auth/forgot-password` | Request a password reset |
| POST | `/auth/reset-password` | Reset a password using a valid token |

Authentication uses HTTP-only session cookies. Protected endpoints require a valid session.

In the current development implementation, password-reset links are logged to the server console. Production email delivery requires an email provider integration.

### Task Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Retrieve tasks |
| GET | `/tasks/:id` | Retrieve a task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/move` | Move a task to another project |

### Task Query Parameters

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
- Plain-text passwords are not stored.
- Passwords must meet the application's validation requirements.
- Password length is limited to bcrypt's 72-byte input limit.

### Session Security

- Session tokens are randomly generated.
- Session tokens are stored as hashes in the database.
- Sessions have expiration dates.
- HTTP-only cookies help prevent JavaScript access to session tokens.
- Logging out revokes the current session.
- Password resets revoke existing sessions.

### Project Roles

| Role | Permissions |
|---|---|
| Owner | Full project management permissions |
| Member | Project access and permitted task operations |
| Viewer | Read-only task access; can participate in comments |

Permissions are enforced on the server, not only through frontend controls.

### Rate Limiting

- Login attempts are rate limited.
- Password-reset requests are rate limited.
- Password-reset responses avoid revealing whether an email address is registered.

## PostgreSQL Database Features

- Relational database schema
- Users, projects, project memberships, tasks, comments, and tags
- User sessions and password-reset tokens in the Express backend
- Versioned SQL migrations
- Database seed scripts
- Parameterized SQL queries
- Database indexes
- Transactional operations
- Audit logging

## SQL Injection Prevention

Database queries use parameterized SQL statements to help prevent SQL injection.

Unsafe example:

```ts
const query = `SELECT * FROM tasks WHERE id = ${id}`;
const result = await pool.query(query);
```

Safe example:

```ts
const result = await pool.query(
  "SELECT * FROM tasks WHERE id = $1",
  [id]
);
```

Parameterized queries keep user-provided values separate from the SQL query structure.

## Automated Testing

The Express backend uses Jest and Supertest.

From the `server/` directory, run:

```bash
npm test
```

The backend test suite has **34 passing tests across two test suites**.

### Authentication API Tests

- User registration
- Duplicate-email rejection
- Invalid signup input
- Password validation
- Login and incorrect credentials
- Logout and session revocation
- Forgot-password response privacy
- Password reset and session revocation

### Task API Tests

- Task CRUD operations
- Request validation
- Invalid IDs
- Pagination, filtering, and sorting
- Cross-user access protection
- Viewer permission enforcement
- Expired-session protection

### Test Results

- Authentication tests: 8 passed
- Task API tests: 26 passed
- Total: 34 passed

The Next.js application has also been validated separately using TypeScript checks, linting, a production build, and manual permission testing.

## Production Build

### Next.js Frontend

From `next-app/`:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Express Backend

From `server/`:

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
- Next.js App Router
- Server Components and Client Components
- Server Actions
- REST API integration
- Backend development with Express
- Authentication and session management
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
