import { createContext, useContext, useState, useEffect } from "react";

const TutorialContext = createContext();

const DEFAULT_TUTORIALS = [
  {
    id: 1,
    title: "Beginner Crochet Basics",
    details: "Learn the foundational crochet stitches step by step.",
    type: "Crochet",
    duration: "15:00",
    authorId: 999,
    authorName: "Sarah M.",
    media: [],
    mediaType: "image",
    youtubeLink: "",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 2,
    title: "Watercolor Techniques",
    details: "Explore wet-on-wet and dry brush watercolor methods.",
    type: "Painting",
    duration: "22:00",
    authorId: 998,
    authorName: "Alex K.",
    media: [],
    mediaType: "image",
    youtubeLink: "",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 3,
    title: "Advanced Knitting Patterns",
    details: "Take your knitting to the next level with complex patterns.",
    type: "Knitting",
    duration: "30:00",
    authorId: 997,
    authorName: "Emma L.",
    media: [],
    mediaType: "image",
    youtubeLink: "",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 4,
    title: "Embroidery Stitches Guide",
    details: "Master satin stitch, french knots, and more.",
    type: "Embroidery",
    duration: "18:00",
    authorId: 996,
    authorName: "Maria P.",
    media: [],
    mediaType: "image",
    youtubeLink: "",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 5,
    title: "Abstract Painting Methods",
    details: "Express yourself through abstract techniques and color play.",
    type: "Abstract Art",
    duration: "25:00",
    authorId: 995,
    authorName: "Chris B.",
    media: [],
    mediaType: "image",
    youtubeLink: "",
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 6,
    title: "Sketching Portraits",
    details: "Break down facial proportions and shading for realistic portraits.",
    type: "Sketching",
    duration: "35:00",
    authorId: 994,
    authorName: "David R.",
    media: [],
    mediaType: "image",
    youtubeLink: "",
    createdAt: Date.now() - 86400000 * 4,
  },
];

// Safely save to localStorage — videos (base64) can be large.
// We strip media blobs before saving and keep only non-blob entries.
function safeSave(tutorials) {
  try {
    // For video tutorials with blob/base64 media, we persist metadata only.
    // Images (smaller) are kept as-is. Videos are cleared from storage since
    // base64 video easily exceeds the 5MB localStorage quota.
    const serialisable = tutorials.map((t) => {
      if (t.mediaType === "video") {
        return { ...t, media: [] }; // video blobs can't survive a refresh anyway
      }
      // For images, try to keep them; if quota exceeded we strip them too
      return t;
    });
    localStorage.setItem("loomslilly_tutorials", JSON.stringify(serialisable));
  } catch (e) {
    // Quota exceeded — try stripping all media
    try {
      const stripped = tutorials.map((t) => ({ ...t, media: [] }));
      localStorage.setItem("loomslilly_tutorials", JSON.stringify(stripped));
    } catch {
      console.warn("Could not persist tutorials:", e);
    }
  }
}

export function TutorialProvider({ children }) {
  const [tutorials, setTutorials] = useState(() => {
    try {
      const saved = localStorage.getItem("loomslilly_tutorials");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge: keep saved order but fall back to defaults for missing ids
        const savedIds = new Set(parsed.map((t) => t.id));
        const missingDefaults = DEFAULT_TUTORIALS.filter((d) => !savedIds.has(d.id));
        // Put user-uploaded ones first, then any defaults not yet in storage
        return [...parsed, ...missingDefaults];
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_TUTORIALS;
  });

  useEffect(() => {
    safeSave(tutorials);
  }, [tutorials]);

  const addTutorial = (data, user) => {
    const newTutorial = {
      id: Date.now(),
      title: data.title,
      details: data.details,
      type: data.type,
      duration: data.duration || "",
      authorId: user.id,
      authorName: user.name,
      media: data.media || [],
      mediaType: data.mediaType || "image",
      youtubeLink: data.youtubeLink || "",
      createdAt: Date.now(),
    };
    setTutorials((prev) => [newTutorial, ...prev]);
    return newTutorial.id;
  };

  const deleteTutorial = (id) => {
    setTutorials((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TutorialContext.Provider value={{ tutorials, addTutorial, deleteTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorials = () => useContext(TutorialContext);