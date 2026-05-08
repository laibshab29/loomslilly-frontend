// Product API (mock for now)

export const getProducts = async () => {
  return [
    {
      id: 1,
      name: "Sample Product",
      price: 29.99,
      image: "",
      badge: "New",
      stock: 10, // IMPORTANT for future (quantity + out of stock logic)
      category: "crafts",
    },
  ];
};

export const getProductsByCategory = async (category) => {
  const products = await getProducts();
  return products.filter((p) => p.category === category);
};