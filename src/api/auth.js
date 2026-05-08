// Auth API (mock)

export const signup = async (data) => {
  return {
    success: true,
    user: {
      ...data,
      role: data.role || "buyer", // buyer | seller | both
    },
  };
};

export const login = async (data) => {
  return {
    success: true,
    user: {
      ...data,
      role: "buyer",
    },
  };
};

export const logout = async () => {
  return { success: true };
};