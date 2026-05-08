import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTutorials } from "../context/TutorialContext";

const TYPE_EMOJI = {
  Crochet: "🧶", Knitting: "🧵", Embroidery: "🪡",
  Sketching: "✏️", Painting: "🎨", "Abstract Art": "🖼️", Other: "🎭",
};

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
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
            <button onClick={onCancel} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all">Delete</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Notification({ message, type = "info", onClose }) {
  if (!message) return null;
  const styles = {
    info: "bg-[#EDE8F9] border border-[#C8B6E2] text-[#4A3A7A]",
    success: "bg-[#E4F9F0] border border-[#6FCFA0] text-[#2A7A55]",
  };
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] mb-6 text-sm font-medium ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

export function MyTutorials() {
  const { user, role } = useAuth();
  const { tutorials, deleteTutorial } = useTutorials();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState(null);

  if (role !== "seller" && role !== "both") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl text-white">Seller access only</h1>
      </div>
    );
  }

  const myTutorials = tutorials.filter((t) => t.authorId === user?.id);

  const handleDelete = () => {
    deleteTutorial(deleteTarget);
    setDeleteTarget(null);
    setNotification({ message: "Tutorial deleted.", type: "info" });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">

      {deleteTarget && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-[1440px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-6xl mb-6">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>My</span>
            <span className="text-white" style={{ fontFamily: "Fredoka" }}> Tutorials</span>
          </h1>
          <button
            onClick={() => navigate("/tutorials/upload")}
            className="px-8 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Upload New Tutorial
          </button>
        </div>

        {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
        )}

        {/* EMPTY */}
        {myTutorials.length === 0 ? (
          <div className="text-center py-20 text-white text-2xl">
            You haven't uploaded any tutorials yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTutorials.map((tutorial) => {
              const emoji = TYPE_EMOJI[tutorial.type] || "🎨";
              const firstMedia = tutorial.media?.[0];

              return (
                <motion.div
                  key={tutorial.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-[28px] overflow-hidden bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] shadow-xl"
                >
                  {/* THUMBNAIL */}
                  <div className="h-48 bg-[#C8B6E2]/30 flex items-center justify-center relative overflow-hidden">
                    {firstMedia ? (
                      tutorial.mediaType === "video" ? (
                        <video src={firstMedia} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={firstMedia} alt={tutorial.title} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="text-6xl">{emoji}</div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 style={{ fontFamily: "Fredoka, sans-serif" }} className="text-2xl text-[#FFF6F8]">
                        {tutorial.title}
                      </h2>
                      <button
                        onClick={() => setDeleteTarget(tutorial.id)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-all flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <p className="text-white/80 text-sm mb-3 capitalize">{tutorial.type}</p>
                    <p className="text-white/70 text-sm line-clamp-2 mb-4">{tutorial.details}</p>

                    {tutorial.duration && (
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{tutorial.duration}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}