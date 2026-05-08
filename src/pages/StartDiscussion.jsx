import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCommunity } from "../context/CommunityContext";

export function StartDiscussion() {
  const { user, isGuest } = useAuth();
  const { addDiscussion, isBanned } = useCommunity();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const inputStyle =
    "w-full px-4 py-3 rounded-[16px] bg-[#F6C1CC]/20 border-2 border-[#7A6C9D]/20 outline-none focus:ring-0 text-[#2E2A4A] placeholder:text-[#7A6C9D]";

  // Access guards
  if (isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🔒</div>
          <p className="text-[#FFF6F8] text-2xl mb-6">
            Sign up to start a discussion
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

  if (user && isBanned(user.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">🚫</div>
          <p
            style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
            className="text-3xl"
          >
            Access Restricted
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!body.trim()) newErrors.body = "Discussion body is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const newId = addDiscussion(title.trim(), body.trim(), user);
    setSubmitted(true);

    setTimeout(() => {
      navigate(`/community/discussion/${newId}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-20">
      <div className="max-w-[800px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl mb-4">
            <span
              style={{
                fontFamily: "Fredoka, sans-serif",
                color: "#FFF6F8",
              }}
            >
              Start a{" "}
            </span>
            <span
              style={{
                fontFamily: "Pacifico, cursive",
                color: "#FF8FA3",
                textShadow: "0 0 35px rgba(255,143,163,0.7)",
              }}
            >
              Discussion
            </span>
          </h1>
          <p className="text-[#FFF6F8] text-xl">
            Share your thoughts with the community
          </p>
        </motion.div>

        {submitted ? (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-12 text-center">
            <h2
              style={{ fontFamily: "Pacifico, cursive", color: "#FF8FA3" }}
              className="text-3xl"
            >
              Discussion Posted!
            </h2>
            <p className="text-[#7A6C9D] mt-2">Taking you there now...</p>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#FFF6F8]/90 p-8 shadow-2xl">

            {/* DISCUSSION RULES */}
            <div className="rounded-[16px] bg-[#F6C1CC]/20 p-6 mb-8">
              <h3 className="text-lg text-[#2E2A4A] mb-3">
                Discussion Rules
              </h3>
              <div className="space-y-2">
                {[
                  "Keep it respectful and on-topic.",
                  "No spam, self-promotion, or harmful content.",
                  "Give credit when sharing others' work.",
                  "Be constructive — feedback should help, not hurt.",
                ].map((rule, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[#FF8FA3] mt-0.5">•</span>
                    <p className="text-[#7A6C9D] text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* TITLE */}
              <div>
                <input
                  placeholder="Discussion Title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title)
                      setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  className={inputStyle}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* BODY */}
              <div>
                <textarea
                  placeholder="What's on your mind? Share your thoughts, questions, or ideas..."
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    if (errors.body)
                      setErrors((prev) => ({ ...prev, body: "" }));
                  }}
                  rows={6}
                  className={inputStyle}
                />
                {errors.body && (
                  <p className="text-red-500 text-sm mt-1">{errors.body}</p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#FF8FA3] text-white hover:scale-105 transition-all"
              >
                Post Discussion
              </button>

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => navigate("/community")}
                className="w-full py-4 rounded-full bg-[#C8B6E2] text-[#2E2A4A] hover:scale-105 transition-all"
              >
                Cancel
              </button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}