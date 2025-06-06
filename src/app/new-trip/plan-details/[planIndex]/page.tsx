
'use client';

import { useParams, useRouter } from 'next/navigation'; // useSearchParams removed
import { useEffect, useState } from 'react';
import PlanDetailsView, { createTravelPlanFromAi } from '@/components/PlanDetailsView';
import type { TravelPlan, AiGeneratedPlan, GenerateTravelPlansOutput, NewTripFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';
const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';

export default function GeneratedPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [planToShow, setPlanToShow] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const planIndexStr = params.planIndex as string;
    if (!planIndexStr) {
      setError("Plan index is missing.");
      setIsLoading(false);
      return;
    }
    const planIndex = parseInt(planIndexStr, 10);

    if (typeof window !== 'undefined') {
      const plansOutputParam = sessionStorage.getItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
      const formInputParam = sessionStorage.getItem(SESSION_STORAGE_FORM_INPUT_KEY);

      if (isNaN(planIndex) || !plansOutputParam || !formInputParam) {
        setError("Invalid or missing plan data in session. Please try generating plans again.");
        setIsLoading(false);
        return;
      }
      
      try {
        const allGeneratedPlans: GenerateTravelPlansOutput = JSON.parse(plansOutputParam);
        const originalFormInput: NewTripFormState = JSON.parse(formInputParam);

        if (planIndex < 0 || !allGeneratedPlans.travelPlans || planIndex >= allGeneratedPlans.travelPlans.length) {
          setError("Selected plan not found or index is out of bounds.");
          setIsLoading(false);
          return;
        }
        
        const selectedAiPlan: AiGeneratedPlan = allGeneratedPlans.travelPlans[planIndex];
        const fullPlan = createTravelPlanFromAi(selectedAiPlan, originalFormInput);
        
        setPlanToShow({ ...fullPlan, id: `temp-${crypto.randomUUID()}` });

        // Clean up sessionStorage after use
        sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);

      } catch (e) {
        console.error("Error processing plan details from sessionStorage:", e);
        setError("Failed to load plan details. Data might be corrupted.");
      }
    } else {
        setError("Session storage is not available.");
    }
    setIsLoading(false);
  }, [params, router]); // depends on params.planIndex

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
            <Button onClick={() => router.push('/new-trip')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to New Trip Form
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
