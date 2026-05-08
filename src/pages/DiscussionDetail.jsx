import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCommunity } from "../context/CommunityContext";
import { Flag, Trash2 } from "lucide-react";

export function DiscussionDetail() {
  const { id } = useParams();
  const { user, isGuest } = useAuth();
  const {
    discussions,
    deleteDiscussion,
    addReply,
    deleteReply,
    reportUser,
    isBanned,
    isReported,
  } = useCommunity();
  const navigate = useNavigate();

  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [deleteDiscussionModal, setDeleteDiscussionModal] = useState(false);
  const [deleteReplyTarget, setDeleteReplyTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  const discussion = discussions.find((d) => d.id === Number(id));

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  // ── GUARDS ───────────────────────────────────────────────────

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">
            Sign up to view discussions
          </p>
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

  // 🔥 Step 23 — banned block, no re-entry
  if (user && isBanned(user.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🚫</div>
          <h2
            style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
            className="text-3xl mb-4"
          >
            Access Restricted
          </h2>
          <p className="text-[#FFF6F8] max-w-sm mx-auto">
            Your account has been flagged. You can no longer participate in discussions.
          </p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">💬</div>
          <p
            style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
            className="text-3xl"
          >
            Discussion not found
          </p>
          <button
            onClick={() => navigate("/community")}
            className="mt-6 px-8 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === discussion.authorId;

  // ── HANDLERS ─────────────────────────────────────────────────

  const handleReply = () => {
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty");
      return;
    }
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

  const handleReport = () => {
    if (!reportTarget) return;
    reportUser(reportTarget.userId, user.id);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportTarget(null);
    }, 1500);
  };

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
            <h1
              style={{ fontFamily: "Fredoka, sans-serif" }}
              className="text-3xl text-[#2E2A4A]"
            >
              {discussion.title}
            </h1>

            {/* 🔥 Owner delete control */}
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

          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-[#7A6C9D]">
              by {discussion.authorName}
            </span>
            <span className="text-[#C8B6E2]">•</span>
            <span className="text-sm text-[#7A6C9D]">
              {formatDate(discussion.createdAt)}
            </span>

            {/* 🔥 Report author — not own post */}
            {!isOwner && (
              <button
                onClick={() =>
                  setReportTarget({
                    userId: discussion.authorId,
                    name: discussion.authorName,
                  })
                }
                disabled={isReported(discussion.authorId, user?.id)}
                className={`ml-auto flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-all
                  ${
                    isReported(discussion.authorId, user?.id)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#F6C1CC]/30 text-[#7A6C9D] hover:bg-[#F6C1CC]/60"
                  }`}
              >
                <Flag className="w-3 h-3" />
                {isReported(discussion.authorId, user?.id)
                  ? "Reported"
                  : "Report"}
              </button>
            )}
          </div>

          <p className="text-[#2E2A4A] leading-relaxed">{discussion.body}</p>
        </div>

        {/* REPLIES */}
        <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl mb-8">
          <h2 className="text-2xl text-[#2E2A4A] mb-6">
            {discussion.replies.length} Replies
          </h2>

          {discussion.replies.length === 0 ? (
            <p className="text-[#7A6C9D] text-center py-8">
              No replies yet — be the first to respond!
            </p>
          ) : (
            <div className="space-y-4">
              {discussion.replies.map((reply) => {
                const isReplyOwner = user?.id === reply.authorId;
                const replyAuthorBanned = isBanned(reply.authorId);

                return (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-[16px] bg-gradient-to-r from-[#F6C1CC]/20 to-[#C8B6E2]/20"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#2E2A4A]">
                          {reply.authorName}
                        </span>

                        {/* 🔥 Banned user warning on reply */}
                        {replyAuthorBanned && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500">
                            Flagged User
                          </span>
                        )}

                        <span className="text-xs text-[#7A6C9D]">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Report reply author */}
                        {!isReplyOwner && (
                          <button
                            onClick={() =>
                              setReportTarget({
                                userId: reply.authorId,
                                name: reply.authorName,
                              })
                            }
                            disabled={isReported(reply.authorId, user?.id)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all
                              ${
                                isReported(reply.authorId, user?.id)
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-[#F6C1CC]/30 text-[#7A6C9D] hover:bg-[#F6C1CC]/60"
                              }`}
                          >
                            <Flag className="w-3 h-3" />
                            {isReported(reply.authorId, user?.id)
                              ? "Reported"
                              : "Report"}
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

                    <p className="text-[#2E2A4A] text-sm leading-relaxed">
                      {reply.text}
                    </p>
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
            onChange={(e) => {
              setReplyText(e.target.value);
              if (replyError) setReplyError("");
            }}
            rows={4}
            className={inputStyle + " mb-2"}
          />
          {replyError && (
            <p className="text-red-500 text-sm mb-3">{replyError}</p>
          )}

          <button
            onClick={handleReply}
            className="w-full py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            Post Reply
          </button>
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}

      {/* Delete Discussion Modal */}
      <AnimatePresence>
        {deleteDiscussionModal && (
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
              className="bg-[#FFF6F8] rounded-[24px] p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              <h2
                style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
                className="text-2xl mb-3"
              >
                Delete Discussion?
              </h2>
              <p className="text-[#7A6C9D] mb-8">
                This will permanently remove the discussion and all its replies.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteDiscussionModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDiscussion}
                  className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Reply Modal */}
      <AnimatePresence>
        {deleteReplyTarget !== null && (
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
              className="bg-[#FFF6F8] rounded-[24px] p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              <h2
                style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
                className="text-2xl mb-3"
              >
                Delete Reply?
              </h2>
              <p className="text-[#7A6C9D] mb-8">
                This reply will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteReplyTarget(null)}
                  className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReply}
                  className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report User Modal */}
      <AnimatePresence>
        {reportTarget && (
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
              className="bg-[#FFF6F8] rounded-[24px] p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
            >
              {reportSuccess ? (
                <>
                  <div className="text-5xl mb-4">✅</div>
                  <h2
                    style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
                    className="text-2xl"
                  >
                    Reported
                  </h2>
                  <p className="text-[#7A6C9D] mt-2">
                    Thank you for keeping the community safe.
                  </p>
                </>
              ) : (
                <>
                  <h2
                    style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
                    className="text-2xl mb-3"
                  >
                    Report User?
                  </h2>
                  <p className="text-[#7A6C9D] mb-8">
                    Report{" "}
                    <span className="text-[#2E2A4A] font-medium">
                      {reportTarget.name}
                    </span>{" "}
                    for violating community guidelines?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setReportTarget(null)}
                      className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReport}
                      className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                    >
                      Report
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}