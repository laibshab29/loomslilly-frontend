// src/components/SortBar.jsx
// Reusable sort/filter bar — pass only the options you want shown.

const SORT_OPTIONS = {
  priceLow:  "Price: Low to High",
  priceHigh: "Price: High to Low",
  mostLiked: "Most Liked",
  recent:    "Most Recent",
  discount:  "Biggest Discount",
};

/**
 * @param {string}   value      - current sort key
 * @param {function} onChange   - (newKey) => void
 * @param {string[]} options    - which keys to show, e.g. ["priceLow","priceHigh","mostLiked"]
 */
export function SortBar({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {options.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2
            ${value === key
              ? "bg-[#FF8FA3] text-white border-[#FF8FA3] shadow-md"
              : "bg-[#FFF6F8]/10 text-[#FFF6F8] border-[#7A6C9D]/30 hover:border-[#FF8FA3]/60 hover:scale-105"
            }`}
          style={{ fontFamily: "Fredoka, sans-serif" }}
        >
          {SORT_OPTIONS[key]}
        </button>
      ))}
    </div>
  );
}

/** Helper — sort any array of products given a sort key */
export function sortProducts(products, sortKey) {
  const arr = [...products];
  switch (sortKey) {
    case "priceLow":  return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "priceHigh": return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "mostLiked": return arr.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    case "recent":    return arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    default:          return arr;
  }
}

/** Helper — sort deals */
export function sortDeals(deals, sortKey) {
  const arr = [...deals];
  switch (sortKey) {
    case "priceLow":  return arr.sort((a, b) => (a.discountedPrice || 0) - (b.discountedPrice || 0));
    case "priceHigh": return arr.sort((a, b) => (b.discountedPrice || 0) - (a.discountedPrice || 0));
    case "discount":  return arr.sort((a, b) => {
      const savA = (a.originalPrice || 0) - (a.discountedPrice || 0);
      const savB = (b.originalPrice || 0) - (b.discountedPrice || 0);
      return savB - savA;
    });
    case "recent":    return arr.sort((a, b) => (b.id || 0) - (a.id || 0));
    default:          return arr;
  }
}