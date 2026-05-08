import { createContext, useContext, useState, useEffect } from "react";

const CommunityContext = createContext();

const DEFAULT_DISCUSSIONS = [
  {
    id: 1,
    title: "Share Your Latest Projects!",
    body: "Show off what you've been working on lately. Photos welcome!",
    authorId: 999,
    authorName: "LilyCrafter",
    createdAt: Date.now() - 86400000 * 3,
    replies: [],
    likes: 342,
  },
  {
    id: 2,
    title: "Tips for Beginners",
    body: "What advice would you give to someone just starting out?",
    authorId: 998,
    authorName: "YarnQueen",
    createdAt: Date.now() - 86400000 * 5,
    replies: [],
    likes: 234,
  },
  {
    id: 3,
    title: "Color Combination Ideas",
    body: "Struggling with color palettes? Share your favorites here.",
    authorId: 997,
    authorName: "PaintPro",
    createdAt: Date.now() - 86400000 * 7,
    replies: [],
    likes: 289,
  },
  {
    id: 4,
    title: "Weekend Craft Challenge",
    body: "This weekend's challenge: make something using only 3 colors!",
    authorId: 996,
    authorName: "CraftMaster",
    createdAt: Date.now() - 86400000 * 2,
    replies: [],
    likes: 198,
  },
  {
    id: 5,
    title: "Tool Recommendations",
    body: "What tools do you swear by? Share your must-haves.",
    authorId: 995,
    authorName: "StitchWitch",
    createdAt: Date.now() - 86400000 * 1,
    replies: [],
    likes: 456,
  },
  {
    id: 6,
    title: "Pattern Sharing Thread",
    body: "Drop your favorite patterns here — free or paid!",
    authorId: 994,
    authorName: "KnitKing",
    createdAt: Date.now() - 86400000 * 6,
    replies: [],
    likes: 401,
  },
];

export function CommunityProvider({ children }) {

  const [discussions, setDiscussions] = useState(() => {
    try {
      const saved = localStorage.getItem("discussions");
      return saved ? JSON.parse(saved) : DEFAULT_DISCUSSIONS;
    } catch {
      return DEFAULT_DISCUSSIONS;
    }
  });

  // 🔥 Member count — placeholder for backend
  // Each unique userId who accepted terms counts as a member
  const [memberIds, setMemberIds] = useState(() => {
    try {
      const saved = localStorage.getItem("communityMemberIds");
      return saved ? JSON.parse(saved) : [999, 998, 997, 996, 995, 994];
    } catch {
      return [999, 998, 997, 996, 995, 994];
    }
  });

  // 🔥 Reported users: { [reportedUserId]: { count, reportedBy: [userId] } }
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem("communityReports");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 🔥 Banned user IDs
  const [bannedIds, setBannedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("communityBanned");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ─── PERSIST ─────────────────────────────────────────────────

  useEffect(() => {
    try {
      localStorage.setItem("discussions", JSON.stringify(discussions));
    } catch (e) {
      console.warn("discussions save failed:", e);
    }
  }, [discussions]);

  useEffect(() => {
    try {
      localStorage.setItem("communityMemberIds", JSON.stringify(memberIds));
    } catch (e) {
      console.warn("memberIds save failed:", e);
    }
  }, [memberIds]);

  useEffect(() => {
    try {
      localStorage.setItem("communityReports", JSON.stringify(reports));
    } catch (e) {
      console.warn("reports save failed:", e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem("communityBanned", JSON.stringify(bannedIds));
    } catch (e) {
      console.warn("bannedIds save failed:", e);
    }
  }, [bannedIds]);

  // ─── MEMBER ACTIONS ───────────────────────────────────────────

  const joinCommunity = (userId) => {
    if (!memberIds.includes(userId)) {
      setMemberIds((prev) => [...prev, userId]);
    }
  };

  const memberCount = memberIds.length;

  // ─── DISCUSSION ACTIONS ───────────────────────────────────────

  const addDiscussion = (title, body, user) => {
    const newDiscussion = {
      id: Date.now(),
      title,
      body,
      authorId: user.id,
      authorName: user.name,
      createdAt: Date.now(),
      replies: [],
      likes: 0,
    };
    setDiscussions((prev) => [newDiscussion, ...prev]);
    return newDiscussion.id;
  };

  const deleteDiscussion = (id) => {
    setDiscussions((prev) => prev.filter((d) => d.id !== id));
  };

  const addReply = (discussionId, text, user) => {
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              replies: [
                ...d.replies,
                {
                  id: Date.now(),
                  text,
                  authorId: user.id,
                  authorName: user.name,
                  createdAt: Date.now(),
                },
              ],
            }
          : d
      )
    );
  };

  const deleteReply = (discussionId, replyId) => {
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === discussionId
          ? { ...d, replies: d.replies.filter((r) => r.id !== replyId) }
          : d
      )
    );
  };

  // ─── REPORT / BAN ACTIONS ─────────────────────────────────────

  const reportUser = (reportedUserId, reportingUserId) => {
    setReports((prev) => {
      const existing = prev[reportedUserId] || { count: 0, reportedBy: [] };

      // Prevent duplicate reports from same user
      if (existing.reportedBy.includes(reportingUserId)) return prev;

      const updated = {
        count: existing.count + 1,
        reportedBy: [...existing.reportedBy, reportingUserId],
      };

      // 🔥 Auto-ban after 3 reports (frontend threshold — backend will override)
      if (updated.count >= 3) {
        setBannedIds((prev) =>
          prev.includes(reportedUserId) ? prev : [...prev, reportedUserId]
        );
      }

      return { ...prev, [reportedUserId]: updated };
    });
  };

  const isBanned = (userId) => bannedIds.includes(userId);

  const isReported = (reportedUserId, reportingUserId) => {
    return (
      reports[reportedUserId]?.reportedBy?.includes(reportingUserId) ?? false
    );
  };

  return (
    <CommunityContext.Provider
      value={{
        discussions,
        memberCount,
        addDiscussion,
        deleteDiscussion,
        addReply,
        deleteReply,
        reportUser,
        isBanned,
        isReported,
        joinCommunity,
        reports,
        bannedIds,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => useContext(CommunityContext);