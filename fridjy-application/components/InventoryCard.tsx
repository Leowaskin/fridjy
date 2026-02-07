import React from 'react';
import { InventoryItem } from '../types';
import { Trash2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  item: InventoryItem;
  onRemove: (id: string) => void;
}

export const InventoryCard: React.FC<Props> = ({ item, onRemove }) => {
  const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const isExpired = daysUntilExpiry < 0;
  const isUrgent = daysUntilExpiry <= 2 && !isExpired;

  return (
    <div className={clsx(
      "relative p-4 rounded-xl border transition-all duration-200 shadow-sm",
      isExpired ? "bg-rose-50 border-rose-200" : 
      isUrgent ? "bg-amber-50 border-amber-200" : 
      "bg-white border-stone-100 hover:border-orange-200 hover:shadow-md"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-stone-800">{item.name}</h3>
          <p className="text-sm text-stone-500">{item.quantity} • {item.category}</p>
        </div>
        <button 
          onClick={() => onRemove(item.id)}
          className="text-stone-400 hover:text-rose-500 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {isExpired && (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">
            <AlertCircle size={12} /> Expired
          </span>
        )}
        {isUrgent && (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
            <AlertCircle size={12} /> Use Soon
          </span>
        )}
        {!isExpired && !isUrgent && (
          <span className="text-xs text-lime-700 bg-lime-100/50 px-2 py-1 rounded-full font-medium">
            {daysUntilExpiry} days left
          </span>
        )}
      </div>

      {/* Fragility Indicator */}
      <div className="absolute bottom-4 right-4 flex gap-0.5">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={clsx(
              "w-1.5 h-1.5 rounded-full",
              i < Math.ceil(item.fragility / 3.33) ? "bg-lime-500" : "bg-stone-200"
            )} 
          />
        ))}
      </div>
    </div>
  );
};