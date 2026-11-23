# Task Board Application

A full-stack Task Board application built using React, TypeScript, Node.js, Express.js, and MongoDB. It allows users to create, manage, update, delete, search, filter, and organize tasks across different statuses.

## Features

### Frontend
- Create new tasks.
- Edit existing tasks.
- Delete tasks.
- Move tasks between To Do, In Progress, and Done.
- Search tasks by title.
- Filter tasks by status.
- Sort tasks by newest or oldest.
- Pagination for task lists.
- Responsive task board interface.

### Backend
- RESTful API using Node.js and Express.js.
- Complete CRUD operations.
- Request validation using Zod.
- Consistent error responses.
- Centralized error-handling middleware.
- Request-logging middleware.
- Pagination, filtering, sorting, and title search.
- MongoDB Atlas integration for persistent data storage.

### Automated Testing
- Jest and Supertest.
- Tests for API endpoints.
- Validation and failure-case testing.

## Technologies Used

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- Zod

**Testing**
- Jest
- Supertest

## Project Structure

```text
task-board/
│
├── public/
├── src/
│   ├── components/
│   ├── services/
│   │   └── taskApi.ts
│   ├── types/
│   └── App.tsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   ├── package.json
│   └── jest.config.js
│
├── package.json
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js
- npm
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/sai-sreeja-a/react-task-board.git
```

```bash
cd react-task-board
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` folder.

Add your MongoDB connection string:

```env
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholder with your own MongoDB Atlas connection string.

**Note:** Never commit your `.env` file or expose database credentials on GitHub.

### 5. Start the Backend Server

From the `server` directory:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5000`

### 6. Start the Frontend

Open another terminal, navigate to the project root, and run:

```bash
npm run dev
```

Frontend runs at:

`http://localhost:5173`

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

The task listing endpoint supports:

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

Search example:

```text
GET /api/tasks?search=React
```

## Running Automated Tests

Navigate to the server directory:

```bash
cd server
```

Run:

```bash
npm test
```

## Production Build

From the project root:

```bash
npm run build
```

## Project Status

- Frontend and backend integration completed.
- REST API CRUD operations implemented.
- Request validation and error handling implemented.
- Pagination, filtering, sorting, and title search implemented.
- MongoDB Atlas integration completed.
- Automated backend tests: **23 passing tests**.
- Production build successful.

## Author

**Sai Sreeja**

GitHub: [sai-sreeja-a](https://github.com/sai-sreeja-a)
