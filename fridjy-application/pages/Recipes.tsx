import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useHealth } from '../hooks/useHealth';
import { generateRecipe } from '../services/geminiService';
import { Recipe } from '../types';
import { ChefHat, Clock, Flame, Loader2, Check, Utensils, ThumbsUp } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

const DIETARY_TAGS = [
  "High Protein", 
  "Low Carb", 
  "Vegetarian", 
  "Vegan", 
  "Gluten Free", 
  "Keto", 
  "Paleo", 
  "Quick (< 15m)",
  "Healthy",
  "Comfort Food"
];

export const Recipes: React.FC = () => {
  const { inventory } = useInventory();
  const { addLog } = useHealth();
  const navigate = useNavigate();
  
  const [preferences, setPreferences] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loggedIndices, setLoggedIndices] = useState<number[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleGenerate = async () => {
    if (inventory.length === 0) {
        alert("Your fridge is empty! Add items first.");
        return;
    }
    setLoading(true);
    setRecipes([]);
    setExpandedIndex(null);
    setLoggedIndices([]);
    
    // Combine text input and tags
    const combinedPreferences = [
      preferences.trim(),
      selectedTags.length > 0 ? `Tags: ${selectedTags.join(", ")}` : ""
    ].filter(Boolean).join(". ");

    try {
      const result = await generateRecipe(inventory, combinedPreferences);
      setRecipes(result);
      if (result.length > 0) setExpandedIndex(0); // Auto expand first one
    } catch (e) {
      alert("Failed to generate recipes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = (recipe: Recipe, index: number) => {
    if (loggedIndices.includes(index)) return;

    const today = new Date().toISOString().split('T')[0];
    addLog({
      date: today,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats
    });

    setLoggedIndices([...loggedIndices, index]);
    
    // Optional: Navigate to health page after a delay or show toast
    // For now, just visuals update
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-lg mx-auto min-h-screen flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">AI Chef</h1>
        <p className="text-stone-500 text-sm">Generate recipes from your stock.</p>
      </header>

      <div className="space-y-6 flex-1">
        {/* Controls */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600 block">Dietary Options</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                      isSelected 
                        ? "bg-orange-100 border-orange-300 text-orange-700 shadow-sm" 
                        : "bg-stone-50 border-stone-100 text-stone-500 hover:bg-stone-100"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-stone-600 block">Specific Cravings (Optional)</label>
             <input 
                type="text" 
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. something spicy, soup..."
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || inventory.length === 0}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-lg font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ChefHat size={20} /> Create 5 Recipes</>}
          </button>
        </div>

        {/* Recipe Display */}
        {recipes.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-lg font-bold text-stone-700 px-1">Recommended for You</h2>
             {recipes.map((recipe, idx) => {
                 const isExpanded = expandedIndex === idx;
                 const isLogged = loggedIndices.includes(idx);
                 
                 return (
                    <div key={idx} className={clsx(
                        "bg-white rounded-xl border overflow-hidden transition-all duration-300 shadow-sm",
                        isExpanded ? "border-orange-200 shadow-md ring-1 ring-orange-100" : "border-stone-200"
                    )}>
                        {/* Card Header */}
                        <div 
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            className="p-4 cursor-pointer flex justify-between items-start hover:bg-stone-50 transition-colors"
                        >
                            <div>
                                <h3 className="font-bold text-stone-800 flex items-center gap-2">
                                    {idx === 0 && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Top Pick</span>}
                                    {recipe.title}
                                </h3>
                                <div className="flex gap-3 mt-2 text-xs text-stone-500">
                                     <span className="flex items-center gap-1"><Clock size={12}/> {recipe.cookingTime}</span>
                                     <span className="flex items-center gap-1"><Flame size={12}/> {recipe.calories} kcal</span>
                                     <span className={clsx("font-medium", recipe.difficulty === 'Easy' ? "text-lime-600" : "text-amber-600")}>{recipe.difficulty}</span>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="px-6 pb-6 pt-0 border-t border-stone-100 animate-in fade-in duration-200">
                                <p className="text-stone-500 text-sm leading-relaxed mt-4 italic">{recipe.description}</p>
                                
                                {/* Macros Strip */}
                                <div className="flex gap-4 my-4 p-3 bg-stone-50 rounded-lg text-xs">
                                     <div className="text-center flex-1">
                                        <div className="font-bold text-stone-700">{recipe.protein}g</div>
                                        <div className="text-stone-400 uppercase text-[10px]">Protein</div>
                                     </div>
                                     <div className="w-px bg-stone-200"></div>
                                     <div className="text-center flex-1">
                                        <div className="font-bold text-stone-700">{recipe.carbs}g</div>
                                        <div className="text-stone-400 uppercase text-[10px]">Carbs</div>
                                     </div>
                                      <div className="w-px bg-stone-200"></div>
                                     <div className="text-center flex-1">
                                        <div className="font-bold text-stone-700">{recipe.fats}g</div>
                                        <div className="text-stone-400 uppercase text-[10px]">Fats</div>
                                     </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-2">Ingredients</h4>
                                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            {recipe.ingredients.map((ing, i) => (
                                                <li key={i} className="text-stone-600 text-xs flex items-start gap-1.5">
                                                    <span className="text-orange-400 mt-1">•</span> {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-2">Instructions</h4>
                                        <ol className="space-y-3">
                                            {recipe.instructions.map((step, i) => (
                                                <li key={i} className="flex gap-3 text-stone-600 text-sm">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-500 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLogMeal(recipe, idx);
                                        }}
                                        disabled={isLogged}
                                        className={clsx(
                                            "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mt-4",
                                            isLogged 
                                              ? "bg-lime-100 text-lime-700 cursor-default" 
                                              : "bg-stone-800 text-white hover:bg-stone-700 shadow-lg shadow-stone-500/20"
                                        )}
                                    >
                                        {isLogged ? <><Check size={18} /> Meal Logged to Health Tracker</> : <><Utensils size={18} /> I ate this (Log Nutrition)</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                 );
             })}
          </div>
        )}
      </div>
    </div>
  );
};
