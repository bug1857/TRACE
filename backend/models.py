import datetime
from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action_type = Column(String, nullable=False)
    target = Column(String, nullable=False)
    details = Column(String, nullable=True)
    project_id = Column(String, nullable=True, default="proj-1")
