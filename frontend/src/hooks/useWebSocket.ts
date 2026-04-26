import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketState {
  isConnected: boolean;
  newOrders: any[];
  statusUpdates: any[];
  tableUpdates: any[];
}

export function useWebSocket(tableNumber?: number) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    newOrders: [],
    statusUpdates: [],
    tableUpdates: []
  });
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Socket.io Verbindung aufbauen
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 WebSocket verbunden');
      setState(prev => ({ ...prev, isConnected: true }));
      
      // Tisch-Raum beitreten (falls Tischnummer vorhanden)
      if (tableNumber) {
        socket.emit('join-table', tableNumber);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket getrennt');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('new-order', (order) => {
      console.log('📢 Neue Bestellung erhalten:', order);
      setState(prev => ({
        ...prev,
        newOrders: [...prev.newOrders, order]
      }));
    });

    socket.on('order-status-changed', (order) => {
      console.log('📢 Bestellstatus geändert:', order);
      setState(prev => ({
        ...prev,
        statusUpdates: [...prev.statusUpdates, order]
      }));
    });

    socket.on('table-status-changed', (table) => {
      console.log('📢 Tischstatus geändert:', table);
      setState(prev => ({
        ...prev,
        tableUpdates: [...prev.tableUpdates, table]
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [tableNumber]);

  const joinAdminRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('join-admin');
      console.log('👤 Admin-Raum beigetreten');
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      newOrders: [],
      statusUpdates: [],
      tableUpdates: []
    }));
  }, []);

  return {
    ...state,
    joinAdminRoom,
    clearNotifications,
    socket: socketRef.current
  };
}
