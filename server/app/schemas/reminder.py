from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Literal
import re

ReminderStatus = Literal["scheduled", "completed", "failed"]

class ReminderBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1, max_length=500)
    phone_number: str = Field(..., pattern=r"^\+[1-9]\d{1,14}$", alias="phoneNumber")
    scheduled_for: datetime = Field(..., alias="scheduledFor")
    timezone: str = Field(..., min_length=1)

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        if not re.match(r"^\+[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format")
        return v

    @field_validator("scheduled_for")
    @classmethod
    def validate_scheduled_for(cls, v: datetime) -> datetime:
        if v <= datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        return v

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = Field(None, min_length=1, max_length=100)
    message: str | None = Field(None, min_length=1, max_length=500)
    phone_number: str | None = Field(None, pattern=r"^\+[1-9]\d{1,14}$", alias="phoneNumber")
    scheduled_for: datetime | None = Field(None, alias="scheduledFor")
    timezone: str | None = None
    status: ReminderStatus | None = None

class ReminderResponse(ReminderBase):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    status: ReminderStatus
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
