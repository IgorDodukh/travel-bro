'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export type PostSummary = {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readingMinutes: number;
    cover?: string;
    tags?: string[];
};

// Export posts for reuse in other files
export const posts: PostSummary[] = [
    {
        slug: 'ai-vs-human-travel-planning',
        title: 'AI vs Human Travel Planning — The Real Test',
        excerpt: 'See how AI-built itineraries beat the endless tabs and manual planning in speed, relevance and personalization.',
        date: '2025-10-15',
        readingMinutes: 4,
        cover: '/assets/blog-covers/ai-vs-human.jpg',
        tags: ['ai', 'planning'],
    },
    {
        slug: 'hidden-gems-portugal',
        title: '5 Hidden Gems in Portugal You\'d Never Find on Google Maps',
        excerpt: 'Discover secret beaches, mountain villages and local cafes — handpicked and ranked by our AI.',
        date: '2025-10-01',
        readingMinutes: 5,
        cover: '/assets/blog-covers/portugal-gems.jpg',
        tags: ['portugal', 'hidden-gems'],
    },
    {
        slug: 'plan-weekend-trip-5-min',
        title: 'Plan Your Next Weekend Trip in 5 Minutes',
        excerpt: 'How to use PlaPlan to create a perfect 2-day escape — step by step.',
        date: '2025-10-28',
        readingMinutes: 5,
        cover: '/assets/blog-covers/weekend-trip.jpg',
        tags: ['how-to', 'weekend'],
    },
    {
        slug: '10-travel-planning-tips',
        title: '10 Smart Travel Planning Tips You Can Learn from AI',
        excerpt: 'Discover expert travel planning strategies inspired by AI optimization.',
        date: '2025-11-03',
        readingMinutes: 6,
        cover: '/assets/blog-covers/10-travel-tips.jpg',
        tags: ['travel', 'tips'],
    },
];

export default function BlogPageClient() {
    useEffect(() => {
        document.documentElement.classList.add('.');
    }, []);

    // Add JSON-LD structured data for blog list
    const blogListSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'PlaPlan Travel Blog',
        description: 'Travel planning tips and guides powered by AI',
        url: 'https://plaplan.io/blog',
        publisher: {
            '@type': 'Organization',
            name: 'PlaPlan',
            logo: {
                '@type': 'ImageObject',
                url: 'https://plaplan.io/logo.png',
            },
        },
        blogPost: posts.map(post => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            url: `https://plaplan.io/blog/${post.slug}`,
            image: post.cover ? `https://plaplan.io${post.cover}` : undefined,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
            />
            <div className="text-foreground">
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
                </div>

                <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 max-w-5xl">
                    <section className="text-center max-w-4xl mx-auto mb-12 md:mb-20">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground mb-4 opacity-0 animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                            Stories & Guides
                        </h1>
                        <p className="text-lg md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed opacity-0 animate-fadeInUp" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                            Useful guides, travel inspiration and AI-driven tips to help you travel smarter. New posts published regularly.
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map((p, i) => (
                            <article
                                key={p.slug}
                                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 opacity-0 animate-fadeInUp group"
                                style={{ animationDelay: `${300 + i * 100}ms`, animationFillMode: 'forwards' }}
                            >
                                <Link href={`/blog/${p.slug}`} className="grid grid-cols-1 md:grid-cols-[auto_1fr] h-full">
                                    <div className="relative w-full h-48 md:h-auto md:w-48 lg:w-44">
                                        <Image
                                            src={p.cover ?? '/assets/blog-covers/default.jpg'}
                                            alt={p.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 192px, 176px"
                                        />
                                    </div>

                                    <div className="p-4 md:p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                <time dateTime={p.date}>{new Date(p.date).toLocaleDateString()}</time>
                                                <span>•</span>
                                                <span>{p.readingMinutes} min</span>
                                            </div>

                                            <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {p.title}
                                            </h2>
                                            <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">{p.excerpt}</p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-4">
                                            <div className="flex gap-2 flex-wrap">
                                                {p.tags?.slice(0, 3).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="text-primary font-semibold flex items-center gap-2 flex-shrink-0">
                                                <span>Read</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </section>

                    <section className="text-center mt-12">
                        <Link href="/new-trip" className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all duration-200">
                            Plan Your Trip — Try PlaPlan
                            <ArrowRight className="w-4 h-4" />
                        </Link>
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
        </>
    );
}