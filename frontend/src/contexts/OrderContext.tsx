import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Order, CartItem } from '../types';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (tableNumber: number, items: CartItem[], total: number, tax: number, specialInstructions?: string) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const createOrder = useCallback((tableNumber: number, items: CartItem[], total: number, tax: number, specialInstructions?: string): Order => {
    const newOrder: Order = {
      id: `#${1000 + orders.length + 1}`,
      tableNumber,
      items: [...items],
      status: 'pending',
      total,
      tax,
      createdAt: new Date(),
      specialInstructions,
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    return newOrder;
  }, [orders.length]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status } : null);
    }
  }, [currentOrder]);

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      createOrder,
      updateOrderStatus,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within a OrderProvider');
  }
  return context;
}
