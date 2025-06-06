'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlanDetailsView, { createTravelPlanFromAi } from '@/components/PlanDetailsView';
import type { TravelPlan, AiGeneratedPlan, GenerateTravelPlansOutput, NewTripFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GeneratedPlanDetailsPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  
  const [planToShow, setPlanToShow] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const planIndex = parseInt(params.planIndex as string, 10);
    const plansOutputParam = searchParams.get('plans'); // This should come from /new-trip/plans
    const formInputParam = searchParams.get('formInput'); // This should come from /new-trip/plans

    if (isNaN(planIndex) || !plansOutputParam || !formInputParam) {
      setError("Invalid plan data. Please try again.");
      setIsLoading(false);
      return;
    }
    
    try {
      const allGeneratedPlans: GenerateTravelPlansOutput = JSON.parse(plansOutputParam);
      const originalFormInput: NewTripFormState = JSON.parse(formInputParam);

      if (planIndex < 0 || planIndex >= allGeneratedPlans.travelPlans.length) {
        setError("Selected plan not found.");
        setIsLoading(false);
        return;
      }
      
      const selectedAiPlan: AiGeneratedPlan = allGeneratedPlans.travelPlans[planIndex];
      const fullPlan = createTravelPlanFromAi(selectedAiPlan, originalFormInput);
      
      // Since this is a new plan, it doesn't have an ID yet until saved.
      // PlanDetailsView will handle assigning one on save.
      // We pass a temporary or empty ID for now or modify TravelPlan to allow optional ID for new plans.
      // For simplicity, PlanDetailsView expects an ID, so we provide a temporary one.
      // The save logic in PlanDetailsView should generate a new one if it's a 'new' mode plan.
      setPlanToShow({ ...fullPlan, id: `temp-${crypto.randomUUID()}` });

    } catch (e) {
      console.error("Error processing plan details:", e);
      setError("Failed to load plan details. Data might be corrupted.");
    }
    setIsLoading(false);
  }, [searchParams, params]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading your selected plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Oops! Something went wrong.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push('/new-trip/plans')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!planToShow) {
     return (
      <div className="text-center py-10">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">Plan Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">The selected plan could not be loaded.</p>
            <Button onClick={() => router.push('/new-trip/plans')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <PlanDetailsView initialPlan={planToShow} mode="new" />
  );
}
