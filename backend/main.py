from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from recommendation_service import generate_workout_plan
from chatbot_service import get_chat_response
from diet_vision_service import analyze_food_image
import json
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import datetime

# Initialize the SQLite Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Fitness Coach API",
    description="Core Backend API for the Final Year Project",
    version="1.0"
)

# Enable CORS so Next.js can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas for Input Validation ---

class UserProfile(BaseModel):
    name: str
    age: int
    weight: float
    height: float
    goal: str
    days_per_week: int

class ChatMessage(BaseModel):
    message: str

class WorkoutSaveRequest(BaseModel):
    workout_name: str
    reps_completed: int

# --- Database Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Online", "message": "Welcome to the AI Fitness Coach API! Go to /docs to test the endpoints."}

@app.post("/api/workout/recommendation")
def get_recommendation(profile: UserProfile):
    """
    Endpoint Phase 4: Receives user biometrics and returns a custom workout/diet plan.
    """
    try:
        # model_dump() converts Pydantic object to dictionary
        plan_json_string = generate_workout_plan(profile.model_dump())
        return json.loads(plan_json_string) # Convert string back to JSON for HTTP response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_with_ai(chat: ChatMessage):
    """
    Endpoint Phase 5: Connects the frontend to the LangChain LLM Assistant.
    """
    try:
        response = get_chat_response(chat.message)
        return {"reply": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workout/save")
def save_workout(req: WorkoutSaveRequest, db: Session = Depends(get_db)):
    db_history = models.ExerciseHistory(
        user_id=1,
        workout_name=req.workout_name,
        reps_completed=req.reps_completed,
        accuracy_score=1.0,
        date=datetime.datetime.utcnow()
    )
    db.add(db_history)
    db.commit()
    return {"message": "Workout saved successfully!"}

@app.get("/api/workout/history")
def get_workout_history(db: Session = Depends(get_db)):
    try:
        history = db.query(models.ExerciseHistory).order_by(models.ExerciseHistory.date.desc()).limit(7).all()
        
        chart_data = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        for i in range(7):
            calories = 200 + (i * 50)
            performance = 50
            
            if i < len(history):
                record = history[i]
                calories += (record.reps_completed * 15)
                performance = min(100, 50 + (record.reps_completed * 5))
                
            chart_data.append({
                "name": days[i],
                "calories": calories,
                "performance": performance
            })
            
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/diet/vision")
async def process_diet_vision(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = analyze_food_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Start the server on localhost:8001 to avoid ghost process conflicts
    uvicorn.run(app, host="0.0.0.0", port=8001)
