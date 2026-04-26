import { useNavigate } from 'react-router-dom';
import { QrCode, MapPin, Clock, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import { CATEGORIES } from '../types';
import { getPopularItems } from '../data/menuData';
import { useTable } from '../contexts/TableContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentTable } = useTable();
  const popularItems = getPopularItems();

  return (
    <div className="animate-fade-in">
      <div className="bg-lake text-white px-5 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Restaurant dä Seeblick</p>
            <h1 className="text-2xl font-bold">Herzlich Willkommen! 🏔️</h1>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            🏔️
          </div>
        </div>
        
        {currentTable && (
          <div className="bg-white/10 rounded-card p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/70">Tisch:</span>
              <span className="font-bold">{currentTable}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/scanner')}
          className="w-full bg-seeblick text-white font-semibold py-4 rounded-button shadow-button hover:bg-seeblick-dark active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2"
        >
          <QrCode size={24} />
          QR-Code scannen
        </button>
      </div>

      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Speisekarte</h2>
            <button
              onClick={() => navigate('/menu')}
              className="text-seeblick text-sm font-medium flex items-center gap-1 hover:underline"
            >
              Alle anzeigen
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {popularItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Beliebt bei unseren Gästen</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5">
              {popularItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/menu/${item.category}`)}
                  className="flex-shrink-0 w-48 bg-white rounded-card shadow-card overflow-hidden text-left transition-all duration-200 hover:shadow-card-hover active:scale-[0.98]"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-seeblick-50 to-cream-100 flex items-center justify-center">
                    <div className="text-4xl opacity-20">🍽️</div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-text-primary text-sm mb-1 truncate">{item.name}</h3>
                    <p className="text-seeblick font-bold">CHF {item.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-card shadow-card p-5">
          <h3 className="font-bold text-text-primary mb-4">Restaurant Info</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-text-secondary">
              <MapPin size={18} className="text-seeblick flex-shrink-0" />
              <span className="text-sm">Berg SG, Schweiz</span>
            </div>
            
            <div className="flex items-center gap-3 text-text-secondary">
              <Clock size={18} className="text-seeblick flex-shrink-0" />
              <div className="text-sm">
                <p>Mo–Fr: 08:30–13:00 | 16:30–24:00</p>
                <p className="text-seeblick font-medium mt-1">✅ Jetzt geöffnet</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-text-secondary">
              <Phone size={18} className="text-seeblick flex-shrink-0" />
              <span className="text-sm">077 439 58 54</span>
            </div>
            
            <a
              href="https://wa.me/41774395854"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-seeblick hover:underline"
            >
              <MessageCircle size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium">WhatsApp Reservierung</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
