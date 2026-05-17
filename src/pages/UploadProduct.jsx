import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

export function UploadProduct() {
  const { addProduct } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    price: 1,
    stock: 1,
    likes: 0,
    details: "",
    delivery: "",
    images: [], // array of base64
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [previews, setPreviews] = useState([]); // array of base64 for preview

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "category") updated.type = "";
      return updated;
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - previews.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setPreviews((prev) => [...prev, base64]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, base64],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Clear input so same file can be re-selected
    e.target.value = "";
  };

  const removeImage = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Valid price is required";
    if (!formData.details) newErrors.details = "Details are required";
    if (!formData.delivery) newErrors.delivery = "Delivery time required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addProduct(
      {
        ...formData,
        image: formData.images[0] || null,
        category: formData.category.toLowerCase(),
        type: formData.type.toLowerCase(),
        price: parseFloat(formData.price),
      },
      user
    );

    setSubmitted(true);
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        {/* HEADER */}
        <motion.div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#F4F1F8" }}>Upload </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              Product
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]">Add your creation to the marketplace</p>
        </motion.div>

        {/* SUCCESS */}
        {submitted ? (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl">
              Product Uploaded!
            </h2>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* IMAGE UPLOAD */}
              <div>
                <p className="text-[#7A6C9D] text-sm mb-2">
                  Product Images <span className="text-[#FF8FA3]">*</span>{" "}
                  <span className="text-xs text-[#C8B6E2]">(up to 5, any file type)</span>
                </p>

                {/* PREVIEWS */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-[12px] overflow-hidden border-2 border-[#FF8FA3]/40">
                        <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-[#FF8FA3]/80 text-white py-0.5">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* UPLOAD BUTTON */}
                {previews.length < 5 && (
                  <label className="flex items-center gap-3 px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-dashed border-[#7A6C9D]/30 hover:border-[#FF8FA3]/60 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-[#7A6C9D]" />
                    <span className="text-[#7A6C9D] text-sm">
                      {previews.length === 0
                        ? "Click to upload images"
                        : `Add more (${previews.length}/5)`}
                    </span>
                    <input
                      type="file"
                      accept="*/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
              </div>

              {/* NAME */}
              <div>
                <input
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputStyle}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* CATEGORY */}
              <div>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Select Category</option>
                  <option value="crafts">Crafts</option>
                  <option value="arts">Arts</option>
                </select>
              </div>

              {/* TYPE */}
              {formData.category && (
                <select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Select Subcategory</option>
                  {formData.category === "crafts" && (
                    <>
                      <option value="crochet">Crochet</option>
                      <option value="knitting">Knitting</option>
                      <option value="embroidery">Embroidery</option>
                    </>
                  )}
                  {formData.category === "arts" && (
                    <>
                      <option value="painting">Painting</option>
                      <option value="sketching">Sketching</option>
                      <option value="abstract">Abstract</option>
                    </>
                  )}
                </select>
              )}

              {/* PRICE */}
              <div>
                <input
                  placeholder="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleChange("price", value);
                    if (!value || Number(value) <= 0) {
                      setErrors((prev) => ({ ...prev, price: "Price must be greater than 0" }));
                    } else {
                      setErrors((prev) => ({ ...prev, price: "" }));
                    }
                  }}
                  className={inputStyle}
                />
                <p className="text-[#7A6C9D] text-sm mt-1">Price is in PKR (Rupees)</p>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* STOCK */}
              <div>
                <input
                  placeholder="Stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", Math.max(0, Number(e.target.value)))}
                  className={inputStyle}
                />
                <p className="text-[#7A6C9D] text-sm mt-1">Available quantity</p>
              </div>

              {/* DETAILS */}
              <div>
                <textarea
                  placeholder="Product Details"
                  rows={4}
                  value={formData.details}
                  onChange={(e) => handleChange("details", e.target.value)}
                  className={inputStyle}
                />
                {errors.details && <p className="text-red-500 text-sm mt-1">{errors.details}</p>}
              </div>

              {/* DELIVERY */}
              <div>
                <input
                  placeholder="Delivery Time (e.g. 3-5 days)"
                  value={formData.delivery}
                  onChange={(e) => handleChange("delivery", e.target.value)}
                  className={inputStyle}
                />
                {errors.delivery && <p className="text-red-500 text-sm mt-1">{errors.delivery}</p>}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all shadow-lg text-lg"
              >
                Upload Product
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}