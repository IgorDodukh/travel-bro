
// 'use client';

// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import TravelPlanCard from '@/components/TravelPlanCard';
// import type { TravelPlan } from '@/lib/types';
// import { getSavedTravelPlans } from '@/lib/localStorageUtils';
// import { PlusCircle } from 'lucide-react';

// const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';
// const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';

// export default function HomePage() {
//   const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Apply dark theme by default
//     document.documentElement.classList.add('.');
//     setSavedPlans(getSavedTravelPlans());
//     setIsLoading(false);
//   }, []);

//   const handlePlanNewTripClick = () => {
//     if (typeof window !== 'undefined') {
//       sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);
//       sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh]">
//         <p className="text-xl text-muted-foreground">Loading your travel plans...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <section className="text-center">
//         <h2 className="text-3xl font-bold font-headline mb-4 text-primary">Welcome to PlaPlan!</h2>
//         <p className="text-lg text-muted-foreground mb-8">
//           Your personalized travel planner. Let's craft your next unforgettable journey.
//         </p>
//       </section>

//       {savedPlans.length > 0 && (
//         <section>
//           <h3 className="text-2xl font-semibold font-headline mb-6">Your Saved Trips</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {savedPlans.map((plan) => (
//               <TravelPlanCard key={plan.id} plan={plan} />
//             ))}
//           </div>
//         </section>
//       )}

//       {savedPlans.length === 0 && !isLoading && (
//         <section className="text-center py-12 bg-card rounded-2xl shadow-md">
//           <h3 className="text-xl font-semibold mb-4">No saved trips yet!</h3>
//           <p className="text-muted-foreground mb-6">Start planning your dream vacation now.</p>
//         </section>
//       )}

//       <div className="fixed bottom-8 right-8 md:static md:mt-12 md:flex md:justify-center">
//         <Button asChild size="lg" variant="default" className="shadow-xl hover:shadow-2xl transition-shadow duration-300" onClick={handlePlanNewTripClick}>
//           <Link href="/new-trip" className="flex items-center gap-2">
//             <PlusCircle className="w-6 h-6" />
//             Plan New Trip
//           </Link>
//         </Button>
//       </div>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TravelPlanCard from '@/components/TravelPlanCard';
import type { TravelPlan } from '@/lib/types';
import { getSavedTravelPlans } from '@/lib/localStorageUtils';
import { PlusCircle, MapPin, Calendar, Plane, Sparkles, Globe, Compass } from 'lucide-react';

const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';
const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';

export default function HomePage() {
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('.');
    setSavedPlans(getSavedTravelPlans());
    setIsLoading(false);
    setMounted(true);
  }, []);

  const handlePlanNewTripClick = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
    }
  };

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-xl text-muted-foreground mt-6 animate-pulse">Loading your travel plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Travel Planning</span>
          </div>

          {/* Main Heading */}
          <div className="relative mb-8 ">
            <div className="inline-flex items-center gap-2 px-4 py-2">
              <Image
                src="/assets/logo-transparent.png"
                alt="PlaPlan Logo"
                width={440}
                height={52}
                priority
              />
            </div>
            {/* <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
              <Compass className="w-8 h-8 md:w-12 md:h-12 text-primary/40 animate-spin" style={{ animationDuration: '20s' }} />
            </div> */}
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your wanderlust into unforgettable adventures with our intelligent travel planner
          </p>

          {/* CTA Section */}
          <div className="text-center">
            <div className="relative">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-12 rounded-2xl text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                onClick={handlePlanNewTripClick}
              >
                <Link href="/new-trip" className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  Create New Plan
                  {/* <Sparkles className="w-6 h-6 animate-pulse" /> */}
                </Link>
              </Button>
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>

            <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Powered by AI
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                Worldwide destinations
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                Mobile-friendly
              </span>
            </div>
          </div>

          {/* Feature Grid */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            <div className="group cursor-pointer">
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Globe className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Worldwide</h3>
                <p className="text-sm text-muted-foreground">Global destinations</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Smart Planning</h3>
                <p className="text-sm text-muted-foreground">AI-optimized routes</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Mountain className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Adventures</h3>
                <p className="text-sm text-muted-foreground">Unique experiences</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Camera className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Memories</h3>
                <p className="text-sm text-muted-foreground">Capture moments</p>
              </div>
            </div>
          </div> */}
        </section>

        {/* Saved Plans Section */}
        {savedPlans.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Travel Collection</h2>
                <p className="text-muted-foreground">Manage your saved adventures</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                    <TravelPlanCard plan={plan} />
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {savedPlans.length === 0 && !isLoading && (
          <section className="text-center py-20 mb-20">
            <div className="bg-card border border-border rounded-3xl p-12 max-w-2xl mx-auto shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group">
                <Plane className="w-12 h-12 text-primary group-hover:animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready for Your First Adventure?</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Your journey to extraordinary experiences starts here. Let our AI craft the perfect itinerary tailored just for you.
              </p>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI-Powered
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-primary" />
                  Worldwide
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  Personalized
                </span>
              </div>
            </div>
          </section>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}