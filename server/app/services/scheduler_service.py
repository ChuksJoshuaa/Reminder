from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.reminder import Reminder, ReminderStatus
from app.services.vapi_service import vapi_service
import pytz

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
        try:
            result = vapi_service.make_call(
                phone_number=reminder.phone_number,
                message=reminder.message
            )

            if result["success"]:
                reminder.status = ReminderStatus.COMPLETED
                print(f"Reminder {reminder.id} completed successfully")
            else:
                reminder.status = ReminderStatus.FAILED
                print(f"Reminder {reminder.id} failed: {result.get('error')}")

            db.commit()

        except Exception as e:
            reminder.status = ReminderStatus.FAILED
            db.commit()
            print(f"Error processing reminder {reminder.id}: {str(e)}")

reminder_scheduler = ReminderScheduler()
