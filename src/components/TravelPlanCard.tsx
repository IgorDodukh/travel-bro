import Link from 'next/link';
import type { TravelPlan } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, Info } from 'lucide-react';

interface TravelPlanCardProps {
  plan: TravelPlan;
}

export default function TravelPlanCard({ plan }: TravelPlanCardProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-primary font-headline">{plan.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          {plan.destination}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            {plan.duration} days
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-muted-foreground" />
            {plan.dailyItineraries.reduce((total, day) => total + day.pointsOfInterest.length, 0)} points of interest
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-accent hover:bg-opacity-80 text-accent-foreground">
          <Link href={`/plan/${plan.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
