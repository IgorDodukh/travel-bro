'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Sample reviews data - replace with your actual reviews
const reviews = [
  {
    id: 1,
    name: "Olena",
    avatar: "👩‍💼",
    rating: 5,
    comment: "PlaPlan.io completely transformed how I plan my trips! The AI suggestions were spot-on and saved me hours of research. Best travel app I've ever used!",
    location: "New York, USA"
  },
  {
    id: 2,
    name: "Alex",
    avatar: "👨‍💻",
    rating: 5,
    comment: "Incredible experience! The itineraries are perfectly optimized and the app understood exactly what kind of traveler I am. Highly recommend to everyone!",
    location: "London, UK"
  },
  {
    id: 3,
    name: "Valeria",
    avatar: "👩‍🎨",
    rating: 5,
    comment: "I was skeptical about AI planning, but PlaPlan.io exceeded all expectations. My European adventure was perfectly organized and stress-free!",
    location: "Barcelona, Spain"
  },
  {
    id: 4,
    name: "Viacheslav",
    avatar: "👨‍🔬",
    rating: 5,
    comment: "The attention to detail is amazing! Every suggestion felt personalized. PlaPlan.io made planning my honeymoon an absolute breeze.",
    location: "Singapore"
  },
  {
    id: 5,
    name: "Alona",
    avatar: "👩‍🏫",
    rating: 5,
    comment: "As a busy professional, this app is a lifesaver. Smart, intuitive, and creates itineraries better than any travel agent I've worked with!",
    location: "Sydney, Australia"
  },
  {
    id: 6,
    name: "Michael O'Brien",
    avatar: "👨‍✈️",
    rating: 5,
    comment: "I've used many travel planning tools, but PlaPlan.io stands out. The AI really understands travel preferences and creates magical experiences!",
    location: "Dublin, Ireland"
  },
  {
    id: 7,
    name: "Yuki Tanaka",
    avatar: "👩‍💼",
    rating: 5,
    comment: "Perfect for solo travelers! The app helped me discover hidden gems I would never have found on my own. Absolutely worth it!",
    location: "Tokyo, Japan"
  },
  {
    id: 8,
    name: "Lucas Silva",
    avatar: "👨‍🎓",
    rating: 5,
    comment: "Game changer for budget travelers! PlaPlan.io helped me plan an incredible trip while staying within my budget. The smart recommendations are phenomenal!",
    location: "São Paulo, Brazil"
  }
];

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-12 px-4">
        <p className="text-xl md:text-2xl text-black/80 font-semibold mb-2">
          What Our Travelers Say
        </p>
        <hr className="w-20 h-1 mx-auto my-2 bg-primary border-0 rounded-lg md:my-4" />
        <p className="text-sm md:text-md text-black/60 max-w-2xl mx-auto">
          Join our happy travelers who've transformed their adventures with PlaPlan.io
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Review Cards Carousel */}
        <div 
          className="relative overflow-hidden rounded-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="w-full flex-shrink-0 px-2 sm:px-4">
                {/* Review Card */}
                <div className="bg-white/70 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[280px] sm:min-h-[260px] flex flex-col">
                  
                  {/* Header with Avatar and Name */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-3xl sm:text-4xl border-2 border-primary/20">
                      {review.avatar}
                    </div>
                    
                    {/* Name and Location */}
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-base sm:text-lg">
                        {review.name}
                      </h3>
                      {/* <p className="text-xs sm:text-sm text-muted-foreground">
                        {review.location}
                      </p> */}
                    </div>

                    {/* Google-style logo */}
                    {/* <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div> */}
                  </div>

                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Review Comment */}
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed flex-1">
                    "{review.comment}"
                  </p>

                  {/* Verified Badge */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Verified Traveler
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => { prevSlide(); setIsAutoPlaying(false); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 bg-white/90 hover:bg-white backdrop-blur-sm border border-border rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
          aria-label="Previous review"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </button>
        
        <button
          onClick={() => { nextSlide(); setIsAutoPlaying(false); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 bg-white/90 hover:bg-white backdrop-blur-sm border border-border rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10"
          aria-label="Next review"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </button>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-primary'
                  : 'w-2 h-2 bg-primary/30 hover:bg-primary/50'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}