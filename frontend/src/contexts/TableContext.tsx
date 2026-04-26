import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Table } from '../types';
import { tables } from '../data/tableData';

interface TableContextType {
  currentTable: number | null;
  setCurrentTable: (tableNumber: number | null) => void;
  allTables: Table[];
  updateTableStatus: (tableId: string, status: Table['status']) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [currentTable, setCurrentTable] = useState<number | null>(null);
  const [allTables, setAllTables] = useState<Table[]>(tables);

  const updateTableStatus = useCallback((tableId: string, status: Table['status']) => {
    setAllTables(prev =>
      prev.map(table =>
        table.id === tableId ? { ...table, status } : table
      )
    );
  }, []);

  return (
    <TableContext.Provider value={{
      currentTable,
      setCurrentTable,
      allTables,
      updateTableStatus,
    }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
}
