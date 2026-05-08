import { createContext, useContext } from "react";

const SellerContext = createContext();

export function SellerProvider({ children }) {
  const sellers = [
    {
      id: 999,
      name: "LoomsLilly Studio",
      image: null,
    },
    {
      id: 998,
      name: "Art Haven",
      image: null,
    },
    {
      id: 997,
      name: "Creative Threads",
      image: null,
    },
  ];

  const getSellerById = (id) => {
    return sellers.find((s) => s.id === Number(id));
  };

  return (
    <SellerContext.Provider value={{ sellers, getSellerById }}>
      {children}
    </SellerContext.Provider>
  );
}

export const useSellers = () => useContext(SellerContext);