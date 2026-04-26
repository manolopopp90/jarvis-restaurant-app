import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, MessageSquare } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useCart } from '../contexts/CartContext';
import { useTable } from '../contexts/TableContext';
import { useOrder } from '../contexts/OrderContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, tax, total, clearCart } = useCart();
  const { currentTable } = useTable();
  const { createOrder } = useOrder();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!currentTable) {
      navigate('/scanner');
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    createOrder(currentTable, items, total, tax, specialInstructions);
    clearCart();
    setIsSubmitting(false);
    navigate('/confirmation');
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Warenkorb" showBack />

      <div className="p-5">
        {currentTable && (
          <div className="bg-lake text-white rounded-card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Restaurant dä Seeblick</p>
                <p className="text-xl font-bold">Tisch {currentTable}</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                🏔️
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-text-muted text-lg mb-2">Ihr Warenkorb ist leer</p>
            <p className="text-text-secondary text-sm mb-6">Fügen Sie Gerichte aus der Speisekarte hinzu</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-seeblick text-white font-semibold px-8 py-3 rounded-button shadow-button hover:bg-seeblick-dark transition-colors"
            >
              Zur Speisekarte
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-card shadow-card p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-seeblick-50 to-cream-100 rounded-card-sm flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl opacity-30">🍽️</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-text-primary">{item.menuItem.name}</h3>
                    </div>

                    <p className="text-text-secondary text-sm mb-2">
                      {item.quantity}x CHF {item.menuItem.price.toFixed(2)}
                    </p>

                    {item.extras && item.extras.length > 0 && (
                      <p className="text-text-muted text-xs mb-2">
                        Extras: {item.extras.join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-off-white border border-light-grey rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-off-white border border-light-grey rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-seeblick">
                      CHF {(item.menuItem.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-card shadow-card p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={18} className="text-seeblick" />
                <label className="font-medium text-text-primary">Zusatzwünsche</label>
              </div>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Ihre besonderen Wünsche..."
                className="w-full p-3 bg-off-white rounded-card-sm border-2 border-transparent focus:border-seeblick focus:outline-none transition-colors resize-none"
                rows={3}
              />
            </div>

            <div className="bg-white rounded-card shadow-card p-5 mb-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-text-secondary">
                  <span>Zwischensumme</span>
                  <span>CHF {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>MwSt. (7.7%)</span>
                  <span>CHF {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-light-grey pt-2">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-text-primary">Gesamtsumme</span>
                    <span className="text-xl font-bold text-seeblick">CHF {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full bg-seeblick text-white font-semibold py-4 rounded-button shadow-button hover:bg-seeblick-dark active:scale-[0.98] transition-all duration-100 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  📤 Bestellung senden
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
