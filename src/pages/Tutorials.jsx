import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, User, Trash2, X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTutorials } from "../context/TutorialContext";
import { GuestBlock } from "../components/shared/GuestBlock";
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

// ─── Video Lightbox ────────────────────────────────────────────────────────────
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
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

          {/* Video container */}
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

export function Tutorials() {
  const { isGuest, user } = useAuth();
  const { tutorials, deleteTutorial } = useTutorials();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const handleCardClick = (tutorial) => {
    navigate(`/tutorials/${tutorial.id}`);
  };

  const handlePlayClick = (e, src) => {
    e.stopPropagation();
    setLightboxSrc(src);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* GUEST BLOCK */}
        {isGuest && (
          <GuestBlock message="Sign up to learn from tutorials shared by our talented community of creators." />
        )}

        {/* MAIN CONTENT */}
        {!isGuest && (
          <>
            {/* HEADER */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl lg:text-7xl mb-4">
                <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
                  Tutorials
                </span>
              </h1>
              <p className="text-xl text-[#FFF6F8] mb-8">
                Learn from our talented community of creators
              </p>
              <button
                onClick={() => navigate("/tutorials/upload")}
                className="px-10 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all shadow-lg"
              >
                Upload Tutorial
              </button>
            </motion.div>

            {/* EMPTY STATE */}
            {tutorials.length === 0 && (
              <div className="text-center py-20 text-white text-2xl">
                No tutorials yet — be the first to upload one!
              </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorials.map((tutorial, index) => {
                const isOwner = user?.id === tutorial.authorId;
                const emoji = TYPE_EMOJI[tutorial.type] || "🎨";
                const firstMedia = tutorial.media?.[0];
                const hasVideo = tutorial.mediaType === "video" && firstMedia;
                const hasYouTube = !!tutorial.youtubeLink;

                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    onClick={() => handleCardClick(tutorial)}
                    className="rounded-[20px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg group relative cursor-pointer"
                  >
                    {/* THUMBNAIL */}
                    <div className="aspect-video bg-gradient-to-br from-[#F6C1CC]/50 to-[#C8B6E2]/50 flex items-center justify-center relative overflow-hidden">
                      {firstMedia ? (
                        tutorial.mediaType === "video" ? (
                          <video src={firstMedia} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={firstMedia} alt={tutorial.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="text-6xl">{emoji}</div>
                      )}

                      {/* Play overlay — only for uploaded videos */}
                      {hasVideo && (
                        <div
                          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          onClick={(e) => handlePlayClick(e, firstMedia)}
                        >
                          <div className="w-16 h-16 rounded-full bg-[#FF8FA3] flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                          </div>
                        </div>
                      )}

                      {/* YouTube badge */}
                      {!hasVideo && hasYouTube && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                          YouTube
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg text-[#2E2A4A] leading-snug">{tutorial.title}</h3>
                        {isOwner && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(tutorial.id); }}
                            className="p-1.5 rounded-full hover:bg-[#FF8FA3]/20 transition-all flex-shrink-0"
                            title="Delete tutorial"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-[#C8B6E2] mb-3 capitalize">{tutorial.type}</p>

                      <div className="flex items-center justify-between text-sm text-[#7A6C9D]">
                        {tutorial.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{tutorial.duration}</span>
                          </div>
                        )}
                        {hasYouTube && !tutorial.duration && (
                          <a
                            href={tutorial.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-red-400 hover:text-red-500 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Watch
                          </a>
                        )}
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{tutorial.authorName}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Video Lightbox */}
      <VideoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteTutorial(deleteTarget); setDeleteTarget(null); }}
        title="Delete Tutorial?"
        message="This action cannot be undone. Your tutorial will be permanently removed."
        confirmText="Delete"
      />
    </div>
  );
}