import { useParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { ProductCard } from "../components/ProductCard";
import { useState } from "react";

function getImageSrc(image) {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (image instanceof File) return URL.createObjectURL(image);
  return null;
}

export function DealDetails() {
  const { id } = useParams();
  const { deals } = useProducts();
  const deal = deals.find((d) => d.id === Number(id));
  const [currentImage, setCurrentImage] = useState(0);

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-3xl">
        Deal not found
      </div>
    );
  }

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
        </div>
      )}

      {/* PRICE BOX */}
      <div className="max-w-[500px] mx-auto rounded-[28px] bg-white border-4 border-[#FF8FA3] shadow-[0_0_35px_rgba(255,143,163,0.5)] p-8 text-center mb-16">
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
      </div>

      {/* PRODUCTS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {deal.products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

    </div>
  );
}