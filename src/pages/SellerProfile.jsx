import { useSellers } from "../context/SellerContext";
import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { ProductCard } from "../components/ProductCard";
import { User } from "lucide-react";

export function SellerProfile() {
  const { id } = useParams();
  const { products } = useProducts();
  const { getSellerById } = useSellers();
  const seller = getSellerById(id);
  const sellerProducts = products.filter(
    (p) => p.sellerId === Number(id)
  );

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">

      {/* 🔥 PROFILE SECTION */}
      <div className="text-center mb-12">

        {/* PROFILE IMAGE */}
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center overflow-hidden">
            {seller?.image ? (
              <img src={seller.image} className="w-full h-full object-cover" />
            ) : (
              <User className="text-white w-12 h-12" />
            )}
          </div>
        </div>

        {/* NAME */}
        <h1
          style={{
            fontFamily: "Pacifico",
            color: "#FF8FA3",
            textShadow: "0 0 35px rgba(255,143,163,0.7)",
          }}
          className="text-5xl"
        >
            {seller?.name || "Seller"}

        </h1>
      </div>

      {/* 🔥 PRODUCTS */}
      <div className="max-w-[1440px] mx-auto">
        {sellerProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellerProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-white text-xl">
            No products uploaded yet
          </p>
        )}
      </div>
    </div>
  );
}