import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const ProductContext = createContext();

// 🔥 Strip images before saving to localStorage — they blow the quota
const stripImages = (products) =>
  products.map(({ image, ...rest }) => rest);

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

  // 🔥 In-memory image store — never touches localStorage
  // { [productId]: base64string }
  const imageStoreRef = useRef({});

  // ─── PERSIST (images stripped out) ───────────────────────────

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

  // ─── IMAGE HELPERS ────────────────────────────────────────────

  const setProductImage = (productId, base64) => {
    imageStoreRef.current[productId] = base64;
  };

  const getProductImage = (productId) => {
    return imageStoreRef.current[productId] ?? null;
  };

  // Attach in-memory images back onto products for all consumers
  const productsWithImages = products.map((p) => ({
    ...p,
    image: imageStoreRef.current[p.id] ?? p.image ?? null,
  }));

  // ─── PRODUCT ACTIONS ──────────────────────────────────────────

  const addProduct = (product, user) => {
    const id = Date.now();

    if (product.image) {
      setProductImage(id, product.image);
    }

    setProducts((prev) => [
      ...prev,
      {
        ...product,
        image: null,
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
    if (updatedData.image) {
      setProductImage(id, updatedData.image);
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, ...updatedData, image: null }
          : product
      )
    );
  };

  const reduceStock = (cartItems) => {
    setProducts((prev) =>
      prev.map((product) => {
        const cartItem = cartItems.find((item) => item.id === product.id);
        if (!cartItem) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - cartItem.quantity),
        };
      })
    );
  };

  // ─── LIKES ────────────────────────────────────────────────────

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
        getProductImage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);