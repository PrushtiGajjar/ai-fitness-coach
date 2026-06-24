import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    age = Column(Integer)
    weight = Column(Float)
    height = Column(Float)
    goal = Column(String)

class ExerciseHistory(Base):
    __tablename__ = "exercise_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    workout_name = Column(String)
    reps_completed = Column(Integer)
    accuracy_score = Column(Float)
    date = Column(DateTime, default=datetime.datetime.utcnow)
