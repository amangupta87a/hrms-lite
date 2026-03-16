from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

# ---- Employee stuff ----

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: str
    
    class Config:
        from_attributes = True

class EmployeeListResponse(BaseModel):
    employees: List[EmployeeResponse]
    total: int

# ---- Attendance stuff ----

class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: str
    employee_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class AttendanceListResponse(BaseModel):
    attendance: List[AttendanceResponse]
    total: int

# ---- Auth stuff ----

class LoginRequest(BaseModel):
    user_id: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class CredentialsResponse(BaseModel):
    user_id: str
    password: str  # decrypted for demo display

# generic response models
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    detail: str
    success: bool = False
