# Frontend - HRMS Lite

React frontend for HRMS Lite HR Management System.

## Tech Stack

- **React 18.2** - UI library
- **React Router DOM 6.21** - Routing
- **Axios 1.6** - HTTP client
- **Lucide React 0.303** - Icon library
- **React Toastify 9.1** - Notifications

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

App runs on http://localhost:3000

## Build for Production

```bash
npm run build
```

Output in `build/` folder.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Modal.js
│   │   ├── Loading.js
│   │   ├── EmptyState.js
│   │   ├── ErrorMessage.js
│   │   └── ConfirmDialog.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Employees.js
│   │   ├── Attendance.js
│   │   └── ChangePassword.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── .env.example
└── README.md
```

## Environment Variables

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Pages

| Route | Description |
|-------|-------------|
| /login | Admin login page |
| /dashboard | Stats overview |
| /employees | Employee management |
| /attendance | Attendance tracking |

## Features

- Login with backend authentication
- Dashboard with attendance stats
- Employee CRUD operations
- Attendance marking with date filters
- Change password functionality
- Responsive design
