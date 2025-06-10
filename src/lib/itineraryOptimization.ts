import { PointOfInterest, DailyItinerary } from './types';

export async function optimizeItinerary(
  // The input is a flat list of points without assigned days yet
  // We only need the location data for clustering
  pointsOfInterest: PointOfInterest[],
 numberOfDays: number
): Promise<DailyItinerary[]> {
  // TODO: Implement itinerary optimization logic here
  // This function should group points of interest by proximity
  // and distribute them across the specified number of days.

  // For now, returning a basic structure without optimization
  // const dailyItineraries: DailyItinerary[] = [];
  // for (let i = 0; i < numberOfDays; i++) {
  //   dailyItineraries.push({
  //     day: i + 1,
  //     pointsOfInterest: pointsOfInterest.filter(poi => poi.dayIndex === i + 1) // Basic filtering by existing dayIndex if available
  //   });
  // }

  // Basic implementation: Simple clustering based on rough geographical proximity.
  // This is a very naive approach and can be improved with more sophisticated
  // clustering algorithms and route optimization (e.g., Traveling Salesperson Problem).

  // Filter out points without valid locations
  const validPoints = pointsOfInterest.filter(
    (poi) => poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0)
  );

  if (validPoints.length === 0) {
    return Array.from({ length: numberOfDays }, (_, i) => ({
      day: i + 1,
      pointsOfInterest: [],
    }));
  }

  // Initialize daily itineraries
  const optimizedDailyItineraries: DailyItinerary[] = Array.from(
    { length: numberOfDays },
    (_, i) => ({
      day: i + 1,
      pointsOfInterest: [],
    })
  );

  // Simple way to distribute points: Sort by latitude and distribute
  // This is not geographically accurate clustering but provides a starting point
  const sortedPoints = [...validPoints].sort(
    (a, b) => (a.location?.lat || 0) - (b.location?.lat || 0)
  );

  for (let i = 0; i < numberOfDays; i++) {
    const pointsForThisDay = sortedPoints.filter(
      (_, index) => index % numberOfDays === i
    );

    // Assign dayIndex and add to the corresponding daily itinerary
    pointsForThisDay.forEach(poi => {
        // Create a new object to avoid modifying the original point if it was reused
        const optimizedPoi: PointOfInterest = {
            ...poi,
            dayIndex: i + 1, // Assign the calculated day index
            // Optionally, clear previous dayIndex if points were already assigned one
            // dayIndex: i + 1,
        };
        optimizedDailyItineraries[i].pointsOfInterest.push(optimizedPoi);
    });
  }

  // Note: This doesn't perform true spatial clustering or route optimization within days.
  // It simply distributes points based on a sort order.

  return optimizedDailyItineraries;
}