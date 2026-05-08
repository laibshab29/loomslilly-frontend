import { createContext, useContext, useState, useEffect } from "react";

const EventContext = createContext();

const DEFAULT_EVENTS = [
  {
    id: 1,
    name: "Watercolor Workshop",
    date: "2026-06-20",
    type: "Workshop",
    venue: "Creative Studio, Karachi",
    slots: 20,
    slotsUsed: 8,
    link: "",
    details: "An immersive workshop exploring wet-on-wet and dry brush watercolor techniques.",
    authorId: 999,
    authorName: "Sarah M.",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 2,
    name: "Crochet Circle Meetup",
    date: "2026-07-05",
    type: "Pop-up",
    venue: "Community Hall, Lahore",
    slots: 30,
    slotsUsed: 12,
    link: "",
    details: "A relaxed meetup for crochet lovers of all skill levels.",
    authorId: 998,
    authorName: "Emma L.",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 3,
    name: "Art Exhibition Opening",
    date: "2026-07-15",
    type: "Exhibition",
    venue: "Modern Art Gallery, Islamabad",
    slots: 100,
    slotsUsed: 45,
    link: "",
    details: "Opening night of our annual community art exhibition featuring local artists.",
    authorId: 997,
    authorName: "Alex K.",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 4,
    name: "Embroidery Masterclass",
    date: "2026-08-01",
    type: "Workshop",
    venue: "Craft Haven, Karachi",
    slots: 15,
    slotsUsed: 15,
    link: "",
    details: "Advanced embroidery techniques including goldwork and stumpwork.",
    authorId: 996,
    authorName: "Maria P.",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 5,
    name: "Maker's Market",
    date: "2026-08-10",
    type: "Pop-up",
    venue: "City Square, Karachi",
    slots: 200,
    slotsUsed: 89,
    link: "",
    details: "A vibrant marketplace for independent makers and craft sellers.",
    authorId: 995,
    authorName: "Chris B.",
    createdAt: Date.now() - 86400000 * 1,
  },
];

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("events_data");
      return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });

  // Track registrations: { eventId: [{ name, email }] }
  const [registrations, setRegistrations] = useState(() => {
    try {
      const saved = localStorage.getItem("event_registrations");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("events_data", JSON.stringify(events));
    } catch (e) {
      console.warn("events save failed:", e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem("event_registrations", JSON.stringify(registrations));
    } catch (e) {
      console.warn("registrations save failed:", e);
    }
  }, [registrations]);

  // Only show events whose date hasn't passed
  const today = new Date().toISOString().split("T")[0];
  const activeEvents = events.filter((e) => e.date >= today);

  const addEvent = (data, user) => {
    const newEvent = {
      id: Date.now(),
      name: data.name,
      date: data.date,
      type: data.type,
      venue: data.venue,
      slots: Number(data.slots),
      slotsUsed: 0,
      link: data.link || "",
      details: data.details,
      authorId: user.id,
      authorName: user.name,
      createdAt: Date.now(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent.id;
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const registerForEvent = (eventId, registrant) => {
    // Increment slotsUsed
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, slotsUsed: e.slotsUsed + 1 } : e
      )
    );
    // Store registration
    setRegistrations((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), registrant],
    }));
  };

  const getSlotsLeft = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return 0;
    return event.slots - event.slotsUsed;
  };

  const isExpired = (date) => date < today;
  const isFull = (eventId) => getSlotsLeft(eventId) <= 0;

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvents,
        addEvent,
        deleteEvent,
        registerForEvent,
        getSlotsLeft,
        isExpired,
        isFull,
        registrations,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);