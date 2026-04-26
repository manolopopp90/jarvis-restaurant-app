import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import TopBar from '../components/TopBar';
import MenuItemCard from '../components/MenuItemCard';
import CategoryCard from '../components/CategoryCard';
import { CATEGORIES } from '../types';
import { menuItems } from '../data/menuData';

export default function MenuPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  const currentCategory = CATEGORIES.find(c => c.id === category);

  const subcategories = useMemo(() => {
    if (!category) return [];
    const items = menuItems.filter(item => item.category === category);
    const subs = [...new Set(items.map(item => item.subcategory).filter(Boolean))];
    return subs;
  }, [category]);

  const filteredItems = useMemo(() => {
    let items = menuItems;

    if (category) {
      items = items.filter(item => item.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    if (selectedSubcategory !== 'all') {
      items = items.filter(item => item.subcategory === selectedSubcategory);
    }

    return items;
  }, [category, searchQuery, selectedSubcategory]);

  if (!category) {
    return (
      <div>
        <TopBar title="Speisekarte" />
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title={currentCategory?.name || 'Speisekarte'}
        showBack
      />

      <div className="p-5">
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Gerichte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-light-grey rounded-button text-text-primary placeholder:text-text-muted focus:border-seeblick focus:outline-none transition-colors"
          />
        </div>

        {subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-5 px-5">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSubcategory === 'all'
                  ? 'bg-lake text-white'
                  : 'bg-white text-text-secondary border border-light-grey hover:bg-off-white'
              }`}
            >
              Alle
            </button>
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub || 'all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSubcategory === sub
                    ? 'bg-lake text-white'
                    : 'bg-white text-text-secondary border border-light-grey hover:bg-off-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-text-muted text-lg mb-2">Keine Gerichte gefunden</p>
            <p className="text-text-secondary text-sm">Versuchen Sie eine andere Suche</p>
          </div>
        )}
      </div>
    </div>
  );
}
