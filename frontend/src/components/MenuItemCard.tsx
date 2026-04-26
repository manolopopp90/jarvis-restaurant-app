import React from 'react';
import { Star } from 'lucide-react';
import type { MenuItem } from '../types';
import { useCart } from '../contexts/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { setSelectedItem, setIsDetailOpen } = useCart();

  const handleClick = () => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-card shadow-card border border-light-grey overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-card-hover active:scale-[0.99]"
    >
      <div className="aspect-[16/10] bg-gradient-to-br from-seeblick-50 to-cream-100 flex items-center justify-center relative">
        <div className="text-6xl opacity-20">🍽️</div>
        {item.isPopular && (
          <span className="absolute top-3 left-3 bg-seeblick text-white text-xs font-semibold px-3 py-1 rounded-full">
            Beliebt
          </span>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-light-grey text-text-muted text-sm font-medium px-4 py-2 rounded-lg">
              Ausverkauft
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-text-primary text-lg leading-tight">{item.name}</h3>
        </div>
        
        <p className="text-text-secondary text-sm line-clamp-2 mb-3">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.rating && (
              <div className="flex items-center gap-1">
                <Star size={16} className="text-seeblick fill-seeblick" />
                <span className="text-sm font-medium text-text-primary">{item.rating}</span>
                <span className="text-xs text-text-muted">({item.reviewCount})</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-seeblick text-lg">CHF {item.price.toFixed(2)}</span>
          </div>
        </div>
        
        {item.isAvailable && (
          <button
            onClick={handleAddToCart}
            className="w-full mt-3 bg-seeblick text-white font-semibold py-3 rounded-button shadow-button hover:bg-seeblick-dark active:scale-[0.98] transition-all duration-100"
          >
            + Zum Warenkorb
          </button>
        )}
      </div>
    </div>
  );
}
