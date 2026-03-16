from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.database import get_attendance_collection, get_employee_collection
from app.schemas import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceListResponse,
    MessageResponse,
)


router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def format_attendance_document(attendance_document, employee_name: Optional[str] = None):
    """Convert a Mongo attendance document into a response-friendly dict."""
    return {
        "id": str(attendance_document["_id"]),
        "employee_id": attendance_document["employee_id"],
        "date": attendance_document["date"],
        "status": attendance_document["status"],
        "employee_name": employee_name,
    }


@router.post("", response_model=AttendanceResponse, status_code=201)
async def mark_employee_attendance(attendance_payload: AttendanceCreate):
    employee_collection = get_employee_collection()
    attendance_collection = get_attendance_collection()

    employee_document = await employee_collection.find_one(
        {"employee_id": attendance_payload.employee_id}
    )
    if not employee_document:
        raise HTTPException(
            status_code=404,
            detail=f"Employee '{attendance_payload.employee_id}' not found",
        )

    existing_attendance = await attendance_collection.find_one(
        {
            "employee_id": attendance_payload.employee_id,
            "date": attendance_payload.date.isoformat(),
        }
    )
    if existing_attendance:
        raise HTTPException(
            status_code=409,
            detail=f"Attendance already marked for {attendance_payload.date}",
        )

    attendance_document = {
        "employee_id": attendance_payload.employee_id,
        "date": attendance_payload.date.isoformat(),
        "status": attendance_payload.status.value,
    }

    insert_result = await attendance_collection.insert_one(attendance_document)
    created_attendance = await attendance_collection.find_one(
        {"_id": insert_result.inserted_id}
    )

    return format_attendance_document(created_attendance, employee_document["full_name"])


@router.get("", response_model=AttendanceListResponse)
async def list_attendance_records(
    employee_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    employee_collection = get_employee_collection()
    attendance_collection = get_attendance_collection()

    query_filter: dict = {}
    if employee_id:
        query_filter["employee_id"] = employee_id

    if start_date or end_date:
        date_filter: dict = {}
        if start_date:
            date_filter["$gte"] = start_date.isoformat()
        if end_date:
            date_filter["$lte"] = end_date.isoformat()
        query_filter["date"] = date_filter

    employee_names: dict[str, str] = {}
    async for employee_document in employee_collection.find():
        employee_names[employee_document["employee_id"]] = employee_document["full_name"]

    attendance_records: list[dict] = []
    async for attendance_document in attendance_collection.find(query_filter).sort(
        "date", -1
    ):
        name_for_display = employee_names.get(
            attendance_document["employee_id"], "Unknown"
        )
        attendance_records.append(
            format_attendance_document(attendance_document, name_for_display)
        )

    return {"attendance": attendance_records, "total": len(attendance_records)}


@router.get("/employee/{employee_id}", response_model=AttendanceListResponse)
async def list_single_employee_attendance(employee_id: str):
    employee_collection = get_employee_collection()
    attendance_collection = get_attendance_collection()

    employee_document = await employee_collection.find_one(
        {"employee_id": employee_id}
    )
    if not employee_document:
        raise HTTPException(status_code=404, detail="Employee not found")

    attendance_records: list[dict] = []
    async for attendance_document in attendance_collection.find(
        {"employee_id": employee_id}
    ).sort("date", -1):
        attendance_records.append(
            format_attendance_document(
                attendance_document, employee_document["full_name"]
            )
        )

    return {"attendance": attendance_records, "total": len(attendance_records)}


@router.put("/{employee_id}/{att_date}", response_model=AttendanceResponse)
async def update_employee_attendance_status(
    employee_id: str, att_date: date, attendance_payload: AttendanceCreate
):
    employee_collection = get_employee_collection()
    attendance_collection = get_attendance_collection()

    employee_document = await employee_collection.find_one(
        {"employee_id": employee_id}
    )
    if not employee_document:
        raise HTTPException(status_code=404, detail="Employee not found")

    updated_attendance = await attendance_collection.find_one_and_update(
        {"employee_id": employee_id, "date": att_date.isoformat()},
        {"$set": {"status": attendance_payload.status.value}},
        return_document=True,
    )

    if not updated_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    return format_attendance_document(
        updated_attendance, employee_document["full_name"]
    )


@router.delete("/{employee_id}/{att_date}", response_model=MessageResponse)
async def delete_attendance_record(employee_id: str, att_date: date):
    attendance_collection = get_attendance_collection()

    deletion_result = await attendance_collection.delete_one(
        {"employee_id": employee_id, "date": att_date.isoformat()}
    )

    if deletion_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"message": "Attendance deleted", "success": True}
