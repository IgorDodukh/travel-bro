'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlanDetailsView from '@/components/PlanDetailsView';
import type { TravelPlan } from '@/lib/types';
import { getTravelPlanById, deleteTravelPlan as deletePlanFromStorage } from '@/lib/localStorageUtils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SavedPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planId = params.id as string;

  useEffect(() => {
    if (planId) {
      const fetchedPlan = getTravelPlanById(planId);
      if (fetchedPlan) {
        setPlan(fetchedPlan);
      } else {
        setError(`Travel plan with ID "${planId}" not found.`);
      }
    } else {
      setError("No plan ID provided.");
    }
    setIsLoading(false);
  }, [planId]);

  const handleDeletePlan = (idToDelete: string) => {
    deletePlanFromStorage(idToDelete);
    toast({
      title: "Plan Deleted",
      description: `The travel plan has been successfully deleted.`,
    });
    router.push('/'); // Navigate back to home page
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading your travel plan...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="text-center py-10">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Oops! Plan Not Found.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    // This case should ideally be covered by error state, but as a fallback:
    return <p>Plan could not be loaded.</p>;
  }
  
  return (
    <PlanDetailsView initialPlan={plan} mode="existing" onDeletePlan={handleDeletePlan} />
  );
}
