"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Mail, Info, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Home page'
    },
    // TODO: Return back when Plan generation is refactored for web
    // {
    //   href: '/my-plans',
    //   label: 'Collection',
    //   icon: Compass,
    //   description: 'Saved trips collection'
    // },
    {
      href: '/support',
      label: 'Contact Us',
      icon: Mail,
      description: 'Contact form'
    },
    {
      href: '/about',
      label: 'About',
      icon: Info,
      description: 'About PlaPlan.io'
    },
  ];

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleCounterPress = () => {
    // You can show a modal, navigate to settings, or show more details
    console.log('API counter pressed - show usage details');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/10 backdrop-blur-sm border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 text-primary hover:opacity-80 transition-all duration-300 group"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <Image
                src="/assets/logo-transparent.png"
                alt="PlaPlan Logo"
                width={120}
                height={62}
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
                      ? 'text-primary font-semibobld text-xl hover:text-primary/70'
                      : 'text-foreground/70 hover:text-foreground'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                  />
                  <span className="text-sm font-semibold">{link.label}</span>

                </Link>
              );
            })}
            {/* TODO: Return back when Plan generation is refactored for web */}
            {/* <CompactApiCounterWithModal /> */}


            {/* CTA Button */}
            {/* TODO: Return back when Plan generation is refactored for web */}
            {/* <Link
              href="/new-trip"
              className="ml-4 relative group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-white"
            >
              <div className="w-5 h-5 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3" />
              </div>
              <span>Plan Trip</span>

              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link> */}
            <Link
              href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on the App Store"
              className="ml-4 relative group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-white"
            >
              <span>Get App</span>
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link>

          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <div className="flex flex-col gap-1">
                <div className="w-4 h-0.5 bg-foreground rounded-full transition-all duration-300" />
                <div className="w-4 h-0.5 bg-foreground rounded-full transition-all duration-300" />
                <div className="w-4 h-0.5 bg-foreground rounded-full transition-all duration-300" />
              </div>
            )}
          </button>
        </div>

        {/* Mobile Navigation - Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed left-0 right-0 top-[72px] z-40 px-6 pb-6 animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl p-4">
              <nav className="flex flex-col gap-2">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActivePath(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-3xl font-medium transition-all duration-300
                        ${isActive
                          ? 'border-2 border-primary text-primary bg-white/60 hover:bg-white/70'
                          : 'text-foreground hover:text-foreground hover:bg-white/60'
                        }
                      `}
                    >
                      <Icon className={isActive ? "w-6 h-6" : "w-5 h-5"} />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{link.label}</span>
                        <span className="text-xs opacity-70">{link.description}</span>
                      </div>
                    </Link>
                  );
                })}

                {/* Mobile CTA */}
                {/* TODO: Return back when Plan generation is refactored for web */}
                {/* <Link
                  href="/new-trip"
                  onClick={closeMobileMenu}
                  className="mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Plan New Trip</span>
                </Link> */}
                <Link
                  href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  aria-label="Download on the App Store"
                  className="mt-2 flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-primary/90 transition-all duration-300"
                >
                  <span>Get App</span>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}