import { PointOfInterest, DailyItinerary } from './types';

export function groupByDay(points: PointOfInterest[]): DailyItinerary[] {
  const grouped: Record<number, PointOfInterest[]> = {};

  for (const point of points) {
    if (!grouped[point.dayIndex]) {
      grouped[point.dayIndex] = [];
    }
    grouped[point.dayIndex].push(point);
  }

  const result: DailyItinerary[] = Object.entries(grouped).map(([dayStr, points]) => ({
    day: parseInt(dayStr),
    pointsOfInterest: points,
  }));

  // Optional: sort by day
  result.sort((a, b) => a.day - b.day);

  return result;
}