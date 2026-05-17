import { useMemo, useState } from "react";
import { ConfirmModal } from "./shared/ConfirmModal";
import { X } from "lucide-react";

function getTomorrowDate() {
  return new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
}

// Convert a File to a base64 data URL
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CreateDealForm({
  sellerProducts,
  dealForm,
  setDealForm,
  handleCreateDeal,
}) {
  const [errorModal, setErrorModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const showError = (title, message) => {
    setErrorModal({ title, message });
  };

  const selectedProducts = sellerProducts.filter((product) =>
    dealForm.productIds.includes(String(product.id))
  );

  const originalPrice = useMemo(() => {
    return selectedProducts.reduce(
      (total, product) => total + Number(product.price),
      0
    );
  }, [selectedProducts]);

  // Handle file selection — convert to base64 so they persist
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentCount = (dealForm.images || []).length;
    if (currentCount + files.length > 10) {
      showError("Too Many Images", "You can upload a maximum of 10 images total.");
      return;
    }

    setUploading(true);
    try {
      const base64Images = await Promise.all(files.map(fileToBase64));
      setDealForm({
        ...dealForm,
        images: [...(dealForm.images || []), ...base64Images],
      });
    } catch (err) {
      showError("Upload Failed", "Something went wrong reading the image files.");
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be re-selected if removed
      e.target.value = "";
    }
  };

  const removeImage = (idx) => {
    setDealForm({
      ...dealForm,
      images: dealForm.images.filter((_, i) => i !== idx),
    });
  };

  const handlePublish = () => {
    if (!dealForm.title.trim()) {
      showError("Missing Title", "Please enter a title for your deal.");
      return;
    }

    const filledProducts = dealForm.productIds.filter(Boolean);
    if (filledProducts.length === 0) {
      showError("No Products Selected", "Please select at least one product for the deal.");
      return;
    }

    if (!dealForm.discountedPrice || Number(dealForm.discountedPrice) < 1) {
      showError(
        "Invalid Discounted Price",
        "Please enter a discounted price of at least Rs. 1."
      );
      return;
    }

    if (originalPrice > 0 && Number(dealForm.discountedPrice) > originalPrice) {
      showError(
        "Price Too High",
        "Discounted price (Rs. " +
          dealForm.discountedPrice +
          ") cannot exceed the original price (Rs. " +
          originalPrice +
          ")."
      );
      setDealForm({ ...dealForm, discountedPrice: "" });
      return;
    }

    if (!dealForm.validDate) {
      showError("Missing Date", "Please select a valid expiry date for the deal.");
      return;
    }

    if (dealForm.validDate < getTomorrowDate()) {
      showError(
        "Invalid Date",
        "A deal must last at least 24 hours. The earliest expiry date allowed is the day after tomorrow — please choose a date further in the future."
      );
      setDealForm({ ...dealForm, validDate: "" });
      return;
    }

    handleCreateDeal(selectedProducts, originalPrice);
  };

  return (
    <div className="max-w-[700px] mx-auto bg-[#FFF6F8]/90 rounded-[28px] p-8 shadow-xl">

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

        {dealForm.productIds.length < 5 ? (
          <button
            type="button"
            onClick={() => {
              if (sellerProducts.length <= dealForm.productIds.length) {
                showError(
                  "Not Enough Products",
                  "You do not have enough uploaded products to add another to this deal."
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
          value={"Rs. " + originalPrice}
          className="w-full px-4 py-3 rounded-[16px] bg-gray-200 text-[#2E2A4A]"
        />
      </div>

      {/* DISCOUNTED PRICE */}
      <div className="mb-6">
        <label className="block text-[#7A6C9D] mb-2">
          Discounted Price <span className="text-[#FF8FA3]">*</span>
        </label>
        <div className="flex items-center gap-3">
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

          <button
            type="button"
            onClick={() => {
              const current = Number(dealForm.discountedPrice) || 0;
              if (originalPrice > 0 && current + 1 > originalPrice) {
                showError(
                  "Price Too High",
                  "Discounted price cannot exceed the original price of Rs. " + originalPrice + "."
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

        {originalPrice > 0 && (
          <p className="text-xs text-[#C8B6E2] mt-2 pl-1">
            Must be between Rs. 1 and Rs. {originalPrice}
          </p>
        )}

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
          A deal must last at least 24 hours — pick a date from the day after tomorrow onward.
        </p>
      </div>

      {/* IMAGES */}
      <div className="mb-8">
        <label className="block text-[#7A6C9D] mb-2">
          Upload Deal Images{" "}
          <span className="text-xs text-[#C8B6E2]">(optional, max 10)</span>
        </label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || (dealForm.images || []).length >= 10}
          className="w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 cursor-pointer disabled:opacity-50"
        />

        {uploading && (
          <p className="text-xs text-[#C8B6E2] mt-2">Processing images…</p>
        )}

        {/* PREVIEW THUMBNAILS */}
        {dealForm.images && dealForm.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {dealForm.images.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={"Preview " + (idx + 1)}
                  className="w-full h-24 object-cover rounded-[12px] border-2 border-[#7A6C9D]/20"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF8FA3] text-white flex items-center justify-center shadow-md hover:scale-110 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {dealForm.images && dealForm.images.length > 0 && (
          <p className="text-xs text-[#C8B6E2] mt-2">
            {dealForm.images.length} of 10 images selected
          </p>
        )}
      </div>

      <button
        onClick={handlePublish}
        disabled={uploading}
        className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all disabled:opacity-50"
      >
        Publish Deal
      </button>

      <ConfirmModal
        isOpen={!!errorModal}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title || "Oops"}
        message={errorModal?.message || ""}
        variant="info"
      />
    </div>
  );
}