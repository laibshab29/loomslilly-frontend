import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { LowStockBanner } from "../components/shared/LowStockBanner";

export function MyProducts() {
  const { products, deleteProduct, updateProduct, getLowStockProducts } = useProducts();
  const { user, role } = useAuth();
  const { notifyLowStock, notifyCriticalStock, notifyOutOfStock, resolveStockNotification } =
    useNotifications();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const sellerProds = products.filter((p) => p.sellerId === user.id);
    sellerProds.forEach((p) => {
      if (p.stock === 0) {
        notifyOutOfStock({ recipientId: user.id, productId: p.id, productName: p.name });
      } else if (p.stock < 10) {
        notifyCriticalStock({ recipientId: user.id, productId: p.id, productName: p.name, stock: p.stock });
      } else if (p.stock < 20) {
        notifyLowStock({ recipientId: user.id, productId: p.id, productName: p.name, stock: p.stock });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, user]);

  if (role !== "seller" && role !== "both") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span
          style={{
            fontFamily: "Pacifico",
            color: "#FF8FA3",
            fontSize: "36px",
            textShadow: "0 0 30px rgba(255,143,163,0.7)",
          }}
        >
          Seller access only
        </span>
      </div>
    );
  }

  const sellerProducts = products.filter((p) => p.sellerId === user?.id);
  const lowStockProducts = getLowStockProducts(user?.id, 20);

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none text-[#2E2A4A]";

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      category: product.category,
      type: product.type,
      price: product.price,
      details: product.details ?? "",
      stock: product.stock,
      delivery: product.delivery ?? "",
      image: product.image ?? null,
    });
  };

  const handleSave = (id, originalProduct) => {
    const updated = {
      name: editForm.name?.trim() || originalProduct.name,
      category: editForm.category?.trim() || originalProduct.category,
      type: editForm.type?.trim() || originalProduct.type,
      price:
        editForm.price !== "" && editForm.price !== undefined
          ? editForm.price
          : originalProduct.price,
      stock:
        editForm.stock !== "" && editForm.stock !== undefined
          ? editForm.stock
          : originalProduct.stock,
      details: editForm.details?.trim() || originalProduct.details,
      delivery: editForm.delivery?.trim() || originalProduct.delivery,
      image: editForm.image ?? originalProduct.image,
    };

    updateProduct(id, updated);

    resolveStockNotification({
      recipientId: user.id,
      productId: id,
      newStock: Number(updated.stock),
    });

    setEditingId(null);
    setEditForm({});
  };

  const confirmDelete = () => {
    if (deleteTargetId !== null) {
      deleteProduct(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl">
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              My{" "}
            </span>
            <span
              style={{
                fontFamily: "Fredoka, sans-serif",
                color: "#FFF6F8",
              }}
            >
              Products
            </span>
          </h1>
        </div>

        {/* LOW STOCK BANNER */}
        {lowStockProducts.length > 0 && (
          <div className="max-w-[800px] mx-auto">
            <LowStockBanner products={lowStockProducts} />
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <div className="flex justify-center mt-6 mb-10">
          <a
            href="/upload"
            className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Upload Product
          </a>
        </div>

        {sellerProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FFF6F8]/90 rounded-[24px] p-6 shadow-xl"
              >
                {/* IMAGE */}
                <div className="aspect-square rounded-[20px] overflow-hidden bg-[#F6C1CC]/20 mb-4 flex items-center justify-center">
                  {(editingId === product.id ? editForm.image : product.image) ? (
                    <img
                      src={editingId === product.id ? editForm.image : product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">🧶</span>
                  )}
                </div>

                {editingId !== product.id ? (
                  <>
                    <h2 className="text-2xl text-[#2E2A4A] mb-2">{product.name}</h2>
                    <p className="text-[#7A6C9D] capitalize">
                      {product.category} • {product.type}
                    </p>
                    <p className="text-[#FF8FA3] text-2xl mt-2">Rs. {product.price}</p>
                    <p className="text-[#2E2A4A] mt-2">
                      Stock: {product.stock}
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                          Critical
                        </span>
                      )}
                      {product.stock >= 10 && product.stock < 20 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Low
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Out of Stock
                        </span>
                      )}
                    </p>
                    <p className="text-[#2E2A4A]">❤️ {product.likes || 0} Likes</p>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(product.id)}
                        className="flex-1 py-2 rounded-full bg-[#FF8FA3] text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-[#7A6C9D] text-sm mb-2">Update Product Image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setEditForm((prev) => ({ ...prev, image: reader.result }));
                          reader.readAsDataURL(file);
                        }}
                        className={inputStyle}
                      />
                    </div>

                    <input
                      placeholder={product.name}
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className={inputStyle + " mb-4"}
                    />

                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                          type: "",
                        }))
                      }
                      className={inputStyle + " mb-4"}
                    >
                      <option value="">Select Category</option>
                      <option value="crafts">Crafts</option>
                      <option value="arts">Arts</option>
                    </select>

                    {editForm.category && (
                      <select
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, type: e.target.value }))
                        }
                        className={inputStyle + " mb-4"}
                      >
                        <option value="">Select Subcategory</option>
                        {editForm.category === "crafts" && (
                          <>
                            <option value="crochet">Crochet</option>
                            <option value="knitting">Knitting</option>
                            <option value="embroidery">Embroidery</option>
                          </>
                        )}
                        {editForm.category === "arts" && (
                          <>
                            <option value="painting">Painting</option>
                            <option value="sketching">Sketching</option>
                            <option value="abstract">Abstract</option>
                          </>
                        )}
                      </select>
                    )}

                    <input
                      type="number"
                      placeholder={product.price}
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      className={inputStyle + " mb-4"}
                    />

                    <input
                      type="number"
                      placeholder={product.stock}
                      value={editForm.stock}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          stock: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className={inputStyle + " mb-4"}
                    />

                    <textarea
                      placeholder={product.details || "Product Details"}
                      value={editForm.details}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, details: e.target.value }))
                      }
                      className={inputStyle + " mb-4"}
                    />

                    <input
                      placeholder={product.delivery || "Delivery Time (e.g. 3-5 days)"}
                      value={editForm.delivery}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, delivery: e.target.value }))
                      }
                      className={inputStyle + " mb-4"}
                    />

                    <button
                      onClick={() => handleSave(product.id, product)}
                      className="w-full py-3 rounded-full bg-[#FF8FA3] text-white"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      className="w-full py-3 mt-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span
              style={{
                fontFamily: "Pacifico",
                color: "#FF8FA3",
                fontSize: "38px",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              You have not uploaded any products yet
            </span>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#FFF6F8] rounded-[24px] p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              <h2
                style={{
                  fontFamily: "Pacifico, cursive",
                  color: "#FF8FA3",
                  textShadow: "0 0 20px rgba(255,143,163,0.5)",
                }}
                className="text-2xl mb-3"
              >
                Delete Product?
              </h2>
              <p className="text-[#7A6C9D] mb-8">
                This action cannot be undone. Your product will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}