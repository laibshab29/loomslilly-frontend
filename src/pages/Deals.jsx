import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { CreateDealForm } from "../components/CreateDealForm";

export function Deals() {
  const { isGuest, isBuyer, role, user } = useAuth();
  const { products, deals, createDeal } = useProducts();
  const navigate = useNavigate();

  const [showDealForm, setShowDealForm] = useState(false);
  const [dealForm, setDealForm] = useState({
    title: "",
    productIds: [""],
    discountedPrice: "",
    validDate: "",
    images: [],
  });

  const sellerProducts = products.filter((p) => p.sellerId === user?.id);
  const selectedProducts = sellerProducts.filter((p) =>
    dealForm.productIds.includes(String(p.id))
  );
  const originalPrice = selectedProducts.reduce((total, p) => total + Number(p.price), 0);

  const handleCreateDeal = (selectedProducts, originalPrice) => {
    if (!dealForm.title) { alert("Please enter deal title."); return; }
    if (selectedProducts.length === 0) { alert("Select at least one product."); return; }
    if (!dealForm.discountedPrice) { alert("Enter discounted price."); return; }
    if (!dealForm.validDate) { alert("Select valid date."); return; }

    createDeal(
      {
        title: dealForm.title,
        products: selectedProducts,
        originalPrice,
        discountedPrice: Number(dealForm.discountedPrice),
        validDate: dealForm.validDate,
        images: dealForm.images,
      },
      user
    );

    setShowDealForm(false);
    setDealForm({ title: "", productIds: [""], discountedPrice: "", validDate: "", images: [] });
  };

  const DealCard = ({ deal }) => (
    <Link to={`/deals/${deal.id}`}>
      <div className="rounded-[28px] overflow-hidden p-6 bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] shadow-xl hover:scale-[1.02] transition-all duration-300">
        {deal.images?.length > 0 && (
          <img
            src={deal.images[0]}
            alt={deal.title}
            className="w-full h-[240px] object-cover rounded-[20px] mb-4"
          />
        )}
        <h2 className="text-3xl mb-4" style={{ fontFamily: "Pacifico", color: "#FFF6F8" }}>
          {deal.title}
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {deal.products.map((product) => (
            <div key={product.id} className="px-3 py-2 rounded-full bg-white text-[#2E2A4A]">
              {product.name} • {product.category}
            </div>
          ))}
        </div>
        <div className="text-white">
          <p>Original: Rs. {deal.originalPrice}</p>
          <p className="text-2xl">Deal: Rs. {deal.discountedPrice}</p>
          <p className="text-white/80 mt-2">Valid Until: {deal.validDate}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>Amazing </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Deals
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]" style={{ fontFamily: "Inter, sans-serif" }}>
            Limited time offers on your favorite supplies
          </p>
        </motion.div>

        {/* ── GUEST ── */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6">🔒</div>
            <h2 className="text-3xl text-[#FFF6F8] mb-4" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Sign up to access exclusive deals
            </h2>
            <Link
              to="/signup"
              className="px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
            >
              Sign Up Now
            </Link>
          </motion.div>
        )}

        {/* ── SELLER ── */}
        {!isGuest && role === "seller" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12"
          >
            <div className="text-center mb-12">
              <div className="text-7xl mb-6">🏷️</div>
              <h2 className="text-3xl text-[#FFF6F8] mb-4" style={{ fontFamily: "Fredoka, sans-serif" }}>
                Seller accounts cannot purchase deals
              </h2>
              <p className="text-[#FFF6F8]/80 mb-8">You can still view and create deals</p>

              {sellerProducts.length === 0 ? (
                <div className="max-w-[500px] mx-auto bg-[#FFF6F8]/90 rounded-[24px] p-8">
                  <p className="text-[#2E2A4A] text-xl mb-6">You do not have uploaded products yet</p>
                  <Link
                    to="/upload"
                    className="inline-block px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                  >
                    Upload Product
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowDealForm(!showDealForm)}
                  className="px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  {showDealForm ? "Cancel" : "Create Deal"}
                </button>
              )}
            </div>

            {showDealForm && sellerProducts.length > 0 && (
              <CreateDealForm
                sellerProducts={sellerProducts}
                dealForm={dealForm}
                setDealForm={setDealForm}
                handleCreateDeal={handleCreateDeal}
              />
            )}

            {deals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* ── BUYER ── */}
        {!isGuest && isBuyer && (
          deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-[#FFF6F8]">
              No deals available right now.
            </div>
          )
        )}

      </div>
    </div>
  );
}