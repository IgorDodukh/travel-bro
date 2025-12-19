'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Calendar, Plane, Sparkles, Globe, Mountain, Camera } from 'lucide-react';
import ReviewsCarousel from '@/components/ReviewCarousel';
import FAQSection from '@/components/FaqSection';
import AppDownloadSection from '@/components/AppDownloadSection';
import { point } from 'leaflet';

const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';
const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';

const PRICING_DATA = {
  planGenerations: {
    free: '3/day',
    pro: 'Unlimited',
    title: 'Travel Plan Generations',
    subtitle: 'Create new itineraries',
    points: null,
    order: 1,
  },
  savedPlans: {
    free: '2 plans',
    pro: 'Unlimited',
    title: 'Saved Plans',
    subtitle: 'Store itineraries',
    points: null,
    order: 2,
  },
  aiItineraries: {
    free: true,
    pro: true,
    title: 'AI-Powered Itineraries',
    subtitle: 'Day-by-day plans with places, timing, and routes',
    points: null,
    order: 3,
  },
  interactiveMaps: {
    free: true,
    pro: true,
    title: 'Interactive Maps',
    subtitle: 'View all stops and routes in one place',
    points: null,
    order: 4,
  },
  packingLists: {
    free: true,
    pro: true,
    title: 'Packing Lists',
    subtitle: 'Basic simple packing lists for each trip',
    points: null,
    order: 5,
  },
  travelPlanCustomization: {
    free: false,
    pro: true,
    title: 'Travel Plan Customization',
    subtitle: 'Edit title, description and cover picture',
    points: null,
    order: 6,
  },
  dashboard: {
    free: false,
    pro: true,
    title: 'Travel Dashboard',
    subtitle: 'Travel insights and statistics',
    points: [
      'Total Travel Duration and Distance',
      'Best Period to Visit',
      'Location Safety Rate',
      'Avg. Accommodation Price',
      'Public Transport Info'
    ],
    order: 7,
  },
  locationDetails: {
    free: false,
    pro: true,
    title: 'Location Details',
    subtitle: 'Cost of visiting and time insights for each place',
    points: null,
    order: 8,
  },
  offlineAccess: {
    free: false,
    pro: true,
    title: 'Offline Access',
    subtitle: 'Access your plans without internet',
    points: null,
    order: 9,
  },
  itineraryManagement: {
    free: false,
    pro: true,
    title: 'Manage Itineraries',
    subtitle: 'Create, update and delete locations, add new days',
    points: null,
    order: 10,
  },
};

const FeatureValue = ({ value, isPro }: { value: string | boolean; isPro?: boolean }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  if (value === 'Unlimited' && isPro) {
    return (
      <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 lg:px-4 py-1">
        <span className="text-primary font-bold text-sm lg:text-base">Unlimited</span>
      </div>
    );
  }

  return <span className="text-muted-foreground font-medium text-sm lg:text-base">{value}</span>;
};

