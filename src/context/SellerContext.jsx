import { createContext, useContext } from "react";

const SellerContext = createContext();

const DEMO_SELLERS = [
  { id: 999, name: "LoomsLilly Studio", image: null },
  { id: 998, name: "Art Haven", image: null },
  { id: 997, name: "Creative Threads", image: null },
];

export function SellerProvider({ children }) {
  const sellers = DEMO_SELLERS;

  const getSellerById = (id) => {
    const numericId = Number(id);

    // 1. Check demo sellers
    const demo = sellers.find((s) => s.id === numericId);
    if (demo) return demo;

    // 2. Fall back to registered users in localStorage
    try {
      const registered = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const user = registered.find((u) => u.id === numericId);
      if (user) {
        return {
          id: user.id,
          name: user.name,
          image: user.image || null,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      }
    } catch {
      // ignore
    }

    return null;
  };

  return (
    <SellerContext.Provider value={{ sellers, getSellerById }}>
      {children}
    </SellerContext.Provider>
  );
}

export const useSellers = () => useContext(SellerContext);