import type { Metadata } from 'next';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ApiLimitProvider } from '@/contexts/ApiLimitContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  robots: siteConfig.robots,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`, // Create this image
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.png`], // Same image as above
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isProduction && (
          <>
            <script src="https://cdn.cookiehub.eu/c2/1045cff8.js"></script>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
                  document.addEventListener("DOMContentLoaded", function(event) {
                    var cpm = { };
                    window.cookiehub.load(cpm);
                  });
                `,
              }}
            />
          </>
        )}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="canonical" href="https://plaplan.io" key="canonical" />
        <meta name="PlaPlan" content="app-id=6751006510"></meta>
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
            <Analytics />
            <SpeedInsights />
          </main>

          <Footer />
          <Toaster />
        </ApiLimitProvider>
      </body>
    </html>
  );
}