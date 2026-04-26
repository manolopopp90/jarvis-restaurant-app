import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle, Users } from 'lucide-react';
import { useTable } from '../contexts/TableContext';
import type { Table } from '../types';

export default function TableManagementPage() {
  const navigate = useNavigate();
  const { allTables, updateTableStatus } = useTable();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeArea, setActiveArea] = useState<'terrace' | 'indoor'>('terrace');

  const terraceTables = allTables.filter(t => t.area === 'terrace');
  const indoorTables = allTables.filter(t => t.area === 'indoor');

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleStatusChange = (status: Table['status']) => {
    if (selectedTable) {
      updateTableStatus(selectedTable.id, status);
      setSelectedTable(null);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-40 bg-white border-b border-light-grey h-14 flex items-center px-4 shadow-sm">
        <div className="flex items-center flex-1">
          <button
            onClick={() => navigate('/admin')}
            className="mr-3 p-2 hover:bg-off-white rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Tischverwaltung</h1>
        </div>
        <button className="bg-seeblick text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-seeblick-dark transition-colors flex items-center gap-1">
          <Plus size={16} />
          Neuer Tisch
        </button>
      </header>

      <div className="p-5">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveArea('terrace')}
            className={`flex-1 py-3 rounded-button font-medium transition-colors ${
              activeArea === 'terrace'
                ? 'bg-lake text-white'
                : 'bg-white text-text-secondary border border-light-grey hover:bg-off-white'
            }`}
          >
            🌿 Terrasse
          </button>
          <button
            onClick={() => setActiveArea('indoor')}
            className={`flex-1 py-3 rounded-button font-medium transition-colors ${
              activeArea === 'indoor'
                ? 'bg-lake text-white'
                : 'bg-white text-text-secondary border border-light-grey hover:bg-off-white'
            }`}
          >
            🏠 Innenbereich
          </button>
        </div>

        <div className="bg-white rounded-card shadow-card p-6 mb-6 min-h-[300px]">
          <p className="text-text-muted text-sm mb-4">
            {activeArea === 'terrace' ? 'Tische auf der Terrasse' : 'Tische im Innenbereich'}
          </p>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {(activeArea === 'terrace' ? terraceTables : indoorTables).map(table => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`relative p-4 rounded-card-sm border-2 transition-all duration-200 ${
                  table.status === 'free'
                    ? 'border-success/30 bg-success/5 hover:bg-success/10'
                    : table.status === 'occupied'
                    ? 'border-warning/30 bg-warning/5 hover:bg-warning/10'
                    : 'border-info/30 bg-info/5 hover:bg-info/10'
                }`}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary mb-1">{table.number}</p>
                  <div className="flex items-center justify-center gap-1 text-text-muted text-sm">
                    <Users size={14} />
                    <span>{table.capacity}</span>
                  </div>
                  {table.status === 'occupied' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-warning rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSelectedTable(null)}
            />
            <div className="relative bg-white w-full max-w-lg rounded-t-sheet shadow-sheet p-6 animate-slide-up">
              <div className="w-10 h-1 bg-light-grey rounded-full mx-auto mb-6" />

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-1">
                  Tisch {selectedTable.number}
                </h2>
                <p className="text-text-secondary">
                  {selectedTable.area === 'terrace' ? 'Terrasse' : 'Innenbereich'} • {selectedTable.capacity} Personen
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-text-muted mb-2">Status</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('free')}
                    className={`flex-1 py-3 rounded-button font-medium transition-colors ${
                      selectedTable.status === 'free'
                        ? 'bg-success text-white'
                        : 'bg-off-white text-text-secondary hover:bg-success/10'
                    }`}
                  >
                    <CheckCircle size={16} className="inline mr-1" />
                    Frei
                  </button>
                  <button
                    onClick={() => handleStatusChange('occupied')}
                    className={`flex-1 py-3 rounded-button font-medium transition-colors ${
                      selectedTable.status === 'occupied'
                        ? 'bg-warning text-white'
                        : 'bg-off-white text-text-secondary hover:bg-warning/10'
                    }`}
                  >
                    <Users size={16} className="inline mr-1" />
                    Belegt
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTable(null)}
                  className="flex-1 py-3 rounded-button border-2 border-light-grey text-text-secondary font-medium hover:bg-off-white transition-colors"
                >
                  Schliessen
                </button>
                <button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'free');
                    setSelectedTable(null);
                  }}
                  className="flex-1 py-3 rounded-button bg-error text-white font-medium hover:bg-error/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Leeren
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
