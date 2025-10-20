
'use client';

import { redirect, useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import PlanDetailsView, { createTravelPlanFromAi } from '@/components/PlanDetailsView';
import type { TravelPlan, AiGeneratedPlan, GenerateTravelPlansOutput, NewTripFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';
const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';

export default function GeneratedPlanDetailsPage() {
  redirect('/');
  return null;

  const params = useParams();
  const router = useRouter();
  const planIndexFromParams = params.planIndex as string;

  const [planToShow, setPlanToShow] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if data for the current planIndex has been processed
  const processedPlanIndexRef = useRef<string | null>(null);

  useEffect(() => {
    const loadPlanDetails = async () => {

      // Initial error checks for planIndexFromParams
      if (!planIndexFromParams) {
        setError("Plan index is missing from URL.");
        setIsLoading(false);
        processedPlanIndexRef.current = null; // Reset if error occurs before processing
        return;
      }

      const planIndex = parseInt(planIndexFromParams, 10);
      if (isNaN(planIndex)) {
        setError("Invalid plan index format in URL.");
        setIsLoading(false);
        processedPlanIndexRef.current = null; // Reset on error
        return;
      }

      // If we have already successfully processed this planIndex for the current session data,
      // the data should be in planToShow, and we don't need to do anything further.
      if (processedPlanIndexRef.current === planIndexFromParams && planToShow) {
        setIsLoading(false); // Ensure loading is false
        return;
      }

      // If we reach here, it's a new planIndex or a retry for an index
      // that previously failed before setting processedPlanIndexRef.
      setIsLoading(true);
      setError(null);
      // setPlanToShow(null); // Do not clear stale data if it's for the same index and session data is still valid

      if (typeof window !== 'undefined') {
        const plansOutputParam = sessionStorage.getItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
        const formInputParam = sessionStorage.getItem(SESSION_STORAGE_FORM_INPUT_KEY);

        if (!plansOutputParam || !formInputParam) {
          setError("Invalid or missing plan data in session. Please try generating plans again.");
          setIsLoading(false);
          // Do not set processedPlanIndexRef, allowing a retry if user navigates away and back or refreshes.
          return;
        }

        try {
          const allGeneratedPlans: GenerateTravelPlansOutput = JSON.parse(plansOutputParam);
          const originalFormInput: NewTripFormState = JSON.parse(formInputParam);

          if (planIndex < 0 || !allGeneratedPlans.travelPlans || planIndex >= allGeneratedPlans.travelPlans.length) {
            setError("Selected plan not found or index is out of bounds.");
            setIsLoading(false); // Stop loading on error
            return;
          }

          const selectedAiPlan: AiGeneratedPlan = allGeneratedPlans.travelPlans[planIndex];
          const fullPlan = await createTravelPlanFromAi(selectedAiPlan, originalFormInput);

          setPlanToShow({ ...fullPlan, id: `temp-${crypto.randomUUID()}` });

          // Mark as processed for this planIndex.
          // Session items are NOT cleared here anymore.
          processedPlanIndexRef.current = planIndexFromParams;

        } catch (e) {
          console.error("Error processing plan details from sessionStorage:", e);
          setError("Failed to load plan details. Data might be corrupted or an unexpected error occurred.");
        } finally {
          setIsLoading(false); // Ensure loading is stopped in all paths of try-catch
        }
      } else {
        setError("Session storage is not available to load plan details.");
        setIsLoading(false);
      }
    };
    loadPlanDetails(); // Call the async function
  }, [planIndexFromParams, planToShow]); // Added planToShow to deps to re-evaluate if it's cleared externally

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
            <p className="text-muted-foreground mb-6">The selected plan could not be loaded. This might happen if you navigated here directly or refreshed after the data was cleared.</p>
            <Button onClick={() => router.push('/new-trip')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Start New Trip
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // return (
  //   <PlanDetailsView initialPlan={planToShow} mode="new" />
  // );
}
