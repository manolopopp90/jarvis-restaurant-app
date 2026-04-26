import type { Table } from '../types';

export const tables: Table[] = [
  // Terrasse
  { id: 't1', number: 1, capacity: 4, status: 'occupied', position: { x: 20, y: 20 }, area: 'terrace' },
  { id: 't2', number: 2, capacity: 2, status: 'free', position: { x: 60, y: 20 }, area: 'terrace' },
  { id: 't3', number: 3, capacity: 6, status: 'occupied', position: { x: 30, y: 50 }, area: 'terrace' },
  { id: 't4', number: 4, capacity: 4, status: 'free', position: { x: 70, y: 50 }, area: 'terrace' },
  { id: 't5', number: 5, capacity: 2, status: 'occupied', position: { x: 20, y: 80 }, area: 'terrace' },
  { id: 't6', number: 6, capacity: 4, status: 'free', position: { x: 60, y: 80 }, area: 'terrace' },
  // Innenbereich
  { id: 't7', number: 7, capacity: 4, status: 'free', position: { x: 15, y: 20 }, area: 'indoor' },
  { id: 't8', number: 8, capacity: 6, status: 'occupied', position: { x: 50, y: 20 }, area: 'indoor' },
  { id: 't9', number: 9, capacity: 2, status: 'free', position: { x: 15, y: 50 }, area: 'indoor' },
  { id: 't10', number: 10, capacity: 4, status: 'occupied', position: { x: 50, y: 50 }, area: 'indoor' },
  { id: 't11', number: 11, capacity: 8, status: 'free', position: { x: 30, y: 80 }, area: 'indoor' },
  { id: 't12', number: 12, capacity: 4, status: 'occupied', position: { x: 70, y: 80 }, area: 'indoor' },
];

export const getTablesByArea = (area: 'terrace' | 'indoor'): Table[] => {
  return tables.filter(table => table.area === area);
};

export const getTableByNumber = (number: number): Table | undefined => {
  return tables.find(table => table.number === number);
};

export const getOccupiedTables = (): Table[] => {
  return tables.filter(table => table.status === 'occupied');
};
