import { useEffect } from "react";
import { useOrders } from "../context/OrderContext";
import { useNotifications } from "../context/NotificationContext";
import { useProducts } from "../context/ProductContext";

export function OrderHandlersBridge() {
  const { setExternalHandlers } = useOrders();
  const {
    notifyNewOrder,
    notifyPersistentNewOrder,
    notifyPaymentFailure,
    notifyOrderCancelled,
    notifyDelivered,
    notifyPaymentConfirmed,
  } = useNotifications();
  const { reduceStock } = useProducts();

  useEffect(() => {
    setExternalHandlers({
      notifyNewOrder: (sellerId, order) => notifyNewOrder(sellerId, order),
      notifyPersistentNewOrder: (sellerId, order) => notifyPersistentNewOrder(sellerId, order),
      notifyPaymentFailure: (buyerId, order) => notifyPaymentFailure(buyerId, order),
      notifyOrderCancelled: (buyerId, order, reason) => notifyOrderCancelled(buyerId, order, reason),
      notifyDelivered: (buyerId, order) => notifyDelivered(buyerId, order),
      notifyPaymentConfirmed: (buyerId, order) => notifyPaymentConfirmed(buyerId, order),
      restoreStock: (items) => {
        const restored = items.map((i) => ({ ...i, quantity: -i.quantity }));
        reduceStock(restored);
      },
    });
  }, [setExternalHandlers, notifyNewOrder, notifyPersistentNewOrder, notifyPaymentFailure, notifyOrderCancelled, notifyDelivered, notifyPaymentConfirmed, reduceStock]);

  return null;
}