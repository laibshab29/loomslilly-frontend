import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useEffect } from "react";
import { LogoTransition } from "./components/LogoTransition";
import { useUI } from "./context/UIContext";
import { AnimatePresence } from "framer-motion";

export default function App() {
  const { transitionMode, setTransitionMode } = useUI();

  useEffect(() => {
    const seen = sessionStorage.getItem("seenIntro");

    if (!seen) {
      setTransitionMode("intro");
      sessionStorage.setItem("seenIntro", "true");
    }
  }, [setTransitionMode]);

  return (
    <>
      <AnimatePresence mode="wait">
        {transitionMode && (
          <LogoTransition
            key="transition"
            mode={transitionMode}
            onFinish={() => setTransitionMode(null)} // ✅ CLEAN CONTROL
          />
        )}
      </AnimatePresence>

      <RouterProvider router={router} />
    </>
  );
}