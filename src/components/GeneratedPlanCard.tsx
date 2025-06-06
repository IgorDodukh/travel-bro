
import Link from 'next/link';
import type { AiGeneratedPlan } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowRight } from 'lucide-react';

interface GeneratedPlanCardProps {
  plan: AiGeneratedPlan;
  index: number;
  // formInput prop is removed as GeneratedPlanDetailsPage will get it from sessionStorage
}

export default function GeneratedPlanCard({ plan, index }: GeneratedPlanCardProps) {
  // Query parameters are removed to prevent long URLs
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="text-primary font-headline">{plan.planName || `Alternative Plan ${index + 1}`}</CardTitle>
        <CardDescription>A unique itinerary based on your preferences.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            Key Highlights:
          </h4>
          <ul className="list-disc list-inside pl-2 text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
            {plan.pointsOfInterest.slice(0, 5).map((poi, idx) => (
              <li key={idx} className="truncate">{poi}</li>
            ))}
            {plan.pointsOfInterest.length > 5 && <li>And more...</li>}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          {/* Navigate without query parameters */}
          <Link href={`/new-trip/plan-details/${index}`}>
            View & Customize
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
