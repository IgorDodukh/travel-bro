
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TravelPlanCard from '@/components/TravelPlanCard';
import type { TravelPlan } from '@/lib/types';
import { getSavedTravelPlans } from '@/lib/localStorageUtils';
import { PlusCircle } from 'lucide-react';

const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';
const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';

export default function HomePage() {
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply dark theme by default
    document.documentElement.classList.add('dark');
    setSavedPlans(getSavedTravelPlans());
    setIsLoading(false);
  }, []);

  const handlePlanNewTripClick = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl text-muted-foreground">Loading your travel plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h2 className="text-3xl font-bold font-headline mb-4 text-primary">Welcome to MIARA Planner!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Your personalized travel planner. Let's craft your next unforgettable journey.
        </p>
      </section>

      {savedPlans.length > 0 && (
        <section>
          <h3 className="text-2xl font-semibold font-headline mb-6">Your Saved Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlans.map((plan) => (
              <TravelPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      )}

      {savedPlans.length === 0 && !isLoading && (
        <section className="text-center py-12 bg-card rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-4">No saved trips yet!</h3>
          <p className="text-muted-foreground mb-6">Start planning your dream vacation now.</p>
        </section>
      )}
      
      <div className="fixed bottom-8 right-8 md:static md:mt-12 md:flex md:justify-center">
        <Button asChild size="lg" variant="default" className="shadow-xl hover:shadow-2xl transition-shadow duration-300" onClick={handlePlanNewTripClick}>
          <Link href="/new-trip" className="flex items-center gap-2">
            <PlusCircle className="w-6 h-6" />
            Plan New Trip
          </Link>
        </Button>
      </div>
    </div>
  );
}
