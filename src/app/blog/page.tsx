import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export type PostSummary = {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readingMinutes: number;
    cover?: string;
    tags?: string[];
};

export const metadata: Metadata = {
    title: 'Travel Planning Blog | AI Travel Tips & Guides | PlaPlan',
    description: 'Discover smart travel planning tips, AI-powered itinerary guides, and hidden travel destinations. Learn how to plan the perfect trip with PlaPlan.',
    keywords: 'travel planning, AI travel planner, trip planning tips, travel itinerary, travel guide, weekend trips, travel blog',
    openGraph: {
        title: 'Travel Planning Blog | PlaPlan',
        description: 'Smart travel planning tips and AI-powered travel guides',
        type: 'website',
        url: 'https://plaplan.io/blog',
        images: [
            {
                url: '/assets/blog-covers/og-blog.png',
                width: 1200,
                height: 630,
                alt: 'PlaPlan Travel Blog',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Travel Planning Blog | PlaPlan',
        description: 'Smart travel planning tips and AI-powered travel guides',
        images: ['/assets/blog-covers/og-blog.png'],
    },
    alternates: {
        canonical: 'https://plaplan.io/blog',
    },
};

export default function BlogIndexPage() {
    return (
        <BlogPageClient />
    );
}