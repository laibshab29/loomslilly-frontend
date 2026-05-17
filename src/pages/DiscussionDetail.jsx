import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCommunity } from "../context/CommunityContext";
import { useNotifications } from "../context/NotificationContext";
import { Flag, Trash2, X, AlertTriangle } from "lucide-react";

// ─── REPORT REASONS ───────────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Hate speech or discrimination",
  "Harassment or bullying",
  "Spam or misleading content",
  "Inappropriate or offensive content",
  "Sharing others' work without credit",
  "Other",
];

// ─── REPORT MODAL ────────────────────────────────────────────────────────────
function ReportModal({ target, onClose, onSubmit }) {
  const [step, setStep] = useState("reason"); // "reason" | "confirm" | "thanks"
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");

  const reason = selectedReason === "Other" ? otherText.trim() || "Other" : selectedReason;

  const handleConfirm = () => {
    setStep("thanks");
    setTimeout(() => {
      onSubmit(reason);
      onClose();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative z-10 bg-[#FFF6F8] rounded-[28px] p-8 shadow-2xl w-full max-w-md"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F6C1CC]/40 transition-all"
        >
          <X className="w-4 h-4 text-[#7A6C9D]" />
        </button>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Choose reason ── */}
          {step === "reason" && (
            <motion.div
              key="reason"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FF8FA3]/20 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-[#FF8FA3]" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-xl">
                    Report {target.type === "discussion" ? "Discussion" : "Reply"}
                  </h2>
                  {target.type === "reply" && (
                    <p className="text-xs text-[#7A6C9D]">by {target.authorName}</p>
                  )}
                </div>
              </div>

              <p className="text-[#7A6C9D] text-sm mb-4">
                Please select a reason <span className="text-[#FF8FA3]">*</span>
              </p>

              <div className="space-y-2 mb-6">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-[14px] text-sm transition-all border-2 ${
                      selectedReason === r
                        ? "border-[#FF8FA3] bg-[#FF8FA3]/10 text-[#2E2A4A]"
                        : "border-[#7A6C9D]/15 bg-[#F6C1CC]/10 text-[#7A6C9D] hover:border-[#FF8FA3]/40"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {selectedReason === "Other" && (
                <textarea
                  rows={3}
                  placeholder="Please describe the issue..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:border-[#FF8FA3] text-[#2E2A4A] placeholder:text-[#7A6C9D] text-sm mb-4"
                />
              )}

              <button
                onClick={() => setStep("confirm")}
                disabled={!selectedReason || (selectedReason === "Other" && !otherText.trim())}
                className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Confirm ── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">⚠️</div>
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-3">
                Are you sure?
              </h2>
              <p className="text-[#7A6C9D] text-sm mb-2">
                You're reporting this {target.type} for:
              </p>
              <div className="bg-[#F6C1CC]/30 rounded-[14px] px-4 py-3 mb-8">
                <p className="text-[#2E2A4A] font-medium text-sm">"{reason}"</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("reason")}
                  className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-[1.02] transition-all"
                >
                  Yes, Report
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Thank you ── */}
          {step === "thanks" && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="text-6xl mb-4"
              >
                🙏
              </motion.div>
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-2">
                Thank You
              </h2>
              <p className="text-[#7A6C9D] text-sm">
                Your feedback helps keep our community safe.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── REPORT NOTIFICATION MODAL (shown to discussion owner on notification click) ─
export function ReportNotificationModal({ notification, onClose }) {
  const isRemoved = notification.type === "report_removed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative z-10 bg-[#FFF6F8] rounded-[28px] p-8 shadow-2xl w-full max-w-md"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F6C1CC]/40 transition-all"
        >
          <X className="w-4 h-4 text-[#7A6C9D]" />
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{isRemoved ? "🚫" : "⚠️"}</div>
          <h2
            style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
            className="text-2xl mb-2"
          >
            {isRemoved ? "Discussion Removed" : "Discussion Reported"}
          </h2>
          <p className="text-[#7A6C9D] text-sm">
            {isRemoved
              ? "Your discussion has been removed after receiving 3 reports."
              : `Your discussion "${notification.discussionTitle}" has been reported.`}
          </p>
        </div>

        <div className="bg-[#F6C1CC]/20 rounded-[18px] p-5 mb-6">
          <p className="text-xs text-[#7A6C9D] mb-3 font-medium uppercase tracking-wide">
            {isRemoved ? "All reasons reported" : "Reason reported"}
          </p>
          <div className="space-y-2">
            {notification.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF8FA3] flex-shrink-0 mt-0.5" />
                <p className="text-[#2E2A4A] text-sm">"{r}"</p>
              </div>
            ))}
          </div>
        </div>

        {!isRemoved && (
          <p className="text-center text-xs text-[#7A6C9D]">
            Your discussion will be automatically removed if it receives 3 reports.
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-[1.02] transition-all"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function DiscussionDetail() {
  const { id } = useParams();
  const { user, isGuest } = useAuth();
  const {
    discussions,
    deleteDiscussion,
    addReply,
    deleteReply,
    reportDiscussion,
    reportReply,
    hasUserReportedDiscussion,
    hasUserReportedReply,
    isBanned,
  } = useCommunity();
  const { notifyDiscussionReported, notifyDiscussionRemoved } = useNotifications();
  const navigate = useNavigate();

  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [deleteDiscussionModal, setDeleteDiscussionModal] = useState(false);
  const [deleteReplyTarget, setDeleteReplyTarget] = useState(null);

  // Report modal state: { type: "discussion" } | { type: "reply", replyId, authorName }
  const [reportTarget, setReportTarget] = useState(null);

  // Hidden reply IDs (reported during this session — they're also filtered from state)
  const [hiddenReplies, setHiddenReplies] = useState(new Set());

  const discussion = discussions.find((d) => d.id === Number(id));

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  // ── GUARDS ────────────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Sign up to view discussions</p>
          <button onClick={() => navigate("/signup")} className="px-8 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (user && isBanned(user.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🚫</div>
          <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl mb-4">Access Restricted</h2>
          <p className="text-[#FFF6F8] max-w-sm mx-auto">Your account has been flagged.</p>
        </div>
      </div>
    );
  }

  // If discussion has 3+ reports, show removed notice
  if (discussion && discussion.reports.length >= 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🚫</div>
          <p style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl mb-4">Discussion Removed</p>
          <p className="text-[#FFF6F8] mb-6">This discussion was removed for violating community guidelines.</p>
          <button onClick={() => navigate("/community")} className="px-8 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">💬</div>
          <p style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-3xl">Discussion not found</p>
          <button onClick={() => navigate("/community")} className="mt-6 px-8 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === discussion.authorId;
  const alreadyReportedDiscussion = hasUserReportedDiscussion(discussion.id, user?.id);

  // Filter out replies with 1+ report OR hidden in session
  const visibleReplies = discussion.replies.filter(
    (r) => r.reports.length === 0 && !hiddenReplies.has(r.id)
  );

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleReply = () => {
    if (!replyText.trim()) { setReplyError("Reply cannot be empty"); return; }
    addReply(discussion.id, replyText.trim(), user);
    setReplyText("");
    setReplyError("");
  };

  const handleDeleteDiscussion = () => {
    deleteDiscussion(discussion.id);
    navigate("/community");
  };

  const handleDeleteReply = () => {
    if (deleteReplyTarget !== null) {
      deleteReply(discussion.id, deleteReplyTarget);
      setDeleteReplyTarget(null);
    }
  };

  const handleReportSubmit = (reason) => {
    if (!reportTarget) return;

    if (reportTarget.type === "discussion") {
      const { newCount, removed } = reportDiscussion(discussion.id, user.id, reason);

      if (removed) {
        // Notify owner: discussion removed
        notifyDiscussionRemoved({
          recipientId: discussion.authorId,
          discussionId: discussion.id,
          discussionTitle: discussion.title,
          reasons: [...discussion.reports.map((r) => r.reason), reason],
        });
      } else {
        // Notify owner: reported (not yet removed)
        notifyDiscussionReported({
          recipientId: discussion.authorId,
          discussionId: discussion.id,
          discussionTitle: discussion.title,
          reason,
        });
      }

      // If now at 3 reports, redirect away
      if (removed) {
        setTimeout(() => navigate("/community"), 500);
      }
    } else if (reportTarget.type === "reply") {
      reportReply(discussion.id, reportTarget.replyId, user.id, reason);
      // Hide immediately in UI
      setHiddenReplies((prev) => new Set([...prev, reportTarget.replyId]));
    }

    setReportTarget(null);
  };

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate("/community")}
          className="mb-8 px-5 py-2 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
        >
          ← Back to Community
        </button>

        {/* DISCUSSION CARD */}
        <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 style={{ fontFamily: "Fredoka, sans-serif" }} className="text-3xl text-[#2E2A4A]">
              {discussion.title}
            </h1>
            {isOwner && (
              <button
                onClick={() => setDeleteDiscussionModal(true)}
                className="p-2 rounded-full bg-[#FF8FA3]/20 hover:bg-[#FF8FA3]/40 transition-all flex-shrink-0"
                title="Delete discussion"
              >
                <Trash2 className="w-5 h-5 text-[#FF8FA3]" />
              </button>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-3 mb-6">
            <span className="text-sm text-[#7A6C9D]">by {discussion.authorName}</span>
            <span className="text-[#C8B6E2]">•</span>
            <span className="text-sm text-[#7A6C9D]">{formatDate(discussion.createdAt)}</span>

            {/* Report discussion — not for owner */}
            {!isOwner && (
              <button
                onClick={() => setReportTarget({ type: "discussion" })}
                disabled={alreadyReportedDiscussion}
                className={`ml-auto flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-all ${
                  alreadyReportedDiscussion
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#F6C1CC]/30 text-[#7A6C9D] hover:bg-[#F6C1CC]/60"
                }`}
              >
                <Flag className="w-3 h-3" />
                {alreadyReportedDiscussion ? "Reported" : "Report"}
              </button>
            )}

            {/* Report count badge visible to owner */}
            {isOwner && discussion.reports.length > 0 && (
              <span className="ml-auto text-xs px-3 py-1 rounded-full bg-[#FF8FA3]/20 text-[#FF8FA3]">
                {discussion.reports.length}/3 reports
              </span>
            )}
          </div>

          <p className="text-[#2E2A4A] leading-relaxed">{discussion.body}</p>
        </div>

        {/* REPLIES */}
        <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl mb-8">
          <h2 className="text-2xl text-[#2E2A4A] mb-6">{visibleReplies.length} Replies</h2>

          {visibleReplies.length === 0 ? (
            <p className="text-[#7A6C9D] text-center py-8">No replies yet — be the first to respond!</p>
          ) : (
            <div className="space-y-4">
              {visibleReplies.map((reply) => {
                const isReplyOwner = user?.id === reply.authorId;
                const alreadyReportedReply = hasUserReportedReply(discussion.id, reply.id, user?.id);

                return (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-[16px] bg-gradient-to-r from-[#F6C1CC]/20 to-[#C8B6E2]/20"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#2E2A4A]">{reply.authorName}</span>
                        <span className="text-xs text-[#7A6C9D]">{formatDate(reply.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Report reply — not for reply owner */}
                        {!isReplyOwner && (
                          <button
                            onClick={() => setReportTarget({
                              type: "reply",
                              replyId: reply.id,
                              authorName: reply.authorName,
                            })}
                            disabled={alreadyReportedReply}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
                              alreadyReportedReply
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-[#F6C1CC]/30 text-[#7A6C9D] hover:bg-[#F6C1CC]/60"
                            }`}
                          >
                            <Flag className="w-3 h-3" />
                            {alreadyReportedReply ? "Reported" : "Report"}
                          </button>
                        )}

                        {/* Delete own reply */}
                        {isReplyOwner && (
                          <button
                            onClick={() => setDeleteReplyTarget(reply.id)}
                            className="p-1 rounded-full hover:bg-[#FF8FA3]/20 transition-all"
                            title="Delete reply"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF8FA3]" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[#2E2A4A] text-sm leading-relaxed">{reply.text}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* REPLY INPUT */}
        <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl">
          <h3 className="text-xl text-[#2E2A4A] mb-4">Add a Reply</h3>
          <textarea
            placeholder="Share your thoughts..."
            value={replyText}
            onChange={(e) => { setReplyText(e.target.value); if (replyError) setReplyError(""); }}
            rows={4}
            className={inputStyle + " mb-2"}
          />
          {replyError && <p className="text-red-500 text-sm mb-3">{replyError}</p>}
          <button
            onClick={handleReply}
            className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Post Reply
          </button>
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* Report modal */}
        {reportTarget && (
          <ReportModal
            target={reportTarget}
            onClose={() => setReportTarget(null)}
            onSubmit={handleReportSubmit}
          />
        )}
      </AnimatePresence>

      {/* Delete Discussion Modal */}
      <AnimatePresence>
        {deleteDiscussionModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#FFF6F8] rounded-[24px] p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-3">Delete Discussion?</h2>
              <p className="text-[#7A6C9D] mb-8">This will permanently remove the discussion and all its replies.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteDiscussionModal(false)} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">Cancel</button>
                <button onClick={handleDeleteDiscussion} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Reply Modal */}
      <AnimatePresence>
        {deleteReplyTarget !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#FFF6F8] rounded-[24px] p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              <h2 style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }} className="text-2xl mb-3">Delete Reply?</h2>
              <p className="text-[#7A6C9D] mb-8">This reply will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteReplyTarget(null)} className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all">Cancel</button>
                <button onClick={handleDeleteReply} className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}