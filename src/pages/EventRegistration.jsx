import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { Calendar, MapPin, Users } from "lucide-react";

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

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

export function EventRegistration() {
  const { user } = useAuth();
  const { events, registerForEvent, getSlotsLeft, isFull, isExpired } = useEvents();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventId = Number(searchParams.get("eventId"));
  const event = events.find((e) => e.id === eventId);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Guard: no valid event found
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🎪</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Event not found.</p>
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Guard: expired
  if (isExpired(event.date)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">⏰</div>
          <p className="text-[#FFF6F8] text-2xl mb-3">This event has already passed.</p>
          <p className="text-[#C8B6E2] mb-6">Check out upcoming events!</p>
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            View Events
          </button>
        </div>
      </div>
    );
  }

  // Guard: full
  if (isFull(event.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🚫</div>
          <p className="text-[#FFF6F8] text-2xl mb-3">Registration is closed.</p>
          <p className="text-[#C8B6E2] mb-6">No slots left for <strong>{event.name}</strong>.</p>
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            View Other Events
          </button>
        </div>
      </div>
    );
  }

  const slotsLeft = getSlotsLeft(event.id);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showNotification("Please enter your full name.", "error");
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    // Final live checks before submitting
    if (isExpired(event.date)) {
      showNotification("This event has already passed.", "error");
      return;
    }
    if (isFull(event.id)) {
      showNotification("Sorry, this event just filled up.", "error");
      return;
    }

    registerForEvent(event.id, { name: formData.name, email: formData.email });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[600px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>Event </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Registration
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8]" style={{ fontFamily: "Inter, sans-serif" }}>
            Sign up for your favourite events
          </p>
        </motion.div>

        {/* EVENT SUMMARY PILL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[20px] bg-[#FFF6F8]/20 backdrop-blur-sm border border-[#FFF6F8]/30 p-5 mb-6 text-[#FFF6F8] space-y-2"
        >
          <p className="text-lg font-semibold">{event.name}</p>
          <div className="flex flex-wrap gap-4 text-sm text-[#C8B6E2]">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(event.date)}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.venue}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} left</span>
          </div>
        </motion.div>

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[24px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 p-8 shadow-2xl"
        >
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl text-[#2E2A4A] mb-4" style={{ fontFamily: "Fredoka, sans-serif" }}>
                Registration Complete!
              </h2>
              <p className="text-[#7A6C9D] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                You're registered for <strong>{event.name}</strong>.
              </p>
              <p className="text-[#7A6C9D] mb-6 text-sm">We'll send a confirmation to <strong>{formData.email}</strong></p>
              <button
                onClick={() => navigate("/events")}
                className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all shadow-lg"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                Back to Events
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {notification && (
                <Notification
                  message={notification.message}
                  type={notification.type}
                  onClose={() => setNotification(null)}
                />
              )}

              {/* NAME */}
              <div>
                <label className="block text-[#2E2A4A] mb-2" style={{ fontFamily: "Fredoka, sans-serif" }}>
                  Full Name <span className="text-[#FF8FA3]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputStyle}
                  placeholder="Enter your name"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-[#2E2A4A] mb-2" style={{ fontFamily: "Fredoka, sans-serif" }}>
                  Email Address <span className="text-[#FF8FA3]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputStyle}
                  placeholder="your@email.com"
                />
              </div>

              {/* SLOTS WARNING */}
              {slotsLeft <= 5 && (
                <p className="text-sm text-[#C0395A] font-medium">
                  ⚠️ Only {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining — register quickly!
                </p>
              )}

              {/* SUBMIT */}
              <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-full bg-[#FF8FA3] text-white text-lg hover:scale-[1.02] transition-all shadow-lg"
                style={{ fontFamily: "Fredoka, sans-serif" }}
              >
                Register Now
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}