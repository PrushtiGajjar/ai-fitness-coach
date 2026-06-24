import google.generativeai as genai
import os
import json
from PIL import Image
import io

def analyze_food_image(image_bytes: bytes) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback to mock data if API key is missing to prevent crash during presentation
        return {
            "food_name": "Demo Burger (API Key Missing)",
            "calories": 850,
            "protein_g": 35,
            "carbs_g": 45,
            "fats_g": 40,
            "assessment": "Please set GEMINI_API_KEY environment variable. This is a highly caloric meal, better suited for a bulk phase than weight loss."
        }
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    image = Image.open(io.BytesIO(image_bytes))
    
    prompt = """
    You are an expert AI Nutritionist.
    Analyze the food in this image.
    Provide a JSON response with the following structure exactly (no markdown formatting, just raw JSON):
    {
      "food_name": "Name of the dish",
      "calories": 500,
      "protein_g": 30,
      "carbs_g": 40,
      "fats_g": 20,
      "assessment": "A brief 2 sentence assessment of whether this is good for someone trying to lose weight."
    }
    """
    
    try:
        response = model.generate_content([prompt, image])
        text = response.text
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        return json.loads(text.strip())
    except Exception as e:
        print("Vision API Error:", str(e))
        return {
            "food_name": "Unknown Assessment",
            "calories": 0,
            "protein_g": 0,
            "carbs_g": 0,
            "fats_g": 0,
            "assessment": "Failed to parse image. Please try again."
        }
