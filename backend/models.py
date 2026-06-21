import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action_type = Column(String, nullable=False)
    target = Column(String, nullable=False)
    details = Column(String, nullable=True)
    project_id = Column(String, nullable=True, default="proj-1")

class EmissionFactorOverride(Base):
    __tablename__ = "emission_factor_overrides"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, nullable=True, default="proj-1")
    category = Column(String, unique=True, index=True, nullable=False)
    factor = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

