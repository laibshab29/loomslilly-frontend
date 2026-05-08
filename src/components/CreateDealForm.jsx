import { useMemo, useState } from "react";

function Notification({ message, type = "error", onClose }) {
  if (!message) return null;

  const styles = {
    error: "bg-[#FFE4EA] border border-[#FF8FA3] text-[#C0395A]",
    success: "bg-[#E4F9F0] border border-[#6FCFA0] text-[#2A7A55]",
    info: "bg-[#EDE8F9] border border-[#C8B6E2] text-[#4A3A7A]",
  };

  const icons = { error: "✕", success: "✓", info: "ℹ" };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] mb-4 text-sm font-medium ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icons[type]}</span>
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        className="opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
      >
        ✕
      </button>
    </div>
  );
}

function getTomorrowDate() {
  return new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
}

export function CreateDealForm({
  sellerProducts,
  dealForm,
  setDealForm,
  handleCreateDeal,
}) {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // SELECTED PRODUCTS
  const selectedProducts = sellerProducts.filter((product) =>
    dealForm.productIds.includes(String(product.id))
  );

  // ORIGINAL PRICE
  const originalPrice = useMemo(() => {
    return selectedProducts.reduce(
      (total, product) => total + Number(product.price),
      0
    );
  }, [selectedProducts]);

  // ─── PUBLISH VALIDATION ───────────────────────────────────
  const handlePublish = () => {
    // 1. Title required
    if (!dealForm.title.trim()) {
      showNotification("Please enter a title for the deal.", "error");
      return;
    }

    // 2. At least one product selected
    const filledProducts = dealForm.productIds.filter(Boolean);
    if (filledProducts.length === 0) {
      showNotification("Please select at least one product.", "error");
      return;
    }

    // 3. Discounted price required
    if (!dealForm.discountedPrice || Number(dealForm.discountedPrice) < 1) {
      showNotification("Please enter a discounted price of at least Rs. 1.", "error");
      return;
    }

    // 4. Discounted price must not exceed original price
    if (originalPrice > 0 && Number(dealForm.discountedPrice) > originalPrice) {
      showNotification(
        `Discounted price (Rs. ${dealForm.discountedPrice}) cannot exceed the original price (Rs. ${originalPrice}). Please enter a lower price.`,
        "error"
      );
      setDealForm({ ...dealForm, discountedPrice: "" });
      return;
    }

    // 5. Date required
    if (!dealForm.validDate) {
      showNotification("Please select a valid expiry date.", "error");
      return;
    }

    // 6. Date must be in the future (catches manual keyboard entry)
    if (dealForm.validDate < getTomorrowDate()) {
      showNotification(
        "The expiry date cannot be today or in the past. Please select a future date.",
        "error"
      );
      setDealForm({ ...dealForm, validDate: "" });
      return;
    }

    // ALL PASSED
    handleCreateDeal(selectedProducts, originalPrice);
  };

  return (
    <div className="max-w-[700px] mx-auto bg-[#FFF6F8]/90 rounded-[28px] p-8 shadow-xl">

      {/* NOTIFICATION */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* TITLE */}
      <div className="mb-6">
        <label className="block text-[#7A6C9D] mb-2">
          Title <span className="text-[#FF8FA3]">*</span>
        </label>
        <input
          placeholder="Flash Sale"
          value={dealForm.title}
          onChange={(e) =>
            setDealForm({ ...dealForm, title: e.target.value })
          }
          className="w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20"
        />
      </div>

      {/* PRODUCTS */}
      <div className="mb-6">
        <label className="block text-[#7A6C9D] mb-3">
          Select Products <span className="text-[#FF8FA3]">*</span>
        </label>

        {dealForm.productIds.map((selectedId, index) => {
          const alreadySelected = dealForm.productIds.filter(Boolean);
          return (
            <select
              key={index}
              value={selectedId}
              onChange={(e) => {
                const updated = [...dealForm.productIds];
                updated[index] = e.target.value;
                setDealForm({ ...dealForm, productIds: updated });
              }}
              className="w-full px-4 py-3 rounded-[16px] mb-4 bg-[#F6C1CC]/20"
            >
              <option value="">Select Product</option>
              {sellerProducts
                .filter(
                  (product) =>
                    !alreadySelected.includes(String(product.id)) ||
                    String(product.id) === selectedId
                )
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
            </select>
          );
        })}

        {/* ADD PRODUCT */}
        {dealForm.productIds.length < 5 ? (
          <button
            type="button"
            onClick={() => {
              if (sellerProducts.length <= dealForm.productIds.length) {
                showNotification(
                  "You do not have enough uploaded products.",
                  "error"
                );
                return;
              }
              setDealForm({
                ...dealForm,
                productIds: [...dealForm.productIds, ""],
              });
            }}
            className="px-5 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A]"
          >
            + Add Another Product
          </button>
        ) : (
          <p className="text-[#FF8FA3]">Maximum 5 products allowed</p>
        )}
      </div>

      {/* ORIGINAL PRICE */}
      <div className="mb-6">
        <label className="block text-[#7A6C9D] mb-2">Original Price</label>
        <input
          disabled
          value={`Rs. ${originalPrice}`}
          className="w-full px-4 py-3 rounded-[16px] bg-gray-200 text-[#2E2A4A]"
        />
      </div>

      {/* DISCOUNTED PRICE */}
      <div className="mb-6">
        <label className="block text-[#7A6C9D] mb-2">
          Discounted Price <span className="text-[#FF8FA3]">*</span>
        </label>
        <div className="flex items-center gap-3">

          {/* DECREMENT */}
          <button
            type="button"
            onClick={() => {
              const current = Number(dealForm.discountedPrice) || 0;
              if (current <= 1) return;
              setDealForm({ ...dealForm, discountedPrice: current - 1 });
            }}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F6C1CC]/40 text-[#7A6C9D] text-xl font-bold hover:bg-[#F6C1CC]/70 transition-all"
          >
            −
          </button>

          {/* MANUAL INPUT — free typing, comparison done on publish */}
          <input
            type="number"
            value={dealForm.discountedPrice}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setDealForm({ ...dealForm, discountedPrice: "" });
                return;
              }
              const value = Number(raw);
              if (value < 1) return;
              setDealForm({ ...dealForm, discountedPrice: value });
            }}
            className="flex-1 px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 text-center text-[#2E2A4A] focus:outline-none"
          />

          {/* INCREMENT */}
          <button
            type="button"
            onClick={() => {
              const current = Number(dealForm.discountedPrice) || 0;
              if (originalPrice > 0 && current + 1 > originalPrice) {
                showNotification(
                  `Discounted price cannot exceed the original price of Rs. ${originalPrice}.`,
                  "error"
                );
                return;
              }
              setDealForm({ ...dealForm, discountedPrice: current + 1 });
            }}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F6C1CC]/40 text-[#7A6C9D] text-xl font-bold hover:bg-[#F6C1CC]/70 transition-all"
          >
            +
          </button>

        </div>

        {/* RANGE HINT */}
        {originalPrice > 0 && (
          <p className="text-xs text-[#C8B6E2] mt-2 pl-1">
            Must be between Rs. 1 and Rs. {originalPrice}
          </p>
        )}

        {/* LIVE WARNING when typed price already exceeds original */}
        {originalPrice > 0 &&
          dealForm.discountedPrice !== "" &&
          Number(dealForm.discountedPrice) > originalPrice && (
            <p className="text-xs text-[#C0395A] mt-1 pl-1">
              ⚠ Price exceeds original price of Rs. {originalPrice} — this will be blocked on publish.
            </p>
          )}
      </div>

      {/* VALID DATE */}
      <div className="mb-6">
        <label className="block text-[#7A6C9D] mb-2">
          Valid Until <span className="text-[#FF8FA3]">*</span>
        </label>
        <input
          type="date"
          min={getTomorrowDate()}
          value={dealForm.validDate}
          onChange={(e) =>
            setDealForm({ ...dealForm, validDate: e.target.value })
          }
          className="w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20"
        />
        <p className="text-xs text-[#C8B6E2] mt-2 pl-1">
          Must be a future date (not today or earlier)
        </p>
      </div>

      {/* IMAGES — optional */}
      <div className="mb-8">
        <label className="block text-[#7A6C9D] mb-2">
          Upload Deal Images{" "}
          <span className="text-xs text-[#C8B6E2]">(optional)</span>
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 10) {
              showNotification("Maximum 10 images allowed.", "error");
              return;
            }
            setDealForm({ ...dealForm, images: files });
          }}
          className="w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20"
        />
      </div>

      {/* PUBLISH */}
      <button
        onClick={handlePublish}
        className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all"
      >
        Publish Deal
      </button>

    </div>
  );
}