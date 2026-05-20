import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [likedMap, setLikedMap] = useState({});
  const [likedDealsMap, setLikedDealsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [likesLoading, setLikesLoading] = useState(true);
  // ─── FETCH PRODUCTS ───────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (url, position)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchProducts error:", error.message);
      return;
    }

    const normalized = (data || []).map((p) => {
      const sorted = (p.product_images || []).sort(
        (a, b) => a.position - b.position
      );
      const urls = sorted.map((img) => img.url);
      return {
        ...p,
        images: urls,
        image: urls[0] ?? null,
        sellerId: p.seller_id,
        createdAt: p.created_at,
      };
    });

    setProducts(normalized);
  }, []);

  // ─── FETCH DEALS ──────────────────────────────────────────────
  const fetchDeals = useCallback(async () => {
    const { data, error } = await supabase
      .from("deals")
      .select(`
        *,
        deal_products ( product_id ),
        deal_images ( url )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchDeals error:", error.message);
      return;
    }

    const allProductIds = (data || []).flatMap((d) =>
      (d.deal_products || []).map((dp) => dp.product_id)
    );

    let productMap = {};
    if (allProductIds.length > 0) {
      const { data: dealProds } = await supabase
        .from("products")
        .select("id, name, category, type, price")
        .in("id", allProductIds);
      (dealProds || []).forEach((p) => { productMap[p.id] = p; });
    }

    const normalized = (data || []).map((d) => ({
      id: d.id,
      title: d.title,
      sellerId: d.seller_id,
      originalPrice: d.original_price,
      discountedPrice: d.discounted_price,
      validDate: d.valid_date,
      images: (d.deal_images || []).map((img) => img.url),
      products: (d.deal_products || [])
        .map((dp) => productMap[dp.product_id])
        .filter(Boolean),
    }));

    setDeals(normalized);
  }, []);

  // ─── FETCH LIKES FOR CURRENT USER ────────────────────────────
  const fetchLikes = useCallback(async (userId) => {
  setLikesLoading(true);
  if (!userId) {
    setLikedMap({});
    setLikedDealsMap({});
    setLikesLoading(false);
    return;
  }

  const { data: productLikes, error: likesError } = await supabase
  .from("product_likes")
  .select("product_id")
  .eq("user_id", userId);



  const { data: dealLikes } = await supabase
    .from("deal_likes")
    .select("deal_id")
    .eq("user_id", userId);

  const newLikedMap = {};
  (productLikes || []).forEach((l) => { newLikedMap[Number(l.product_id)] = true; });
  setLikedMap(newLikedMap);
  // ADD THIS:
console.log("newLikedMap:", newLikedMap);
  const newLikedDealsMap = {};
  (dealLikes || []).forEach((l) => { newLikedDealsMap[Number(l.deal_id)] = true; });
  setLikedDealsMap(newLikedDealsMap);
  

  setLikesLoading(false);
}, []);


  // ─── INITIAL LOAD ─────────────────────────────────────────────
  // fetchLikes is intentionally NOT called here — onAuthStateChange
  // fires INITIAL_SESSION immediately on mount and handles it
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProducts(), fetchDeals()]);
      setLoading(false);
    };
    init();
  }, [fetchProducts, fetchDeals]);

  // ─── AUTH STATE LISTENER ──────────────────────────────────────
  // Fires on INITIAL_SESSION (covers already-logged-in on refresh),
  // SIGNED_IN, SIGNED_OUT, and TOKEN_REFRESHED
  // AFTER:
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user?.id) {
          // Small delay to ensure session token is fully set before querying
          setTimeout(() => fetchLikes(session.user.id), 100);
        } else {
          fetchLikes(null);
        }
      } else if (event === "SIGNED_OUT") {
        fetchLikes(null);
      }
    }
  );
  return () => subscription.unsubscribe();
}, [fetchLikes]);
  // ─── ADD PRODUCT ─────────────────────────────────────────────
  const addProduct = async (product, user) => {
    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: user.id,
        name: product.name,
        category: product.category,
        type: product.type,
        price: parseFloat(product.price),
        stock: parseInt(product.stock) || 0,
        likes: 0,
        details: product.details,
        delivery: product.delivery,
        badge: product.badge || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("addProduct insert error:", insertError.message);
      return { success: false, message: insertError.message };
    }

    const imageRows = [];
    const base64Images = product.images || [];

    for (let i = 0; i < base64Images.length; i++) {
      const base64 = base64Images[i];
      try {
        const res = await fetch(base64);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const filename = `${user.id}/${newProduct.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filename, blob, { contentType: blob.type });

        if (uploadError) {
          console.warn("Image upload error:", uploadError.message);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filename);

        imageRows.push({ product_id: newProduct.id, url: publicUrl, position: i });
      } catch (e) {
        console.warn("Image processing error:", e);
      }
    }

    if (imageRows.length > 0) {
      const { error: imgError } = await supabase
        .from("product_images")
        .insert(imageRows);
      if (imgError) console.warn("product_images insert error:", imgError.message);
    }

    await fetchProducts();
    return { success: true };
  };

  // ─── DELETE PRODUCT ───────────────────────────────────────────
  const deleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { console.error("deleteProduct error:", error.message); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ─── UPDATE PRODUCT ───────────────────────────────────────────
  const updateProduct = async (id, updatedData) => {
    const updates = {};
    if (updatedData.name !== undefined) updates.name = updatedData.name;
    if (updatedData.category !== undefined) updates.category = updatedData.category;
    if (updatedData.type !== undefined) updates.type = updatedData.type;
    if (updatedData.price !== undefined) updates.price = parseFloat(updatedData.price);
    if (updatedData.stock !== undefined) updates.stock = parseInt(updatedData.stock);
    if (updatedData.details !== undefined) updates.details = updatedData.details;
    if (updatedData.delivery !== undefined) updates.delivery = updatedData.delivery;
    if (updatedData.badge !== undefined) updates.badge = updatedData.badge;

    const { error } = await supabase.from("products").update(updates).eq("id", id);
    if (error) { console.error("updateProduct error:", error.message); return; }

    if (updatedData.image && updatedData.image.startsWith("data:")) {
      try {
        const res = await fetch(updatedData.image);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const filename = `updates/${id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filename, blob, { contentType: blob.type, upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(filename);

          await supabase.from("product_images").delete().eq("product_id", id);
          await supabase.from("product_images").insert({
            product_id: id, url: publicUrl, position: 0,
          });
        }
      } catch (e) {
        console.warn("updateProduct image error:", e);
      }
    }

    await fetchProducts();
  };

  // ─── REDUCE STOCK ─────────────────────────────────────────────
  const reduceStock = async (cartItems) => {
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;
      const newStock = Math.max(0, product.stock - item.quantity);
      await supabase.from("products").update({ stock: newStock }).eq("id", item.id);
    }
    await fetchProducts();
  };

  // ─── TOGGLE PRODUCT LIKE ─────────────────────────────────────
  const toggleLike = async (productId, userId) => {
    if (!userId) return;
    const alreadyLiked = !!likedMap[productId];
    const product = products.find((p) => p.id === productId);
    const currentLikes = product?.likes || 0;

    // Optimistic update
    setLikedMap((prev) => ({ ...prev, [Number(productId)]: !alreadyLiked }));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, likes: Math.max(0, currentLikes + (alreadyLiked ? -1 : 1)) }
          : p
      )
    );

    if (alreadyLiked) {
      await supabase
        .from("product_likes")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", userId);
      await supabase
        .from("products")
        .update({ likes: Math.max(0, currentLikes - 1) })
        .eq("id", productId);
    } else {
      // upsert with ignoreDuplicates prevents double-insert on rapid clicks
      await supabase
        .from("product_likes")
        .upsert(
          { product_id: productId, user_id: userId },
          { onConflict: "product_id,user_id", ignoreDuplicates: true }
        );
      await supabase
        .from("products")
        .update({ likes: currentLikes + 1 })
        .eq("id", productId);
    }
    
  };

  const isLikedByUser = (productId, userId) => {
    if (!userId) return false;
    return !!likedMap[Number(productId)];
  };

  // ─── TOGGLE DEAL LIKE ─────────────────────────────────────────
  const toggleDealLike = async (dealId, userId) => {
    if (!userId) return;
    const alreadyLiked = !!likedDealsMap[dealId];

    setLikedDealsMap((prev) => ({ ...prev, [dealId]: !alreadyLiked }));

    if (alreadyLiked) {
      await supabase
        .from("deal_likes")
        .delete()
        .eq("deal_id", dealId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("deal_likes")
        .upsert(
          { deal_id: dealId, user_id: userId },
          { onConflict: "deal_id,user_id", ignoreDuplicates: true }
        );
    }
  };

  const isDealLikedByUser = (dealId, userId) => {
    if (!userId) return false;
    return !!likedDealsMap[dealId];
  };

  // ─── DEAL ACTIONS ─────────────────────────────────────────────
  const createDeal = async (dealData, user) => {
    const { data: newDeal, error } = await supabase
      .from("deals")
      .insert({
        seller_id: user.id,
        title: dealData.title,
        original_price: dealData.originalPrice,
        discounted_price: dealData.discountedPrice,
        valid_date: dealData.validDate,
      })
      .select()
      .single();

    if (error) {
      console.error("createDeal error:", error.message);
      return { success: false, message: error.message };
    }

    if (dealData.productIds?.length > 0) {
      const rows = dealData.productIds
        .filter(Boolean)
        .map((pid) => ({ deal_id: newDeal.id, product_id: parseInt(pid) }));
      await supabase.from("deal_products").insert(rows);
    }

    const imageRows = [];
    for (let i = 0; i < (dealData.images || []).length; i++) {
      const base64 = dealData.images[i];
      if (!base64.startsWith("data:")) {
        imageRows.push({ deal_id: newDeal.id, url: base64 });
        continue;
      }
      try {
        const res = await fetch(base64);
        const blob = await res.blob();
        const ext = blob.type.split("/")[1] || "jpg";
        const filename = `deals/${newDeal.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("deal-images")
          .upload(filename, blob, { contentType: blob.type });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("deal-images")
            .getPublicUrl(filename);
          imageRows.push({ deal_id: newDeal.id, url: publicUrl });
        }
      } catch (e) {
        console.warn("Deal image upload error:", e);
      }
    }

    if (imageRows.length > 0) {
      await supabase.from("deal_images").insert(imageRows);
    }

    await fetchDeals();
    return { success: true };
  };

  const deleteDeal = async (id) => {
    await supabase.from("deals").delete().eq("id", id);
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDeal = async (id, updatedData) => {
    const updates = {};
    if (updatedData.title !== undefined) updates.title = updatedData.title;
    if (updatedData.discountedPrice !== undefined)
      updates.discounted_price = updatedData.discountedPrice;
    if (updatedData.validDate !== undefined) updates.valid_date = updatedData.validDate;

    await supabase.from("deals").update(updates).eq("id", id);
    await fetchDeals();
  };

  // ─── DEAL HELPERS ─────────────────────────────────────────────
  const getDealsForProduct = (productId) =>
    deals.filter((d) => d.products?.some((p) => p.id === productId));

  const getDealsForSeller = (sellerId) => {
    if (!sellerId) return [];
    return deals.filter((d) => d.sellerId === sellerId);
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
    return products.filter((p) => p.sellerId === sellerId && p.stock === 0);
  };

  // ─── IMAGE HELPERS ────────────────────────────────────────────
  const getProductImages = (productId) => {
    const p = products.find((prod) => prod.id === productId);
    return p?.images ?? [];
  };

  const getProductImage = (productId) => {
    const p = products.find((prod) => prod.id === productId);
    return p?.image ?? null;
  };

  if (loading) return null;

  return (
    // AFTER:
<ProductContext.Provider
  value={{
    products,
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
    // AFTER:
    fetchProducts,
    likesLoading,
    productsLoading: loading,
  }}
>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);