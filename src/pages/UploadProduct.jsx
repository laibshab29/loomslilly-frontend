import { motion } from "framer-motion";
import { useState } from "react";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  image: null,
  delivery: "",
});

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  const handleChange = (field, value) => {
  setFormData((prev) => {
    const updated = { ...prev, [field]: value };

    // 🔥 Reset subcategory when category changes
    if (field === "category") {
      updated.type = "";
    }

    return updated;
  });
};
  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.details) newErrors.details = "Details are required";
    if (!formData.delivery) newErrors.delivery = "Delivery time required";
    if (!formData.image) newErrors.image = "Product image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addProduct(
      {
        ...formData,
        category: formData.category.toLowerCase(),
        type: formData.type.toLowerCase(),
        price: parseFloat(formData.price),
      },
      user
    );

    setSubmitted(true);

    // optional redirect after 1.5 sec
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        {/* HEADER */}
        <motion.div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span
              style={{
                fontFamily: "Fredoka, sans-serif",
                color: "#F4F1F8",
              }}
            >
              Upload{" "}
            </span>
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255, 143, 163, 0.7)",
              }}
            >
              Product
            </span>
          </h1>

          <p className="text-xl text-[#FFF6F8]">
            Add your creation to the marketplace
          </p>
        </motion.div>

        {/* SUCCESS */}
        {submitted ? (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-12 text-center">
            <h2
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
              }}
              className="text-3xl"
            >
              Product Uploaded!
            </h2>
          </div>
        ) : (

        /* FORM */
        <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* IMAGE UPLOAD */}
<div>

  <p className="text-[#7A6C9D] text-sm mb-2">
    Upload Product Image
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {

  const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onloadend = () => {
  handleChange("image", reader.result);
};

reader.readAsDataURL(file);
}}
    className={inputStyle}
  />

  {errors.image && (
    <p className="text-red-500 text-sm mt-1">
      {errors.image}
    </p>
  )}
</div>

            {/* NAME */}
            <div>
              <input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputStyle}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
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

            {/* TYPE / SUBCATEGORY */}
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

      // allow empty field temporarily
      handleChange("price", value);

      // validation
      if (value === "") {
        setErrors((prev) => ({
          ...prev,
          price: "Price is required",
        }));
      } else if (Number(value) <= 0) {
        setErrors((prev) => ({
          ...prev,
          price: "Price must be greater than 0",
        }));
      } else if (isNaN(value)) {
        setErrors((prev) => ({
          ...prev,
          price: "Price must be a number",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          price: "",
        }));
      }
    }}
    className={inputStyle}
  />

  <p className="text-[#7A6C9D] text-sm mt-1">
    Price is in PKR (Rupees)
  </p>

  {errors.price && (
    <p className="text-red-500 text-sm mt-1">
      {errors.price}
    </p>
  )}
</div>
<div>
  <input
    placeholder="Stock"
    type="number"
    min="0"
    value={formData.stock}
    onChange={(e) =>
      handleChange(
        "stock",
        Math.max(0, Number(e.target.value))
      )
    }
    className={inputStyle}
  />

  <p className="text-[#7A6C9D] text-sm mt-1">
    Available quantity
  </p>
</div>
            {/* DETAILS */}
            <div>
              <textarea
                placeholder="Product Details"
                value={formData.details}
                onChange={(e) => handleChange("details", e.target.value)}
                className={inputStyle}
              />
              {errors.details && (
                <p className="text-red-500 text-sm mt-1">{errors.details}</p>
              )}
            </div>

            {/* DELIVERY */}
            <div>
              <input
                placeholder="Delivery Time (e.g. 3-5 days)"
                value={formData.delivery}
                onChange={(e) => handleChange("delivery", e.target.value)}
                className={inputStyle}
              />
              {errors.delivery && (
                <p className="text-red-500 text-sm mt-1">{errors.delivery}</p>
              )}
            </div>

            {/* SUBMIT */}
            <button className="w-full py-4 rounded-full bg-[#FF8FA3] text-white">
              Upload Product
            </button>

          </form>
        </div>
        )}
      </div>
    </div>
  );
}