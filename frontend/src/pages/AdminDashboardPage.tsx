import { useNavigate } from 'react-router-dom';
import { Utensils, DollarSign, Users, CheckCircle, Clock, CookingPot } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useOrder } from '../contexts/OrderContext';
import { useTable } from '../contexts/TableContext';
import TableCard from '../components/TableCard';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { orders } = useOrder();
  const { allTables, updateTableStatus } = useTable();

  const stats = {
    activeOrders: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    totalGuests: allTables.filter(t => t.status === 'occupied').reduce((sum, t) => sum + t.capacity, 0),
  };

  const recentOrders = orders.slice(0, 5);
  const occupiedTables = allTables.filter(t => t.status === 'occupied');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-warning" />;
      case 'preparing': return <CookingPot size={16} className="text-seeblick" />;
      case 'ready': return <CheckCircle size={16} className="text-success" />;
      default: return <CheckCircle size={16} className="text-success" />;
    }
  };

  return (
    <div>
      <TopBar
        title="Admin Dashboard"
        rightElement={
          <button
            onClick={() => navigate('/admin/tables')}
            className="text-seeblick text-sm font-medium hover:underline"
          >
            Tische
          </button>
        }
      />

      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏔️</span>
            <span className="font-bold text-text-primary">Restaurant dä Seeblick</span>
          </div>
          <p className="text-text-secondary text-sm">Heute: {orders.length} Bestellungen</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-card shadow-card p-4 text-center">
            <div className="w-10 h-10 bg-seeblick/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Utensils size={20} className="text-seeblick" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats.activeOrders}</p>
            <p className="text-xs text-text-muted">Aktive Bestell.</p>
          </div>

          <div className="bg-white rounded-card shadow-card p-4 text-center">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <DollarSign size={20} className="text-success" />
            </div>
            <p className="text-2xl font-bold text-text-primary">CHF {stats.totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-text-muted">Umsatz heute</p>
          </div>

          <div className="bg-white rounded-card shadow-card p-4 text-center">
            <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users size={20} className="text-info" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats.totalGuests}</p>
            <p className="text-xs text-text-muted">Gäste</p>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Tischübersicht</h3>
            <button
              onClick={() => navigate('/admin/tables')}
              className="text-seeblick text-sm hover:underline"
            >
              Alle anzeigen
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {occupiedTables.slice(0, 8).map(table => (
              <TableCard
                key={table.id}
                table={table}
                onClick={() => updateTableStatus(table.id, 'free')}
              />
            ))}
          </div>

          {occupiedTables.length === 0 && (
            <p className="text-text-muted text-center py-4">Keine belegten Tische</p>
          )}
        </div>

        <div className="bg-white rounded-card shadow-card p-5">
          <h3 className="font-bold text-text-primary mb-4">Letzte Bestellungen</h3>

          <div className="space-y-3">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-off-white rounded-card-sm"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-medium text-text-primary text-sm">{order.id}</p>
                    <p className="text-text-muted text-xs">Tisch {order.tableNumber}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-seeblick text-sm">CHF {order.total.toFixed(2)}</p>
                  <p className="text-text-muted text-xs">
                    {order.createdAt.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {recentOrders.length === 0 && (
            <p className="text-text-muted text-center py-4">Keine Bestellungen vorhanden</p>
          )}
        </div>
      </div>
    </div>
  );
}
