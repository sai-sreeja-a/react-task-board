# Task Board Application

A full-stack task management application built using Next.js, React, TypeScript, and PostgreSQL.

The application allows users to manage projects, organize tasks, track task progress, and collaborate through comments with role-based access control.

## Features

### Authentication
- User registration
- User login and logout
- Authenticated project access

### Project Management
- View available projects
- Create new projects
- Manage project details
- Role-based project permissions

### Task Management
- Create tasks
- View task details
- Update existing tasks
- Change task status
- Move tasks between projects
- Mark tasks as completed
- Delete tasks

### Collaboration and Permissions
- Add comments to tasks
- Role-based access control
- Viewers have read-only access
- Owners and members can update task status

### User Experience
- Loading states
- Error handling
- Custom 404 page
- Route-level error boundaries

## Server and Browser Responsibilities

The application uses the Next.js App Router. Pages use Server Components for authentication checks and data fetching. Interactive forms use Client Components where browser-side interaction is required. Data changes are handled through Server Actions.

### Projects Page — `/projects`

**Runs on the server:**
- Checks the authenticated user.
- Fetches the projects available to the user.
- Renders the project list.

**Runs in the browser:**
- Displays the rendered project list.
- Allows the user to click a project or navigate to create a project.

**Why:** Project data and authentication are handled on the server, while the browser is responsible for navigation and user interaction.

### Project Details Page — `/projects/[projectId]`

**Runs on the server:**
- Checks the authenticated user.
- Fetches the selected project and its tasks.
- Checks the user's project permissions.
- Handles invalid project IDs and displays the 404 page when the project is not found.

**Runs in the browser:**
- Displays the project and task information.
- Allows users to navigate to task details or the task creation form.

**Why:** Project and task data are loaded securely on the server. The browser handles navigation and interactive controls.

### Task Details Page — `/tasks/[taskId]`

**Runs on the server:**
- Checks the authenticated user.
- Fetches the task, its project, and its comments.
- Checks permissions for task operations.
- Handles missing tasks with the 404 page.

**Runs in the browser:**
- Displays the task edit form.
- Allows users to edit the title, description, and status.
- Allows users to submit comments.
- Shows validation errors and saving feedback.

**Why:** Task data and permission checks remain server-side. Client Components provide interactive forms and pending-state feedback.

### Settings Page — `/settings`

**Runs on the server:**
- Checks the authenticated user.
- Redirects unauthenticated users to the login page.
- Retrieves the user's account information.

**Runs in the browser:**
- Displays the account information returned by the server.

**Why:** The page is read-only, so it does not need client-side state or a Client Component.

### Forms and Data Updates

Project creation, task creation, task updates, and comment creation use Server Actions.

Client-side form components use React form hooks to:
- Display validation errors returned by the server.
- Preserve submitted values when validation fails.
- Disable submit buttons while an action is pending.
- Show feedback while the action is processing.

Server Actions validate input, perform the requested operation, and revalidate relevant pages when data changes.

This approach keeps database operations and authorization checks on the server while providing interactive form behavior in the browser.


## Technology Stack

- **Full-stack framework:** Next.js App Router
- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **Backend logic:** Next.js Server Components, Server Actions, and server-side data access
- **Development Tools:** npm, Node.js

## Environment Variables

The Next.js application connects directly to PostgreSQL.

Create a `.env.local` file in the `next-app` folder, alongside `package.json`.

Add the following configuration:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_tracker_db
PGUSER=postgres
PGPASSWORD=your_local_password
```

Replace `your_local_password` with your PostgreSQL password.

Keep `.env.local` private. Do not commit it to Git.


## Project Structure
set-03-react-basics/
|
|-- next-app/              # Next.js frontend
|   |-- src/
|   |   |-- app/
|   |-- public/
|   |-- package.json
|
|-- server/                # Express backend
    |-- src/
    |   |-- controllers/
    |   |-- routes/
    |-- package.json

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Frontend Setup

```bash
cd next-app
npm install
```

Configure the required environment variables in `.env.local`.

Start the development server:

```bash
npm run dev
```

### 3. Backend Setup

Open another terminal:

```bash
cd server
npm install
```

Configure the required backend environment variables.

Start the backend using the appropriate script defined in `server/package.json`.

### 4. Open the Application

Open the frontend URL displayed in your terminal.

## Validation and Testing

Frontend TypeScript validation:

```bash
npx tsc --noEmit
```

Frontend production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Backend tests:

```bash
npm test
```

## Security

- Authentication is required for protected operations.
- Project permissions control access to task operations.
- Environment variables are used for configuration.
- Database credentials and secrets should never be committed to version control.

## Project Status

The application includes authentication, project management, task management, comments, role-based permissions, and error handling.

The frontend TypeScript validation and production build have been successfully tested.

Backend automated tests have also been run successfully.