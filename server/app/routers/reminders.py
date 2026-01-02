from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, cast
from app.database import get_db
from app.models.reminder import Reminder, ReminderStatus
from app.models.call_log import CallLog
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from app.schemas.call_log import CallLogResponse, CallStatus as CallStatusLiteral
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta
import pytz

router = APIRouter(prefix="/reminders", tags=["reminders"])

@router.get("", response_model=List[ReminderResponse])
def get_reminders(db: Session = Depends(get_db)):
    reminders = db.query(Reminder).all()
    return [ReminderResponse.from_orm_with_timezone(r) for r in reminders]

@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: str, db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return ReminderResponse.from_orm_with_timezone(reminder)

@router.post("", response_model=ReminderResponse, status_code=201)
def create_reminder(reminder_data: ReminderCreate, db: Session = Depends(get_db)):
    scheduled_datetime = datetime.fromisoformat(reminder_data.scheduled_for.replace('Z', '+00:00'))

    reminder = Reminder(
        id=str(uuid.uuid4()),
        title=reminder_data.title,
        message=reminder_data.message,
        phone_number=reminder_data.phone_number,
        scheduled_for=scheduled_datetime,
        timezone=reminder_data.timezone,
        status=ReminderStatus.SCHEDULED
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return ReminderResponse.from_orm_with_timezone(reminder)

@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: str,
    reminder_data: ReminderUpdate,
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    update_data = reminder_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "scheduled_for" and value:
            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
        setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)

    return ReminderResponse.from_orm_with_timezone(reminder)

@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(reminder_id: str, db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    db.delete(reminder)
    db.commit()

    return None

@router.get("/{reminder_id}/call-logs", response_model=List[CallLogResponse])
def get_call_logs(reminder_id: str, db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    call_logs = db.query(CallLog).filter(
        CallLog.reminder_id == reminder_id
    ).order_by(CallLog.attempted_at.desc()).all()

    return [
        CallLogResponse(
            id=log.id,
            reminderId=log.reminder_id,
            attemptedAt=log.attempted_at.isoformat(),
            status=cast(CallStatusLiteral, log.status.value if hasattr(log.status, 'value') else log.status),
            responseData=log.response_data,
            errorMessage=log.error_message
        )
        for log in call_logs
    ]

class SnoozeRequest(BaseModel):
    minutes: int

@router.post("/{reminder_id}/snooze", response_model=ReminderResponse)
def snooze_reminder(
    reminder_id: str,
    snooze_data: SnoozeRequest,
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    if snooze_data.minutes < 1 or snooze_data.minutes > 1440:
        raise HTTPException(status_code=400, detail="Snooze minutes must be between 1 and 1440 (24 hours)")

    tz = pytz.timezone(reminder.timezone)
    current_utc = datetime.now(pytz.UTC)
    new_scheduled_utc = current_utc + timedelta(minutes=snooze_data.minutes)

    reminder.scheduled_for = new_scheduled_utc.replace(tzinfo=None)
    reminder.status = ReminderStatus.SCHEDULED

    db.commit()
    db.refresh(reminder)

    return ReminderResponse.from_orm_with_timezone(reminder)
