# HRMS Lite

A minimal yet practical **HR Management System** with a React frontend, FastAPI backend, and MongoDB for persistence.  
It is designed as a clean starter kit for small teams, demos, or learning full‑stack patterns.

## Tech Stack

### Frontend
- **React 18** – Component-based UI
- **React Router DOM** – Client-side routing
- **Axios** – HTTP client
- **Lucide React** – Icon set

### Backend
- **FastAPI** – Async Python web framework
- **Motor** – Async MongoDB driver
- **Pydantic** – Request/response validation and typing
- **Uvicorn** – ASGI server

### Database
- **MongoDB** – Document-oriented NoSQL database

## Features

- **Authentication** – Single admin login with encrypted password storage
- **Dashboard** – Overview with stats, attendance rate, and present days per employee
- **Employee Management** – Add, list, and delete employee records
- **Attendance Tracking** – Mark daily attendance and filter by employee or date range
- **Change Password** – Update the admin password (stored in encrypted form in the backend)

## Project Structure

```
hrms-lite/
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── main.py    # App entry point
│   │   ├── config.py  # Settings
│   │   ├── database.py
│   │   ├── schemas.py
│   │   └── auth_utils.py
│   └── requirements.txt
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

## Requirements

- **Python** 3.9+
- **Node.js** 16+
- **MongoDB** running locally or remotely

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hrms-lite.git
cd hrms-lite
```

### 2. Start MongoDB

Make sure MongoDB is running and reachable at `mongodb://localhost:27017` (or update the backend `.env` accordingly).

### 3. Backend setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000` (Swagger docs at `/docs`).

### 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The app will be available at `http://localhost:3000`.

## Default login (demo)

```text
User ID: admin
Password: admin123
```

These demo credentials are also shown on the login page and can be changed from within the UI.

## API Endpoints

### Auth
- `GET /api/auth/credentials` – Get current credentials (password is decrypted for demo display)
- `POST /api/auth/login` – Login with admin credentials
- `POST /api/auth/change-password` – Change the admin password
- `POST /api/auth/reset` – Reset credentials back to the default demo values

### Employees
- `GET /api/employees` – List all employees
- `POST /api/employees` – Create a new employee
- `GET /api/employees/:id` – Get a single employee by ID
- `DELETE /api/employees/:id` – Delete an employee (and related attendance)

### Attendance
- `GET /api/attendance` – List attendance (with optional filters)
- `POST /api/attendance` – Mark attendance for a given day
- `GET /api/attendance/employee/:id` – Get attendance for a specific employee

## Environment variables

### Backend (`backend/.env`)

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hrms_lite
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=*
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## License

MIT
