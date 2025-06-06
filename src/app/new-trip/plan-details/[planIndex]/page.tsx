
'use client';

import { useParams, useRouter } from 'next/navigation';
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
  const planIndexFromParams = params.planIndex as string;
  
  const [planToShow, setPlanToShow] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null); 

    if (!planIndexFromParams) {
      setError("Plan index is missing from URL.");
      setIsLoading(false);
      return;
    }
    const planIndex = parseInt(planIndexFromParams, 10);

    if (isNaN(planIndex)) {
        setError("Invalid plan index format in URL.");
        setIsLoading(false);
        return;
    }

    if (typeof window !== 'undefined') {
      const plansOutputParam = sessionStorage.getItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
      const formInputParam = sessionStorage.getItem(SESSION_STORAGE_FORM_INPUT_KEY);

      if (!plansOutputParam || !formInputParam) {
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

        // Clean up sessionStorage after successful use for this specific plan load
        sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);

      } catch (e) {
        console.error("Error processing plan details from sessionStorage:", e);
        setError("Failed to load plan details. Data might be corrupted or an unexpected error occurred.");
      }
    } else {
        setError("Session storage is not available to load plan details.");
    }
    setIsLoading(false);
  }, [planIndexFromParams]); // Depend only on planIndexFromParams

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
            <p className="text-muted-foreground mb-6">The selected plan could not be loaded. This can happen if you refreshed the page or navigated here directly without generating plans first.</p>
            <Button onClick={() => router.push('/new-trip')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Start New Trip
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
