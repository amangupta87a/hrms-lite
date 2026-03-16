# Backend - HRMS Lite API

FastAPI backend with MongoDB for HRMS Lite.

## Tech Stack

- **FastAPI 0.116.1** - Modern Python web framework
- **Motor 3.3.2** - Async MongoDB driver
- **Pydantic 2.12.5** - Data validation
- **Uvicorn 0.24.0** - ASGI server
- **Python-dotenv** - Environment config

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run server
python -m uvicorn app.main:app --reload
```

Server runs on http://localhost:8000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── routers/
│   │   ├── employees.py   # Employee CRUD
│   │   ├── attendance.py  # Attendance endpoints
│   │   └── auth.py        # Authentication
│   ├── main.py            # FastAPI app
│   ├── config.py          # Settings from .env
│   ├── database.py        # MongoDB connection
│   ├── schemas.py         # Pydantic models
│   └── auth_utils.py      # Encryption helpers
├── requirements.txt
├── .env.example
└── README.md
```

## Environment Variables

```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hrms_lite
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=*
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/credentials | Get decrypted credentials |
| POST | /api/auth/login | Validate login |
| POST | /api/auth/change-password | Update password |
| POST | /api/auth/reset | Reset to defaults |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | List all |
| POST | /api/employees | Create |
| GET | /api/employees/:id | Get by ID |
| DELETE | /api/employees/:id | Delete |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/attendance | List with filters |
| POST | /api/attendance | Mark attendance |
| GET | /api/attendance/employee/:id | By employee |

## Authentication

Admin credentials stored encrypted in MongoDB `admin` collection.
XOR + Base64 encryption for demo purposes.

Default: `admin` / `admin123`
