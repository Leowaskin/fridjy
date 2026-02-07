import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Recipe, Insight, HealthProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

// Helper to clean JSON string if Markdown code blocks are present
const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeFridgeImage = async (base64Image: string): Promise<InventoryItem[]> => {
  const prompt = `
    Analyze this refrigerator image. Identify the food items visible.
    For each item, estimate:
    1. A concise name.
    2. Approximate quantity.
    3. An estimated expiry date from today (YYYY-MM-DD) based on general produce shelf life. Assume today is ${new Date().toISOString().split('T')[0]}.
    4. A category (Produce, Dairy, Meat, Beverage, Condiment, Leftover, Other).
    5. A fragility index (1-10) where 10 is highly perishable (like berries) and 1 is durable (like canned goods).
    
    Return ONLY a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              category: { type: Type.STRING },
              fragility: { type: Type.NUMBER },
            },
            required: ["name", "quantity", "expiryDate", "category", "fragility"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawItems = JSON.parse(cleanJsonString(text));
    
    return rawItems.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      addedAt: Date.now()
    }));

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

export const generateChefInsights = async (inventory: InventoryItem[]): Promise<Insight[]> => {
  if (inventory.length === 0) return [];

  const inventoryList = inventory.map(i => `${i.name} (Expires: ${i.expiryDate})`).join(", ");
  
  const prompt = `
    You are a professional chef and waste-reduction expert.
    Analyze this inventory: ${inventoryList}.
    
    Provide 3 distinct insights in JSON format:
    1. A high-priority waste warning (items expiring soon).
    2. A quick meal suggestion combining available items.
    3. A storage tip for one of the items to extend life.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["waste", "suggestion", "tip"] },
              message: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(cleanJsonString(text));

  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return [];
  }
};

export const generateRecipe = async (items: InventoryItem[], preferences: string): Promise<Recipe[]> => {
  const ingredients = items.map(i => i.name).join(", ");
  
  const prompt = `
    Create 5 distinct, creative, and delicious recipes using some of these ingredients: ${ingredients}.
    User preferences/constraints: ${preferences || "None"}.
    
    Prioritize using ingredients that might expire soon.
    You can assume basic pantry staples (oil, salt, pepper, flour) are available.
    Order the recipes from most recommended to least.
    
    IMPORTANT: Provide accurate estimates for Calories, Protein (g), Carbs (g), and Fats (g) per serving.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              cookingTime: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No recipes generated");
    return JSON.parse(cleanJsonString(text));

  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    throw new Error("Failed to generate recipes.");
  }
};

export const generateMealPlan = async (profile: HealthProfile, request: string): Promise<string> => {
  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  
  const prompt = `
    You are a professional nutritionist and fitness coach.
    Create a personalized meal/action plan for the following user:
    
    Profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg (BMI: ${bmi})
    - Activity Level: ${profile.activityLevel}
    - Daily Calorie Goal: ${profile.calorieGoal} kcal
    - Allergies: ${profile.allergies || "None"}
    - Dietary Type: ${profile.dietaryPreferences || "None"}
    
    User Request/Goal: "${request}"
    
    Output a structured, easy-to-read plan using Markdown formatting. 
    Include:
    1. A brief analysis of their BMI and calorie needs.
    2. A suggested meal plan structure (Breakfast, Lunch, Dinner, Snacks).
    3. Specific advice based on their request.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Gemini Meal Plan Error:", error);
    throw new Error("Failed to generate meal plan.");
  }
};
