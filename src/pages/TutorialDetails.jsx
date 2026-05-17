import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, ArrowLeft, Play, X, ExternalLink, Calendar } from "lucide-react";
import { useTutorials } from "../context/TutorialContext";
import { useAuth } from "../context/AuthContext";
import { ConfirmModal } from "../components/shared/ConfirmModal";

const TYPE_EMOJI = {
  Crochet: "🧶",
  Knitting: "🧵",
  Embroidery: "🪡",
  Sketching: "✏️",
  Painting: "🎨",
  "Abstract Art": "🖼️",
  Other: "🎭",
};

// ─── Video Lightbox ─────────────────────────────────────────────────────────
function VideoLightbox({ src, onClose }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <video
              src={src}
              controls
              autoPlay
              className="w-full rounded-[20px] shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TutorialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tutorials, deleteTutorial } = useTutorials();
  const { user } = useAuth();

  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const tutorial = tutorials.find((t) => String(t.id) === String(id));

  if (!tutorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-7xl">🔍</div>
        <p className="text-[#FFF6F8] text-2xl">Tutorial not found.</p>
        <button
          onClick={() => navigate("/tutorials")}
          className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
        >
          Back to Tutorials
        </button>
      </div>
    );
  }

  const isOwner = user?.id === tutorial.authorId;
  const emoji = TYPE_EMOJI[tutorial.type] || "🎨";
  const hasVideo = tutorial.mediaType === "video" && tutorial.media?.[0];
  const hasImages = tutorial.mediaType === "image" && tutorial.media?.length > 0;
  const hasYouTube = !!tutorial.youtubeLink;

  const formattedDate = new Date(tutorial.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[900px] mx-auto">

        {/* BACK */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/tutorials")}
          className="flex items-center gap-2 text-[#C8B6E2] hover:text-[#FF8FA3] transition-colors mb-10 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Tutorials
        </motion.button>

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[28px] bg-[#FFF6F8]/95 backdrop-blur-sm shadow-2xl overflow-hidden"
        >
          {/* ── MEDIA SECTION ── */}
          <div className="relative">
            {hasVideo ? (
              // Video thumbnail with play button
              <div className="aspect-video bg-gradient-to-br from-[#F6C1CC]/50 to-[#C8B6E2]/50 relative group cursor-pointer"
                onClick={() => setLightboxSrc(tutorial.media[0])}>
                <video
                  src={tutorial.media[0]}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 rounded-full bg-[#FF8FA3] flex items-center justify-center shadow-xl"
                  >
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </motion.div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  Click to play
                </div>
              </div>
            ) : hasImages ? (
              // Image gallery
              <div>
                <div className="aspect-video bg-[#F6C1CC]/20 overflow-hidden">
                  <img
                    src={tutorial.media[activeImg]}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {tutorial.media.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {tutorial.media.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-[10px] overflow-hidden border-2 transition-all ${
                          i === activeImg ? "border-[#FF8FA3] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Emoji placeholder
              <div className="aspect-video bg-gradient-to-br from-[#F6C1CC]/40 to-[#C8B6E2]/40 flex items-center justify-center">
                <div className="text-[100px]">{emoji}</div>
              </div>
            )}
          </div>

          {/* ── CONTENT ── */}
          <div className="p-8">
            {/* Title + type */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl text-[#2E2A4A] leading-tight" style={{ fontFamily: "Fredoka, sans-serif" }}>
                  {tutorial.title}
                </h1>
                <span className="text-4xl flex-shrink-0">{emoji}</span>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#F6C1CC]/50 text-[#7A6C9D] text-sm capitalize">
                {tutorial.type}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-6 text-[#7A6C9D] text-sm mb-8 pb-8 border-b border-[#C8B6E2]/30">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF8FA3]" />
                <span>{tutorial.authorName}</span>
              </div>
              {tutorial.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF8FA3]" />
                  <span>{tutorial.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF8FA3]" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Details */}
            <div className="mb-8">
              <h2 className="text-[#2E2A4A] text-lg font-semibold mb-3">About this Tutorial</h2>
              <p className="text-[#7A6C9D] leading-relaxed whitespace-pre-wrap">
                {tutorial.details}
              </p>
            </div>

            {/* YouTube / external link */}
            {hasYouTube && (
              <div className="mb-8 p-4 rounded-[16px] bg-red-50 border border-red-200 flex items-center justify-between gap-4">
                <div>
                  <p className="text-red-700 font-medium text-sm mb-1">Watch on external platform</p>
                  <p className="text-red-500 text-xs truncate max-w-[400px]">{tutorial.youtubeLink}</p>
                </div>
                <a
                  href={tutorial.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch Now
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {hasVideo && (
                <button
                  onClick={() => setLightboxSrc(tutorial.media[0])}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.03] transition-all shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Play Video
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setDeleteTarget(tutorial.id)}
                  className="px-6 py-3 rounded-full border-2 border-[#FF8FA3]/40 text-[#FF8FA3] hover:bg-[#FF8FA3]/10 transition-all"
                >
                  Delete Tutorial
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <VideoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteTutorial(deleteTarget);
          setDeleteTarget(null);
          navigate("/tutorials");
        }}
        title="Delete Tutorial?"
        message="This action cannot be undone. Your tutorial will be permanently removed."
        confirmText="Delete"
      />
    </div>
  );
}