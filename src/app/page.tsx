'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Plane, Sparkles, Globe, Compass, Mountain, Camera } from 'lucide-react';

const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';
const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('.');
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
    <div className="bg-background">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Travel Planning</span>
          </div>

          {/* Main Heading */}
          <div className="relative mb-8 ">
            <div className="inline-flex items-center gap-2 px-4 py-2 opacity-0 animate-fadeInUp"
              style={{
                animationDelay: `${1 * 100}ms`,
                animationFillMode: 'forwards'
              }}>
              <Image
                src="/assets/logo-transparent.png"
                alt="PlaPlan Logo"
                width={440}
                height={52}
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
              <Compass className="w-8 h-8 md:w-12 md:h-12 text-primary/40 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-12 rounded-2xl text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group text-white"
                onClick={handlePlanNewTripClick}
              >
                <Link href="/new-trip" className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  Create New Plan
                  <Sparkles className="w-6 h-6 animate-pulse" />
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
          <div className="pt-6 pb-6 flex justify-center items-center">
            <Link
              href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on the App Store"
            >
              <Image
                src="assets/app-store-badge-black.svg"
                alt="Download on the App Store"
                width={140}
                height={44}
                className="hover:opacity-80 transition-opacity duration-300"
              />
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="group cursor-pointer">
              <div
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: `${2 * 100}ms`,
                  animationFillMode: 'forwards'
                }}>
                <Globe className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Worldwide</h3>
                <p className="text-sm text-muted-foreground">Global destinations</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: `${3 * 100}ms`,
                  animationFillMode: 'forwards'
                }}>
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">AI Planning</h3>
                <p className="text-sm text-muted-foreground">Optimized travel routes</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: `${4 * 100}ms`,
                  animationFillMode: 'forwards'
                }}>
                <Mountain className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Adventures</h3>
                <p className="text-sm text-muted-foreground">Unique experiences</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                style={{
                  animationDelay: `${5 * 100}ms`,
                  animationFillMode: 'forwards'
                }}>
                <Camera className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-semibold text-foreground mb-1">Memories</h3>
                <p className="text-sm text-muted-foreground">Capture best moments</p>
              </div>
            </div>
          </div>
        </section>
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