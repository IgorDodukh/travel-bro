'use client';

import { useEffect, useState } from 'react';
import TravelPlanCard from '@/components/TravelPlanCard';
import type { TravelPlan } from '@/lib/types';
import { getSavedTravelPlans } from '@/lib/localStorageUtils';
import { MapPin, Calendar, Plane, Sparkles, Globe } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function MyPlansPage() {
  redirect('/');
  return null;

  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('.');
    setSavedPlans(getSavedTravelPlans());
    setIsLoading(false);
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-xl text-muted-foreground mt-6 animate-pulse">Loading your travel plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">

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