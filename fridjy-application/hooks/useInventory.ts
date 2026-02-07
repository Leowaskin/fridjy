import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('fridjy_inventory');
    if (saved) {
      try {
        setInventory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    }
    setLoading(false);
  }, []);

  const updateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    localStorage.setItem('fridjy_inventory', JSON.stringify(newInventory));
  };

  const addItem = (item: InventoryItem) => {
    const updated = [...inventory, item];
    updateInventory(updated);
  };

  const addItems = (items: InventoryItem[]) => {
    const updated = [...inventory, ...items];
    updateInventory(updated);
  };

  const removeItem = (id: string) => {
    const updated = inventory.filter(item => item.id !== id);
    updateInventory(updated);
  };

  const clearInventory = () => {
    updateInventory([]);
  };

  return { inventory, loading, addItem, addItems, removeItem, clearInventory };
};