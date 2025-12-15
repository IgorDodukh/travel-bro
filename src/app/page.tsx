'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Plane, Sparkles, Globe, Compass, Mountain, Camera } from 'lucide-react';
import ReviewsCarousel from '@/components/ReviewCarousel';
import FAQSection from '@/components/FaqSection';
import { Urbanist } from 'next/font/google'
import AppDownloadSection from '@/components/AppDownloadSection';

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-urbanist',
})


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
          {/* <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 w-fit mx-auto lg:mx-0">
            <Sparkles className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">AI-Powered Travel Planning</span>
          </div> */}

          {/* Main Heading */}
          <p className="text-4xl md:text-6xl sm:text-4xl text-gray-900 font-semibold max-w-2xl mx-auto my-4 md:my-8 lg:my-12 xl:my-12 text-center leading-tight">
            Plan your next travel{' '}
            <span
              className="bg-gradient-to-r from-orange-500 via-primary to-pink-500 bg-clip-text text-transparent"
            >
              10X
            </span>{' '}
            faster
          </p>
          {/* CTA Section */}

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-600">
            <span className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse flex-shrink-0" />
              Full journey in seconds
            </span>
            <span className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse flex-shrink-0" style={{ animationDelay: '1s' }} />
              Worldwide destinations
            </span>
            <span className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse flex-shrink-0" style={{ animationDelay: '2s' }} />
              Smart route building
            </span>
          </div>
        </section>
        <AppDownloadSection/>

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
                  Let our intelligent AI create personalized itineraries based on your preferences and interests
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
                  Visualize your entire journey with interactive maps and optimized routes between destinations
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
                  Every day planned perfectly with timings, locations, and all the details you need for a smooth trip
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