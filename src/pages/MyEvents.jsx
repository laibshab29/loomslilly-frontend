import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

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
            Delete Event?
          </h2>
          <p className="text-[#7A6C9D] mb-8 leading-relaxed">
            This action cannot be undone. Your event will be permanently removed.
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

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const TYPE_EMOJI = {
  Workshop: "🎨", Exhibition: "🖼️", "Pop-up": "🎪", Meetup: "☕", Other: "✨",
};

export function MyEvents() {
  const { user } = useAuth();
  const { events, deleteEvent, getSlotsLeft, isFull } = useEvents();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const myEvents = events.filter((e) => e.authorId === user?.id);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = myEvents.filter((e) => e.date >= today);
  const past = myEvents.filter((e) => e.date < today);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1100px] mx-auto">

        {deleteTarget && (
          <ConfirmModal
            onConfirm={() => { deleteEvent(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl lg:text-6xl mb-3">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>My </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Events
            </span>
          </h1>
          <p className="text-[#C8B6E2]">Events you've created</p>
        </motion.div>

        {/* EMPTY */}
        {myEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6">🎪</div>
            <p className="text-[#FFF6F8] text-2xl mb-4">You haven't uploaded any events yet.</p>
            <Link
              to="/events/upload"
              className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all inline-block"
            >
              Upload Your First Event
            </Link>
          </motion.div>
        )}

        {/* UPCOMING */}
        {upcoming.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl text-[#C8B6E2] mb-5" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Upcoming ({upcoming.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event, index) => {
                const full = isFull(event.id);
                const slotsLeft = getSlotsLeft(event.id);
                const emoji = TYPE_EMOJI[event.type] || "✨";
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-[20px] bg-[#FFF6F8]/90 border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg"
                  >
                    <div className="h-24 bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center text-4xl relative">
                      {emoji}
                      <button
                        onClick={() => setDeleteTarget(event.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/60 hover:bg-white/90 transition-all"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
                      </button>
                      {full && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">Full</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg text-[#2E2A4A] leading-snug">{event.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#C8B6E2]/30 text-[#7A6C9D] flex-shrink-0">{event.type}</span>
                      </div>
                      <p className="text-sm text-[#7A6C9D] mb-3 line-clamp-2">{event.details}</p>
                      <div className="space-y-1 text-sm text-[#7A6C9D]">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(event.date)}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {full
                            ? <span className="text-red-400 font-medium">No slots left</span>
                            : <>{slotsLeft} slots left</>
                          }
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* PAST */}
        {past.length > 0 && (
          <section>
            <h2 className="text-xl text-[#C8B6E2] mb-5" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Past Events ({past.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map((event, index) => {
                const emoji = TYPE_EMOJI[event.type] || "✨";
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-[20px] bg-[#FFF6F8]/50 border-2 border-[#7A6C9D]/10 overflow-hidden shadow opacity-70"
                  >
                    <div className="h-24 bg-gradient-to-br from-[#F6C1CC]/40 to-[#C8B6E2]/40 flex items-center justify-center text-4xl grayscale relative">
                      {emoji}
                      <button
                        onClick={() => setDeleteTarget(event.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/60 hover:bg-white/90 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
                      </button>
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gray-400 text-white text-xs">Ended</span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg text-[#2E2A4A] mb-1">{event.name}</h3>
                      <div className="text-sm text-[#7A6C9D] flex items-center gap-2">
                        <Calendar className="w-4 h-4" />{formatDate(event.date)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}