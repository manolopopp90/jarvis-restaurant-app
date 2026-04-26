import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import { useOrder } from '../contexts/OrderContext';
import { useTable } from '../contexts/TableContext';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { currentOrder } = useOrder();
  const { currentTable } = useTable();

  // Calculate estimated ready time (30 minutes from order)
  const readyTime = currentOrder 
    ? new Date(currentOrder.createdAt.getTime() + 30 * 60000)
    : new Date(Date.now() + 30 * 60000);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center max-w-sm w-full">
        <div className="mb-6">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-success" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Bestellung gesendet!
        </h1>

        <p className="text-text-secondary mb-8">
          Ihre Bestellung wurde erfolgreich an die Küche übermittelt.
        </p>

        <div className="bg-white rounded-card shadow-card p-6 mb-8">
          <div className="text-center mb-4">
            <p className="text-text-muted text-sm mb-1">Bestellnummer</p>
            <p className="text-3xl font-bold text-lake">{currentOrder?.id || '#128'}</p>
          </div>

          <div className="border-t border-light-grey pt-4 space-y-2">
            {currentTable && (
              <div className="flex justify-between">
                <span className="text-text-muted">Tisch</span>
                <span className="font-medium">{currentTable}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-text-muted">Zeit</span>
              <span className="font-medium">
                {currentOrder?.createdAt.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) || '12:45'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-text-muted">Betrag</span>
              <span className="font-medium text-seeblick">CHF {currentOrder?.total.toFixed(2) || '54.93'}</span>
            </div>
          </div>
        </div>

        <div className="bg-cream rounded-card p-5 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={20} className="text-seeblick" />
            <span className="font-semibold text-text-primary">Voraussichtliche Fertigstellung</span>
          </div>
          <p className="text-2xl font-bold text-seeblick">
            {readyTime.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-text-secondary text-sm mt-1">(ca. 30 Min.)</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-seeblick text-white font-semibold py-4 rounded-button shadow-button hover:bg-seeblick-dark active:scale-[0.98] transition-all duration-100"
          >
            Weiter bestellen
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-seeblick font-medium py-3 hover:underline"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
}
