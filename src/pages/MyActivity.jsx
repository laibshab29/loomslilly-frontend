import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useCommunity } from "../context/CommunityContext";
import { Heart, MessageCircle, Package } from "lucide-react";

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function MyActivity() {
  const { user, isGuest, role } = useAuth();
  const { products } = useProducts();
  const { discussions } = useCommunity();
  const navigate = useNavigate();

  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">Sign in to view your activity</p>
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

  const isSeller = role === "seller" || role === "both";

  // 🔥 Likes received on user's uploaded products
  const myProducts = products.filter((p) => p.sellerId === user?.id);

  // 🔥 User's discussions
  const myDiscussions = discussions.filter((d) => d.authorId === user?.id);

  // 🔥 Likes on user's discussions
  const discussionsWithLikes = myDiscussions.filter((d) => d.likes > 0);

  // 🔥 Replies received on user's discussions (from others)
  const repliesReceived = myDiscussions.flatMap((d) =>
    d.replies
      .filter((r) => r.authorId !== user?.id)
      .map((r) => ({ ...r, discussionTitle: d.title, discussionId: d.id }))
  );

  // 🔥 Replies user made in any discussion
  const myReplies = discussions.flatMap((d) =>
    d.replies
      .filter((r) => r.authorId === user?.id)
      .map((r) => ({ ...r, discussionTitle: d.title, discussionId: d.id }))
  );

  const SectionHeader = ({ icon, title, count }) => (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl text-[#FFF6F8]" style={{ fontFamily: "Fredoka, sans-serif" }}>
        {title}
      </h2>
      <span className="px-2 py-0.5 rounded-full bg-[#FF8FA3]/20 text-[#FF8FA3] text-sm">
        {count}
      </span>
    </div>
  );

  const EmptyState = ({ text }) => (
    <div className="rounded-[16px] bg-[#FFF6F8]/10 border border-[#FFF6F8]/20 p-8 text-center mb-10">
      <p className="text-[#C8B6E2]">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[900px] mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3", textShadow: "0 0 35px rgba(255,143,163,0.7)" }}>
              My
            </span>
            {" "}
            <span style={{ fontFamily: "Fredoka, sans-serif", color: "#FFF6F8" }}>
              Activity
            </span>
          </h1>
          <p className="text-[#C8B6E2]">Your community presence at a glance</p>
        </div>

        {/* ── SELLER/BOTH: LIKES ON PRODUCTS ── */}
        {isSeller && (
          <section className="mb-10">
            <SectionHeader icon="❤️" title="Likes on Your Products" count={myProducts.reduce((s, p) => s + (p.likes || 0), 0)} />

            {myProducts.length > 0 ? (
              <div className="space-y-3">
                {myProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="rounded-[16px] bg-[#FFF6F8]/90 p-5 flex items-center justify-between gap-4 cursor-pointer shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[#F6C1CC]/40 to-[#C8B6E2]/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image || product.images?.[0] ? (
                          <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-[#C8B6E2]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#2E2A4A] font-medium">{product.name}</p>
                        <p className="text-[#7A6C9D] text-xs capitalize">{product.category} • {product.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#FF8FA3] flex-shrink-0">
                      <Heart className="w-4 h-4 fill-[#FF8FA3]" />
                      <span className="font-semibold">{product.likes || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState text="You haven't uploaded any products yet." />
            )}
          </section>
        )}

        {/* ── LIKES ON USER'S DISCUSSIONS ── */}
        <section className="mb-10">
          <SectionHeader
            icon="💬"
            title="Likes on Your Discussions"
            count={discussionsWithLikes.reduce((s, d) => s + d.likes, 0)}
          />

          {discussionsWithLikes.length > 0 ? (
            <div className="space-y-3">
              {discussionsWithLikes.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/community/discussion/${d.id}`)}
                  className="rounded-[16px] bg-[#FFF6F8]/90 p-5 flex items-center justify-between gap-4 cursor-pointer shadow-md"
                >
                  <div>
                    <p className="text-[#2E2A4A] font-medium">{d.title}</p>
                    <p className="text-[#7A6C9D] text-xs">{formatDate(d.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF8FA3] flex-shrink-0">
                    <Heart className="w-4 h-4 fill-[#FF8FA3]" />
                    <span className="font-semibold">{d.likes}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState text="None of your discussions have likes yet." />
          )}
        </section>

        {/* ── REPLIES RECEIVED ON USER'S DISCUSSIONS ── */}
        <section className="mb-10">
          <SectionHeader icon="📩" title="Replies to Your Discussions" count={repliesReceived.length} />

          {repliesReceived.length > 0 ? (
            <div className="space-y-3">
              {repliesReceived.map((reply) => (
                <motion.div
                  key={reply.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/community/discussion/${reply.discussionId}`)}
                  className="rounded-[16px] bg-[#FFF6F8]/90 p-5 shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-sm text-[#7A6C9D]">
                      In: <span className="text-[#FF8FA3]">{reply.discussionTitle}</span>
                    </p>
                    <span className="text-xs text-[#C8B6E2] flex-shrink-0">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-[#2E2A4A] text-sm leading-relaxed line-clamp-2">{reply.text}</p>
                  <p className="text-xs text-[#7A6C9D] mt-2">— {reply.authorName}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState text="No one has replied to your discussions yet." />
          )}
        </section>

        {/* ── REPLIES USER MADE ── */}
        <section className="mb-10">
          <SectionHeader icon="✍️" title="Your Replies" count={myReplies.length} />

          {myReplies.length > 0 ? (
            <div className="space-y-3">
              {myReplies.map((reply) => (
                <motion.div
                  key={reply.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/community/discussion/${reply.discussionId}`)}
                  className="rounded-[16px] bg-[#FFF6F8]/90 p-5 shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-sm text-[#7A6C9D]">
                      In: <span className="text-[#FF8FA3]">{reply.discussionTitle}</span>
                    </p>
                    <span className="text-xs text-[#C8B6E2] flex-shrink-0">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-[#2E2A4A] text-sm leading-relaxed line-clamp-2">{reply.text}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState text="You haven't replied to any discussions yet." />
          )}
        </section>

      </div>
    </div>
  );
}