import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { FloatingElements } from "./FloatingElements";

export function Root() {
  return (
    <div className="min-h-screen relative">
      <FloatingElements />

      <Navbar />

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}