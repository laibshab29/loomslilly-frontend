import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

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

const EVENT_TYPES = ["Workshop", "Exhibition", "Pop-up", "Meetup", "Other"];

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function UploadEvent() {
  const { user, isGuest } = useAuth();
  const { addEvent } = useEvents();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "",
    venue: "",
    slots: "",
    link: "",
    details: "",
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Sign up to upload events</p>
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

  const handleSubmit = () => {
    if (!form.name.trim()) {
      showNotification("Please enter an event name.", "error");
      return;
    }
    if (!form.date) {
      showNotification("Please select a date.", "error");
      return;
    }
    if (form.date <= getTodayDate()) {
      showNotification("Event date must be in the future.", "error");
      setForm({ ...form, date: "" });
      return;
    }
    if (!form.type) {
      showNotification("Please select an event type.", "error");
      return;
    }
    if (!form.venue.trim()) {
      showNotification("Please enter a venue.", "error");
      return;
    }
    if (!form.slots || Number(form.slots) < 1) {
      showNotification("Please enter a valid number of slots (at least 1).", "error");
      return;
    }
    if (!form.details.trim()) {
      showNotification("Please enter event details.", "error");
      return;
    }

    addEvent(form, user);
    showNotification("Event uploaded successfully!", "success");
    setTimeout(() => navigate("/events"), 1500);
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
              Event
            </span>
          </h1>
          <p className="text-[#FFF6F8] text-lg">Share your event with the community</p>
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

          {/* NAME */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Event Name <span className="text-[#FF8FA3]">*</span>
            </label>
            <input
              placeholder="e.g. Spring Craft Fair"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* DATE */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Date <span className="text-[#FF8FA3]">*</span>
            </label>
            <input
              type="date"
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* TYPE */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Event Type <span className="text-[#FF8FA3]">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputStyle}
            >
              <option value="">Select a type...</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* VENUE */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Venue <span className="text-[#FF8FA3]">*</span>
            </label>
            <input
              placeholder="e.g. Creative Studio, Karachi"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* SLOTS */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Slots Available <span className="text-[#FF8FA3]">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 30"
              min={1}
              value={form.slots}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 1) {
                  setForm({ ...form, slots: val });
                }
              }}
              className={inputStyle}
            />
          </div>

          {/* LINK — optional */}
          <div className="mb-6">
            <label className="block text-[#7A6C9D] mb-2">
              Registration / Info Link{" "}
              <span className="text-xs text-[#C8B6E2]">(optional)</span>
            </label>
            <input
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* DETAILS */}
          <div className="mb-8">
            <label className="block text-[#7A6C9D] mb-2">
              Details <span className="text-[#FF8FA3]">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe the event..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-full bg-[#FF8FA3] text-white text-lg hover:scale-[1.02] transition-all"
          >
            Upload Event
          </button>
        </motion.div>
      </div>
    </div>
  );
}