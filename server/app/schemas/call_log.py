from pydantic import BaseModel, Field, ConfigDict
from typing import Literal

CallStatus = Literal["success", "failed"]

class CallLogResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: str
    reminder_id: str = Field(..., alias="reminderId")
    attempted_at: str = Field(..., alias="attemptedAt")
    status: CallStatus
    response_data: str | None = Field(None, alias="responseData")
    error_message: str | None = Field(None, alias="errorMessage")
