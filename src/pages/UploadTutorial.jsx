import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTutorials } from "../context/TutorialContext";

function Notification({ message, type = "error", onClose }) {
  if (!message) return null;
  const styles = {
    error: "bg-[#FFE4EA] border border-[#FF8FA3] text-[#C0395A]",
    success: "bg-[#E4F9F0] border border-[#6FCFA0] text-[#2A7A55]",
  };
  const icons = { error: "✕", success: "✓" };
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] mb-6 text-sm font-medium ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <span>{icons[type]}</span>
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
}

const TYPES = [
  "Crochet", "Knitting", "Embroidery",
  "Sketching", "Painting", "Abstract Art", "Other",
];

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

export function UploadTutorial() {
  const { user, isGuest } = useAuth();
  const { addTutorial } = useTutorials();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    details: "",
    type: "",
    duration: "",
    mediaType: "image",
    media: [],
  });

  const [notification, setNotification] = useState(null);
  const [previews, setPreviews] = useState([]);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Sign up to upload tutorials</p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      showNotification("Maximum 10 files allowed.", "error");
      return;
    }

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((base64s) => {
      setForm((prev) => ({ ...prev, media: base64s }));
      setPreviews(base64s);
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      showNotification("Please enter a title.", "error");
      return;
    }
    if (!form.details.trim()) {
      showNotification("Please enter tutorial details.", "error");
      return;
    }
    if (!form.type) {
      showNotification("Please select a type of art or craft.", "error");
      return;
    }
    if (form.media.length === 0) {
      showNotification("Please upload at least one image or video.", "error");
      return;
    }

    addTutorial(form, user);
    showNotification("Tutorial uploaded successfully!", "success");
    setTimeout(() => navigate("/tutorials"), 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[700px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Upload
            </span>{" "}
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
              Tutorial
            </span>
          </h1>
          <p className="text-[#FFF6F8] text-lg">Share your craft knowledge with the community</p>
        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] bg-[#FFF6F8]/90 p-8 shadow-2xl"
        >
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
              placeholder="e.g. Beginner Crochet Basics"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* TYPE */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Type of Art / Craft <span className="text-[#FF8FA3]">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputStyle}
            >
              <option value="">Select a type...</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* DETAILS */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Details <span className="text-[#FF8FA3]">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe what this tutorial covers..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* DURATION — optional */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Duration{" "}
              <span className="text-xs text-[#C8B6E2]">(optional, e.g. 15 min)</span>
            </label>
            <input
              placeholder="e.g. 20 min"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* MEDIA TYPE */}
          <div className="mb-4">
            <label className="block text-[#7A6C9D] mb-2">
              Media Type <span className="text-[#FF8FA3]">*</span>
            </label>
            <div className="flex gap-4">
              {["image", "video"].map((mt) => (
                <button
                  key={mt}
                  type="button"
                  onClick={() => setForm({ ...form, mediaType: mt, media: [] })}
                  className={`px-6 py-2 rounded-full capitalize transition-all ${
                    form.mediaType === mt
                      ? "bg-[#FF8FA3] text-white"
                      : "bg-[#F6C1CC]/30 text-[#7A6C9D] hover:bg-[#F6C1CC]/60"
                  }`}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          {/* MEDIA UPLOAD */}
          <div className="mb-8">
            <label className="block text-[#7A6C9D] mb-2">
              Upload {form.mediaType === "video" ? "Video" : "Images"}{" "}
              <span className="text-[#FF8FA3]">*</span>
            </label>
            <input
              type="file"
              multiple={form.mediaType === "image"}
              accept={form.mediaType === "video" ? "video/*" : "image/*"}
              onChange={handleMediaChange}
              className={inputStyle}
            />

            {/* IMAGE PREVIEWS */}
            {previews.length > 0 && form.mediaType === "image" && (
              <div className="flex flex-wrap gap-3 mt-4">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-20 h-20 object-cover rounded-[12px] border-2 border-[#F6C1CC]"
                  />
                ))}
              </div>
            )}

            {/* VIDEO PREVIEW */}
            {previews.length > 0 && form.mediaType === "video" && (
              <video
                src={previews[0]}
                controls
                className="mt-4 w-full rounded-[16px]"
              />
            )}
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-full bg-[#FF8FA3] text-white text-lg hover:scale-[1.02] transition-all"
          >
            Upload Tutorial
          </button>
        </motion.div>
      </div>
    </div>
  );
}