import type { PointOfInterest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
import Image from 'next/image';

interface MapViewPlaceholderProps {
  pointsOfInterest: PointOfInterest[];
}

export default function MapViewPlaceholder({ pointsOfInterest }: MapViewPlaceholderProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" />
          Map View
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Image 
            src="https://placehold.co/400x300.png" 
            alt="Map placeholder" 
            width={400} 
            height={300} 
            data-ai-hint="world map"
            className="rounded-md opacity-50 mb-4"
          />
          <p className="text-muted-foreground font-semibold">Map View Coming Soon!</p>
          <p className="text-sm text-muted-foreground mt-1">
            This area will display an interactive map with your {pointsOfInterest.length} points of interest and routes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
