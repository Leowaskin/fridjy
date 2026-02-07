import React, { useEffect, useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { generateChefInsights } from '../services/geminiService';
import { InventoryCard } from '../components/InventoryCard';
import { Insight } from '../types';
import { Sparkles, PackageOpen } from 'lucide-react';
import clsx from 'clsx';

export const Home: React.FC = () => {
  const { inventory, removeItem, loading } = useInventory();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (inventory.length > 0) {
      const fetchInsights = async () => {
        setInsightsLoading(true);
        const data = await generateChefInsights(inventory);
        setInsights(data);
        setInsightsLoading(false);
      };
      fetchInsights();
    }
  }, [inventory.length]); // Simple dependency check, could be deeper

  const sortedInventory = [...inventory].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  if (loading) return <div className="p-8 text-center text-stone-400">Loading fridge...</div>;

  return (
    <div className="pb-24 pt-8 px-4 max-w-lg mx-auto space-y-8">
      
      <header>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
          Fridgy
        </h1>
        <p className="text-stone-500 font-medium">Cook Smart, Eat Better.</p>
      </header>

      {/* Insights Section */}
      {inventory.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-stone-700 font-semibold">
            <Sparkles className="text-orange-400" size={20} />
            <h2>Chef's Insights</h2>
          </div>
          
          <div className="grid gap-3">
            {insightsLoading ? (
               <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm animate-pulse h-24"></div>
            ) : insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div 
                  key={idx}
                  className={clsx(
                    "p-4 rounded-xl border text-sm shadow-sm",
                    insight.type === 'waste' ? "bg-rose-50 border-rose-100 text-rose-800" :
                    insight.type === 'suggestion' ? "bg-lime-50 border-lime-100 text-lime-800" :
                    "bg-sky-50 border-sky-100 text-sky-800"
                  )}
                >
                  <strong className="block mb-1 uppercase text-xs tracking-wider opacity-70">{insight.type}</strong>
                  {insight.message}
                </div>
              ))
            ) : (
              <div className="text-sm text-stone-400 italic">No specific insights right now.</div>
            )}
          </div>
        </section>
      )}

      {/* Inventory Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-stone-700 font-semibold">
          <div className="flex items-center gap-2">
            <PackageOpen className="text-orange-400" size={20} />
            <h2>Inventory ({inventory.length})</h2>
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-stone-300 rounded-xl bg-white/50">
            <p className="text-stone-500">Your fridge is empty.</p>
            <p className="text-orange-500 text-sm mt-2 font-medium">Tap "Scan" to add items.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedInventory.map(item => (
              <InventoryCard key={item.id} item={item} onRemove={removeItem} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};