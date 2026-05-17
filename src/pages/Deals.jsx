// src/pages/Deals.jsx
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { CreateDealForm } from "../components/CreateDealForm";
import { GuestBlock } from "../components/shared/GuestBlock";
import { ConfirmModal } from "../components/shared/ConfirmModal";
import { SortBar, sortDeals } from "../components/SortBar";

export function Deals() {
  const { isGuest, isBuyer, isSeller, role, user } = useAuth();
  const { products, deals, createDeal } = useProducts();
  const navigate = useNavigate();

  const [showDealForm, setShowDealForm] = useState(false);
  const [noProductsModal, setNoProductsModal] = useState(false);
  const [sort, setSort] = useState("recent");
  const [dealForm, setDealForm] = useState({
    title: "",
    productIds: [""],
    discountedPrice: "",
    validDate: "",
    images: [],
  });

  const sellerProducts = products.filter((p) => p.sellerId === user?.id);

  const sortedDeals = useMemo(() => sortDeals(deals, sort), [deals, sort]);

  const handleCreateDeal = (selectedProducts, originalPrice) => {
    createDeal(
      {
        title: dealForm.title,
        products: selectedProducts,
        originalPrice,
        discountedPrice: Number(dealForm.discountedPrice),
        validDate: dealForm.validDate,
        images: dealForm.images, // now base64 strings
      },
      user
    );

    setShowDealForm(false);
    setDealForm({ title: "", productIds: [""], discountedPrice: "", validDate: "", images: [] });
  };

  const handleCreateDealClick = () => {
    if (!isSeller) return;
    if (sellerProducts.length === 0) {
      setNoProductsModal(true);
      return;
    }
    setShowDealForm(!showDealForm);
  };

  const DealCard = ({ deal }) => (
    <Link to={`/deals/${deal.id}`} className="block mb-6 break-inside-avoid">
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

  // Masonry-style column layout: cards in the next row start right under the shortest column
  const masonryClasses =
    "columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]";

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

          {isSeller && (
            <div className="mt-8">
              <button
                onClick={handleCreateDealClick}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {showDealForm ? "Cancel" : "Create Deal"}
              </button>
            </div>
          )}
        </motion.div>

        {isGuest && (
          <GuestBlock message="Sign up to access exclusive deals from our talented sellers." />
        )}

        {!isGuest && role === "seller" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4"
          >
            {showDealForm && sellerProducts.length > 0 && (
              <CreateDealForm
                sellerProducts={sellerProducts}
                dealForm={dealForm}
                setDealForm={setDealForm}
                handleCreateDeal={handleCreateDeal}
              />
            )}

            {!showDealForm && (
              <div className="text-center mb-12">
                <p className="text-[#FFF6F8]/80">
                  Seller accounts cannot purchase deals, but you can view and create them.
                </p>
              </div>
            )}

            {deals.length > 0 && (
              <>
                <SortBar value={sort} onChange={setSort} options={["recent", "priceLow", "priceHigh", "discount"]} />
                <div className={masonryClasses + " mt-2"}>
                  {sortedDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
                </div>
              </>
            )}
          </motion.div>
        )}

        {!isGuest && isBuyer && (
          <>
            {showDealForm && isSeller && sellerProducts.length > 0 && (
              <CreateDealForm
                sellerProducts={sellerProducts}
                dealForm={dealForm}
                setDealForm={setDealForm}
                handleCreateDeal={handleCreateDeal}
              />
            )}

            {deals.length > 0 ? (
              <>
                <SortBar value={sort} onChange={setSort} options={["recent", "priceLow", "priceHigh", "discount"]} />
                <div className={masonryClasses}>
                  {sortedDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-[#FFF6F8]">
                No deals available right now.
              </div>
            )}
          </>
        )}

      </div>

      <ConfirmModal
        isOpen={noProductsModal}
        onClose={() => setNoProductsModal(false)}
        onConfirm={() => {
          setNoProductsModal(false);
          navigate("/upload");
        }}
        title="No Products Yet"
        message="You need to upload at least one product before creating a deal."
        confirmText="Upload Product"
        cancelText="Later"
      />
    </div>
  );
}