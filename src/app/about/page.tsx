'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, BrainCircuit, HeartHandshake, Feather, ArrowRight } from 'lucide-react';
import { TravelCarousel } from '@/components/ui/TravelCarousel';

export default function AboutPage() {
    useEffect(() => {
        // This is good for maintaining a consistent feel with the home page
        document.documentElement.classList.add('.');
    }, []);

    return (
        <div className="text-foreground">
            {/* Animated Background Orbs (Consistent with HomePage) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 max-w-5xl">

                {/* Page Header */}
                <section className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
                    <h1
                        className="text-3xl md:text-6xl font-bold tracking-tighter text-foreground mb-4 opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                    >
                        Making Every Journey Unforgettable
                    </h1>
                    <p
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
                    >
                        We believe travel should be about breathtaking moments and seamless experiences, not stressful planning. Our AI-powered platform is designed to transform your wanderlust into perfectly crafted, personalized adventures.
                    </p>
                </section>

                {/* Our Story Section */}
                <section className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 md:mb-24">
                    <div
                        className="md:w-1/2 w-full opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
                    >
                        {/* START: Replace the static image with the dynamic carousel */}
                        <TravelCarousel images={[
                            '/assets/travel-photos/1.jpeg',
                            '/assets/travel-photos/2.jpeg',
                            '/assets/travel-photos/3.jpeg',
                            '/assets/travel-photos/4.jpeg',
                            '/assets/travel-photos/5.jpeg',
                            '/assets/travel-photos/6.jpeg',
                            '/assets/travel-photos/7.jpeg',
                        ]}
                            autoplay={false}           // Default: true
                            autoplayDelay={5000}      // Default: 5000ms
                        />
                        {/* END: Carousel replacement */}
                    </div>
                    <div
                        className="md:w-1/2 opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
                    >
                        <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">From Frustration to Freedom</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                Like many travelers, our founders were tired of juggling countless browser tabs, messy spreadsheets, and generic travel blogs. The magic of planning a trip was lost in the chaos of logistics.
                            </p>
                            <p>
                                We dreamed of a smarter way—a single, intuitive platform that could understand our travel style and build a complete, optimized itinerary in minutes. That dream became this app, your new AI travel companion.
                            </p>
                        </div>
                    </div>
                </section>


                {/* Our Values Section */}
                <section className="text-center mb-16 md:mb-24">
                    <h2
                        className="text-3xl font-bold text-foreground mb-8 tracking-tight opacity-0 animate-fadeInUp"
                        style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
                    >
                        What We Believe In
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Value Card 1 */}
                        <div
                            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                            style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
                        >
                            <BrainCircuit className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-foreground mb-1 text-lg">Intelligent Innovation</h3>
                            <p className="text-sm text-muted-foreground">We harness the power of AI not just for efficiency, but to unlock creative and personalized travel possibilities you never imagined.</p>
                        </div>
                        {/* Value Card 2 */}
                        <div
                            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                            style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
                        >
                            <HeartHandshake className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-foreground mb-1 text-lg">Authentic Experiences</h3>
                            <p className="text-sm text-muted-foreground">We prioritize genuine cultural immersion and unique local gems over tourist traps, helping you connect deeply with every destination.</p>
                        </div>
                        {/* Value Card 3 */}
                        <div
                            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fadeInUp"
                            style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}
                        >
                            <Feather className="w-10 h-10 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-foreground mb-1 text-lg">Effortless Simplicity</h3>
                            <p className="text-sm text-muted-foreground">Our design philosophy is simple: powerful technology should feel invisible, creating a planning process that is fluid, intuitive, and fun.</p>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section
                    className="text-center bg-card/50 border border-border/50 backdrop-blur-sm rounded-3xl py-12 px-6 opacity-0 animate-fadeInUp"
                    style={{ animationDelay: '1000ms', animationFillMode: 'forwards' }}
                >
                    <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Ready for Your Next Adventure?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Let us design your dream trip. It’s fast, free, and personalized just for you.
                    </p>
                    <div className="pt-2 pb-2 flex justify-center items-center">
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

                    {/* <Button
                        asChild
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-12 rounded-2xl text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white"
                    >
                        <Link href="/new-trip" className="flex items-center gap-3">
                            Plan Your Trip for Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </Button> */}
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
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
        </div>
    );
}