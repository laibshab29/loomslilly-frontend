// src/lib/uploadPaymentProof.js
import { supabase } from "./supabase";

/**
 * Upload a payment proof image to Supabase Storage.
 *
 * @param {File} file        - The image file from <input type="file">
 * @param {string} orderRef  - A reference string used in the filename
 *                             (e.g. guestId or a temporary nonce). The real
 *                             order number doesn't exist yet at this point
 *                             because the order hasn't been placed.
 * @returns {Promise<{ url: string | null, error: string | null }>}
 */
export async function uploadPaymentProof(file, orderRef) {
  if (!file) return { url: null, error: "No file provided" };

  // Basic client-side validation
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "File must be an image" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: "Image must be under 5 MB" };
  }

  // Build a unique filename: <orderRef>_<timestamp>.<ext>
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeRef = String(orderRef || "anon").replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `${safeRef}_${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("uploadPaymentProof error:", error.message);
    return { url: null, error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("payment-proofs")
    .getPublicUrl(data.path);

  return { url: publicUrl, error: null };
}