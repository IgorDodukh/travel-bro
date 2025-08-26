import Link from 'next/link';
import type { TravelPlan } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, Info } from 'lucide-react';
import ActionButton from './ui/action-button';
import { useRouter } from 'next/navigation';

interface TravelPlanCardProps {
  plan: TravelPlan;
}

export default function TravelPlanCard({ plan }: TravelPlanCardProps) {
  const router = useRouter();

  const onClick = (plan: TravelPlan) => {
    router.push(`/plan/${plan.id}`);
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-gray-700 font-headline">{plan.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          {plan.destination}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-primary" />
            {plan.duration} day{plan.duration > 1 ? 's' : ''}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            {plan.dailyItineraries.reduce((total, day) => total + day.pointsOfInterest.length, 0)} places
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <ActionButton title="View Details" onClick={() => onClick(plan)} />
      </CardFooter>
    </Card>
  );
}
