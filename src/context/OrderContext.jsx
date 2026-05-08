import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const placeOrder = (cartItems, user) => {
    const newOrder = {
      id: Date.now(),
      userId: user.id,
      items: cartItems,
      createdAt: Date.now(),
    };

    setOrders((prev) => [...prev, newOrder]);
  };

  // 🔥 SALES CALCULATION
  const getSellerSales = (sellerId) => {
    let total = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.sellerId === sellerId) {
          total += item.quantity;
        }
      });
    });

    return total;
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getSellerSales }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);