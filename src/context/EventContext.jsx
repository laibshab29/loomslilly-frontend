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
    contactEmail: "sarah@example.com",
    contactPhone: "+92 300 1234567",
    pictures: [],
    brochures: [],
    videos: [],
    details: "An immersive workshop exploring wet-on-wet and dry brush watercolor techniques.",
    authorId: 999,
    authorName: "Sarah M.",
    createdAt: Date.now() - 86400000 * 3,
    fullSince: null,
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
    contactEmail: "emma@example.com",
    contactPhone: "+92 321 7654321",
    pictures: [],
    brochures: [],
    videos: [],
    details: "A relaxed meetup for crochet lovers of all skill levels.",
    authorId: 998,
    authorName: "Emma L.",
    createdAt: Date.now() - 86400000 * 5,
    fullSince: null,
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
    contactEmail: "alex@example.com",
    contactPhone: "+92 333 9876543",
    pictures: [],
    brochures: [],
    videos: [],
    details: "Opening night of our annual community art exhibition featuring local artists.",
    authorId: 997,
    authorName: "Alex K.",
    createdAt: Date.now() - 86400000 * 7,
    fullSince: null,
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
    contactEmail: "maria@example.com",
    contactPhone: "+92 311 2223344",
    pictures: [],
    brochures: [],
    videos: [],
    details: "Advanced embroidery techniques including goldwork and stumpwork.",
    authorId: 996,
    authorName: "Maria P.",
    createdAt: Date.now() - 86400000 * 2,
    fullSince: Date.now() - 86400000 * 2, // already full > 24h ago, will be filtered out on /events
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
    contactEmail: "chris@example.com",
    contactPhone: "+92 345 5556677",
    pictures: [],
    brochures: [],
    videos: [],
    details: "A vibrant marketplace for independent makers and craft sellers.",
    authorId: 995,
    authorName: "Chris B.",
    createdAt: Date.now() - 86400000 * 1,
    fullSince: null,
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

  const today = new Date().toISOString().split("T")[0];
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Events visible on the public Events page:
  // - Date not passed
  // - If full, must have become full within the last 24 hours
  const activeEvents = events.filter((e) => {
    if (e.date < today) return false;
    const isFull = e.slotsUsed >= e.slots;
    if (isFull && e.fullSince) {
      const hoursSinceFull = (Date.now() - e.fullSince) / ONE_DAY_MS;
      if (hoursSinceFull > 1) return false; // hide full events older than 24h
    }
    return true;
  });

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
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      pictures: data.pictures || [],
      brochures: data.brochures || [],
      videos: data.videos || [],
      details: data.details,
      authorId: user.id,
      authorName: user.name,
      createdAt: Date.now(),
      fullSince: null,
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent.id;
  };

  const updateEvent = (id, data) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...data };
        if (data.slots !== undefined) updated.slots = Number(data.slots);
        // If slots were increased above slotsUsed, clear fullSince
        if (updated.slotsUsed < updated.slots) updated.fullSince = null;
        return updated;
      })
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const registerForEvent = (eventId, registrant) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const newUsed = e.slotsUsed + 1;
        const justBecameFull = newUsed >= e.slots && !e.fullSince;
        return {
          ...e,
          slotsUsed: newUsed,
          fullSince: justBecameFull ? Date.now() : e.fullSince,
        };
      })
    );
    setRegistrations((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), registrant],
    }));
  };

  const getEvent = (id) => events.find((e) => e.id === Number(id));

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
        updateEvent,
        deleteEvent,
        registerForEvent,
        getEvent,
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