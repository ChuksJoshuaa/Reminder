from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class ReminderStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    FAILED = "failed"

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    scheduled_for = Column(DateTime, nullable=False)
    timezone = Column(String, nullable=False)
    status = Column(Enum(ReminderStatus), default=ReminderStatus.SCHEDULED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
