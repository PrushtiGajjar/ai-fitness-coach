import json

def calculate_bmi(weight_kg, height_cm):
    """Calculates Body Mass Index (BMI)."""
    height_m = height_cm / 100.0
    return weight_kg / (height_m ** 2)

def get_bmi_category(bmi):
    """Returns the health category based on BMI."""
    if bmi < 18.5: return "Underweight (Need to eat more)"
    elif 18.5 <= bmi < 24.9: return "Healthy Weight (Looking good!)"
    elif 25 <= bmi < 29.9: return "Slightly Overweight (Need to eat less)"
    else: return "Overweight (Need to eat less)"

def generate_workout_plan(user_profile):
    """
    Generates a tailored workout and diet plan based on user metrics.
    Input: dictionary with 'age', 'weight', 'height', 'goal', 'days_per_week'
    Output: JSON schedule of workouts and diet.
    """
    weight = user_profile.get('weight', 70)
    height = user_profile.get('height', 170)
    days = user_profile.get('days_per_week', 3)
    
    bmi = calculate_bmi(weight, height)
    bmi_category = get_bmi_category(bmi)
    
    # Auto-determine goal based on BMI
    if bmi >= 25:
        goal = "weight loss"
    elif bmi < 18.5:
        goal = "muscle gain"
    else:
        goal = "general fitness"
    
    plan = {
        "user_metrics": {
            "bmi": round(bmi, 1),
            "category": bmi_category
        },
        "diet_suggestion": "",
        "workout_schedule": {}
    }
    
    # 1. Diet Recommendation Logic
    if "weight loss" in goal:
        plan["diet_suggestion"] = "You are carrying extra weight right now. To fix this, you need to eat fewer calories than your body uses every day! Focus on eating lots of vegetables to stay full, and avoid sugary snacks."
    elif "muscle gain" in goal:
        plan["diet_suggestion"] = "You are underweight right now. To build a stronger body, you need to eat MORE food than you usually do! Eat lots of protein like eggs and chicken to help your muscles grow big and strong."
    else:
        plan["diet_suggestion"] = "You are at a very healthy weight right now! To keep your body feeling great, just eat a balanced mix of fresh foods and keep exercising."
        
    # 2. Workout Generation Logic
    if "weight loss" in goal:
        exercises = ["Jumping Jacks", "Burpees", "Bodyweight Squats", "Mountain Climbers", "Plank"]
        workout_type = "High-Intensity Interval Training (HIIT) & Core"
    elif "muscle gain" in goal:
        exercises = ["Push-ups", "Pull-ups", "Dumbbell Squats", "Bicep Curls", "Dumbbell Rows"]
        workout_type = "Hypertrophy & Strength Training"
    else:
        exercises = ["Yoga", "Light Jogging", "Bodyweight Squats", "Plank"]
        workout_type = "General Fitness & Mobility"
        
    # 3. Schedule Assignment
    # Spread the workouts based on the user's available days
    rest_days = 7 - days
    
    day_count = 1
    for day_name in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
        if day_count <= days:
            plan["workout_schedule"][day_name] = {
                "type": workout_type,
                "exercises": exercises,
                "duration": "45-60 mins",
                "intensity": "High" if "weight loss" in goal else "Medium"
            }
            day_count += 1
        else:
            plan["workout_schedule"][day_name] = {
                "type": "Rest Day",
                "exercises": ["Stretching", "Walking"],
                "duration": "Active Recovery"
            }
            
    return json.dumps(plan, indent=4)

if __name__ == "__main__":
    # Test User 1: John (Wants to lose weight, Overweight BMI)
    john_profile = {
        "name": "John",
        "age": 22,
        "weight": 85, # kg
        "height": 175, # cm
        "goal": "Weight Loss",
        "days_per_week": 4
    }
    
    # Test User 2: Sarah (Wants to gain muscle, Normal BMI)
    sarah_profile = {
        "name": "Sarah",
        "age": 21,
        "weight": 55, # kg
        "height": 165, # cm
        "goal": "Muscle Gain",
        "days_per_week": 5
    }

    print("--- GENERATED PLAN FOR JOHN ---")
    print(generate_workout_plan(john_profile))
    
    print("\n--- GENERATED PLAN FOR SARAH ---")
    print(generate_workout_plan(sarah_profile))
