import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const ProductContext = createContext();

const stripImages = (products) =>
  products.map(({ image, images, ...rest }) => rest);

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Yarn Bundle Pack",
    price: 34.99,
    category: "crafts",
    type: "crochet",
    badge: "50% OFF",
    stock: 10,
    likes: 12,
    createdAt: Date.now(),
    sellerId: 999,
    details: "A beautiful bundle of high-quality yarn perfect for crochet projects.",
    delivery: "3-5 days",
  },
  {
    id: 2,
    name: "Paint Set Deluxe",
    price: 29.99,
    category: "arts",
    type: "painting",
    badge: "Flash Sale",
    stock: 8,
    likes: 5,
    createdAt: Date.now(),
    sellerId: 998,
    details: "Professional grade paint set with 24 vibrant colors.",
    delivery: "2-4 days",
  },
  {
    id: 3,
    name: "Embroidery Kit",
    price: 24.99,
    category: "crafts",
    type: "embroidery",
    stock: 12,
    likes: 20,
    createdAt: Date.now(),
    sellerId: 997,
    details: "Complete embroidery kit with needles, hoops, and thread.",
    delivery: "3-7 days",
  },
];

const DEFAULT_DEALS = [
  {
    id: 1001,
    title: "Mega Crochet Bundle",
    sellerId: 999,
    products: [
      { id: 1, name: "Yarn Bundle Pack", category: "crafts", type: "crochet", price: 34.99 },
      { id: 3, name: "Embroidery Kit", category: "crafts", type: "embroidery", price: 24.99 },
    ],
    originalPrice: 59.98,
    discountedPrice: 39.99,
    validDate: "2026-12-30",
    images: [],
  },
  {
    id: 1002,
    title: "Painting Flash Sale",
    sellerId: 998,
    products: [
      { id: 2, name: "Paint Set Deluxe", category: "arts", type: "painting", price: 29.99 },
    ],
    originalPrice: 29.99,
    discountedPrice: 19.99,
    validDate: "2026-11-15",
    images: [],
  },
];

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("products");
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [deals, setDeals] = useState(() => {
    try {
      const saved = localStorage.getItem("deals");
      return saved ? JSON.parse(saved) : DEFAULT_DEALS;
    } catch {
      return DEFAULT_DEALS;
    }
  });

  const [likedMap, setLikedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("likedMap");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [likedDealsMap, setLikedDealsMap] = useState(() => {
    try {
      const saved = localStorage.getItem("likedDealsMap");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const imageStoreRef = useRef({});

  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(stripImages(products)));
    } catch (e) {
      console.warn("localStorage products save failed:", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("deals", JSON.stringify(deals));
    } catch (e) {
      console.warn("localStorage deals save failed:", e);
    }
  }, [deals]);

  useEffect(() => {
    try {
      localStorage.setItem("likedMap", JSON.stringify(likedMap));
    } catch (e) {
      console.warn("localStorage likedMap save failed:", e);
    }
  }, [likedMap]);

  useEffect(() => {
    try {
      localStorage.setItem("likedDealsMap", JSON.stringify(likedDealsMap));
    } catch (e) {
      console.warn("localStorage likedDealsMap save failed:", e);
    }
  }, [likedDealsMap]);

  // ─── IMAGE HELPERS ────────────────────────────────────────────
  const setProductImages = (productId, base64Array) => {
    imageStoreRef.current[productId] = base64Array;
  };

  const getProductImages = (productId) => {
    return imageStoreRef.current[productId] ?? [];
  };

  const setProductImage = (productId, base64) => {
    imageStoreRef.current[productId] = [base64];
  };

  const getProductImage = (productId) => {
    const imgs = imageStoreRef.current[productId];
    return imgs?.[0] ?? null;
  };

  const productsWithImages = products.map((p) => ({
    ...p,
    images: imageStoreRef.current[p.id] ?? [],
    image: imageStoreRef.current[p.id]?.[0] ?? p.image ?? null,
  }));

  // ─── PRODUCT ACTIONS ──────────────────────────────────────────
  const addProduct = (product, user) => {
    const id = Date.now();

    if (product.images && product.images.length > 0) {
      setProductImages(id, product.images);
    } else if (product.image) {
      setProductImage(id, product.image);
    }

    setProducts((prev) => [
      ...prev,
      {
        ...product,
        image: null,
        images: [],
        id,
        createdAt: Date.now(),
        sellerId: user.id,
        stock: Number(product.stock) || 0,
        likes: Number(product.likes) || 0,
      },
    ]);
  };

  const deleteProduct = (id) => {
    delete imageStoreRef.current[id];
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id, updatedData) => {
    if (updatedData.images?.length > 0) {
      setProductImages(id, updatedData.images);
    } else if (updatedData.image) {
      setProductImage(id, updatedData.image);
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, ...updatedData, image: null, images: [] }
          : product
      )
    );
  };

  // 🔥 Updated: Negative quantities = stock restoration (used on order cancel)
  const reduceStock = (cartItems) => {
    setProducts((prev) =>
      prev.map((product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        if (!cartItem) return product;
        const newStock = product.stock - cartItem.quantity;
        return {
          ...product,
          stock: Math.max(0, newStock),
        };
      })
    );
  };

  // ─── PRODUCT LIKES ────────────────────────────────────────────
  const toggleLike = (productId, userId) => {
    const userKey = String(userId ?? "guest");
    const currentLiked = likedMap[userKey] || [];
    const alreadyLiked = currentLiked.includes(productId);

    setLikedMap((prev) => ({
      ...prev,
      [userKey]: alreadyLiked
        ? currentLiked.filter((id) => id !== productId)
        : [...currentLiked, productId],
    }));

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              likes: Math.max(0, (product.likes || 0) + (alreadyLiked ? -1 : 1)),
            }
          : product
      )
    );
  };

  const isLikedByUser = (productId, userId) => {
    const userKey = String(userId ?? "guest");
    return (likedMap[userKey] || []).includes(productId);
  };

  // ─── DEAL LIKES ───────────────────────────────────────────────
  const toggleDealLike = (dealId, userId) => {
    const userKey = String(userId ?? "guest");
    const currentLiked = likedDealsMap[userKey] || [];
    const alreadyLiked = currentLiked.includes(dealId);

    setLikedDealsMap((prev) => ({
      ...prev,
      [userKey]: alreadyLiked
        ? currentLiked.filter((id) => id !== dealId)
        : [...currentLiked, dealId],
    }));
  };

  const isDealLikedByUser = (dealId, userId) => {
    const userKey = String(userId ?? "guest");
    return (likedDealsMap[userKey] || []).includes(dealId);
  };

  // ─── DEAL ACTIONS ─────────────────────────────────────────────
  const createDeal = (dealData, user) => {
    setDeals((prev) => [
      ...prev,
      { id: Date.now(), sellerId: user.id, ...dealData },
    ]);
  };

  const deleteDeal = (id) => {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
  };

  const updateDeal = (id, updatedData) => {
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === id ? { ...deal, ...updatedData } : deal
      )
    );
  };

  const getDealsForProduct = (productId) => {
    return deals.filter((d) =>
      d.products?.some((p) => p.id === productId)
    );
  };

  const getDealsForSeller = (sellerId) => {
    if (!sellerId) return [];
    return deals.filter((d) => d.sellerId === Number(sellerId));
  };

  // ─── STOCK ALERT HELPERS ──────────────────────────────────────
  const getLowStockProducts = (sellerId, threshold = 20) => {
    if (!sellerId) return [];
    return products.filter(
      (p) => p.sellerId === sellerId && p.stock > 0 && p.stock <= threshold
    );
  };

  const getCriticalStockProducts = (sellerId, threshold = 10) => {
    if (!sellerId) return [];
    return products.filter(
      (p) => p.sellerId === sellerId && p.stock > 0 && p.stock <= threshold
    );
  };

  const getOutOfStockProducts = (sellerId) => {
    if (!sellerId) return [];
    return products.filter(
      (p) => p.sellerId === sellerId && p.stock === 0
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products: productsWithImages,
        deals,
        addProduct,
        deleteProduct,
        updateProduct,
        createDeal,
        deleteDeal,
        updateDeal,
        reduceStock,
        toggleLike,
        isLikedByUser,
        toggleDealLike,
        isDealLikedByUser,
        getProductImage,
        getProductImages,
        getDealsForProduct,
        getDealsForSeller,
        getLowStockProducts,
        getCriticalStockProducts,
        getOutOfStockProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);