import { motion } from "framer-motion";
import { MessageCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCommunity } from "../context/CommunityContext";
import { CommunityGuidelinesModal } from "../components/shared/CommunityGuidelinesModal";
import { LeaveCommunityModal } from "../components/shared/LeaveCommunityModal";
import { GuestBlock } from "../components/shared/GuestBlock";

export function Community() {
  const {
    isGuest,
    user,
    isCommunityMember,
    joinCommunityMembership,
    leaveCommunityMembership,
  } = useAuth();
  const { discussions, memberCount, joinCommunity, isBanned, reports } = useCommunity();
  const navigate = useNavigate();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const visibleDiscussions = discussions.filter(
    (d) => (reports[d.authorId]?.count ?? 0) < 3
  );

  useEffect(() => {
    const saved = localStorage.getItem("communityAccepted");
    if (saved === "true") setAcceptedTerms(true);
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem("communityAccepted", "true");
    setAcceptedTerms(true);
  };

  const handleConfirmJoin = () => {
    setGuidelinesOpen(false);
    if (isGuest) {
      navigate("/signup");
      return;
    }
    if (user) joinCommunity(user.id);
    joinCommunityMembership();
  };

  const handleConfirmLeave = (reason) => {
    if (reason) {
      console.log("Leave reason:", reason);
    }
    leaveCommunityMembership();
    setLeaveOpen(false);
    navigate("/");
  };

  const userIsBanned = user && isBanned(user.id);

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* 🔒 GUEST BLOCK — uses shared component */}
        {isGuest && (
          <GuestBlock message="Sign up to join our creative community, share ideas, and connect with fellow makers." />
        )}

        {/* 🚫 BANNED BLOCK */}
        {!isGuest && userIsBanned && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-6">🚫</div>
            <h2
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 30px rgba(255,143,163,0.6)",
              }}
              className="text-4xl mb-4"
            >
              Access Restricted
            </h2>
            <p className="text-[#FFF6F8] text-xl max-w-md mx-auto">
              Your account has been flagged and you can no longer access the community.
            </p>
          </motion.div>
        )}

        {/* 📜 TERMS SCREEN */}
        {!isGuest && !userIsBanned && !acceptedTerms && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-[600px] mx-auto py-20"
          >
            <div className="rounded-[24px] bg-[#FFF6F8]/90 p-10 shadow-2xl text-center">
              <h2
                style={{
                  fontFamily: "Pacifico, cursive",
                  color: "#FF8FA3",
                  textShadow: "0 0 20px rgba(255,143,163,0.5)",
                }}
                className="text-3xl mb-6"
              >
                Community Guidelines
              </h2>

              <div className="text-left space-y-3 mb-8">
                {[
                  "Be respectful and kind to all members.",
                  "No hate speech, harassment, or harmful content.",
                  "Support and encourage fellow creators.",
                  "Keep discussions relevant and constructive.",
                  "Do not share others' work without credit.",
                  "Violations may result in removal from the community.",
                ].map((rule, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-[#FF8FA3] mt-1">•</span>
                    <p className="text-[#2E2A4A]">{rule}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAcceptTerms}
                className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
              >
                Accept & Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* ✅ MAIN COMMUNITY CONTENT */}
        {!isGuest && !userIsBanned && acceptedTerms && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl lg:text-7xl mb-4">
                <span
                  style={{
                    fontFamily: "Pacifico, cursive",
                    color: "#FF8FA3",
                    textShadow: "0 0 30px rgba(255, 143, 163, 0.6)",
                  }}
                >
                  Community
                </span>
              </h1>

              <p className="text-xl text-[#FFF6F8] mb-8">
                Connect with fellow creators and share your passion
              </p>

              {!isCommunityMember && (
                <button
                  onClick={() => setGuidelinesOpen(true)}
                  className="px-12 py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  Join Community
                </button>
              )}
            </motion.div>

            {isCommunityMember && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] bg-[#C8B6E2]/20 p-8 mb-12 text-center"
              >
                <h2 className="text-3xl text-[#FFF6F8] mb-2">
                  Welcome to the Community! 🎉
                </h2>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-lg">
                <Users className="w-12 h-12 text-[#FF8FA3] mb-4" />
                <h3 className="text-2xl text-[#2E2A4A] mb-1">
                  {memberCount.toLocaleString()}+ Members
                </h3>
                <p className="text-[#7A6C9D] text-sm">
                  and growing every day
                </p>
              </div>

              <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-lg">
                <MessageCircle className="w-12 h-12 text-[#C8B6E2] mb-4" />
                <h3 className="text-2xl text-[#2E2A4A] mb-1">
                  {visibleDiscussions.length} Active Discussions
                </h3>
                <p className="text-[#7A6C9D] text-sm">
                  join the conversation
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl text-[#2E2A4A]">Recent Discussions</h2>
                <button
                  onClick={() => navigate("/community/start-discussion")}
                  className="px-6 py-2.5 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
                >
                  + Start Discussion
                </button>
              </div>

              <div className="space-y-4">
                {visibleDiscussions.map((discussion) => (
                  <motion.div
                    key={discussion.id}
                    whileHover={{ scale: 1.01, x: 4 }}
                    onClick={() =>
                      navigate(`/community/discussion/${discussion.id}`)
                    }
                    className="flex items-center justify-between p-4 rounded-[16px] bg-gradient-to-r from-[#F6C1CC]/20 to-[#C8B6E2]/20 cursor-pointer hover:from-[#F6C1CC]/40 hover:to-[#C8B6E2]/40 transition-all"
                  >
                    <div>
                      <h4 className="text-lg text-[#2E2A4A]">
                        {discussion.title}
                      </h4>
                      <p className="text-sm text-[#7A6C9D]">
                        by {discussion.authorName} •{" "}
                        {discussion.replies.length} replies
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[#FF8FA3]">
                      <span>❤️ {discussion.likes}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {isCommunityMember && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setLeaveOpen(true)}
                  className="px-8 py-3 rounded-full bg-[#C8B6E2]/40 text-[#FFF6F8] hover:bg-[#FF8FA3] hover:text-white transition-all duration-300"
                >
                  Leave Community
                </button>
              </div>
            )}
          </>
        )}

      </div>

      <CommunityGuidelinesModal
        isOpen={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
        onConfirm={handleConfirmJoin}
        isGuest={isGuest}
      />

      <LeaveCommunityModal
        isOpen={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={handleConfirmLeave}
      />
    </div>
  );
}