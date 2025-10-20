import { appVersion } from "@/app/utils/appVersion";

export default function Footer() {
  return (
    <footer className="bg-background mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PlaPlan.io. All rights reserved.</p>
        <p className="text-xs">v{appVersion}</p>
      </div>
    </footer>
  );
}
