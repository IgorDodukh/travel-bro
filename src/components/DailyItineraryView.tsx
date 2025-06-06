'use client';

import type { DailyItinerary, PointOfInterest } from '@/lib/types';
import PoiCard from './PoiCard';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';

interface DailyItineraryViewProps {
  dayItinerary: DailyItinerary;
  onUpdateDayItinerary: (updatedDayItinerary: DailyItinerary) => void;
  onAddPoiClick: (dayNumber: number) => void;
  onEditPoiClick: (poi: PointOfInterest, dayNumber: number) => void;
  isEditingPlan: boolean;
}

export default function DailyItineraryView({ dayItinerary, onUpdateDayItinerary, onAddPoiClick, onEditPoiClick, isEditingPlan }: DailyItineraryViewProps) {
  
  const handleMove = (poiId: string, direction: 'up' | 'down') => {
    const pois = [...dayItinerary.pointsOfInterest];
    const index = pois.findIndex(p => p.id === poiId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pois.length) return;

    [pois[index], pois[newIndex]] = [pois[newIndex], pois[index]]; // Swap
    onUpdateDayItinerary({ ...dayItinerary, pointsOfInterest: pois });
  };

  const handleDeletePoi = (poiId: string) => {
    const updatedPois = dayItinerary.pointsOfInterest.filter(p => p.id !== poiId);
    onUpdateDayItinerary({ ...dayItinerary, pointsOfInterest: updatedPois });
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold font-headline text-primary">Day {dayItinerary.day}</h3>
        {isEditingPlan && (
          <Button variant="outline" size="sm" onClick={() => onAddPoiClick(dayItinerary.day)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add POI to Day {dayItinerary.day}
          </Button>
        )}
      </div>
      {dayItinerary.pointsOfInterest.length === 0 ? (
        <p className="text-muted-foreground text-sm">No points of interest scheduled for this day. {isEditingPlan ? "Click 'Add POI' to get started!" : ""}</p>
      ) : (
        <div className="space-y-2">
          {/* Basic list rendering, full drag-and-drop is complex for scaffold */}
          {dayItinerary.pointsOfInterest.map((poi, index) => (
            <PoiCard
              key={poi.id}
              poi={poi}
              index={index}
              totalItems={dayItinerary.pointsOfInterest.length}
              onMoveUp={() => handleMove(poi.id, 'up')}
              onMoveDown={() => handleMove(poi.id, 'down')}
              onDelete={handleDeletePoi}
              onEdit={(p) => onEditPoiClick(p, dayItinerary.day)}
              isEditingPlan={isEditingPlan}
            />
          ))}
        </div>
      )}
       {/* Placeholder for drag-and-drop hint if not implemented with buttons */}
       {isEditingPlan && dayItinerary.pointsOfInterest.length > 1 && (
         <p className="text-xs text-muted-foreground mt-3 text-center">
           Use the arrow buttons to reorder points of interest. Full drag & drop coming soon!
         </p>
       )}
    </div>
  );
}
