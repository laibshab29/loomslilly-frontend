import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [transitionMode, setTransitionMode] = useState(null);

  return (
    <UIContext.Provider value={{ transitionMode, setTransitionMode }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);