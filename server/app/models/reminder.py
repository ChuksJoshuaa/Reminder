from sqlalchemy import String, DateTime, Enum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime
import enum

class Base(DeclarativeBase):
    pass

class ReminderStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    FAILED = "failed"

class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[str] = mapped_column(String, nullable=False)
    scheduled_for: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    timezone: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[ReminderStatus] = mapped_column(
        Enum(ReminderStatus),
        default=ReminderStatus.SCHEDULED,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
