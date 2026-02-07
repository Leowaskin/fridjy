
export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate: string; // ISO Date string
  category: string;
  fragility: number; // 0-10, 10 being very fragile (e.g., berries)
  addedAt: number;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
}

export interface Insight {
  type: 'waste' | 'suggestion' | 'tip';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface HealthProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  calorieGoal: number;
  allergies: string;
  dietaryPreferences: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
}

export enum AppRoute {
  HOME = '/',
  SCAN = '/scan',
  RECIPES = '/recipes',
  HEALTH = '/health',
  SETTINGS = '/settings'
}
