// src/pages/SearchResults.jsx
import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useEvents } from "../context/EventContext";
import { useTutorials } from "../context/TutorialContext";
import { ProductCard } from "../components/ProductCard";
import { SortBar, sortProducts } from "../components/SortBar";

function TutorialCard({ tutorial }) {
  return (
    <Link to={`/tutorials/${tutorial.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-[#FFF6F8]/90 rounded-[24px] p-5 shadow-xl"
      >
        {tutorial.thumbnail && (
          <img
            src={tutorial.thumbnail}
            alt={tutorial.title}
            className="w-full h-40 object-cover rounded-[16px] mb-4"
          />
        )}
        <h3 className="text-xl text-[#2E2A4A] mb-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
          {tutorial.title}
        </h3>
        <p className="text-sm text-[#7A6C9D] capitalize">{tutorial.type}</p>
      </motion.div>
    </Link>
  );
}

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-[#FFF6F8]/90 rounded-[24px] p-5 shadow-xl"
      >
        <h3 className="text-xl text-[#2E2A4A] mb-1" style={{ fontFamily: "Fredoka, sans-serif" }}>
          {event.name}
        </h3>
        <p className="text-sm text-[#7A6C9D]">{event.type} · {event.venue}</p>
      </motion.div>
    </Link>
  );
}

function DealCard({ deal }) {
  return (
    <Link to={`/deals/${deal.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-[24px] overflow-hidden p-6 bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] shadow-xl"
      >
        {deal.images?.[0] && (
          <img src={deal.images[0]} alt={deal.title} className="w-full h-40 object-cover rounded-[16px] mb-4" />
        )}
        <h3 className="text-2xl mb-2" style={{ fontFamily: "Pacifico, cursive", color: "#FFF6F8" }}>
          {deal.title}
        </h3>
        <p className="text-white/80 text-sm line-through">Rs. {deal.originalPrice}</p>
        <p className="text-white text-xl">Rs. {deal.discountedPrice}</p>
      </motion.div>
    </Link>
  );
}

const SECTION_SORT_OPTIONS = {
  Products: ["priceLow", "priceHigh", "mostLiked", "recent"],
  Deals:    ["priceLow", "priceHigh", "recent"],
  Tutorials: [],
  Events:   [],
};

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q")?.trim().toLowerCase() || "";

  const { products, deals } = useProducts();
  const { activeEvents } = useEvents();
  const { tutorials } = useTutorials();

  const [productSort, setProductSort] = useState("recent");
  const [dealSort, setDealSort]       = useState("recent");

  const matchedProducts = useMemo(() => {
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        p.details?.toLowerCase().includes(q)
    );
  }, [products, q]);

  const matchedDeals = useMemo(() => {
    if (!q) return [];
    return deals.filter((d) => d.title?.toLowerCase().includes(q));
  }, [deals, q]);

  const matchedEvents = useMemo(() => {
    if (!q) return [];
    return activeEvents.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.type?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q)
    );
  }, [activeEvents, q]);

  const matchedTutorials = useMemo(() => {
    if (!q) return [];
    return tutorials.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q)
    );
  }, [tutorials, q]);

  const sortedProducts = useMemo(() => sortProducts(matchedProducts, productSort), [matchedProducts, productSort]);

  const sortedDeals = useMemo(() => {
    const arr = [...matchedDeals];
    switch (dealSort) {
      case "priceLow":  return arr.sort((a, b) => (a.discountedPrice || 0) - (b.discountedPrice || 0));
      case "priceHigh": return arr.sort((a, b) => (b.discountedPrice || 0) - (a.discountedPrice || 0));
      case "recent":    return arr.sort((a, b) => (b.id || 0) - (a.id || 0));
      default:          return arr;
    }
  }, [matchedDeals, dealSort]);

  const totalResults =
    matchedProducts.length + matchedDeals.length + matchedEvents.length + matchedTutorials.length;

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl lg:text-6xl mb-2">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>Results for </span>
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 30px rgba(255,143,163,0.6)",
              }}
            >
              "{q}"
            </span>
          </h1>
          <p className="text-[#C8B6E2] text-sm mt-1">
            {totalResults === 0 ? "No results found" : `${totalResults} result${totalResults !== 1 ? "s" : ""} found`}
          </p>
        </motion.div>

        {/* NO RESULTS */}
        {totalResults === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-[#FFF6F8] text-2xl" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Nothing matched your search.
            </p>
            <p className="text-[#C8B6E2] mt-2">Try different keywords or browse our categories.</p>
          </div>
        )}

        {/* PRODUCTS */}
        {matchedProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl mb-4" style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
              Products
            </h2>
            <SortBar
              value={productSort}
              onChange={setProductSort}
              options={SECTION_SORT_OPTIONS.Products}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} {...p} notificationStyle="toast" />
              ))}
            </div>
          </section>
        )}

        {/* DEALS */}
        {matchedDeals.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl mb-4" style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
              Deals
            </h2>
            <SortBar
              value={dealSort}
              onChange={setDealSort}
              options={SECTION_SORT_OPTIONS.Deals}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDeals.map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </div>
          </section>
        )}

        {/* TUTORIALS */}
        {matchedTutorials.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl mb-6" style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
              Tutorials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {matchedTutorials.map((t) => (
                <TutorialCard key={t.id} tutorial={t} />
              ))}
            </div>
          </section>
        )}

        {/* EVENTS */}
        {matchedEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl mb-6" style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 20px rgba(255,143,163,0.5)" }}>
              Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}