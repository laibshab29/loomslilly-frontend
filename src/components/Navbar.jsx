// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, X, User, LogOut, Bell, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { useEvents } from "../context/EventContext";
import { useTutorials } from "../context/TutorialContext";
import { useProducts } from "../context/ProductContext";
import { useCommunity } from "../context/CommunityContext";
import { useNotifications } from "../context/NotificationContext";
import { CommunityGuidelinesModal } from "./shared/CommunityGuidelinesModal";

import logo from "../assets/logo.jpeg";

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

const navLinks = [
  { label: "All",          path: "/all-products" },
  { label: "Crafts",       path: "/crafts" },
  { label: "Arts",         path: "/arts" },
  { label: "Tutorials",    path: "/tutorials" },
  { label: "Deals",        path: "/deals" },
  { label: "Community",    path: "/community" },
  { label: "Events",       path: "/events" },
  { label: "New Arrivals", path: "/new-arrivals" },
  { label: "Trending",     path: "/trending" },
];

export function Navbar() {
  const { isGuest, logout, user, role, isCommunityMember, joinCommunityMembership } = useAuth();
  const navigate = useNavigate();
  const { setTransitionMode } = useUI();
  const { activeEvents } = useEvents();
  const { tutorials } = useTutorials();
  const { products, deals } = useProducts();
  const { joinCommunity } = useCommunity();
  const { unreadCount } = useNotifications();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const inputRef = useRef(null);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const handleSearchSubmit = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    closeSearch();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        closeSearch();
        setLogoutConfirmOpen(false);
      }
      if (e.key === "Enter" && searchOpen) {
        handleSearchSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen, query]);

  const results = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return {};

    const grouped = {};
    const add = (category, item) => {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    };

    STATIC_PAGES.forEach((p) => {
      if (p.label.toLowerCase().includes(q)) {
        add(p.category, { label: p.label, path: p.path });
      }
    });

    products.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q)
      ) {
        add("Products", {
          label: p.name,
          sub: `${p.category} · ${p.type}${p.badge ? ` · ${p.badge}` : ""}`,
          path: `/search?q=${encodeURIComponent(p.name)}`,
        });
      }
    });

    deals.forEach((d) => {
      if (d.title.toLowerCase().includes(q)) {
        add("Deals", {
          label: d.title,
          sub: `Was Rs. ${d.originalPrice} → Rs. ${d.discountedPrice}`,
          path: `/deals/${d.id}`,
        });
      }
    });

    activeEvents.forEach((e) => {
      if (
        e.name.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      ) {
        add("Events", { label: e.name, sub: `${e.type} · ${e.venue}`, path: `/events` });
      }
    });

    tutorials.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)) {
        add("Tutorials", { label: t.title, sub: t.type, path: `/tutorials` });
      }
    });

    return grouped;
  })();

  const hasResults = Object.keys(results).length > 0;

  const handleLogoClick = () => {
    setTransitionMode("quick");
    setTimeout(() => {
      navigate("/");
      setTransitionMode(null);
    }, 500);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate("/");
  };

  const handleConfirmJoin = () => {
    setGuidelinesOpen(false);
    if (isGuest) { navigate("/signup"); return; }
    if (user) joinCommunity(user.id);
    joinCommunityMembership();
  };

  const myUnread = user ? unreadCount(user.id) : 0;

  const topRow = navLinks.slice(0, 5);
  const bottomRow = navLinks.slice(5, 9);

  return (
    <div className="relative z-50 mt-14">
      <nav className="mx-4 lg:mx-20 relative">
        <div className="max-w-[1440px] mx-auto bg-[#FFF6F8]/80 backdrop-blur-md rounded-[30px] pl-44 pr-6 py-3 shadow-lg border-2 border-[#7A6C9D]/30 relative overflow-visible">

          {/* CUT MASK */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-44 h-44 bg-[#5B4B73] rounded-full z-10" />

          {/* LOGO */}
          <div
            onClick={handleLogoClick}
            className="absolute -left-8 top-1/2 -translate-y-1/2 z-50 cursor-pointer"
          >
            <div className="w-44 h-44 rounded-full">
              <div className="w-full h-full rounded-full p-[4px] bg-[#FF8FA3] shadow-[0_0_15px_rgba(255,143,163,0.5)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#5B4B73]">
                  <img src={logo} alt="LoomsLilly Logo" className="w-full h-full object-cover scale-115" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 relative z-20">

            {/* NAV LINKS — 2 rows */}
            <div className="hidden lg:flex flex-col gap-1 flex-1">
              {[topRow, bottomRow].map((row, rowIdx) => (
                <div key={rowIdx} className="flex items-center justify-center gap-1">
                  {row.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex-1 text-center px-2 py-1.5 rounded-full text-[#2E2A4A] text-sm font-medium hover:bg-[#F6C1CC]/50 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                      style={{ fontFamily: "Fredoka, sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {!isGuest && (
                <Link
                  to="/notifications"
                  className="relative p-3 rounded-full bg-[#C8B6E2]/30 hover:bg-[#C8B6E2]/50 transition-all duration-300 hover:scale-110"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-[#2E2A4A]" />
                  {myUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF8FA3] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {myUnread > 9 ? "9+" : myUnread}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={openSearch}
                className="p-3 rounded-full bg-[#C8B6E2]/30 hover:bg-[#C8B6E2]/50 transition-all duration-300 hover:scale-110"
                title="Search"
              >
                <Search className="w-5 h-5 text-[#2E2A4A]" />
              </button>

              {role !== "seller" && (
                <Link
                  to="/cart"
                  className="p-3 rounded-full bg-[#C8B6E2]/30 hover:bg-[#C8B6E2]/50 transition-all duration-300 hover:scale-110"
                  title="Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-[#2E2A4A]" />
                </Link>
              )}

              {/* 🔥 GUEST-ONLY: shopping bag → My Orders (signed-in users access via Account) */}
              {isGuest && (
                <Link
                  to="/my-orders"
                  className="p-3 rounded-full bg-[#C8B6E2]/30 hover:bg-[#C8B6E2]/50 transition-all duration-300 hover:scale-110"
                  title="My Orders"
                >
                  <ShoppingBag className="w-5 h-5 text-[#2E2A4A]" />
                </Link>
              )}

              {isGuest ? (
                <>
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/signup?mode=login"
                      className="px-3 py-0.5 text-xs rounded-full bg-[#FF8FA3] text-white text-center hover:scale-105 transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-3 py-0.5 text-xs rounded-full bg-[#FF8FA3] text-white text-center hover:scale-105 transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                  <button
                    onClick={() => setGuidelinesOpen(true)}
                    className="px-3 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] text-xs font-medium text-center leading-tight hover:scale-105 transition-all whitespace-normal max-w-[80px]"
                    style={{ fontFamily: "Fredoka, sans-serif" }}
                  >
                    Join<br />Community
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] text-sm hover:scale-105 transition-all max-w-[140px]"
                  >
                    <User className="w-4 h-4 text-[#2E2A4A] flex-shrink-0" />
                    <span className="truncate">{user?.name || "Account"}</span>
                  </Link>

                  {!isCommunityMember && role !== "seller" && (
                    <button
                      onClick={() => setGuidelinesOpen(true)}
                      className="px-3 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] text-xs font-medium text-center leading-tight hover:scale-105 transition-all whitespace-normal max-w-[80px]"
                      style={{ fontFamily: "Fredoka, sans-serif" }}
                    >
                      Join<br />Community
                    </button>
                  )}

                  <button
                    onClick={() => setLogoutConfirmOpen(true)}
                    title="Logout"
                    className="p-3 rounded-full bg-[#FF8FA3] text-white hover:scale-110 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
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

      {/* SEARCH OVERLAY */}
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
              <div className="flex items-center gap-3 bg-[#FFF6F8] rounded-[20px] px-5 py-4 shadow-2xl border-2 border-[#FF8FA3]/40">
                <Search className="w-5 h-5 text-[#7A6C9D] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, events, tutorials..."
                  className="flex-1 bg-transparent outline-none text-[#2E2A4A] placeholder:text-[#7A6C9D] text-lg"
                  style={{ fontFamily: "Fredoka, sans-serif" }}
                />
                {query.trim() && (
                  <button
                    onClick={handleSearchSubmit}
                    className="px-4 py-1.5 rounded-full bg-[#FF8FA3] text-white text-sm hover:scale-105 transition-all"
                    style={{ fontFamily: "Fredoka, sans-serif" }}
                  >
                    Search
                  </button>
                )}
                <button onClick={closeSearch} className="p-1.5 rounded-full hover:bg-[#F6C1CC]/40 transition-all">
                  <X className="w-5 h-5 text-[#7A6C9D]" />
                </button>
              </div>

              <AnimatePresence>
                {query.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-3 bg-[#FFF6F8] rounded-[20px] shadow-2xl border-2 border-[#7A6C9D]/20 overflow-hidden max-h-[50vh] overflow-y-auto"
                  >
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full flex items-center gap-3 px-5 py-3 bg-[#FF8FA3]/10 hover:bg-[#FF8FA3]/20 transition-colors text-left border-b border-[#7A6C9D]/10"
                    >
                      <Search className="w-4 h-4 text-[#FF8FA3] flex-shrink-0" />
                      <p className="text-[#FF8FA3] text-sm font-medium">
                        See all results for "<strong>{query}</strong>"
                      </p>
                    </button>

                    {!hasResults ? (
                      <div className="px-6 py-8 text-center text-[#7A6C9D]">
                        <div className="text-4xl mb-3">🔍</div>
                        <p>No quick results for "<strong>{query}</strong>"</p>
                      </div>
                    ) : (
                      Object.entries(results).map(([category, items]) => (
                        <div key={category}>
                          <div className="px-5 pt-4 pb-1">
                            <span className="text-xs font-semibold text-[#C8B6E2] uppercase tracking-widest">
                              {category}
                            </span>
                          </div>
                          {items.slice(0, 4).map((item, i) => (
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

      {/* LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setLogoutConfirmOpen(false); }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-[440px] rounded-[24px] bg-[#FFF6F8] p-10 shadow-2xl border-2 border-[#FF8FA3]/40 text-center"
            >
              <h2
                style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}
                className="text-3xl mb-4"
              >
                Are You Sure?
              </h2>
              <p className="text-[#2E2A4A] mb-8">You are about to log out of your account.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="px-6 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommunityGuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
        onConfirm={handleConfirmJoin}
        isGuest={isGuest}
      />
    </div>
  );
}