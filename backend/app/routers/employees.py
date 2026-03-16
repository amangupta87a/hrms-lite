from fastapi import APIRouter, HTTPException, status

from app.database import get_employee_collection, get_attendance_collection
from app.schemas import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeListResponse,
    MessageResponse,
)


router = APIRouter(prefix="/api/employees", tags=["Employees"])


def format_employee_document(employee_document):
    """Convert a raw Mongo employee document into a response-friendly dict."""
    return {
        "id": str(employee_document["_id"]),
        "employee_id": employee_document["employee_id"],
        "full_name": employee_document["full_name"],
        "email": employee_document["email"],
        "department": employee_document["department"],
    }


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee_payload: EmployeeCreate):
    employee_collection = get_employee_collection()

    if await employee_collection.find_one({"employee_id": employee_payload.employee_id}):
        raise HTTPException(
            status_code=409,
            detail=f"Employee with ID '{employee_payload.employee_id}' already exists",
        )

    if await employee_collection.find_one({"email": employee_payload.email.lower()}):
        raise HTTPException(
            status_code=409,
            detail=f"Employee with email '{employee_payload.email}' already exists",
        )

    new_employee_document = employee_payload.model_dump()
    new_employee_document["email"] = new_employee_document["email"].lower()

    insert_result = await employee_collection.insert_one(new_employee_document)
    created_employee = await employee_collection.find_one(
        {"_id": insert_result.inserted_id}
    )

    return format_employee_document(created_employee)


@router.get("", response_model=EmployeeListResponse)
async def list_all_employees():
    employee_collection = get_employee_collection()

    employees: list[dict] = []
    async for employee_document in employee_collection.find():
        employees.append(format_employee_document(employee_document))

    return {"employees": employees, "total": len(employees)}


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee_by_employee_id(employee_id: str):
    employee_collection = get_employee_collection()

    employee_document = await employee_collection.find_one({"employee_id": employee_id})
    if not employee_document:
        raise HTTPException(
            status_code=404, detail=f"Employee '{employee_id}' not found"
        )

    return format_employee_document(employee_document)


@router.delete("/{employee_id}", response_model=MessageResponse)
async def delete_employee_and_related_attendance(employee_id: str):
    employee_collection = get_employee_collection()
    attendance_collection = get_attendance_collection()

    employee_document = await employee_collection.find_one({"employee_id": employee_id})
    if not employee_document:
        raise HTTPException(
            status_code=404, detail=f"Employee '{employee_id}' not found"
        )

    await employee_collection.delete_one({"employee_id": employee_id})
    await attendance_collection.delete_many({"employee_id": employee_id})

    return {"message": f"Deleted {employee_document['full_name']}", "success": True}
