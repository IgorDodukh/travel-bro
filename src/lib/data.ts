export const TRAVEL_PLANS = [
  {
    id: "plan-1",
    title: "Kyoto Cultural Dive",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    country: "Tokyo, Japan",
    coordinates: [35.0116, 135.7681],
    stats: { duration: "7 Days", distance: "85 km", accomPrice: "$1,200", transportPrice: "$150" },
    itinerary: [
      { day: 1, title: "Arrival & Gion Walk", location: "Gion District", coords: [35.0037, 135.7778] },
      { day: 2, title: "Fushimi Inari Shrine", location: "Fushimi Ward", coords: [34.9671, 135.7727] },
      { day: 3, title: "Arashiyama Bamboo Grove", location: "Arashiyama", coords: [35.0116, 135.6792] },
    ]
  },
  {
    id: "plan-2",
    title: "Amalfi Coast Escape",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
    country: "Milan, Italy",
    coordinates: [40.6340, 14.6027],
    stats: { duration: "5 Days", distance: "40 km", accomPrice: "$2,100", transportPrice: "$80" },
    itinerary: [
      { day: 1, title: "Positano Sunset", location: "Positano", coords: [40.6281, 14.4850] },
      { day: 2, title: "Boat to Capri", location: "Capri", coords: [40.5513, 14.2377] },
    ]
  },
  {
    id: "plan-3",
    title: "Iceland Ring Road",
    image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=800&auto=format&fit=crop",
    country: "Reykjavík, Iceland",
    coordinates: [64.9631, -19.0208],
    stats: { duration: "10 Days", distance: "1332 km", accomPrice: "$3,000", transportPrice: "$400" },
    itinerary: [
      { day: 1, title: "Reykjavik Start", location: "Reykjavik", coords: [64.1466, -21.9426] },
      { day: 2, title: "Golden Circle", location: "Selfoss", coords: [63.9335, -20.9971] },
    ]
  }
];

export const MOCK_CHART_DATA = [
  { name: 'Mon', speed: 40 },
  { name: 'Tue', speed: 30 },
  { name: 'Wed', speed: 70 },
  { name: 'Thu', speed: 50 },
  { name: 'Fri', speed: 90 },
  { name: 'Sat', speed: 60 },
  { name: 'Sun', speed: 80 },
];