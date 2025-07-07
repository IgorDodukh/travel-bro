import Link from 'next/link';
import { Plane } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Plane className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold">MIARA Planner</h1>
        </Link>
        <nav>
          {/* Future navigation links can go here */}
        </nav>
      </div>
    </header>
  );
}
