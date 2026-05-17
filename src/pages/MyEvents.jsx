import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Trash2, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { ConfirmModal } from "../components/shared/ConfirmModal";

const EVENT_TYPES = ["Workshop", "Exhibition", "Pop-up", "Meetup", "Other"];

const TYPE_EMOJI = {
  Workshop: "🎨", Exhibition: "🖼️", "Pop-up": "🎪", Meetup: "☕", Other: "✨",
};

const inputStyle =
  "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] transition-colors";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// 🔥 Returns first picture, first brochure image, or null
function getCardImage(event) {
  if (event.pictures && event.pictures.length > 0) return event.pictures[0];
  if (event.brochures && event.brochures.length > 0) {
    const imgBrochure = event.brochures.find((b) => typeof b === "string" && b.startsWith("data:image"));
    if (imgBrochure) return imgBrochure;
  }
  return null;
}

export function MyEvents() {
  const { user } = useAuth();
  const { events, deleteEvent, updateEvent, getSlotsLeft, isFull } = useEvents();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 🔥 ConfirmModal state
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", variant: "confirm", onConfirm: null });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const myEvents = events.filter((e) => e.authorId === user?.id);
  const today = new Date().toISOString().split("T")[0];
  const upcoming = myEvents.filter((e) => e.date >= today);
  const past = myEvents.filter((e) => e.date < today);

  // 🔥 Open edit form with current values pre-filled
  const handleEdit = (event) => {
    setEditingId(event.id);
    setEditForm({
      name: event.name,
      date: event.date,
      type: event.type,
      venue: event.venue,
      slots: event.slots,
      link: event.link ?? "",
      details: event.details,
      contactEmail: event.contactEmail ?? "",
      contactPhone: event.contactPhone ?? "",
    });
  };

  // 🔥 Save — fallback to original if field was cleared
  const handleSaveConfirmed = (originalEvent) => {
    const updated = {
      name:         editForm.name?.trim()         || originalEvent.name,
      date:         editForm.date                 || originalEvent.date,
      type:         editForm.type                 || originalEvent.type,
      venue:        editForm.venue?.trim()        || originalEvent.venue,
      slots:        editForm.slots !== "" && editForm.slots !== undefined
                      ? Number(editForm.slots)
                      : originalEvent.slots,
      link:         editForm.link?.trim()         ?? originalEvent.link,
      details:      editForm.details?.trim()      || originalEvent.details,
      contactEmail: editForm.contactEmail?.trim() ?? originalEvent.contactEmail,
      contactPhone: editForm.contactPhone?.trim() ?? originalEvent.contactPhone,
    };
    updateEvent(originalEvent.id, updated);
    setEditingId(null);
    setEditForm({});
    closeModal();
  };

  // 🔥 Trigger save confirm modal
  const handleSaveRequest = (originalEvent) => {
    setModal({
      isOpen: true,
      title: "Save Changes?",
      message: "Are you sure you want to update this event?",
      variant: "confirm",
      onConfirm: () => handleSaveConfirmed(originalEvent),
    });
  };

  // 🔥 Trigger delete confirm modal
  const handleDeleteRequest = (id) => {
    setModal({
      isOpen: true,
      title: "Delete Event?",
      message: "This action cannot be undone. Your event will be permanently removed.",
      variant: "confirm",
      onConfirm: () => {
        deleteEvent(id);
        closeModal();
      },
    });
  };

  const renderCard = (event, index, isPast = false) => {
    const full = isFull(event.id);
    const slotsLeft = getSlotsLeft(event.id);
    const emoji = TYPE_EMOJI[event.type] || "✨";
    const cardImage = getCardImage(event);
    const isEditing = editingId === event.id;

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className={`rounded-[20px] bg-[#FFF6F8]/90 border-2 border-[#7A6C9D]/20 overflow-hidden shadow-lg ${isPast ? "opacity-70" : ""}`}
      >
        {/* BANNER */}
        <div className={`h-24 flex items-center justify-center text-4xl relative ${isPast ? "bg-gradient-to-br from-[#F6C1CC]/40 to-[#C8B6E2]/40 grayscale" : "bg-gradient-to-br from-[#F6C1CC] to-[#C8B6E2]"}`}>
          {cardImage ? (
            <img src={cardImage} alt={event.name} className="w-full h-full object-cover" />
          ) : (
            emoji
          )}

          {/* 🔥 EDIT BUTTON */}
          {!isPast && (
            <button
              onClick={() => isEditing ? (setEditingId(null), setEditForm({})) : handleEdit(event)}
              className="absolute top-3 right-10 p-2 rounded-full bg-white/60 hover:bg-white/90 transition-all"
              title={isEditing ? "Cancel edit" : "Edit event"}
            >
              <Pencil className="w-4 h-4 text-[#C8B6E2]" />
            </button>
          )}

          {/* DELETE BUTTON */}
          <button
            onClick={() => handleDeleteRequest(event.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/60 hover:bg-white/90 transition-all"
            title="Delete event"
          >
            <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
          </button>

          {full && !isPast && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">Full</span>
          )}
          {isPast && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gray-400 text-white text-xs">Ended</span>
          )}
        </div>

        {/* NORMAL VIEW */}
        {!isEditing && (
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg text-[#2E2A4A] leading-snug">{event.name}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[#C8B6E2]/30 text-[#7A6C9D] flex-shrink-0">{event.type}</span>
            </div>
            <p className="text-sm text-[#7A6C9D] mb-3 line-clamp-2">{event.details}</p>
            <div className="space-y-1 text-sm text-[#7A6C9D]">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(event.date)}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.venue}</div>
              {!isPast && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {full
                    ? <span className="text-red-400 font-medium">No slots left</span>
                    : <>{slotsLeft} slots left</>
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔥 EDIT VIEW */}
        {isEditing && (
          <div className="p-5 space-y-3">

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Event Name</label>
              <input
                placeholder={event.name}
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Date</label>
              <input
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                value={editForm.date}
                onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Event Type</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                className={inputStyle}
              >
                <option value="">Select type...</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Venue</label>
              <input
                placeholder={event.venue}
                value={editForm.venue}
                onChange={(e) => setEditForm((p) => ({ ...p, venue: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Slots Available</label>
              <input
                type="number"
                min={event.slotsUsed || 1}
                placeholder={String(event.slots)}
                value={editForm.slots}
                onChange={(e) => setEditForm((p) => ({ ...p, slots: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Details</label>
              <textarea
                rows={3}
                placeholder={event.details}
                value={editForm.details}
                onChange={(e) => setEditForm((p) => ({ ...p, details: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Contact Email</label>
              <input
                placeholder={event.contactEmail || "Email"}
                value={editForm.contactEmail}
                onChange={(e) => setEditForm((p) => ({ ...p, contactEmail: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Contact Phone</label>
              <input
                placeholder={event.contactPhone || "Phone"}
                value={editForm.contactPhone}
                onChange={(e) => setEditForm((p) => ({ ...p, contactPhone: e.target.value }))}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs text-[#7A6C9D] mb-1 block">Website Link</label>
              <input
                placeholder={event.link || "https://..."}
                value={editForm.link}
                onChange={(e) => setEditForm((p) => ({ ...p, link: e.target.value }))}
                className={inputStyle}
              />
            </div>

            {/* SAVE */}
            <button
              onClick={() => handleSaveRequest(event)}
              className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all"
            >
              Save Changes
            </button>

            {/* CANCEL */}
            <button
              onClick={() => { setEditingId(null); setEditForm({}); }}
              className="w-full py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all"
            >
              Cancel
            </button>

          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1100px] mx-auto">

        {/* 🔥 CENTERED HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl mb-3">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 30px rgba(255,143,163,0.6)" }}>
              My{" "}
            </span>
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
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
              {upcoming.map((event, index) => renderCard(event, index, false))}
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
              {past.map((event, index) => renderCard(event, index, true))}
            </div>
          </section>
        )}
      </div>

      {/* 🔥 SHARED CONFIRM MODAL */}
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