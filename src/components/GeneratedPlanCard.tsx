
import Link from 'next/link';
import type { AiGeneratedPlan, AiGeneratedPointOfInterest } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowRight } from 'lucide-react';

interface GeneratedPlanCardProps {
  plan: AiGeneratedPlan;
  index: number;
}

export default function GeneratedPlanCard({ plan, index }: GeneratedPlanCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col rounded-2xl">
      <CardHeader>
        <CardTitle className="text-primary font-headline">{plan.planName || `Alternative Plan ${index + 1}`}</CardTitle>
        <CardDescription>A unique route of {plan.pointsOfInterest.length} locations based on your preferences.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            Key Highlights:
          </h4>
          <ul className="list-disc list-inside pl-2 text-sm text-muted-foreground space-y-1 max-h-33 overflow-y-auto">
            {plan.pointsOfInterest.slice(0, 5).map((poi: AiGeneratedPointOfInterest, idx: number) => (
              <li key={idx} className="truncate">{poi.name}</li>
            ))}
            {plan.pointsOfInterest.length > 5 && <li>And more...</li>}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" className="w-full">
          <Link href={`/new-trip/plan-details/${index}`}>
            View & Customize
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
