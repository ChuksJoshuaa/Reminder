from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
import enum
from app.models.reminder import Base

class CallStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"

class CallLog(Base):
    __tablename__ = "call_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    reminder_id: Mapped[str] = mapped_column(String, ForeignKey("reminders.id", ondelete="CASCADE"), nullable=False)
    attempted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    status: Mapped[CallStatus] = mapped_column(String, nullable=False)
    response_data: Mapped[str] = mapped_column(Text, nullable=True)
    error_message: Mapped[str] = mapped_column(String, nullable=True)
