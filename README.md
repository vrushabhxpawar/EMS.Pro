# TaskFlow — Employee Task Management System

A full-stack MERN application for managing employee tasks, boards, and team workflows. Admins can create boards, assign tasks, and manage users. Employees can view their assigned tasks, update progress, and track deadlines.

## Frontend URL : https://emspro-frontend.vercel.app

## Backend URL : https://ems-pro-backend-l598.onrender.com

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Authentication & Security](#authentication--security)
- [Role-Based Access](#role-based-access)
- [Screenshots](#screenshots)

---

## Features

### Admin
- Dashboard with total employees, tasks, in-progress, and completed stats
- Create, edit, and delete boards
- Add members to boards
- Create and assign tasks with priority and due date
- View all tasks across all boards
- Manage all registered users

### Employee
- Personal dashboard with task summary and focus panel
- View only boards they are a member of
- Kanban board view (Todo / In Progress / Done)
- My Tasks page with status and priority filters
- Update task status
- Profile management with avatar color, name, email, and password

### General
- JWT authentication via httpOnly cookies
- Password strength meter
- Overdue task highlighting
- Fully responsive layout

---

## Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express | Server and REST API |
| MongoDB + Mongoose | Database and ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation and verification |
| cookie-parser | httpOnly cookie handling |
| cors | Cross-origin requests |
| dotenv | Environment variables |

### Frontend
| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui | Accessible UI components |
| Lucide React | Icon library |
| Axios | HTTP client with interceptors |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # login, register, logout, me, updateProfile, changePassword
│   │   ├── userController.js       # getUsers, deleteUser
│   │   ├── boardController.js      # CRUD for boards
│   │   └── taskController.js       # CRUD for tasks, getMyTasks
│   ├── middleware/
│   │   └── auth.js                 # protect middleware (JWT cookie verification)
│   ├── models/
│   │   ├── User.js                 # name, email, password, role, avatarColor
│   │   ├── Board.js                # title, description, owner, members
│   │   └── Task.js                 # title, description, status, priority, dueDate, assignedTo, board
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── boardRoutes.js
│   │   └── taskRoutes.js
│   ├── .env
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js            # Axios instance with withCredentials + 401 interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state, login, logout
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx     # Role-aware navigation
    │   │   │   └── Topbar.jsx      # User greeting + dropdown
    │   │   ├── ui/                 # shadcn generated components
    │   │   ├── PriorityBadge.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminUsers.jsx
    │   │   │   ├── AdminBoards.jsx
    │   │   │   └── BoardForm.jsx
    │   │   └── user/
    │   │       ├── UserDashboard.jsx
    │   │       ├── UserBoards.jsx
    │   │       ├── BoardView.jsx
    │   │       ├── MyTasks.jsx
    │   │       ├── MyProfile.jsx
    │   │       └── modals/
    │   │           ├── CreateTaskModal.jsx
    │   │           └── TaskDetailModal.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── jsconfig.json
    ├── vite.config.js
    └── .env
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

---

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in your values (see Environment Variables section)

# 4. Start the server
npm run dev
```

---

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button input label dropdown-menu

# 4. Create environment file
cp .env.example .env

# 5. Start the dev server
npm run dev
```

---

## Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/taskflow

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Cookie
COOKIE_EXPIRES_DAYS=7

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login and set cookie |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Private | Get current user |
| PUT | `/update-profile` | Private | Update name, email, avatarColor |
| PUT | `/change-password` | Private | Change password (requires current) |

---

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | Get all users |
| DELETE | `/:id` | Admin | Delete a user |

---

### Boards — `/api/boards`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get boards (admin: all, user: member of) |
| POST | `/` | Admin | Create a board |
| GET | `/:id` | Private | Get single board |
| PUT | `/:id` | Admin | Update board |
| DELETE | `/:id` | Admin | Delete board and its tasks |
| GET | `/:id/tasks` | Private | Get all tasks for a board |

---

### Tasks — `/api/tasks`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/my-tasks` | Private | Get all tasks assigned to current user |
| POST | `/boards/:id/tasks` | Admin | Create a task on a board |
| PUT | `/:id` | Private | Update task (admin: all fields, user: status only) |
| DELETE | `/:id` | Admin | Delete a task |

> **Important:** `/my-tasks` must be registered **before** `/:id` in the router to prevent Express from treating `"my-tasks"` as an ObjectId.

---

## Frontend Pages

### Public
| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email + password sign in |
| `/register` | Register | New account creation |

### Employee (Private)
| Route | Page | Description |
|---|---|---|
| `/dashboard` | UserDashboard | Task stats, task list, focus panel, board shortcuts |
| `/boards` | UserBoards | Cards for boards the user is a member of |
| `/boards/:id` | BoardView | Kanban view — Todo / In Progress / Done |
| `/my-tasks` | MyTasks | Full task list with status and priority filters |
| `/profile` | MyProfile | Edit name, email, avatar color, password |

### Admin (Private + Admin Only)
| Route | Page | Description |
|---|---|---|
| `/admin` | AdminDashboard | Stats, recent tasks table, employee overview |
| `/admin/users` | AdminUsers | All users with delete action |
| `/admin/boards` | AdminBoards | All boards with view, edit, delete |
| `/admin/boards/new` | BoardForm | Create new board with member selection |
| `/admin/boards/:id/edit` | BoardForm | Edit existing board |

---

## Authentication & Security

### Cookie-based JWT

Authentication uses **httpOnly cookies** — the token is never accessible to JavaScript, preventing XSS token theft.

```js
// Cookie set on login
res.cookie('token', jwt, {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
});
```

The Axios instance sends `withCredentials: true` so the browser includes the cookie on every request automatically.

---

### Password Hashing

Passwords are hashed using `bcryptjs` via a Mongoose `pre('save')` hook:

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

The `isModified` guard prevents re-hashing on unrelated saves (e.g. profile updates).

---

## Role-Based Access

Two roles: `admin` and `employee`.

| Feature | Admin | Employee |
|---|---|---|
| View all boards | ✅ | ❌ (own boards only) |
| Create / edit / delete boards | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Edit all task fields | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View all users | ✅ | ❌ |
| Delete users | ✅ | ❌ |
| View own tasks | ✅ | ✅ |
| Update own profile | ✅ | ✅ |

Role is enforced on both:
- **Backend** — `protect` middleware checks JWT, admin-only routes check `req.user.role`
- **Frontend** — `ProtectedRoute` with `adminOnly` prop, sidebar links filtered by role, UI elements conditionally rendered

---

## Key Implementation Notes

### Route Order in Express

The `/my-tasks` route must come **before** `/:id` or Express will try to cast `"my-tasks"` as a MongoDB ObjectId:

```js
router.get('/my-tasks', protect, getMyTasks);  // ✅ first
router.get('/:id',      protect, getTaskById); // ✅ after
```

### Profile State Sync

Profile form state is initialized empty and synced via `useEffect` once the auth user loads — avoids the stale closure problem of initializing state from `user` directly in `useState()`:

```js
useEffect(() => {
  if (user) {
    setProfileForm({ name: user.name, email: user.email });
    setAvatarColor(user.avatarColor || 'bg-gray-800');
  }
}, [user]);
```

---

## Scripts

### Backend

```bash
npm run dev      # Start with nodemon
npm start        # Start without nodemon
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## License

MIT — free to use and modify for personal or commercial projects.
