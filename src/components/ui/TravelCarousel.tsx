'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  images: string[];
  autoplay?: boolean;
  autoplayDelay?: number;
};

export const TravelCarousel: React.FC<CarouselProps> = ({ 
  images, 
  autoplay = true, 
  autoplayDelay = 5000 
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    skipSnaps: false,
    dragFree: false
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayDelay);

    // Pause autoplay on hover
    const container = emblaApi.containerNode();
    const handleMouseEnter = () => clearInterval(autoplayInterval);
    const handleMouseLeave = () => {
      const newInterval = setInterval(() => {
        emblaApi.scrollNext();
      }, autoplayDelay);
      return newInterval;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(autoplayInterval);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [emblaApi, autoplay, autoplayDelay]);

  if (!images.length) return null;

  return (
    <div className="relative group">
      {/* Main Carousel Container */}
      <div 
        className="embla rounded-2xl border border-border shadow-lg overflow-hidden bg-muted/5" 
        ref={emblaRef}
      >
        <div className="embla__container">
          {images.map((src, index) => (
            <div className="embla__slide" key={index}>
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={src}
                  alt={`Travel photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Image counter overlay */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {index + 1} / {images.length}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-50"
        onClick={scrollPrev}
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-50"
        onClick={scrollNext}
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-primary w-8' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Enhanced 3D Effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 pointer-events-none" 
        style={{ 
          transform: 'translateZ(20px) scale(0.98)',
          filter: 'blur(0.5px)'
        }}
      />

      {/* Embedded Styles */}
      <style jsx global>{`
        .embla {
          overflow: hidden;
          cursor: grab;
        }
        .embla:active {
          cursor: grabbing;
        }
        .embla__container {
          display: flex;
          touch-action: pan-y;
          margin-left: -16px;
        }
        .embla__slide {
          position: relative;
          flex: 0 0 100%;
          min-width: 0;
          padding-left: 16px;
          transform: translate3d(0, 0, 0);
        }
        
        /* Smooth transitions for better UX */
        .embla__container {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Touch and mobile optimizations */
        @media (max-width: 768px) {
          .embla__slide {
            padding-left: 8px;
          }
          .embla__container {
            margin-left: -8px;
          }
        }
      `}</style>
    </div>
  );
};