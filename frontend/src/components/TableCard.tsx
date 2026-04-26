import { Users, Utensils } from 'lucide-react';
import type { Table } from '../types';

interface TableCardProps {
  table: Table;
  onClick?: (table: Table) => void;
}

export default function TableCard({ table, onClick }: TableCardProps) {
  const statusColors = {
    free: 'border-l-seeblick bg-white',
    occupied: 'border-l-warning bg-white',
    reserved: 'border-l-info bg-white',
  };

  const statusBadgeColors = {
    free: 'bg-success/10 text-success',
    occupied: 'bg-warning/10 text-warning',
    reserved: 'bg-info/10 text-info',
  };

  const statusLabels = {
    free: 'Frei',
    occupied: 'Belegt',
    reserved: 'Reserviert',
  };

  return (
    <div
      onClick={() => onClick?.(table)}
      className={`border-l-4 rounded-card-sm shadow-card p-4 cursor-pointer transition-all duration-200 hover:shadow-card-hover active:scale-[0.98] ${statusColors[table.status]}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-primary">{table.number}</span>
          {table.status === 'occupied' && <Utensils size={16} className="text-warning" />}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadgeColors[table.status]}`}>
          {statusLabels[table.status]}
        </span>
      </div>

      <div className="flex items-center gap-1 text-text-muted text-sm">
        <Users size={14} />
        <span>{table.capacity} Personen</span>
      </div>

      {table.area && (
        <div className="mt-2 text-xs text-text-muted">
          {table.area === 'terrace' ? '🌿 Terrasse' : '🏠 Innenbereich'}
        </div>
      )}
    </div>
  );
}
