// Cart API (mock)

export const getCart = async () => {
  return [];
};

export const addToCartAPI = async (item) => {
  return { success: true, item };
};

export const updateCartItemAPI = async (item) => {
  return { success: true, item };
};

export const removeFromCartAPI = async (id) => {
  return { success: true, id };
};