import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, ArrowLeft, PenTool, Pencil, X, Save } from 'lucide-react';
import { analyzeFridgeImage } from '../services/geminiService';
import { useInventory } from '../hooks/useInventory';
import { InventoryItem } from '../types';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export const Scan: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<InventoryItem[]>([]);
  const { addItems } = useInventory();
  const navigate = useNavigate();

  // Manual Mode State
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    quantity: '',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Other',
    fragility: 5
  });

  // Edit State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormState, setEditFormState] = useState<InventoryItem | null>(null);

  const CATEGORIES = ["Produce", "Dairy", "Meat", "Beverage", "Condiment", "Leftover", "Other"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setDetectedItems([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    
    setAnalyzing(true);
    try {
      const base64Data = preview.split(',')[1];
      const items = await analyzeFridgeImage(base64Data);
      setDetectedItems(items);
    } catch (err) {
      alert("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    addItems(detectedItems);
    navigate('/');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name: manualForm.name,
      quantity: manualForm.quantity || '1',
      expiryDate: manualForm.expiryDate,
      category: manualForm.category,
      fragility: manualForm.fragility,
      addedAt: Date.now()
    };
    addItems([newItem]);
    navigate('/');
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditFormState({ ...detectedItems[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editFormState) {
        const newItems = [...detectedItems];
        newItems[editingIndex] = editFormState;
        setDetectedItems(newItems);
        setEditingIndex(null);
        setEditFormState(null);
    }
  };

  if (isManualMode) {
    return (
      <div className="pb-24 pt-8 px-4 max-w-lg mx-auto flex flex-col h-screen overflow-y-auto">
        <header className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setIsManualMode(false)}
            className="p-2 bg-white border border-stone-200 rounded-lg text-stone-500 hover:text-stone-800 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Manual Entry</h1>
            <p className="text-stone-500 text-sm">Add item details directly.</p>
          </div>
        </header>
        
        <form onSubmit={handleManualSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Item Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-white border border-stone-200 rounded-lg p-3 text-stone-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm"
              placeholder="e.g., Milk"
              value={manualForm.name}
              onChange={e => setManualForm({...manualForm, name: e.target.value})}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Quantity</label>
            <input 
              required
              type="text" 
              className="w-full bg-white border border-stone-200 rounded-lg p-3 text-stone-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm"
              placeholder="e.g., 1 carton, 500g"
              value={manualForm.quantity}
              onChange={e => setManualForm({...manualForm, quantity: e.target.value})}
            />
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Expiry Date</label>
            <input 
              required
              type="date" 
              className="w-full bg-white border border-stone-200 rounded-lg p-3 text-stone-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm appearance-none"
              value={manualForm.expiryDate}
              onChange={e => setManualForm({...manualForm, expiryDate: e.target.value})}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-600">Category</label>
            <div className="relative">
              <select 
                className="w-full bg-white border border-stone-200 rounded-lg p-3 text-stone-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none appearance-none transition-all shadow-sm"
                value={manualForm.category}
                onChange={e => setManualForm({...manualForm, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                 <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
              </div>
            </div>
          </div>

          {/* Fragility */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm text-stone-600">
               <label>Fragility (1-10)</label>
               <span className="text-orange-500 font-bold">{manualForm.fragility}</span>
            </div>
            <input 
              type="range" 
              min="1" max="10" 
              className="w-full accent-orange-500 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
              value={manualForm.fragility}
              onChange={e => setManualForm({...manualForm, fragility: parseInt(e.target.value)})}
            />
            <div className="flex justify-between text-xs text-stone-400">
              <span>Durable (Cans)</span>
              <span>Fragile (Berries)</span>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 mt-6 shadow-lg shadow-orange-500/20 transition-all">
            Add Item
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8 px-4 max-w-lg mx-auto flex flex-col h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Add Inventory</h1>
        <p className="text-stone-500 text-sm">Snap a photo of your fridge contents.</p>
      </header>

      <div className="flex-1 flex flex-col gap-4">
        {/* Camera Area */}
        <div className="relative group w-full aspect-[4/3] bg-white rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden flex items-center justify-center transition-colors hover:border-orange-300 shadow-sm">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-400 group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <p className="text-stone-400 font-medium">Tap to take photo</p>
            </div>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            capture="environment"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileSelect}
          />
        </div>

        {/* Action Buttons */}
        {!preview && (
             <div className="space-y-3">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-white border border-stone-200 text-stone-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-sm"
                 >
                    <Upload size={20} /> Upload from Gallery
                 </button>
                 
                 <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink-0 mx-4 text-stone-400 text-xs font-medium">OR</span>
                    <div className="flex-grow border-t border-stone-200"></div>
                 </div>

                 <button 
                    onClick={() => setIsManualMode(true)}
                    className="w-full py-4 bg-white border border-stone-200 text-stone-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-sm"
                 >
                    <PenTool size={20} /> Enter Manually
                 </button>
             </div>
        )}

        {preview && !detectedItems.length && (
            <div className="flex gap-4 mt-2">
                 <button 
                    onClick={() => { setPreview(null); fileInputRef.current!.value = ''; }}
                    className="flex-1 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl font-medium shadow-sm"
                 >
                    Retake
                 </button>
                 <button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                 >
                    {analyzing ? <Loader2 className="animate-spin" /> : "Analyze"}
                 </button>
            </div>
        )}

        {/* Results */}
        {analyzing && (
            <div className="text-center py-8">
                <p className="text-orange-500 font-medium animate-pulse">Gemini is looking at your food...</p>
                <p className="text-xs text-stone-400 mt-2">Identifying items, expiry dates, and categories.</p>
            </div>
        )}

        {detectedItems.length > 0 && (
            <div className="space-y-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-stone-800">Detected Items ({detectedItems.length})</h3>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {detectedItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-stone-50 p-3 rounded-lg text-sm border border-stone-100 group">
                            <div>
                                <div className="text-stone-800 font-medium">{item.name}</div>
                                <div className="text-stone-500 text-xs">{item.quantity} • {item.expiryDate}</div>
                            </div>
                            <button 
                              onClick={() => startEditing(idx)}
                              className="p-2 text-stone-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Pencil size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                >
                    Add All to Fridge
                </button>
            </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && editFormState && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
               <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-lg text-stone-800">Edit Item</h3>
                   <button onClick={() => setEditingIndex(null)} className="p-1 hover:bg-stone-100 rounded-full text-stone-400"><X size={20}/></button>
               </div>
               
               <div className="space-y-4">
                   <div>
                      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">Name</label>
                      <input 
                          className="w-full border-b border-stone-200 py-2 text-stone-800 focus:border-orange-500 outline-none bg-transparent transition-colors"
                          value={editFormState.name}
                          onChange={e => setEditFormState({...editFormState, name: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">Quantity</label>
                          <input 
                              className="w-full border-b border-stone-200 py-2 text-stone-800 focus:border-orange-500 outline-none bg-transparent transition-colors"
                              value={editFormState.quantity}
                              onChange={e => setEditFormState({...editFormState, quantity: e.target.value})}
                          />
                       </div>
                       <div>
                          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">Expiry</label>
                          <input 
                              type="date"
                              className="w-full border-b border-stone-200 py-2 text-stone-800 focus:border-orange-500 outline-none bg-transparent transition-colors"
                              value={editFormState.expiryDate}
                              onChange={e => setEditFormState({...editFormState, expiryDate: e.target.value})}
                          />
                       </div>
                   </div>
               </div>

               <div className="pt-2">
                   <button onClick={saveEdit} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all">
                      <Save size={18} /> Save Changes
                   </button>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};
