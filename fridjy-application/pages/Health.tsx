import React, { useState } from 'react';
import { useHealth } from '../hooks/useHealth';
import { generateMealPlan } from '../services/geminiService';
import { Activity, Plus, Target, Sparkles, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { HealthProfile } from '../types';

export const Health: React.FC = () => {
  const { profile, logs, updateProfile, addLog } = useHealth();
  const [activeTab, setActiveTab] = useState<'tracker' | 'planner'>('tracker');
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<HealthProfile>(profile);

  // Log Meal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({ calories: '', protein: '', carbs: '', fats: '' });

  // Planner State
  const [planRequest, setPlanRequest] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [planning, setPlanning] = useState(false);

  // --- Derived Data ---
  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === today) || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  
  // Weekly Data for Charts (Last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const weeklyData = last7Days.map(date => {
    const log = logs.find(l => l.date === date);
    return {
      date,
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' }),
      calories: log?.calories || 0,
      protein: log?.protein || 0,
      carbs: log?.carbs || 0
    };
  });

  // --- Handlers ---
  const handleSaveProfile = () => {
    updateProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    addLog({
      date: today,
      calories: Number(newLog.calories) || 0,
      protein: Number(newLog.protein) || 0,
      carbs: Number(newLog.carbs) || 0,
      fats: Number(newLog.fats) || 0
    });
    setNewLog({ calories: '', protein: '', carbs: '', fats: '' });
    setShowLogModal(false);
  };

  const handleCreatePlan = async () => {
    setPlanning(true);
    try {
      const plan = await generateMealPlan(profile, planRequest);
      setGeneratedPlan(plan);
    } catch (e) {
      alert("Error generating plan.");
    } finally {
      setPlanning(false);
    }
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-lg mx-auto min-h-screen flex flex-col space-y-6">
      <header className="flex justify-between items-start">
        <div>
           <h1 className="text-2xl font-bold text-stone-800">Health & Goals</h1>
           <p className="text-stone-500 text-sm">Track progress & plan meals.</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-full p-1 flex">
          <button 
             onClick={() => setActiveTab('tracker')}
             className={clsx("px-4 py-1.5 rounded-full text-xs font-bold transition-all", activeTab === 'tracker' ? "bg-orange-100 text-orange-600" : "text-stone-400 hover:text-stone-600")}
          >
            Tracker
          </button>
          <button 
             onClick={() => setActiveTab('planner')}
             className={clsx("px-4 py-1.5 rounded-full text-xs font-bold transition-all", activeTab === 'planner' ? "bg-orange-100 text-orange-600" : "text-stone-400 hover:text-stone-600")}
          >
            AI Planner
          </button>
        </div>
      </header>

      {/* --- TRACKER TAB --- */}
      {activeTab === 'tracker' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          
          {/* Profile Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <div className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">Current Status</div>
                 <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-stone-800">{profile.weight}</span>
                   <span className="text-sm text-stone-500">kg</span>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">BMI Score</div>
                 <div className="flex items-center justify-end gap-2">
                    <span className={clsx(
                        "text-xl font-bold", 
                        Number(bmi) < 18.5 ? "text-amber-500" : 
                        Number(bmi) < 25 ? "text-lime-500" : 
                        "text-rose-500"
                    )}>{bmi}</span>
                 </div>
              </div>
            </div>

            <button 
              onClick={() => { setTempProfile(profile); setIsEditingProfile(!isEditingProfile); }}
              className="text-orange-500 text-xs font-bold flex items-center gap-1 hover:text-orange-600 z-10 relative"
            >
               <User size={14} /> {isEditingProfile ? "Close Profile" : "Edit Profile / Set Goals"}
            </button>
            
            {/* Edit Profile Form */}
            {isEditingProfile && (
              <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                      <label className="text-xs text-stone-500">Height (cm)</label>
                      <input type="number" value={tempProfile.height} onChange={e => setTempProfile({...tempProfile, height: Number(e.target.value)})} className="w-full bg-stone-50 rounded p-2 text-sm border border-stone-200 outline-none focus:border-orange-300"/>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-stone-500">Weight (kg)</label>
                      <input type="number" value={tempProfile.weight} onChange={e => setTempProfile({...tempProfile, weight: Number(e.target.value)})} className="w-full bg-stone-50 rounded p-2 text-sm border border-stone-200 outline-none focus:border-orange-300"/>
                  </div>
                  <div className="space-y-1 col-span-2">
                      <label className="text-xs text-stone-500">Daily Calorie Goal</label>
                      <input type="number" value={tempProfile.calorieGoal} onChange={e => setTempProfile({...tempProfile, calorieGoal: Number(e.target.value)})} className="w-full bg-stone-50 rounded p-2 text-sm border border-stone-200 outline-none focus:border-orange-300"/>
                  </div>
                   <div className="space-y-1 col-span-2">
                      <label className="text-xs text-stone-500">Allergies</label>
                      <input type="text" value={tempProfile.allergies} onChange={e => setTempProfile({...tempProfile, allergies: e.target.value})} className="w-full bg-stone-50 rounded p-2 text-sm border border-stone-200 outline-none focus:border-orange-300"/>
                  </div>
                  <button onClick={handleSaveProfile} className="col-span-2 bg-stone-800 text-white py-2 rounded-lg text-xs font-bold mt-2">Save Profile</button>
              </div>
            )}
          </div>

          {/* Weekly Chart */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-stone-800 flex items-center gap-2"><Activity size={18} className="text-orange-500"/> Weekly Report</h3>
                 <span className="text-xs text-stone-400">Target: {profile.calorieGoal} kcal</span>
             </div>
             
             {/* CSS Bar Chart */}
             <div className="flex justify-between items-end h-32 w-full gap-2 relative">
                {/* Goal Line */}
                <div className="absolute w-full border-t border-dashed border-stone-300 top-0 left-0" style={{top: '10%'}}></div>

                {weeklyData.map((day, i) => {
                    // Calculate height percentage relative to max (either goal or max consumed + buffer)
                    const maxVal = Math.max(profile.calorieGoal * 1.2, ...weeklyData.map(d => d.calories));
                    const heightPct = Math.min((day.calories / maxVal) * 100, 100);
                    
                    // Determine color
                    const isOver = day.calories > profile.calorieGoal;
                    const isUnder = day.calories < profile.calorieGoal * 0.8;
                    const isMet = !isOver && !isUnder;
                    
                    // Empty bar style
                    if(day.calories === 0) {
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="w-full bg-stone-100 rounded-t-md h-full relative flex items-end">
                                    <div className="w-full bg-stone-200/50 h-1 rounded-t-md"></div>
                                </div>
                                <span className="text-[10px] text-stone-400 font-medium">{day.day}</span>
                            </div>
                        )
                    }

                    return (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                             {/* Tooltip */}
                            <div className="absolute -top-8 bg-stone-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                {day.calories} kcal
                            </div>
                            
                            <div className="w-full bg-stone-100 rounded-t-md h-full relative flex items-end overflow-hidden">
                                <div 
                                    className={clsx(
                                        "w-full rounded-t-md transition-all duration-500",
                                        isOver ? "bg-rose-400" : isMet ? "bg-lime-400" : "bg-amber-300"
                                    )}
                                    style={{ height: `${heightPct}%` }}
                                ></div>
                            </div>
                            <span className={clsx("text-[10px] font-bold", dateIsToday(day.date) ? "text-orange-500" : "text-stone-400")}>{day.day}</span>
                        </div>
                    );
                })}
             </div>
             
             <div className="mt-6 flex justify-center gap-4 text-xs text-stone-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-lime-400"></div> On Track</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-300"></div> Under</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-400"></div> Over</div>
             </div>
          </div>

          {/* Today's Intake & Add Button */}
          <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-orange-900">Today's Intake</h3>
                <button onClick={() => setShowLogModal(true)} className="p-2 bg-white text-orange-500 rounded-full shadow-sm hover:scale-105 transition-transform">
                    <Plus size={20} />
                </button>
             </div>
             
             <div className="grid grid-cols-3 gap-2 text-center">
                 <div className="bg-white/60 p-3 rounded-xl">
                     <span className="block text-xs text-orange-400 font-bold uppercase">Calories</span>
                     <span className="text-lg font-bold text-stone-700">{todayLog.calories}</span>
                 </div>
                 <div className="bg-white/60 p-3 rounded-xl">
                     <span className="block text-xs text-orange-400 font-bold uppercase">Protein</span>
                     <span className="text-lg font-bold text-stone-700">{todayLog.protein}g</span>
                 </div>
                 <div className="bg-white/60 p-3 rounded-xl">
                     <span className="block text-xs text-orange-400 font-bold uppercase">Carbs</span>
                     <span className="text-lg font-bold text-stone-700">{todayLog.carbs}g</span>
                 </div>
             </div>
          </div>
        </div>
      )}

      {/* --- PLANNER TAB --- */}
      {activeTab === 'planner' && (
         <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-gradient-to-br from-lime-50 to-emerald-50 p-6 rounded-2xl border border-lime-100 text-center space-y-2">
                 <Sparkles className="mx-auto text-emerald-500 mb-2" size={32} />
                 <h2 className="text-xl font-bold text-emerald-900">AI Nutrition Coach</h2>
                 <p className="text-sm text-emerald-700/80">I'll build a plan based on your BMI ({bmi}), allergies, and goals.</p>
             </div>

             <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                 <div className="space-y-2">
                     <label className="text-sm font-bold text-stone-700">What's your goal?</label>
                     <textarea 
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:border-orange-400 outline-none h-24 resize-none"
                        placeholder="e.g., I want to lose weight but I love pasta, or I need a high protein plan for muscle gain..."
                        value={planRequest}
                        onChange={e => setPlanRequest(e.target.value)}
                     />
                 </div>
                 <button 
                    onClick={handleCreatePlan}
                    disabled={planning || !planRequest}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                 >
                    {planning ? <Loader2 className="animate-spin" /> : "Generate Plan"}
                 </button>
             </div>

             {generatedPlan && (
                 <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm prose prose-stone prose-sm max-w-none">
                     <div className="whitespace-pre-wrap font-medium text-stone-600 leading-relaxed">
                        {generatedPlan}
                     </div>
                 </div>
             )}
         </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
               <h3 className="font-bold text-lg text-stone-800">Log Meal</h3>
               <form onSubmit={handleAddLog} className="space-y-3">
                   <div>
                       <label className="text-xs font-bold text-stone-500 uppercase">Calories</label>
                       <input type="number" required className="w-full border-b border-stone-200 py-2 focus:border-orange-500 outline-none" value={newLog.calories} onChange={e => setNewLog({...newLog, calories: e.target.value})}/>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                       <div>
                           <label className="text-xs font-bold text-stone-500 uppercase">Protein (g)</label>
                           <input type="number" className="w-full border-b border-stone-200 py-2 focus:border-orange-500 outline-none" value={newLog.protein} onChange={e => setNewLog({...newLog, protein: e.target.value})}/>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-stone-500 uppercase">Carbs (g)</label>
                           <input type="number" className="w-full border-b border-stone-200 py-2 focus:border-orange-500 outline-none" value={newLog.carbs} onChange={e => setNewLog({...newLog, carbs: e.target.value})}/>
                       </div>
                       <div>
                           <label className="text-xs font-bold text-stone-500 uppercase">Fats (g)</label>
                           <input type="number" className="w-full border-b border-stone-200 py-2 focus:border-orange-500 outline-none" value={newLog.fats} onChange={e => setNewLog({...newLog, fats: e.target.value})}/>
                       </div>
                   </div>
                   <div className="flex gap-3 pt-4">
                       <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl">Cancel</button>
                       <button type="submit" className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20">Add Log</button>
                   </div>
               </form>
            </div>
        </div>
      )}
    </div>
  );
};

// Helper
const dateIsToday = (dateString: string) => {
    return dateString === new Date().toISOString().split('T')[0];
}
