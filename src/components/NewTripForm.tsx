
'use client';

import { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import { handleGeneratePlansAction, type NewTripFormActionState } from '@/app/new-trip/actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateTravelPlansOutput } from '@/lib/types';

const initialFormState: NewTripFormActionState = { success: false };

export default function NewTripForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  // formData for client-side state before submitting to server action
  const [clientFormData, setClientFormData] = useState({
    destination: '',
    duration: '3', // Stored as string, parsed by server action
    accommodation: '',
    transport: '',
    interests: '', // comma-separated string
    attractionType: '',
  });

  const [state, formAction] = useFormState(handleGeneratePlansAction, initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();

    // Manually append all data from clientFormData
    formData.append('destination', clientFormData.destination);
    formData.append('duration', clientFormData.duration);
    formData.append('accommodation', clientFormData.accommodation);
    formData.append('transport', clientFormData.transport);
    formData.append('interests', clientFormData.interests);
    formData.append('attractionType', clientFormData.attractionType);
    
    startTransition(async () => {
      // Directly call the server action with the constructed FormData
      const result = await handleGeneratePlansAction(state, formData); // Pass previous state if needed by action
      if (result.success && result.data) {
        toast({
          title: "Plans Generated!",
          description: "Redirecting to your new travel plans...",
          variant: "default",
        });
        const params = new URLSearchParams();
        params.append('plans', JSON.stringify(result.data));
        params.append('formInput', JSON.stringify({
          ...clientFormData,
          duration: parseInt(clientFormData.duration, 10), // Ensure duration is number for `formInput`
          interests: clientFormData.interests.split(',').map(i => i.trim()).filter(i => i), // Ensure interests is array for `formInput`
        }));
        router.push(`/new-trip/plans?${params.toString()}`);
      } else {
        toast({
          title: "Error Generating Plans",
          description: result.message || "An unknown error occurred.",
          variant: "destructive",
        });
        // Update state if server action returns new errors for display
        // This part depends on how useFormState interacts with manually calling the action
        // For now, we assume the toast is sufficient for feedback on failure.
        // If the action sets state.errors or state.message, they would be available here if `formAction(formData)` was used.
        // Since we're calling `handleGeneratePlansAction` directly, we'd need to manually update a local error state if needed.
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Plan Your Next Adventure</CardTitle>
        <CardDescription>Follow these steps to create your personalized travel plan.</CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full mt-2" />
        <p className="text-sm text-muted-foreground mt-1 text-center">Step {currentStep} of {totalSteps}</p>
      </CardHeader>
      {/* The form tag is still useful for structure and accessibility, even if we manually construct FormData */}
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-2">Destination & Duration</h3>
              <div>
                <Label htmlFor="destination">Where are you going?</Label>
                <Input id="destination" name="destination" placeholder="e.g., Paris, France" value={clientFormData.destination} onChange={handleInputChange} required />
                {state?.errors?.destination && <p className="text-sm text-destructive mt-1">{state.errors.destination[0]}</p>}
              </div>
              <div>
                <Label htmlFor="duration">How many days?</Label>
                <Input id="duration" name="duration" type="number" min="1" placeholder="e.g., 7" value={clientFormData.duration} onChange={handleInputChange} required />
                {state?.errors?.duration && <p className="text-sm text-destructive mt-1">{state.errors.duration[0]}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-2">Accommodation & Transport</h3>
              <div>
                <Label htmlFor="accommodation">Preferred Accommodation</Label>
                <Select name="accommodation" value={clientFormData.accommodation} onValueChange={(value) => handleSelectChange('accommodation', value)} required>
                  <SelectTrigger><SelectValue placeholder="Select accommodation type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                    <SelectItem value="Airbnb">Airbnb</SelectItem>
                    <SelectItem value="Resort">Resort</SelectItem>
                    <SelectItem value="Boutique Hotel">Boutique Hotel</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.accommodation && <p className="text-sm text-destructive mt-1">{state.errors.accommodation[0]}</p>}
              </div>
              <div>
                <Label htmlFor="transport">Preferred Transport</Label>
                <Select name="transport" value={clientFormData.transport} onValueChange={(value) => handleSelectChange('transport', value)} required>
                  <SelectTrigger><SelectValue placeholder="Select transport type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Rental Car / Own Car</SelectItem>
                    <SelectItem value="Public Transport">Public Transport</SelectItem>
                    <SelectItem value="Walking">Mostly Walking</SelectItem>
                    <SelectItem value="Ride-sharing">Ride-sharing / Taxis</SelectItem>
                    <SelectItem value="Mixed">Mixed (Car & Public)</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.transport && <p className="text-sm text-destructive mt-1">{state.errors.transport[0]}</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-2">Interests & Attraction Style</h3>
              <div>
                <Label htmlFor="interests">Your Interests</Label>
                <Textarea id="interests" name="interests" placeholder="e.g., museums, hiking, local food, photography, nightlife (comma-separated)" value={clientFormData.interests} onChange={handleInputChange} required />
                <p className="text-xs text-muted-foreground mt-1">Separate interests with a comma.</p>
                {state?.errors?.interests && <p className="text-sm text-destructive mt-1">{state.errors.interests[0]}</p>}
              </div>
              <div>
                <Label htmlFor="attractionType">Attraction Style</Label>
                <Select name="attractionType" value={clientFormData.attractionType} onValueChange={(value) => handleSelectChange('attractionType', value)} required>
                  <SelectTrigger><SelectValue placeholder="Select attraction style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unique local spots">Unique Local Spots</SelectItem>
                    <SelectItem value="Typical touristic locations">Typical Tourist Locations</SelectItem>
                    <SelectItem value="Mix of both">A Mix of Both</SelectItem>
                    <SelectItem value="Off-the-beaten path">Off-the-beaten Path</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.attractionType && <p className="text-sm text-destructive mt-1">{state.errors.attractionType[0]}</p>}
              </div>
            </div>
          )}
          
          {/* Display general errors from server action that are not field-specific */}
          {state?.message && !state.success && !state.errors && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
           {state?.message && state.success && (
            <Alert variant="default" className="mt-4 bg-green-100 border-green-300 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} disabled={isPending}>
              Back
            </Button>
          )}
          {currentStep < totalSteps && (
            <Button type="button" onClick={nextStep} disabled={isPending} className="ml-auto">
              Next
            </Button>
          )}
          {currentStep === totalSteps && (
            <Button type="submit" disabled={isPending} className="ml-auto bg-accent hover:bg-opacity-80 text-accent-foreground">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Plans
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

// Add simple fade-in animation for steps
const style = document.createElement('style');
style.innerHTML = `
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
// Ensure this only runs in the browser
if (typeof window !== 'undefined') {
  document.head.appendChild(style);
}

    