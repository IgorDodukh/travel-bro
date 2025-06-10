
import { Loader2 } from 'lucide-react';

export default function LoadingPlanDetails() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-2xl font-semibold text-primary mb-2">Loading Your Plan Details...</h2>
      <p className="text-muted-foreground">Just a moment while we retrieve the specifics of your selected adventure.</p>
    </div>
  );
}
