from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.reminder import Reminder, ReminderStatus
from app.models.call_log import CallLog, CallStatus
from app.services.vapi_service import vapi_service
import pytz
import uuid
import json

class ReminderScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler(timezone=pytz.UTC)

    def start(self):
        self.scheduler.add_job(
            self.check_due_reminders,
            trigger=IntervalTrigger(seconds=30),
            id="check_reminders",
            name="Check for due reminders",
            replace_existing=True
        )
        self.scheduler.start()
        print("Scheduler started")

    def stop(self):
        self.scheduler.shutdown()
        print("Scheduler stopped")

    def check_due_reminders(self):
        db: Session = SessionLocal()
        try:
            now = datetime.utcnow()

            due_reminders = db.query(Reminder).filter(
                Reminder.status == ReminderStatus.SCHEDULED,
                Reminder.scheduled_for <= now
            ).all()

            for reminder in due_reminders:
                print(f"Processing reminder {reminder.id}: {reminder.title}")
                self.process_reminder(db, reminder)

        except Exception as e:
            print(f"Error checking reminders: {str(e)}")
        finally:
            db.close()

    def process_reminder(self, db: Session, reminder: Reminder):
        call_log = None
        try:
            result = vapi_service.make_call(
                phone_number=reminder.phone_number,
                message=reminder.message
            )

            if result["success"]:
                reminder.status = ReminderStatus.COMPLETED
                print(f"Reminder {reminder.id} completed successfully")

                call_log = CallLog(
                    id=str(uuid.uuid4()),
                    reminder_id=reminder.id,
                    attempted_at=datetime.utcnow(),
                    status=CallStatus.SUCCESS,
                    response_data=json.dumps(result.get("data", {})),
                    error_message=None
                )
            else:
                reminder.status = ReminderStatus.FAILED
                error_msg = result.get("error", "Unknown error")
                print(f"Reminder {reminder.id} failed: {error_msg}")

                call_log = CallLog(
                    id=str(uuid.uuid4()),
                    reminder_id=reminder.id,
                    attempted_at=datetime.utcnow(),
                    status=CallStatus.FAILED,
                    response_data=None,
                    error_message=error_msg
                )

            if call_log:
                db.add(call_log)
            db.commit()

        except Exception as e:
            reminder.status = ReminderStatus.FAILED
            error_msg = str(e)

            call_log = CallLog(
                id=str(uuid.uuid4()),
                reminder_id=reminder.id,
                attempted_at=datetime.utcnow(),
                status=CallStatus.FAILED,
                response_data=None,
                error_message=error_msg
            )
            db.add(call_log)
            db.commit()
            print(f"Error processing reminder {reminder.id}: {error_msg}")

reminder_scheduler = ReminderScheduler()
