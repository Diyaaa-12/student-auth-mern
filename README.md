# Student Auth (MERN)

A full-stack student authentication and profile system: registration, login, a protected dashboard, and self-service profile management.

## Features

- Register / login with **bcrypt**-hashed passwords and **JWT** sessions
- Auth middleware protecting every profile route
- Protected React dashboard showing the logged-in student's profile
- Update password (verifies the current one first), course and profile details

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | – | Create a student account |
| POST | `/api/login` | – | Get a JWT |
| GET | `/api/profile` | ✔ | Current student's profile |
| PUT | `/api/update-password` | ✔ | Change password |
| PUT | `/api/update-course` | ✔ | Change enrolled course |
| PUT | `/api/update-profile` | ✔ | Update name / profile picture |

## Project structure

```
backend/    Express 5 + Mongoose API with JWT middleware
frontend/   React 19 + Vite + React Router (Login, Register, Dashboard)
```

## Run locally

```bash
cd backend
npm install
cp .env.example .env     # set MONGO_URI and JWT_SECRET
node server.js

cd ../frontend
npm install
npm run dev
```

## Stack

MongoDB · Express · React · Node.js · JWT · bcrypt · Axios · Vite
