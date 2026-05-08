import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { useEvents } from "../context/EventContext";
import { useTutorials } from "../context/TutorialContext";
import { useProducts } from "../context/ProductContext";

import logo from "../assets/logo.jpeg";

// ─── Static searchable content ────────────────────────────────────────────────
const STATIC_PAGES = [
  { label: "Crochet", path: "/crafts/crochet", category: "Crafts" },
  { label: "Knitting", path: "/crafts/knitting", category: "Crafts" },
  { label: "Embroidery", path: "/crafts/embroidery", category: "Crafts" },
  { label: "Sketching", path: "/arts/sketching", category: "Arts" },
  { label: "Painting", path: "/arts/painting", category: "Arts" },
  { label: "Abstract Art", path: "/arts/abstract", category: "Arts" },
  { label: "Deals", path: "/deals", category: "Pages" },
  { label: "New Arrivals", path: "/new-arrivals", category: "Pages" },
  { label: "Trending", path: "/trending", category: "Pages" },
  { label: "Community", path: "/community", category: "Pages" },
  { label: "Cart", path: "/cart", category: "Pages" },
  { label: "Account", path: "/account", category: "Pages" },
];

export function Navbar() {
  const { isGuest, logout, user, role } = useAuth();
  const navigate = useNavigate();
  const { setTransitionMode } = useUI();
  const { activeEvents } = useEvents();
  const { tutorials } = useTutorials();
  const { products, deals } = useProducts();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const navLinks = [
    { label: "Crafts", path: "/crafts" },
    { label: "Arts", path: "/arts" },
    { label: "Tutorials", path: "/tutorials" },
    { label: "Deals", path: "/deals" },
    { label: "Community", path: "/community" },
    { label: "Events", path: "/events" },
    { label: "New Arrivals", path: "/new-arrivals" },
    { label: "Trending", path: "/trending" },
  ];

  // Open search bar
  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ─── Build results ─────────────────────────────────────────────────────────
  const results = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return {};

    const grouped = {};

    const add = (category, item) => {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    };

    // Static pages
    STATIC_PAGES.forEach((p) => {
      if (p.label.toLowerCase().includes(q)) {
        add(p.category, { label: p.label, path: p.path });
      }
    });

    // Products
    products.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q)
      ) {
        const path = p.category === "arts"
          ? `/arts/${p.type}`
          : p.category === "crafts"
          ? `/crafts/${p.type}`
          : `/new-arrivals`;
        add("Products", {
          label: p.name,
          sub: `${p.category} · ${p.type}${p.badge ? ` · ${p.badge}` : ""}`,
          path,
        });
      }
    });

    // Deals
    deals.forEach((d) => {
      if (d.title.toLowerCase().includes(q)) {
        add("Deals", {
          label: d.title,
          sub: `Was $${d.originalPrice} → $${d.discountedPrice}`,
          path: `/deals/${d.id}`,
        });
      }
    });

    // Events
    activeEvents.forEach((e) => {
      if (
        e.name.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      ) {
        add("Events", {
          label: e.name,
          sub: `${e.type} · ${e.venue}`,
          path: `/events`,
        });
      }
    });

    // Tutorials
    tutorials.forEach((t) => {
      if (
        t.title.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
      ) {
        add("Tutorials", {
          label: t.title,
          sub: t.type,
          path: `/tutorials`,
        });
      }
    });

    return grouped;
  })();

  const hasResults = Object.keys(results).length > 0;

  // ─── Logo click ────────────────────────────────────────────────────────────
  const handleLogoClick = () => {
    setTransitionMode("quick");
    setTimeout(() => {
      navigate("/");
      setTransitionMode(null);
    }, 500);
  };

  return (
    <div className="relative z-50 mt-14">
      <nav className="mx-4 lg:mx-20 relative">
        <div className="max-w-[1440px] mx-auto bg-[#FFF6F8]/80 backdrop-blur-md rounded-[30px] pl-56 pr-6 py-4 shadow-lg border-2 border-[#7A6C9D]/30 relative overflow-visible">

          {/* CUT MASK */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#5B4B73] rounded-full z-10" />

          {/* LOGO */}
          <div
            onClick={handleLogoClick}
            className="absolute left-[-1px] top-[50%] -translate-y-1/2 z-50 cursor-pointer"
          >
            <div className="w-48 h-48 rounded-full">
              <div className="w-full h-full rounded-full p-[4px] bg-[#FF8FA3] shadow-[0_0_15px_rgba(255,143,163,0.5)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#5B4B73]">
                  <img src={logo} alt="LoomsLilly Logo" className="w-full h-full object-cover scale-115" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 relative z-20">

            {/* NAV LINKS */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 rounded-full text-[#2E2A4A] hover:bg-[#F6C1CC]/50 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* SEARCH BUTTON */}
              <button
                onClick={openSearch}
                className="p-3 rounded-full bg-[#C8B6E2]/30 hover:bg-[#C8B6E2]/50 transition-all duration-300 hover:scale-110"
                title="Search"
              >
                <Search className="w-5 h-5 text-[#2E2A4A]" />
              </button>

              {/* CART */}
              {role !== "seller" && (
                <Link
                  to="/cart"
                  className="p-3 rounded-full bg-[#C8B6E2]/30 hover:bg-[#C8B6E2]/50 transition-all duration-300 hover:scale-110"
                >
                  <ShoppingCart className="w-5 h-5 text-[#2E2A4A]" />
                </Link>
              )}

              {/* AUTH */}
              {isGuest ? (
                <>
                  <div className="flex flex-col gap-1">
                    <Link to="/signup?mode=login" className="px-4 py-1 text-xs rounded-full bg-[#FF8FA3] text-white text-center">Log In</Link>
                    <Link to="/signup" className="px-4 py-1 text-xs rounded-full bg-[#FF8FA3] text-white text-center">Sign Up</Link>
                  </div>
                  <Link to="/community" className="px-5 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A]">Join Community</Link>
                </>
              ) : (
                <>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                  >
                    <User className="w-5 h-5 text-[#2E2A4A]" />
                    <span>{user?.name || "Account"}</span>
                  </Link>
                  <button onClick={logout} className="px-5 py-2 rounded-full bg-[#FF8FA3] text-white">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* MOBILE NAV */}
          <div className="lg:hidden mt-4 flex flex-wrap gap-2 relative z-20">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="px-3 py-1.5 rounded-full text-sm text-[#2E2A4A] bg-[#F6C1CC]/30">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── SEARCH OVERLAY ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center pt-28 px-4 bg-black/50 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-[640px]"
            >
              {/* INPUT */}
              <div className="flex items-center gap-3 bg-[#FFF6F8] rounded-[20px] px-5 py-4 shadow-2xl border-2 border-[#FF8FA3]/40">
                <Search className="w-5 h-5 text-[#7A6C9D] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, tutorials, pages..."
                  className="flex-1 bg-transparent outline-none text-[#2E2A4A] placeholder:text-[#7A6C9D] text-lg"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                />
                <button onClick={closeSearch} className="p-1.5 rounded-full hover:bg-[#F6C1CC]/40 transition-all">
                  <X className="w-5 h-5 text-[#7A6C9D]" />
                </button>
              </div>

              {/* RESULTS DROPDOWN */}
              <AnimatePresence>
                {query.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-3 bg-[#FFF6F8] rounded-[20px] shadow-2xl border-2 border-[#7A6C9D]/20 overflow-hidden max-h-[60vh] overflow-y-auto"
                  >
                    {!hasResults ? (
                      <div className="px-6 py-8 text-center text-[#7A6C9D]">
                        <div className="text-4xl mb-3">🔍</div>
                        <p>No results for "<strong>{query}</strong>"</p>
                      </div>
                    ) : (
                      Object.entries(results).map(([category, items]) => (
                        <div key={category}>
                          {/* CATEGORY HEADING */}
                          <div className="px-5 pt-4 pb-1">
                            <span className="text-xs font-semibold text-[#C8B6E2] uppercase tracking-widest">
                              {category}
                            </span>
                          </div>
                          {/* ITEMS */}
                          {items.map((item, i) => (
                            <button
                              key={i}
                              onClick={() => { navigate(item.path); closeSearch(); }}
                              className="w-full flex items-start gap-3 px-5 py-3 hover:bg-[#F6C1CC]/30 transition-colors text-left"
                            >
                              <Search className="w-4 h-4 text-[#C8B6E2] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[#2E2A4A] text-sm font-medium">{item.label}</p>
                                {item.sub && <p className="text-xs text-[#7A6C9D]">{item.sub}</p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}