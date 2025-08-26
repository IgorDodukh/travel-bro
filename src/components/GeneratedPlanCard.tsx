
import type { AiGeneratedPlan, AiGeneratedPointOfInterest } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import ActionButton from './ui/action-button';
import { useRouter } from 'next/navigation';

interface GeneratedPlanCardProps {
  plan: AiGeneratedPlan;
  index: number;
}

export default function GeneratedPlanCard({ plan, index }: GeneratedPlanCardProps) {
  const router = useRouter();

  const handleClickViewPlan = () => {
    router.push(`/new-trip/plan-details/${index}`);
  }
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col rounded-2xl">
      <CardHeader>
        <CardTitle className="text-gray-700 font-headline">{plan.planName || `Alternative Plan ${index + 1}`}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
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
      <CardFooter style={{ justifyContent: 'flex-end' }}>
        <ActionButton title="View & Customize" onClick={handleClickViewPlan} />
      </CardFooter>
    </Card>
  );
}
