import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

function getImageSrc(image) {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (image instanceof File) return URL.createObjectURL(image);
  return null;
}

export function DealDetails() {
  const { id } = useParams();
  const { deals } = useProducts();
  const { addToCart } = useCart();
  const { user, isGuest, isSeller } = useAuth();
  const deal = deals.find((d) => d.id === Number(id));
  const [currentImage, setCurrentImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-3xl">
        Deal not found
      </div>
    );
  }

  const handleAddDealToCart = () => {
    if (!deal.products?.length) return;

    // Prorate the deal price across products by their original price weight
    const totalOriginal = deal.products.reduce((sum, p) => sum + Number(p.price), 0);

    deal.products.forEach((product) => {
      const weight = totalOriginal > 0 ? Number(product.price) / totalOriginal : 1 / deal.products.length;
      const proratedPrice = Math.round(Number(deal.discountedPrice) * weight);
      addToCart({ ...product, price: proratedPrice }, 1, user);
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const outOfStock = deal.products?.every((p) => (p.stock ?? 0) === 0);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">

      {/* TITLE */}
      <div className="text-center mb-12">
        <h1
          className="text-6xl"
          style={{
            fontFamily: "Pacifico",
            color: "#FF8FA3",
            textShadow: "0 0 35px rgba(255,143,163,0.7)",
          }}
        >
          {deal.title}
        </h1>
      </div>

      {/* SLIDESHOW */}
      {deal.images?.length > 0 && (
        <div className="max-w-[900px] mx-auto mb-12">
          <img
            src={getImageSrc(deal.images[currentImage])}
            alt=""
            className="w-full h-[500px] object-cover rounded-[28px]"
          />
          {deal.images.length > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === 0 ? deal.images.length - 1 : prev - 1
                  )
                }
                className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === deal.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* PRICE BOX */}
      <div className="max-w-[500px] mx-auto rounded-[28px] bg-white border-4 border-[#FF8FA3] shadow-[0_0_35px_rgba(255,143,163,0.5)] p-8 text-center mb-8">
        <p className="text-2xl text-[#2E2A4A] mb-4">
          Original Price: Rs. {deal.originalPrice}
        </p>
        <p className="text-4xl text-[#FF8FA3] mb-4">
          Deal Price: Rs. {deal.discountedPrice}
        </p>
        {deal.validDate && (
          <p className="text-sm text-[#7A6C9D] mt-2">
            Valid Until: {deal.validDate}
          </p>
        )}

        {/* ADD TO CART BUTTON */}
        {!isGuest && !isSeller && (
          <button
            onClick={handleAddDealToCart}
            disabled={outOfStock || added}
            className="mt-6 w-full py-4 rounded-full bg-[#FF8FA3] text-white text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            {added ? "Added to Cart!" : outOfStock ? "Out of Stock" : "Add Deal to Cart"}
          </button>
        )}
      </div>

      {/* PRODUCTS */}
      <div className="max-w-[1440px] mx-auto">
        <h2
          className="text-3xl text-center mb-8"
          style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}
        >
          Products in this Deal
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deal.products?.map((product) => (
            <ProductCard key={product.id} {...product} notificationStyle="toast" />
          ))}
        </div>
      </div>

    </div>
  );
}