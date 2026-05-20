import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

// ─── GUEST ID ─────────────────────────────────────────────────
// Kept exactly as before — guest orders still work the same way
function getOrCreateGuestId() {
  try {
    let id = localStorage.getItem("loomslilly_guestId");
    if (!id) {
      id =
        "guest_" +
        Math.random().toString(36).substring(2, 10) +
        Date.now().toString(36);
      localStorage.setItem("loomslilly_guestId", id);
    }
    return id;
  } catch {
    return "guest_anon";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // combined auth + profile object
  const [loading, setLoading] = useState(true);
  const guestId = getOrCreateGuestId();

  // ─── LISTEN FOR AUTH STATE CHANGES ──────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for login / logout / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAndSetUser(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile row and merge with auth user into one object
  // so the rest of the app can keep using user.name, user.role, etc.
  const fetchAndSetUser = async (authUser) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      setUser({
        // Auth fields
        id: authUser.id,
        email: authUser.email,
        emailVerified: authUser.email_confirmed_at ? true : false,
        // Profile fields — same names the rest of the app already uses
        name: profile.name,
        role: profile.role,
        phone: profile.phone ?? "",
        contactEmail: profile.contact_email ?? "",
        jazzcashPhone: profile.jazzcash_phone ?? "",
        easypaisaPhone: profile.easypaisa_phone ?? "",
        isCommunityMember: profile.is_community_member ?? false,
        banned: profile.banned ?? false,
        isAdmin: profile.role === "admin",
        avatarUrl: profile.avatar_url ?? null,
      });
    }
    setLoading(false);
  };

  // ─── REGISTER ───────────────────────────────────────────────
  // Supabase sends the real verification email automatically.
  // No more fake codes or demo mode.
  const register = async ({
    name,
    email,
    password,
    role,
    phone,
    contactEmail,
    jazzcashPhone,
    easypaisaPhone,
  }) => {
    // 1. Create auth account — triggers real verification email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) return { success: false, message: error.message };

    // 2. Insert profile row with all extra fields
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role: role || "buyer",
      phone: phone || "",
      contact_email: contactEmail || "",
      jazzcash_phone: jazzcashPhone || "",
      easypaisa_phone: easypaisaPhone || "",
      is_community_member: false,
      banned: false,
    });

    if (profileError) return { success: false, message: profileError.message };

    return { success: true };
  };

  // ─── PRE-REGISTER ───────────────────────────────────────────
  // Check if email already exists before showing the verify screen.
  // Supabase does not expose a direct "email exists" check on the
  // client, so we query profiles instead.
  const preRegister = async ({ email }) => {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();

    // Also check auth emails via a lightweight sign-in attempt
    // (Supabase returns a specific error when email is not registered)
    // Simplest approach: just let signUp handle it and return its error.
    // preRegister is now only used to give an early duplicate warning.
    if (data) return { success: false, message: "Email already registered" };
    return { success: true };
  };

  // ─── LOGIN ──────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Map Supabase error messages to your existing friendly messages
      if (error.message.includes("Invalid login credentials"))
        return { success: false, message: "Incorrect email or password." };
      if (error.message.includes("Email not confirmed"))
        return {
          success: false,
          message: "Please verify your email before logging in.",
          needsVerification: true,
        };
      return { success: false, message: error.message };
    }

    // Check if banned — profile is loaded by onAuthStateChange,
    // but we need the banned flag right now for immediate feedback
    const { data: profile } = await supabase
      .from("profiles")
      .select("banned")
      .eq("id", data.user.id)
      .single();

    if (profile?.banned) {
      await supabase.auth.signOut();
      return { success: false, message: "This account has been banned." };
    }

    return { success: true };
  };

  // ─── LOGOUT ─────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ─── UPDATE USER ────────────────────────────────────────────
  // Called from Account.jsx — same fields as before
  const updateUser = async (data) => {
    if (!user) return;

    // AFTER:
const updates = {};
if (data.name !== undefined) updates.name = data.name;
if (data.role !== undefined) updates.role = data.role;
if (data.phone !== undefined) updates.phone = data.phone;
if (data.contactEmail !== undefined) updates.contact_email = data.contactEmail;
if (data.jazzcashPhone !== undefined) updates.jazzcash_phone = data.jazzcashPhone;
if (data.easypaisaPhone !== undefined) updates.easypaisa_phone = data.easypaisaPhone;
if (data.isCommunityMember !== undefined)
  updates.is_community_member = data.isCommunityMember;
if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error) {
      // Keep local state in sync immediately
      setUser((prev) => ({ ...prev, ...data }));
    }
  };

  // ─── BAN / UNBAN ────────────────────────────────────────────
  // Admin only — updates the profiles table
  const banUser = async (userId) => {
    await supabase.from("profiles").update({ banned: true }).eq("id", userId);
  };

  const unbanUser = async (userId) => {
    await supabase.from("profiles").update({ banned: false }).eq("id", userId);
  };

  // ─── GET ALL USERS ──────────────────────────────────────────
  // Used by AdminContext
  const getAllUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");
    // Return in the same shape the rest of the app expects
    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email ?? "",
      role: p.role,
      phone: p.phone ?? "",
      contactEmail: p.contact_email ?? "",
      jazzcashPhone: p.jazzcash_phone ?? "",
      easypaisaPhone: p.easypaisa_phone ?? "",
      isCommunityMember: p.is_community_member ?? false,
      banned: p.banned ?? false,
    }));
  };

  // ─── GET USER BY ID ─────────────────────────────────────────
  // Used by Cart.jsx PaymentModal to look up seller wallet numbers
  const getUserById = async (userId) => {
    if (!userId) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      email: data.email ?? "",
      role: data.role,
      phone: data.phone ?? "",
      contactEmail: data.contact_email ?? "",
      jazzcashPhone: data.jazzcash_phone ?? "",
      easypaisaPhone: data.easypaisa_phone ?? "",
      isCommunityMember: data.is_community_member ?? false,
      banned: data.banned ?? false,
    };
  };

  // ─── COMMUNITY HELPERS ───────────────────────────────────────
  const joinCommunityMembership = () => updateUser({ isCommunityMember: true });
  const leaveCommunityMembership = () => updateUser({ isCommunityMember: false });

  // ─── VALIDATION HELPERS ──────────────────────────────────────
  // Kept identical — SignUp.jsx uses these directly
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validatePassword = (password) => {
    const hasCapital = /[A-Z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const numbers = password.match(/\d/g) || [];
    return hasCapital && hasSymbol && numbers.length >= 2;
  };

  // ─── DERIVED ROLE FLAGS ──────────────────────────────────────
  const role = user?.role || "guest";
  const isGuest = !user;
  const isAdmin = role === "admin";
  const isBuyer = role === "buyer" || role === "both";
  const isSeller = role === "seller" || role === "both";
  const isCommunityMember = !!user?.isCommunityMember;

  const hasAccess = (type) => {
    switch (type) {
      case "buyer":  return isBuyer;
      case "seller": return isSeller;
      case "admin":  return isAdmin;
      case "auth":   return !isGuest;
      default:       return false;
    }
  };

  // Don't render children until we know the auth state
  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        guestId,
        login,
        register,
        preRegister,
        logout,
        updateUser,
        joinCommunityMembership,
        leaveCommunityMembership,
        validateEmail,
        validatePassword,
        role,
        isGuest,
        isAdmin,
        isBuyer,
        isSeller,
        isCommunityMember,
        hasAccess,
        banUser,
        unbanUser,
        getAllUsers,
        getUserById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);