export function OptimizedPricingSection() {
  // Sort features by order
  const sortedFeatures = Object.entries(PRICING_DATA).sort(
    ([, a], [, b]) => a.order - b.order
  );

  return (
    <section className="mt-20 mb-20 relative">
      <div className="text-center mb-12">
        <p className="text-3xl md:text-4xl text-black/80 font-semibold mb-2 max-w-3xl mx-auto leading-relaxed">
          Pricing
        </p>
        <hr className="w-20 h-1 mx-auto my-2 bg-primary border-0 rounded-lg md:my-2" />
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
          Start free and upgrade when you're ready for unlimited planning
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Mobile View - Card Layout */}
        <div className="md:hidden space-y-6">
          {/* Free Plan Card */}
          <div className="bg-white/60 backdrop-blur-sm border border-border rounded-3xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-2 shadow-sm">
                <span className="text-xl font-bold text-foreground">Free</span>
              </div>
              <p className="text-sm text-muted-foreground">Get Started</p>
            </div>
            <div className="p-6 space-y-4">
              {sortedFeatures.map(([key, feature]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between py-3 ${key !== sortedFeatures[sortedFeatures.length - 1][0] ? 'border-b border-border' : ''
                    }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
                  </div>
                  <div className="ml-4">
                    <FeatureValue value={feature.free} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className="bg-white/60 backdrop-blur-sm border-2 border-primary rounded-3xl overflow-hidden shadow-xl relative">
            <div className="bg-gradient-to-r from-primary/20 to-amber-500/20 p-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-amber-500 rounded-full px-4 py-2 mb-2 shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-xl font-bold text-white">Premium</span>
              </div>
              <p className="text-sm font-medium text-primary">Unlimited Planning</p>
            </div>
            <div className="p-6 space-y-4">
              {sortedFeatures.map(([key, feature]) => (
                <div
                  key={key}
                  className={`${key !== sortedFeatures[sortedFeatures.length - 1][0] ? 'border-b border-border' : ''
                    }`}
                >
                  {feature.points ? (
                    // Special rendering for dashboard with points
                    <div className="space-y-3 py-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{feature.title}</p>
                        <FeatureValue value={feature.pro} isPro />
                      </div>
                      <div className="pl-4 space-y-2 text-sm">
                        {feature.points.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            <p className="text-muted-foreground">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Standard feature rendering
                    <div className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
                      </div>
                      <div className="ml-4">
                        <FeatureValue value={feature.pro} isPro />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden md:block bg-white/60 backdrop-blur-sm border border-border rounded-3xl overflow-hidden shadow-lg">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-primary/45 to-primary/20 border-b border-border">
            <div className="col-span-1"></div>
            <div className="col-span-1 text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-2">
                <span className="text-lg font-bold text-foreground">Free</span>
              </div>
              <p className="text-sm text-foreground/80 font-medium">Get Started</p>
            </div>
            <div className="col-span-1 text-center relative">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 rounded-full px-4 py-2 mb-2 shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-lg font-bold text-white">Premium</span>
              </div>
              <p className="text-sm font-medium text-primary">Unlimited Planning</p>
            </div>
          </div>

          {/* Feature Rows */}
          <div className="divide-y divide-border">
            {sortedFeatures.map(([key, feature]) => (
              <div
                key={key}
                className="grid grid-cols-3 gap-4 p-6 hover:bg-primary/5 transition-colors duration-200"
              >
                <div className="col-span-1 flex items-center">
                  <div>
                    <p className="font-semibold text-foreground text-sm lg:text-base">
                      {feature.title}
                    </p>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      {feature.subtitle}
                    </p>
                    {feature.points && (
                      // Special rendering for dashboard with points
                      <div className="text-center w-full">
                        <div className="p-4 space-y-2">
                          {feature.points.map((point, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-left">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                              <p className="text-xs lg:text-sm text-muted-foreground">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <FeatureValue value={feature.free} />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <FeatureValue value={feature.pro} isPro />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Row */}
          {/* <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-border">
            <div className="col-span-1"></div>
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-sm text-muted-foreground font-medium">Free Forever</span>
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <Link
                href="https://apps.apple.com/app/apple-store/id6751006510?pt=128059857&ct=landing_download&mt=8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Premium</span>
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}

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
    <div>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-2 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center">
          {/* Badge */}
          <div className="relative inline-flex items-center w-fit mx-auto lg:mx-0 group">
            {/* Gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-full opacity-25 group-hover:opacity-60 transition duration-300 blur-sm"></div>

            {/* Content */}
            <div className="relative inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent font-semibold">
                AI-Powered Travel Planning
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <p className="text-4xl md:text-6xl sm:text-4xl text-gray-900 font-semibold max-w-2xl mx-auto my-4 md:my-8 lg:my-12 xl:my-12 text-center leading-tight">
            Your trip is{' '}
            <span
              className="bg-gradient-to-r from-orange-500 via-primary to-pink-500 bg-clip-text text-transparent"
            >
              fully planned
            </span>{' '}
            without boring research
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From routes and maps to daily schedules and location insights. PlaPlan creates a complete, ready-to-use itinerary in minutes.
          </p>
        </section>

        {/* CTA Section */}
        <AppDownloadSection />

        {/* Travel Interests Badges Section */}
        <section className="mt-10 mb-16 relative">
          {/* Badges Container with fade edges */}
          <div className="relative w-[100%]  mx-auto overflow-hidden">
            {/* Badges Content */}
            <div className="space-y-1">
              {/* Row 1 */}
              <div className="flex gap-1 flex-wrap justify-center">
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🎨 Art
                </span>
                <span className="hidden sm:hidden md:hidden lg:flex inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🏔️ Mountains
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🥾 Hiking
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🏛️ Museums
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🌊 Beaches
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🏰 Castles
                </span>
                <span className="hidden sm:hidden md:hidden lg:flex inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🦁 Safari
                </span>
              </div>

              {/* Row 2 - Shifted right */}
              <div className="flex gap-1 flex-wrap justify-center">
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  📸 Viewpoints
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🍕 Local Food
                </span>
                <span className="hidden sm:hidden md:hidden lg:flex inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🌿 Nature Parks
                </span>
                <span className="hidden sm:hidden md:hidden lg:flex inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🍷 Wine Tasting
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🎭 Theater
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🏺 History
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🚴 Cycling
                </span>
                {/* <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🛍️ Shopping
                </span> */}
              </div>

              {/* Row 3 - Same position as Row 1 */}
              <div className="flex gap-1 flex-wrap justify-center">
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🏖️ Island
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🎪 Festivals
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🌃 Nightlife
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🛍️ Shopping
                </span>
                <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🛕 Temples
                </span>
                <span className="flex sm:hidden md:hidden lg:flex inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-white/80 transition-all duration-300 hover:scale-105 cursor-pointer">
                  🏄 Water Sports
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 mb-20 relative">
          <div className="text-center mb-12">
            <p className="text-3xl md:text-4xl text-black/80 font-semibold mb-2 max-w-3xl mx-auto leading-relaxed">
              See PlaPlan in Action
            </p>
            <hr className="w-20 h-1 mx-auto my-2 bg-primary border-0 rounded-lg md:my-2" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover how PlaPlan transforms your travel planning experience with intelligent features and beautiful design
            </p>
          </div>

          {/* Screenshots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto px-4 sm:px-6">

            {/* Screenshot 1 - AI Planning */}
            <div className="group flex flex-col items-center">
              <div className="relative w-full max-w-[280px] mx-auto mb-6 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* Phone Frame */}
                <div className="w-[173px] h-[570px] rounded-[2rem]">
                  <Image
                    src="/assets/screenshot1.png"
                    alt="App Screenshot 1"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature Description */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">AI-Powered Planning</h3>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  A full day-by-day itinerary with places, timing, and routes are generated instantly.
                </p>
              </div>
            </div>

            {/* Screenshot 2 - Map View */}
            <div className="group flex flex-col items-center">
              <div className="relative w-full max-w-[280px] mx-auto mb-6 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* Phone Frame */}
                <div className="w-[173px] h-[570px] rounded-[2rem]">
                  <Image
                    src="/assets/screenshot2.png"
                    alt="App Screenshot 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature Description */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Interactive Maps</h3>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  See every stop and route on one map, no switching between apps.
                </p>
              </div>
            </div>

            {/* Screenshot 3 - Itinerary Details */}
            <div className="group flex flex-col items-center md:col-span-2 lg:col-span-1">
              <div className="relative w-full max-w-[280px] mx-auto mb-6 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* Phone Frame */}
                <div className="w-[173px] h-[570px] rounded-[2rem]">
                  <Image
                    src="/assets/screenshot3.png"
                    alt="App Screenshot 3"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature Description */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Detailed Itineraries</h3>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Know exactly where to go, when, and how long to stay.
                </p>
              </div>
            </div>
          </div>

          {/* Optional: Call-to-Action */}
          <div className="text-center mt-12">
            <Link
              href="https://apps.apple.com/app/apple-store/id6751006510?pt=128059857&ct=landing_download&mt=8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-2xl text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Download Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Pricing Comparison Section */}
        <OptimizedPricingSection />

        <section className="text-center">
          {/* Feature Grid */}
          <div className='mt-10'>
            <p className="text-3xl md:text-4xl text-black/80 font-semibold mb-2 max-w-3xl mx-auto leading-relaxed">
              Awesome App Features
            </p>
            <hr className="w-20 h-1 mx-auto my-2 bg-primary border-0 rounded-lg md:my-2 dark:bg-gray-700" />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12 max-w-3xl mx-auto leading-relaxed">
              Traveling made easy with AI-powered planning, worldwide destinations, and mobile-focused design. Create your perfect trip in minutes and never waste your time on endless research!
            </p>
          </div>

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
                <Calendar className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 group-hover: transition-transform duration-300" />
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
        <FAQSection />
        {/* <ReviewsCarousel /> */}
      </div >

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
    </div >
  );
}