
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import GeneratedPlanCard from '@/components/GeneratedPlanCard';
import type { GenerateTravelPlansOutput, NewTripFormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';
const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';

export default function GeneratedPlansPage() {
  const router = useRouter();
  const [generatedPlansOutput, setGeneratedPlansOutput] = useState<GenerateTravelPlansOutput | null>(null);
  const [formInput, setFormInput] = useState<NewTripFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plansParam = sessionStorage.getItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
      const formInputParam = sessionStorage.getItem(SESSION_STORAGE_FORM_INPUT_KEY);

      if (plansParam && formInputParam) {
        try {
          const plansData = JSON.parse(plansParam);
          const formData = JSON.parse(formInputParam);
          setGeneratedPlansOutput(plansData);
          setFormInput(formData);
        } catch (e) {
          console.error("Error parsing plans data from sessionStorage:", e);
          setError("Failed to load travel plans. Data might be corrupted.");
        }
      } else {
        setError("No travel plans found in session. Please try generating them again.");
      }
    } else {
        setError("Session storage is not available.");
    }
    setIsLoading(false);
  }, []);

  const handleBackToPreferences = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);
    }
    router.push('/new-trip');
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-headline text-primary">Generating Your Travel Plans...</h2>
          <p className="text-lg text-muted-foreground">Our AI is crafting some amazing adventures for you!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-1" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/new-trip')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!generatedPlansOutput || !generatedPlansOutput.travelPlans || generatedPlansOutput.travelPlans.length === 0 || !formInput) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-primary mb-4">No Plans Generated</h2>
        <p className="text-muted-foreground mb-6">We couldn't generate any plans with the provided preferences. Please try again with different options.</p>
        <Button onClick={() => router.push('/new-trip')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Form
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline text-primary">Here Are Your Personalized Travel Plans!</h2>
        <p className="text-lg text-muted-foreground">Choose one to view details and customize further, or go back to refine your search.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedPlansOutput.travelPlans.map((plan, index) => (
          <GeneratedPlanCard key={index} plan={plan} index={index} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Button variant="outline" onClick={handleBackToPreferences}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Preferences
        </Button>
      </div>
    </div>
  );
}
