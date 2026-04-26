import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Salad, ChefHat, IceCream, GlassWater, Coffee } from 'lucide-react';
import type { CategoryInfo } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Salad,
  ChefHat,
  IceCream,
  GlassWater,
  Coffee,
};

interface CategoryCardProps {
  category: CategoryInfo;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[category.icon] || Salad;

  return (
    <button
      onClick={() => navigate(`/menu/${category.id}`)}
      className="bg-gradient-to-br from-lake to-lake-light rounded-card p-5 text-white text-center transition-all duration-200 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex justify-center mb-3">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
      <p className="text-sm text-white/70">{category.description}</p>
    </button>
  );
}
