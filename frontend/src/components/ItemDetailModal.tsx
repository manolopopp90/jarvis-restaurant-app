import { useState } from 'react';
import { X, Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const EXTRA_OPTIONS = [
  { id: 'extra-dressing', name: 'Extra Dressing', price: 1.50 },
  { id: 'extra-brot', name: 'Extra Brot', price: 2.00 },
  { id: 'extra-kaese', name: 'Extra Käse', price: 2.50 },
];

export default function ItemDetailModal() {
  const { selectedItem, isDetailOpen, setIsDetailOpen, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isDetailOpen || !selectedItem) return null;

  const extrasPrice = selectedExtras.reduce((sum, extraId) => {
    const extra = EXTRA_OPTIONS.find(e => e.id === extraId);
    return sum + (extra?.price || 0);
  }, 0);

  const totalPrice = (selectedItem.price + extrasPrice) * quantity;

  const handleAddToCart = () => {
    addItem(selectedItem, quantity, selectedExtras, specialInstructions);
    setIsDetailOpen(false);
    setQuantity(1);
    setSelectedExtras([]);
    setSpecialInstructions('');
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsDetailOpen(false)}
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-t-sheet shadow-sheet max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-2">
          <div className="w-10 h-1 bg-light-grey rounded-full mx-auto mb-4" />
          <div className="flex justify-between items-center">
            <div />
            <button
              onClick={() => setIsDetailOpen(false)}
              className="p-2 hover:bg-off-white rounded-full transition-colors"
            >
              <X size={24} className="text-text-primary" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-6">
          <div className="aspect-[16/10] bg-gradient-to-br from-seeblick-50 to-cream-100 rounded-card flex items-center justify-center mb-4">
            <div className="text-8xl opacity-20">🍽️</div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2">{selectedItem.name}</h2>
            
            {selectedItem.rating && (
              <div className="flex items-center gap-2 mb-3">
                <Star size={18} className="text-seeblick fill-seeblick" />
                <span className="font-medium text-text-primary">{selectedItem.rating}</span>
                <span className="text-text-muted text-sm">({selectedItem.reviewCount} Bewertungen)</span>
              </div>
            )}

            <p className="text-text-secondary leading-relaxed">{selectedItem.description}</p>

            {selectedItem.allergens && selectedItem.allergens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-text-muted">Allergene:</span>
                {selectedItem.allergens.map(allergen => (
                  <span
                    key={allergen}
                    className="text-xs bg-cream text-text-secondary px-2 py-1 rounded">
                    {allergen}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <span className="text-2xl font-bold text-seeblick">CHF {selectedItem.price.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-text-primary mb-2 block">Menge</label>
            <div className="flex items-center gap-4 bg-off-white rounded-card-sm p-2 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-white border border-light-grey rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-white border border-light-grey rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-text-primary mb-2 block">Zusatzoptionen</label>
            <div className="space-y-2">
              {EXTRA_OPTIONS.map(extra => (
                <label
                  key={extra.id}
                  className="flex items-center justify-between p-3 bg-off-white rounded-card-sm cursor-pointer hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      onChange={() => toggleExtra(extra.id)}
                      className="w-5 h-5 accent-seeblick"
                    />
                    <span className="text-text-primary">{extra.name}</span>
                  </div>
                  <span className="text-seeblick font-medium">+CHF {extra.price.toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-text-primary mb-2 block">Zusatzwünsche</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ihre besonderen Wünsche..."
              className="w-full p-3 bg-off-white rounded-card-sm border-2 border-transparent focus:border-seeblick focus:outline-none transition-colors resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-seeblick text-white font-semibold py-4 rounded-button shadow-button hover:bg-seeblick-dark active:scale-[0.98] transition-all duration-100 text-lg"
          >
            + Zum Warenkorb — CHF {totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
