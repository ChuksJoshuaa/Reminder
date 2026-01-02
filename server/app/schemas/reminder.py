import re
from datetime import datetime
from typing import Any, Literal

import pytz
from pydantic import (BaseModel, ConfigDict, Field, field_validator,
                      model_validator)

ReminderStatus = Literal["scheduled", "completed", "failed"]

class ReminderBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1, max_length=500)
    phone_number: str = Field(..., pattern=r"^\+[1-9]\d{1,14}$", alias="phoneNumber")
    scheduled_for: str = Field(..., alias="scheduledFor")
    timezone: str = Field(..., min_length=1)

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        if not re.match(r"^\+[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format")
        return v

class ReminderCreate(ReminderBase):
    @model_validator(mode="after")
    def convert_to_utc(self) -> "ReminderCreate":
        try:
            tz = pytz.timezone(self.timezone)
            naive_dt = datetime.fromisoformat(self.scheduled_for.replace('Z', '+00:00').split('+')[0].split('T')[0] + 'T' + self.scheduled_for.replace('Z', '+00:00').split('+')[0].split('T')[1] if 'T' in self.scheduled_for else self.scheduled_for)
            local_dt = tz.localize(naive_dt)
            utc_dt = local_dt.astimezone(pytz.UTC)

            if utc_dt <= datetime.now(pytz.UTC):
                raise ValueError("Scheduled time must be in the future")

            self.scheduled_for = utc_dt.isoformat()
            return self
        except Exception as e:
            raise ValueError(f"Invalid datetime or timezone: {str(e)}")

class ReminderUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = Field(None, min_length=1, max_length=100)
    message: str | None = Field(None, min_length=1, max_length=500)
    phone_number: str | None = Field(None, pattern=r"^\+[1-9]\d{1,14}$", alias="phoneNumber")
    scheduled_for: str | None = Field(None, alias="scheduledFor")
    timezone: str | None = None
    status: ReminderStatus | None = None

    @model_validator(mode="after")
    def convert_to_utc(self) -> "ReminderUpdate":
        if self.scheduled_for and self.timezone:
            try:
                tz = pytz.timezone(self.timezone)
                naive_dt = datetime.fromisoformat(self.scheduled_for.replace('Z', '+00:00').split('+')[0].split('T')[0] + 'T' + self.scheduled_for.replace('Z', '+00:00').split('+')[0].split('T')[1] if 'T' in self.scheduled_for else self.scheduled_for)
                local_dt = tz.localize(naive_dt)
                utc_dt = local_dt.astimezone(pytz.UTC)
                self.scheduled_for = utc_dt.isoformat()
            except Exception as e:
                raise ValueError(f"Invalid datetime or timezone: {str(e)}")
        return self

class ReminderResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    title: str
    message: str
    phone_number: str = Field(..., alias="phoneNumber")
    scheduled_for: str = Field(..., alias="scheduledFor")
    timezone: str
    status: ReminderStatus
    created_at: str = Field(..., alias="createdAt")
    updated_at: str = Field(..., alias="updatedAt")

    @classmethod
    def from_orm_with_timezone(cls, db_reminder: Any) -> "ReminderResponse":
        tz = pytz.timezone(db_reminder.timezone)

        utc_scheduled = pytz.UTC.localize(db_reminder.scheduled_for) if db_reminder.scheduled_for.tzinfo is None else db_reminder.scheduled_for
        local_scheduled = utc_scheduled.astimezone(tz)

        utc_created = pytz.UTC.localize(db_reminder.created_at) if db_reminder.created_at.tzinfo is None else db_reminder.created_at
        local_created = utc_created.astimezone(tz)

        utc_updated = pytz.UTC.localize(db_reminder.updated_at) if db_reminder.updated_at.tzinfo is None else db_reminder.updated_at
        local_updated = utc_updated.astimezone(tz)

        return cls(
            id=db_reminder.id,
            title=db_reminder.title,
            message=db_reminder.message,
            phoneNumber=db_reminder.phone_number,
            scheduledFor=local_scheduled.strftime("%Y-%m-%dT%H:%M:%S"),
            timezone=db_reminder.timezone,
            status=db_reminder.status.value,
            createdAt=local_created.strftime("%Y-%m-%dT%H:%M:%S"),
            updatedAt=local_updated.strftime("%Y-%m-%dT%H:%M:%S")
        )
