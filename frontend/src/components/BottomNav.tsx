import { useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, QrCode, LayoutDashboard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/menu', icon: UtensilsCrossed, label: 'Speisekarte' },
  { path: '/scanner', icon: QrCode, label: 'Scanner' },
  { path: '/cart', icon: ShoppingCart, label: 'Warenkorb' },
  { path: '/admin', icon: LayoutDashboard, label: 'Admin' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-light-grey h-16 z-50">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-seeblick'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.path === '/cart' && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-seeblick text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
