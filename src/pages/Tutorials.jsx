import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, User, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTutorials } from "../context/TutorialContext";

const TYPE_EMOJI = {
  Crochet: "🧶",
  Knitting: "🧵",
  Embroidery: "🪡",
  Sketching: "✏️",
  Painting: "🎨",
  "Abstract Art": "🖼️",
  Other: "🎭",
};

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-[#FFF6F8] rounded-[28px] shadow-2xl p-10 max-w-[420px] w-full mx-4 text-center"
        >
          <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl mb-4">
            Delete Tutorial?
          </h2>
          <p className="text-[#7A6C9D] mb-8 leading-relaxed">
            This action cannot be undone. Your tutorial will be permanently removed.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Tutorials() {
  const { isGuest, user } = useAuth();
  const { tutorials, deleteTutorial } = useTutorials();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* CONFIRM MODAL */}
        {deleteTarget && (
          <ConfirmModal
            onConfirm={() => { deleteTutorial(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {/* GUEST BLOCK */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6">🔒</div>
            <h2 className="text-3xl text-[#FFF6F8] mb-4">Sign up to access tutorials</h2>
            <Link
              to="/signup"
              className="px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
            >
              Sign Up Now
            </Link>
          </motion.div>
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

                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="rounded-[20px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg group relative"
                  >
                    {/* THUMBNAIL */}
                    <div className="aspect-video bg-gradient-to-br from-[#F6C1CC]/50 to-[#C8B6E2]/50 flex items-center justify-center relative overflow-hidden">
                      {firstMedia ? (
                        tutorial.mediaType === "video" ? (
                          <video
                            src={firstMedia}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={firstMedia}
                            alt={tutorial.title}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="text-6xl">{emoji}</div>
                      )}

                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-[#FF8FA3] flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* CONTENT */}
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
    </div>
  );
}