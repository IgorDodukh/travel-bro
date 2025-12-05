'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "How does the AI travel planner work?",
            answer: "Our AI analyzes your preferences, travel dates, budget, and interests to create a personalized itinerary. It considers factors like optimal routes, travel times, popular attractions, and local experiences to build the perfect trip for you. Simply input your destination and preferences, and let our AI do the rest!"
        },
        {
            question: "Is PlaPlan free to use?",
            answer: "Yes! PlaPlan offers a free version with core features including AI-powered itinerary generation and basic trip planning. We also offer premium features for users who want advanced customization, offline access, and additional travel tools. You can try premium features for free when you first download the app."
        },
        {
            question: "Can I modify the AI-generated itinerary?",
            answer: "Absolutely! While our AI creates optimized itineraries, you have full control to customize every aspect. You can add, remove, or rearrange activities, adjust timing, swap destinations, and personalize your trip to match your exact preferences. The AI suggestions are a starting point that you can tailor to your needs."
        },
        {
            question: "Does PlaPlan work offline?",
            answer: "Yes, with our premium features, you can download your itineraries for offline access. This means you can view your plans, check details, and navigate your trip even without an internet connection - perfect for international travel or areas with limited connectivity."
        },
        {
            question: "Which destinations does PlaPlan support?",
            answer: "PlaPlan supports destinations worldwide! From popular cities like Paris, Tokyo, and New York to hidden gems and remote locations, our AI can help plan trips anywhere in the world. We continuously update our database with new locations, attractions, and local experiences to ensure comprehensive coverage."
        },
        {
            question: "Can I share my itinerary with travel companions?",
            answer: "Yes! PlaPlan makes it easy to share your trip plans with friends and family. You can export your itinerary in multiple formats or share directly through the app. This ensures everyone in your group stays informed and can contribute to the planning process."
        },
        {
            question: "How accurate are the travel time estimates?",
            answer: "Our AI uses real-time data and historical traffic patterns to provide accurate travel time estimates between destinations. We factor in the mode of transportation, time of day, and typical conditions to help you plan realistic schedules. However, we always recommend building in some buffer time for unexpected delays."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/2 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl text-black/80 font-semibold mb-2 max-w-3xl mx-auto leading-relaxed">
                        Frequently Asked Questions
                    </h2>
                    <hr className="w-20 h-1 mx-auto my-2 bg-primary border-0 rounded-lg md:my-2 dark:bg-gray-700" />
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Everything you need to know about PlaPlan and how it can transform your travel planning experience
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                            style={{
                                animation: 'fadeInUp 0.6s ease-out forwards',
                                animationDelay: `${index * 100}ms`,
                                opacity: 0
                            }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-200 hover:bg-white/40"
                            >
                                <span className="font-semibold text-foreground text-base md:text-lg pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-5 pt-2">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still have questions CTA */}
                <div className="mt-12 text-center">
                    <div className="inline-block bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            Still have questions?
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            We're here to help! Reach out to our support team anytime.
                        </p>
                        <a
                            href="/support"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Contact Support
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
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
      `}</style>
        </section>
    );
}