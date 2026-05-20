// src/components/OrderHandlersBridge.jsx
import { useEffect } from "react";
import { useOrders } from "../context/OrderContext";
import { useNotifications } from "../context/NotificationContext";
import { useProducts } from "../context/ProductContext";

export function OrderHandlersBridge() {
  const { setExternalHandlers } = useOrders();
  const {
    notifyOrderPlacedBuyer,
    notifyPaymentPendingSeller,
    notifyPaymentConfirmed,
    notifyOrderCancelled,
    notifyDelivered,
  } = useNotifications();
  const { reduceStock } = useProducts();

  useEffect(() => {
    setExternalHandlers({
      notifyOrderPlacedBuyer:     (buyerId, order)         => notifyOrderPlacedBuyer(buyerId, order),
      notifyPaymentPendingSeller: (sellerId, order)        => notifyPaymentPendingSeller(sellerId, order),
      notifyPaymentConfirmed:     (buyerId, order)         => notifyPaymentConfirmed(buyerId, order),
      notifyOrderCancelled:       (buyerId, order, reason) => notifyOrderCancelled(buyerId, order, reason),
      notifyDelivered:            (buyerId, order)         => notifyDelivered(buyerId, order),
      restoreStock: (items) => {
        const restored = items.map((i) => ({ ...i, quantity: -i.quantity }));
        reduceStock(restored);
      },
    });
  }, [
    setExternalHandlers,
    notifyOrderPlacedBuyer,
    notifyPaymentPendingSeller,
    notifyPaymentConfirmed,
    notifyOrderCancelled,
    notifyDelivered,
    reduceStock,
  ]);

  return null;
}