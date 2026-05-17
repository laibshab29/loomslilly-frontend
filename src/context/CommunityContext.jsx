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
    likedBy: [],
    reports: [],
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
    likedBy: [],
    reports: [],
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
    likedBy: [],
    reports: [],
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
    likedBy: [],
    reports: [],
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
    likedBy: [],
    reports: [],
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
    likedBy: [],
    reports: [],
  },
];

export function CommunityProvider({ children }) {
  const [discussions, setDiscussions] = useState(() => {
    try {
      const saved = localStorage.getItem("discussions");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate: ensure likedBy, reports, reply.reports exist
        return parsed.map((d) => ({
          ...d,
          likedBy: d.likedBy ?? [],
          reports: d.reports ?? [],
          replies: (d.replies ?? []).map((r) => ({
            ...r,
            reports: r.reports ?? [],
          })),
        }));
      }
      return DEFAULT_DISCUSSIONS;
    } catch {
      return DEFAULT_DISCUSSIONS;
    }
  });

  const [memberIds, setMemberIds] = useState(() => {
    try {
      const saved = localStorage.getItem("communityMemberIds");
      return saved ? JSON.parse(saved) : [999, 998, 997, 996, 995, 994];
    } catch {
      return [999, 998, 997, 996, 995, 994];
    }
  });

  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem("communityReports");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bannedIds, setBannedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("communityBanned");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ─── PERSIST ──────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem("discussions", JSON.stringify(discussions)); }
    catch (e) { console.warn("discussions save failed:", e); }
  }, [discussions]);

  useEffect(() => {
    try { localStorage.setItem("communityMemberIds", JSON.stringify(memberIds)); }
    catch (e) { console.warn("memberIds save failed:", e); }
  }, [memberIds]);

  useEffect(() => {
    try { localStorage.setItem("communityReports", JSON.stringify(reports)); }
    catch (e) { console.warn("reports save failed:", e); }
  }, [reports]);

  useEffect(() => {
    try { localStorage.setItem("communityBanned", JSON.stringify(bannedIds)); }
    catch (e) { console.warn("bannedIds save failed:", e); }
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
      likedBy: [],
      reports: [],
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
                  reports: [],
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

  // ─── DISCUSSION LIKES ─────────────────────────────────────────
  const likeDiscussion = (discussionId, userId) => {
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== discussionId) return d;
        const likedBy = d.likedBy ?? [];
        const alreadyLiked = likedBy.includes(userId);
        return {
          ...d,
          likes: Math.max(0, (d.likes || 0) + (alreadyLiked ? -1 : 1)),
          likedBy: alreadyLiked
            ? likedBy.filter((id) => id !== userId)
            : [...likedBy, userId],
        };
      })
    );
  };

  const isDiscussionLikedByUser = (discussionId, userId) => {
    const d = discussions.find((d) => d.id === discussionId);
    return (d?.likedBy ?? []).includes(userId);
  };

  // ─── REPORT DISCUSSION ────────────────────────────────────────
  const reportDiscussion = (discussionId, reportingUserId, reason) => {
    let result = { alreadyReported: false, newCount: 0, removed: false };

    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== discussionId) return d;
        const alreadyReported = d.reports.some(
          (r) => r.reportingUserId === reportingUserId
        );
        if (alreadyReported) {
          result = { alreadyReported: true, newCount: d.reports.length, removed: false };
          return d;
        }
        const newReports = [
          ...d.reports,
          { reportingUserId, reason, createdAt: Date.now() },
        ];
        result = {
          alreadyReported: false,
          newCount: newReports.length,
          removed: newReports.length >= 3,
        };
        return { ...d, reports: newReports };
      })
    );

    return result;
  };

  // ─── REPORT REPLY ─────────────────────────────────────────────
  const reportReply = (discussionId, replyId, reportingUserId, reason) => {
    let result = { alreadyReported: false, removed: false };

    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id !== discussionId) return d;
        return {
          ...d,
          replies: d.replies.map((r) => {
            if (r.id !== replyId) return r;
            const alreadyReported = r.reports.some(
              (rp) => rp.reportingUserId === reportingUserId
            );
            if (alreadyReported) {
              result = { alreadyReported: true, removed: false };
              return r;
            }
            const newReports = [
              ...r.reports,
              { reportingUserId, reason, createdAt: Date.now() },
            ];
            result = { alreadyReported: false, removed: true };
            return { ...r, reports: newReports };
          }),
        };
      })
    );

    return result;
  };

  // ─── HELPERS ──────────────────────────────────────────────────
  const hasUserReportedDiscussion = (discussionId, userId) => {
    const d = discussions.find((d) => d.id === discussionId);
    return d?.reports.some((r) => r.reportingUserId === userId) ?? false;
  };

  const hasUserReportedReply = (discussionId, replyId, userId) => {
    const d = discussions.find((d) => d.id === discussionId);
    const reply = d?.replies.find((r) => r.id === replyId);
    return reply?.reports.some((r) => r.reportingUserId === userId) ?? false;
  };

  const getDiscussionReportReasons = (discussionId) => {
    const d = discussions.find((d) => d.id === discussionId);
    return d?.reports.map((r) => r.reason) ?? [];
  };

  // ─── LEGACY USER-LEVEL REPORT (kept for ban system) ──────────
  const reportUser = (reportedUserId, reportingUserId) => {
    setReports((prev) => {
      const existing = prev[reportedUserId] || { count: 0, reportedBy: [] };
      if (existing.reportedBy.includes(reportingUserId)) return prev;
      const updated = {
        count: existing.count + 1,
        reportedBy: [...existing.reportedBy, reportingUserId],
      };
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
    return reports[reportedUserId]?.reportedBy?.includes(reportingUserId) ?? false;
  };

  const visibleDiscussions = discussions.filter((d) => d.reports.length < 3);

  return (
    <CommunityContext.Provider
      value={{
        discussions,
        visibleDiscussions,
        memberCount,
        addDiscussion,
        deleteDiscussion,
        addReply,
        deleteReply,
        likeDiscussion,
        isDiscussionLikedByUser,
        reportDiscussion,
        reportReply,
        hasUserReportedDiscussion,
        hasUserReportedReply,
        getDiscussionReportReasons,
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