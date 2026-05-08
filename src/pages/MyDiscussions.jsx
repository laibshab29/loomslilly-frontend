import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCommunity } from "../context/CommunityContext";
import { Trash2 } from "lucide-react";

export function MyDiscussions() {
  const { user, role } = useAuth();
  const { discussions, deleteDiscussion } = useCommunity();
  const navigate = useNavigate();

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  if (role === "guest" || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span
          style={{
            fontFamily: "Pacifico",
            color: "#FF8FA3",
            fontSize: "36px",
            textShadow: "0 0 30px rgba(255,143,163,0.7)",
          }}
        >
          Please sign in to view your discussions
        </span>
      </div>
    );
  }

  const myDiscussions = discussions.filter((d) => d.authorId === user.id);

  const confirmDelete = () => {
    if (deleteTargetId !== null) {
      deleteDiscussion(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl">
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              My{" "}
            </span>
            <span
              style={{
                fontFamily: "Fredoka, sans-serif",
                color: "#FFF6F8",
              }}
            >
              Discussions
            </span>
          </h1>
        </div>

        <div className="flex justify-center mb-10">
          <button
            onClick={() => navigate("/community/start-discussion")}
            className="px-6 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
          >
            + Start New Discussion
          </button>
        </div>

        {myDiscussions.length > 0 ? (
          <div className="space-y-4 max-w-[800px] mx-auto">
            {myDiscussions.map((discussion) => (
              <motion.div
                key={discussion.id}
                whileHover={{ scale: 1.01 }}
                className="rounded-[24px] bg-[#FFF6F8]/90 p-6 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      navigate(`/community/discussion/${discussion.id}`)
                    }
                  >
                    <h2 className="text-xl text-[#2E2A4A] mb-1">
                      {discussion.title}
                    </h2>
                    <p className="text-[#7A6C9D] text-sm line-clamp-2">
                      {discussion.body}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-[#7A6C9D]">
                      <span>💬 {discussion.replies.length} replies</span>
                      <span>❤️ {discussion.likes} likes</span>
                      <span>{formatDate(discussion.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTargetId(discussion.id)}
                    className="p-2 rounded-full bg-[#FF8FA3]/20 hover:bg-[#FF8FA3]/40 transition-all flex-shrink-0"
                    title="Delete discussion"
                  >
                    <Trash2 className="w-5 h-5 text-[#FF8FA3]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span
              style={{
                fontFamily: "Pacifico",
                color: "#FF8FA3",
                fontSize: "32px",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              You haven't started any discussions yet
            </span>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteTargetId !== null && (
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
                style={{
                  fontFamily: "Pacifico, cursive",
                  color: "#FF8FA3",
                  textShadow: "0 0 20px rgba(255,143,163,0.5)",
                }}
                className="text-2xl mb-3"
              >
                Delete Discussion?
              </h2>
              <p className="text-[#7A6C9D] mb-8">
                This will permanently remove the discussion and all its replies.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-3 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}