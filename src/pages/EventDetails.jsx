import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, ExternalLink, Mail, Phone, ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { useEvents } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";

const TYPE_EMOJI = {
  Workshop: "🎨",
  Exhibition: "🖼️",
  "Pop-up": "🎪",
  Meetup: "☕",
  Other: "✨",
};

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isImageFile(file) {
  return typeof file === "string" && file.startsWith("data:image");
}

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEvent, isFull, getSlotsLeft } = useEvents();
  const { isGuest } = useAuth();

  const event = getEvent(id);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSource, setLightboxSource] = useState("pictures");

  const imageBrochures = event ? (event.brochures || []).filter(isImageFile) : [];
  const nonImageBrochures = event ? (event.brochures || []).filter((f) => !isImageFile(f)) : [];
  const lightboxImages = event
    ? (lightboxSource === "pictures" ? event.pictures || [] : imageBrochures)
    : [];

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i + 1) % lightboxImages.length);
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, lightboxImages.length]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">😕</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Event not found</p>
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

  const emoji = TYPE_EMOJI[event.type] || "✨";
  const full = isFull(event.id);
  const slotsLeft = getSlotsLeft(event.id);

  const openLightbox = (source, index) => {
    setLightboxSource(source);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((i) => (i + 1) % lightboxImages.length);
  };
  const prevImage = () => {
    setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);
  };

  const mailtoLink = "mailto:" + event.contactEmail;
  const telLink = "tel:" + event.contactPhone;
  const registerLink = "/events/register?eventId=" + event.id;

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1000px] mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#FFF6F8] mb-6 hover:text-[#FF8FA3] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] overflow-hidden mb-8 shadow-2xl"
        >
          {event.pictures && event.pictures.length > 0 ? (
            <div onClick={() => openLightbox("pictures", 0)} className="cursor-pointer">
              <img
                src={event.pictures[0]}
                alt={event.name}
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : imageBrochures.length > 0 ? (
            <div onClick={() => openLightbox("brochures", 0)} className="cursor-pointer">
              <img
                src={imageBrochures[0]}
                alt={event.name}
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="h-[400px] bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center text-9xl">
              {emoji}
            </div>
          )}
        </motion.div>

        {/* DETAILS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[24px] bg-[#FFF6F8]/95 p-8 lg:p-10 shadow-2xl mb-8"
        >
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <h1
              className="text-4xl lg:text-5xl text-[#2E2A4A]"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              {event.name}
            </h1>
            <span className="text-sm px-4 py-1.5 rounded-full bg-[#C8B6E2]/30 text-[#7A6C9D]">
              {event.type}
            </span>
          </div>

          <p className="text-[#7A6C9D] mb-8 leading-relaxed text-lg whitespace-pre-line">
            {event.details}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#F6C1CC]/20">
              <Calendar className="w-5 h-5 text-[#FF8FA3] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#7A6C9D] uppercase tracking-wide">Date</p>
                <p className="text-[#2E2A4A]">{formatDate(event.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#F6C1CC]/20">
              <MapPin className="w-5 h-5 text-[#FF8FA3] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#7A6C9D] uppercase tracking-wide">Venue</p>
                <p className="text-[#2E2A4A]">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#F6C1CC]/20">
              <Users className="w-5 h-5 text-[#FF8FA3] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#7A6C9D] uppercase tracking-wide">Availability</p>
                <p className="text-[#2E2A4A]">
                  {full ? (
                    <span className="text-red-500 font-medium">No slots left</span>
                  ) : (
                    <span>{slotsLeft} of {event.slots} slots left</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#F6C1CC]/20">
              <span className="text-xl mt-0.5">👤</span>
              <div>
                <p className="text-xs text-[#7A6C9D] uppercase tracking-wide">Organizer</p>
                <p className="text-[#2E2A4A]">{event.authorName}</p>
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="rounded-[16px] bg-[#C8B6E2]/20 p-5 mb-8">
            <h3 className="text-[#2E2A4A] mb-3 font-medium">Contact Organizer</h3>
            <div className="space-y-2 text-[#7A6C9D]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {/* 🔥 Fixed: was missing opening <a tag */}
                <a href={mailtoLink} className="hover:text-[#FF8FA3] transition-colors">
                  {event.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {/* 🔥 Fixed: was missing opening <a tag */}
                <a href={telLink} className="hover:text-[#FF8FA3] transition-colors">
                  {event.contactPhone}
                </a>
              </div>
              {event.link && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  {/* 🔥 Fixed: was missing opening <a tag */}
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF8FA3] transition-colors break-all"
                  >
                    {event.link}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* REGISTER */}
          {full ? (
            <div className="w-full py-4 rounded-full bg-gray-200 text-gray-500 text-center cursor-not-allowed">
              Registration Closed (Full)
            </div>
          ) : isGuest ? (
            <button
              onClick={() => navigate("/signup")}
              className="w-full py-4 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all"
            >
              Sign Up to Register
            </button>
          ) : (
            <button
              onClick={() => navigate(registerLink)}
              className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all shadow-md text-lg"
            >
              Register Now
            </button>
          )}
        </motion.div>

        {/* PICTURE GALLERY (skip first since it's the hero) */}
        {event.pictures && event.pictures.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-[#FFF6F8]/95 p-8 shadow-2xl mb-8"
          >
            <h2
              className="text-2xl text-[#2E2A4A] mb-5"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              More Photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {event.pictures.slice(1).map((pic, i) => (
                <img
                  key={i}
                  src={pic}
                  alt=""
                  onClick={() => openLightbox("pictures", i + 1)}
                  className="w-full h-32 sm:h-40 object-cover rounded-[12px] cursor-pointer hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* BROCHURES */}
        {(imageBrochures.length > 0 || nonImageBrochures.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-[#FFF6F8]/95 p-8 shadow-2xl mb-8"
          >
            <h2
              className="text-2xl text-[#2E2A4A] mb-5"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              Brochures
            </h2>

            {imageBrochures.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {imageBrochures.map((b, i) => (
                  <img
                    key={i}
                    src={b}
                    alt=""
                    onClick={() => openLightbox("brochures", i)}
                    className="w-full h-40 object-cover rounded-[12px] cursor-pointer hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            )}

            {nonImageBrochures.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {nonImageBrochures.map((file, i) => (
                  // 🔥 Fixed: was missing opening <a tag
                  <a
                    key={i}
                    href={file}
                    download={"brochure-" + (i + 1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-[#C8B6E2]/30 text-[#2E2A4A] hover:bg-[#C8B6E2]/50 transition-all"
                  >
                    📄 <span>Brochure {i + 1}</span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* VIDEOS */}
        {event.videos && event.videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-[#FFF6F8]/95 p-8 shadow-2xl"
          >
            <h2
              className="text-2xl text-[#2E2A4A] mb-5"
              style={{ fontFamily: "Fredoka, sans-serif" }}
            >
              Videos
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {event.videos.map((v, i) => (
                <video
                  key={i}
                  src={v}
                  controls
                  className="w-full rounded-[12px] bg-black"
                />
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && lightboxImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/20 hover:bg-white/40 transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 p-3 rounded-full bg-white/20 hover:bg-white/40 transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 p-3 rounded-full bg-white/20 hover:bg-white/40 transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={lightboxImages[lightboxIndex]}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-[12px]"
            />

            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/20 text-white text-sm">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}