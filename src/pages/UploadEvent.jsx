import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { ConfirmModal } from "../components/shared/ConfirmModal";

const EVENT_TYPES = ["Workshop", "Exhibition", "Pop-up", "Meetup", "Other"];

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function readFilesAsBase64(files) {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    )
  );
}

// ─── EMAIL VALIDATION ─────────────────────────────────────────
const validateEmail = (value) => {
  if (!value.trim()) return "Email is required.";
  if (!value.includes("@")) return "Email must contain an @ symbol.";
  const [local, domain] = value.split("@");
  if (!local) return "Email is missing the part before @.";
  if (!domain || !domain.includes(".")) return "Email must have a valid domain (e.g. gmail.com).";
  if (domain.startsWith(".") || domain.endsWith(".")) return "Domain cannot start or end with a dot.";
  return "";
};

// ─── PHONE VALIDATION ─────────────────────────────────────────
const validatePakistaniPhone = (value) => {
  if (/[^+\d]/.test(value)) return "Only digits and a leading + symbol are allowed.";
  if (value.indexOf("+") > 0) return "The + symbol can only appear at the start.";
  const digits = value.replace("+", "");
  if (!/^\d+$/.test(digits)) return "Only digits and a leading + symbol are allowed.";
  if (digits.length < 9) return "Phone number is too short (minimum 9 digits).";
  if (digits.length > 12) return "Phone number is too long (maximum 12 digits).";
  if (value.startsWith("+") && !value.startsWith("+92")) return "International format must start with +92 for Pakistan.";
  if (!value.startsWith("+") && !digits.startsWith("0")) return "Local numbers must start with 0 (e.g. 03001234567).";
  return "";
};

