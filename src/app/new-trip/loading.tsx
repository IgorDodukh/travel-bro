
import { Loader2 } from 'lucide-react';

export default function LoadingNewTrip() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-2xl font-semibold text-primary mb-2">Working Hard on Your Adventure Plan...</h2>
      <p className="text-muted-foreground">Just a moment while we do some magic.</p>
    </div>
  );
}
