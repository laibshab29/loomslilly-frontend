// Events API (mock)

export const getEvents = async () => {
  return [
    {
      id: 1,
      name: "Sample Event",
      date: "2026-04-20",
      location: "Sample Location",
      slots: 10,
    },
  ];
};