const sanitizePhone = (value) => {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "+" && i === 0) { result += ch; continue; }
    if (/\d/.test(ch)) { result += ch; continue; }
  }
  return result;
};

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
    contactEmail: "",
    contactPhone: "",
    pictures: [],
    videos: [],
    brochures: [],
  });

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "error",
    onConfirm: null,
  });

  const showError = (title, message) =>
    setModal({ isOpen: true, title, message, variant: "error", onConfirm: null });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

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

  // ─── FILE HANDLERS ────────────────────────────────────────────

  const handlePictures = async (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - form.pictures.length;
    if (files.length > remaining) {
      showError("Too Many Images", `You can only upload up to 5 pictures. You have ${form.pictures.length} already.`);
      e.target.value = "";
      return;
    }
    const base64s = await readFilesAsBase64(files);
    setForm((prev) => ({ ...prev, pictures: [...prev.pictures, ...base64s] }));
    e.target.value = "";
  };

  const handleVideos = async (e) => {
    const files = Array.from(e.target.files);
    const remaining = 2 - form.videos.length;
    if (files.length > remaining) {
      showError("Too Many Videos", `You can only upload up to 2 videos. You have ${form.videos.length} already.`);
      e.target.value = "";
      return;
    }
    const base64s = await readFilesAsBase64(files);
    setForm((prev) => ({ ...prev, videos: [...prev.videos, ...base64s] }));
    e.target.value = "";
  };

  const handleBrochures = async (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - form.brochures.length;
    if (files.length > remaining) {
      showError("Too Many Brochures", `You can only upload up to 5 brochures. You have ${form.brochures.length} already.`);
      e.target.value = "";
      return;
    }
    const base64s = await readFilesAsBase64(files);
    setForm((prev) => ({ ...prev, brochures: [...prev.brochures, ...base64s] }));
    e.target.value = "";
  };

  const removePicture = (i) =>
    setForm((prev) => ({ ...prev, pictures: prev.pictures.filter((_, idx) => idx !== i) }));
  const removeVideo = (i) =>
    setForm((prev) => ({ ...prev, videos: prev.videos.filter((_, idx) => idx !== i) }));
  const removeBrochure = (i) =>
    setForm((prev) => ({ ...prev, brochures: prev.brochures.filter((_, idx) => idx !== i) }));

  // ─── FIELD CHANGE HANDLERS ────────────────────────────────────

  const handleEmailChange = (value) => {
    setForm((prev) => ({ ...prev, contactEmail: value }));
    setEmailError(value ? validateEmail(value) : "");
  };

  const handlePhoneChange = (value) => {
    const sanitized = sanitizePhone(value);
    setForm((prev) => ({ ...prev, contactPhone: sanitized }));
    setPhoneError(sanitized ? validatePakistaniPhone(sanitized) : "");
  };

  // ─── SUBMIT ───────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!form.name.trim()) { showError("Missing Field", "Please enter an event name."); return; }
    if (!form.date) { showError("Missing Field", "Please select a date."); return; }
    if (form.date <= getTodayDate()) {
      showError("Invalid Date", "Event date must be in the future.");
      setForm((prev) => ({ ...prev, date: "" }));
      return;
    }
    if (!form.type) { showError("Missing Field", "Please select an event type."); return; }
    if (!form.venue.trim()) { showError("Missing Field", "Please enter a venue."); return; }
    if (!form.slots || Number(form.slots) < 1) { showError("Missing Field", "Please enter a valid number of slots (at least 1)."); return; }
    if (!form.details.trim()) { showError("Missing Field", "Please enter event details."); return; }

    // Email
    if (!form.contactEmail.trim()) { showError("Missing Field", "Please enter a contact email address."); return; }
    const emailErr = validateEmail(form.contactEmail);
    if (emailErr) { showError("Invalid Email", emailErr); return; }

    // Phone
    if (!form.contactPhone.trim()) { showError("Missing Field", "Please enter a contact phone number."); return; }
    const phoneErr = validatePakistaniPhone(form.contactPhone);
    if (phoneErr) { showError("Invalid Phone Number", phoneErr); return; }

    // Link or brochure
    if (!form.link.trim() && form.brochures.length === 0) {
      showError("Link or Brochure Required", "Please provide either a website link or at least one brochure.");
      return;
    }

    addEvent(form, user);

    setModal({
      isOpen: true,
      title: "Event Uploaded!",
      message: "Your event has been added to the community.",
      variant: "info",
      onConfirm: () => navigate("/events"),
    });
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
          className="rounded-[28px] bg-[#FFF6F8]/90 p-8 shadow-2xl space-y-6"
        >
          {/* NAME */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">Event Name <span className="text-[#FF8FA3]">*</span></label>
            <input
              placeholder="e.g. Spring Craft Fair"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* DATE */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">Date <span className="text-[#FF8FA3]">*</span></label>
            <input
              type="date"
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">Event Type <span className="text-[#FF8FA3]">*</span></label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputStyle}
            >
              <option value="">Select a type...</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* VENUE */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">Venue <span className="text-[#FF8FA3]">*</span></label>
            <input
              placeholder="e.g. Creative Studio, Karachi"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* SLOTS */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">Slots Available <span className="text-[#FF8FA3]">*</span></label>
            <input
              type="number"
              placeholder="e.g. 30"
              min={1}
              value={form.slots}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 1) setForm({ ...form, slots: val });
              }}
              className={inputStyle}
            />
          </div>

          {/* DETAILS */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">Details <span className="text-[#FF8FA3]">*</span></label>
            <textarea
              rows={5}
              placeholder="Describe the event..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              className={inputStyle}
            />
          </div>

          {/* CONTACT INFO */}
          <div className="rounded-[16px] bg-[#F6C1CC]/20 p-5 space-y-4">
            <p className="text-[#7A6C9D] text-sm font-medium">
              Contact Info <span className="text-[#FF8FA3]">*</span>
              <span className="text-xs text-[#C8B6E2] ml-1">(both required)</span>
            </p>

            {/* EMAIL */}
            <div>
              <input
                placeholder="Contact Email * e.g. organizer@gmail.com"
                value={form.contactEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={inputStyle + (emailError ? " border-red-400" : "")}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <input
                placeholder="Contact Phone * e.g. +923001234567 or 03001234567"
                value={form.contactPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={inputStyle + (phoneError ? " border-red-400" : "")}
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
              <p className="text-[#C8B6E2] text-xs mt-1">
                Accepted formats: +923001234567 · 03001234567 · +92211234567 · 0211234567
              </p>
            </div>
          </div>

          {/* LINK + BROCHURE */}
          <div className="rounded-[16px] bg-[#F6C1CC]/20 p-5 space-y-4">
            <p className="text-[#7A6C9D] text-sm font-medium">
              Website Link or Brochure <span className="text-[#FF8FA3]">*</span>
              <span className="text-xs text-[#C8B6E2] ml-1">(at least one required)</span>
            </p>

            <input
              placeholder="https://... (optional if brochure uploaded)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className={inputStyle}
            />

            <div>
              <p className="text-[#7A6C9D] text-xs mb-2">
                Brochures <span className="text-[#C8B6E2]">(max 5, any file type)</span>
              </p>
              {form.brochures.length < 5 && (
                <input type="file" multiple onChange={handleBrochures} className={inputStyle} />
              )}
              {form.brochures.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.brochures.map((b, i) => (
                    <div key={i} className="relative">
                      {b.startsWith("data:image") ? (
                        <img src={b} alt="" className="w-16 h-16 object-cover rounded-[10px]" />
                      ) : (
                        <div className="w-16 h-16 rounded-[10px] bg-[#C8B6E2]/30 flex items-center justify-center text-2xl">📄</div>
                      )}
                      <button
                        onClick={() => removeBrochure(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF8FA3] text-white text-xs flex items-center justify-center"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PICTURES */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">
              Pictures <span className="text-xs text-[#C8B6E2]">(optional, max 5)</span>
            </label>
            {form.pictures.length < 5 && (
              <input type="file" multiple accept="image/*" onChange={handlePictures} className={inputStyle} />
            )}
            {form.pictures.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.pictures.map((pic, i) => (
                  <div key={i} className="relative">
                    {pic.startsWith("data:image") ? (
                      <img src={pic} alt="" className="w-20 h-20 object-cover rounded-[12px]" />
                    ) : (
                      <div className="w-20 h-20 rounded-[12px] bg-[#C8B6E2]/30 flex items-center justify-center text-2xl">📄</div>
                    )}
                    <button
                      onClick={() => removePicture(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF8FA3] text-white text-xs flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VIDEOS */}
          <div>
            <label className="block text-[#7A6C9D] mb-2">
              Videos <span className="text-xs text-[#C8B6E2]">(optional, max 2)</span>
            </label>
            {form.videos.length < 2 && (
              <input type="file" multiple accept="video/*" onChange={handleVideos} className={inputStyle} />
            )}
            {form.videos.length > 0 && (
              <div className="space-y-2 mt-3">
                {form.videos.map((v, i) => (
                  <div key={i} className="relative">
                    <video src={v} controls className="w-full rounded-[12px] bg-black max-h-40" />
                    <button
                      onClick={() => removeVideo(i)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF8FA3] text-white text-xs flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
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

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm || closeModal}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
      />
    </div>
  );
}