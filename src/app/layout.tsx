import type { Metadata } from 'next';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ApiLimitProvider } from '@/contexts/ApiLimitContext';

export const metadata: Metadata = {
  title: 'PlaPlan - Your Personal Travel Assistant',
  description: 'Plan your next adventure with PlaPlan, generating personalized travel itineraries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ApiLimitProvider>
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_1200px_800px_at_50%_-300px,hsl(13,85%,75%),hsl(25,70%,85%),transparent)] pointer-events-none -z-10" />
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-1/4 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-1/3 -left-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
            <div className="absolute top-2/3 right-1/4 w-72 h-72 bg-primary/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          </div>

          <Header />

          <main className="flex-grow container mx-auto px-0 py-8 relative z-0">
            {children}
          </main>

          <Footer />
          <Toaster />
        </ApiLimitProvider>
      </body>
    </html>
  );
}