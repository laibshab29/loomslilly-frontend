import { createContext, useContext, useState, useEffect } from "react";

const TutorialContext = createContext();

const DEFAULT_TUTORIALS = [
  {
    id: 1,
    title: "Beginner Crochet Basics",
    details: "Learn the foundational crochet stitches step by step.",
    type: "Crochet",
    duration: "15 min",
    authorId: 999,
    authorName: "Sarah M.",
    media: [],
    mediaType: "image",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 2,
    title: "Watercolor Techniques",
    details: "Explore wet-on-wet and dry brush watercolor methods.",
    type: "Painting",
    duration: "22 min",
    authorId: 998,
    authorName: "Alex K.",
    media: [],
    mediaType: "image",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 3,
    title: "Advanced Knitting Patterns",
    details: "Take your knitting to the next level with complex patterns.",
    type: "Knitting",
    duration: "30 min",
    authorId: 997,
    authorName: "Emma L.",
    media: [],
    mediaType: "image",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 4,
    title: "Embroidery Stitches Guide",
    details: "Master satin stitch, french knots, and more.",
    type: "Embroidery",
    duration: "18 min",
    authorId: 996,
    authorName: "Maria P.",
    media: [],
    mediaType: "image",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 5,
    title: "Abstract Painting Methods",
    details: "Express yourself through abstract techniques and color play.",
    type: "Abstract Art",
    duration: "25 min",
    authorId: 995,
    authorName: "Chris B.",
    media: [],
    mediaType: "image",
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 6,
    title: "Sketching Portraits",
    details: "Break down facial proportions and shading for realistic portraits.",
    type: "Sketching",
    duration: "35 min",
    authorId: 994,
    authorName: "David R.",
    media: [],
    mediaType: "image",
    createdAt: Date.now() - 86400000 * 4,
  },
];

export function TutorialProvider({ children }) {
  const [tutorials, setTutorials] = useState(() => {
    try {
      const saved = localStorage.getItem("tutorials");
      return saved ? JSON.parse(saved) : DEFAULT_TUTORIALS;
    } catch {
      return DEFAULT_TUTORIALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("tutorials", JSON.stringify(tutorials));
    } catch (e) {
      console.warn("tutorials save failed:", e);
    }
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