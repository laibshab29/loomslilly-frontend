import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { FloatingElements } from "./FloatingElements";
import { GlobalSellerReminderWatcher } from "./GlobalSellerReminderWatcher";

export function Root() {
  return (
    <div className="min-h-screen relative">
      <FloatingElements />

      <GlobalSellerReminderWatcher />

      <Navbar />

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}