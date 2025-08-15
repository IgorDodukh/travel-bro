"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Compass, Sparkles, Home } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navigationLinks = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Home page'
    },
    {
      href: '/my-plans',
      label: 'Collection',
      icon: Compass,
      description: 'Saved trips collection'
    },
    {
      href: '/support',
      label: 'Contact Us',
      icon: Compass,
      description: 'Contact form'
    },
    {
      href: '/about',
      label: 'About',
      icon: MapPin,
      description: 'About PlaPlan'
    },
  ];

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 text-primary hover:opacity-80 transition-all duration-300 group"
          >
            <div className="relative">
              <Image
                src="/assets/logo-transparent.png"
                alt="PlaPlan Logo"
                width={100}
                height={52}
                priority
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute -inset-2 bg-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePath(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300
                    ${isActive
                      ? 'text-primary font-semibold hover:text-primary/70'
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {/* <Icon
                    className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                  /> */}
                  <span className="text-sm font-semibold">{link.label}</span>

                  {/* Active indicator */}
                  {/* {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full" />
                  )} */}

                  {/* Hover tooltip */}
                  {/* <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{link.description}</p>
                    </div>
                  </div> */}
                </Link>
              );
            })}

            {/* CTA Button */}
            <Link
              href="/new-trip"
              className="ml-4 relative group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              <div className="w-5 h-5 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3" />
              </div>
              <span>Plan Trip</span>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors duration-200">
            <div className="flex flex-col gap-1">
              <div className="w-4 h-0.5 bg-foreground rounded-full transition-all duration-300" />
              <div className="w-4 h-0.5 bg-foreground rounded-full transition-all duration-300" />
              <div className="w-4 h-0.5 bg-foreground rounded-full transition-all duration-300" />
            </div>
          </button>
        </div>

        {/* Mobile Navigation (Hidden by default) */}
        <div className="md:hidden mt-4 pt-4 border-t border-border hidden">
          <nav className="flex flex-col gap-2">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePath(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{link.label}</span>
                    <span className="text-xs opacity-70">{link.description}</span>
                  </div>
                </Link>
              );
            })}

            {/* Mobile CTA */}
            <Link
              href="/new-trip"
              className="mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan New Trip</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}