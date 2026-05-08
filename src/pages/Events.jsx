import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Trash2, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

const TYPE_EMOJI = {
  Workshop: "🎨", Exhibition: "🖼️", "Pop-up": "🎪", Meetup: "☕", Other: "✨",
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

export function Events() {
  const { isGuest, user } = useAuth();
  const { activeEvents, deleteEvent, getSlotsLeft, isFull } = useEvents();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* CONFIRM MODAL */}
        {deleteTarget && (
          <ConfirmModal
            onConfirm={() => { deleteEvent(deleteTarget); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl lg:text-7xl mb-4">
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>Upcoming </span>
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              Events
            </span>
          </h1>
          <p className="text-xl text-[#FFF6F8] mb-8">
            Join us for workshops, exhibitions, and community gatherings
          </p>

          {/* UPLOAD BUTTON */}
          <div className="mt-4">
            {isGuest ? (
              <Link
                to="/signup"
                className="px-10 py-4 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                Sign Up to Upload Event
              </Link>
            ) : (
              <button
                onClick={() => navigate("/events/upload")}
                className="px-10 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all shadow-lg"
              >
                Upload Event
              </button>
            )}
          </div>
        </motion.div>

        {/* EMPTY */}
        {activeEvents.length === 0 && (
          <div className="text-center py-20 text-white text-2xl">
            No upcoming events right now — check back soon!
          </div>
        )}

        {/* EVENT CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeEvents.map((event, index) => {
            const isOwner = user?.id === event.authorId;
            const full = isFull(event.id);
            const slotsLeft = getSlotsLeft(event.id);
            const emoji = TYPE_EMOJI[event.type] || "✨";

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="rounded-[20px] bg-[#FFF6F8]/90 backdrop-blur-sm border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg"
              >
                {/* BANNER */}
                <div className="h-32 bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2] flex items-center justify-center text-5xl relative">
                  {emoji}
                  {/* OWNER DELETE */}
                  {isOwner && (
                    <button
                      onClick={() => setDeleteTarget(event.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/60 hover:bg-white/90 transition-all"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
                    </button>
                  )}
                  {/* FULL BADGE */}
                  {full && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                      Full
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-xl text-[#2E2A4A]">{event.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#C8B6E2]/30 text-[#7A6C9D] flex-shrink-0">
                      {event.type}
                    </span>
                  </div>

                  <p className="text-sm text-[#7A6C9D] mb-4 line-clamp-2">{event.details}</p>

                  <div className="space-y-2 mb-4 text-[#7A6C9D] text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {full ? (
                          <span className="text-red-400 font-medium">No slots left</span>
                        ) : (
                          <>{slotsLeft} slots left</>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* EXTERNAL LINK */}
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-[#C8B6E2] hover:text-[#FF8FA3] transition-colors mb-4"
                    >
                      <ExternalLink className="w-3 h-3" />
                      More info
                    </a>
                  )}

                  {/* REGISTER BUTTON */}
                  {full ? (
                    <div className="w-full py-3 rounded-full bg-gray-200 text-gray-400 text-center text-sm cursor-not-allowed">
                      Registration Closed
                    </div>
                  ) : isGuest ? (
                    <Link
                      to="/signup"
                      className="block w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] text-center hover:scale-105 transition-all"
                    >
                      Sign Up to Register
                    </Link>
                  ) : (
                    <Link
                      to={`/events/register?eventId=${event.id}`}
                      className="block w-full py-3 rounded-full bg-[#FF8FA3] text-white text-center hover:scale-105 transition-all shadow-md"
                    >
                      Register Now
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}