# Team Task Manager

A full-stack, modern Team Task Manager web application featuring a stunning dark-themed glassmorphism UI, Kanban board, and real-time dashboard analytics.

## 🌟 Features
- **Role-Based Access Control:** Admin and Member roles.
- **Projects & Kanban Boards:** Create projects, add team members, and manage tasks with drag-and-drop.
- **Dashboard Analytics:** Visual representation of task statuses using Recharts.
- **Modern UI/UX:** Built with Tailwind CSS and Framer Motion for smooth animations and a premium glassmorphism aesthetic.

## 🚀 Tech Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion, Zustand, `@hello-pangea/dnd`, Recharts.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs.

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed locally OR a MongoDB Atlas cluster.

### 1. Database Setup (MongoDB Atlas)
If you don't have a local MongoDB instance, create a free one on Atlas:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2. Create a new cluster (the free tier is fine).
3. Under "Database Access", create a user and password.
4. Under "Network Access", allow access from anywhere (`0.0.0.0/0`).
5. Click "Connect" -> "Connect your application" and copy the connection string. Replace `<password>` with your database user's password.

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key
```
- Seed the database with sample data:
```bash
npm run seed
```
- Start the backend server:
```bash
npm run server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate user & get token
- `GET /me` - Get current user profile
- `GET /users` - Get all users (Private)

### Projects (`/api/projects`)
- `GET /` - Get all projects for logged-in user
- `POST /` - Create a project (Admin)
- `DELETE /:id` - Delete a project (Admin)

### Tasks (`/api/tasks`)
- `GET /project/:projectId` - Get tasks for a specific project
- `POST /` - Create a task (Admin)
- `PUT /:id` - Update task status/details
- `DELETE /:id` - Delete a task (Admin)

### Dashboard (`/api/dashboard`)
- `GET /` - Get aggregated stats and recent tasks

## 🚢 Deployment (Railway)

1. Push your code to GitHub.
2. Go to [Railway](https://railway.app/) and create a new project from your repo.
3. Railway should auto-detect the `backend` and `frontend` folders if you set them up as separate services, or you can deploy them individually.
4. For the **Backend Service**:
   - Set the root directory to `backend`.
   - Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, `PORT` (Railway will assign this).
   - Start Command: `npm start`
5. For the **Frontend Service**:
   - Set the root directory to `frontend`.
   - Build Command: `npm run build`
   - You might need to update the `API_URL` in `frontend/src/utils/api.js` to point to your deployed Railway backend URL before building.
