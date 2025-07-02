
'use client';

import { useState, useTransition, useActionState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleGeneratePlansAction, type NewTripFormActionState } from '@/app/new-trip/actions';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { NewTripFormState } from '@/lib/types';
import { Switch } from './ui/switch';

const initialFormState: NewTripFormActionState = { success: false };
const SESSION_STORAGE_GENERATED_PLANS_KEY = 'roamReadyGeneratedPlansOutput';
const SESSION_STORAGE_FORM_INPUT_KEY = 'roamReadyFormInput';

const clientSchema = z.object({
  destination: z.string().min(1, { message: "Destination is required" }),
  duration: z.string()
    .min(1, { message: "Duration is required" })
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
      message: "Duration must be a positive number",
    }),
  accommodation: z.string().min(1, { message: "Accommodation type is required" }),
  transport: z.string().min(1, { message: "Transport type is required" }),
  interests: z.string().min(1, { message: "At least one interest is required" }),
  attractionType: z.string().min(1, { message: "Attraction style is required" }),
});

// A simple debounce function with a cancel method
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;
  
  const debouncedFunc = function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };

  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunc;
}

export default function NewTripForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const router = useRouter();
  const { toast } = useToast();
  
  const [state, formAction, isPending] = useActionState(handleGeneratePlansAction, initialFormState);
  
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const [clientFormData, setClientFormData] = useState({
    destination: '',
    duration: '3',
    accommodation: '',
    transport: '',
    interests: '',
    attractionType: '',
    includeSurroundings: false,
  });

  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isFetchingDestination, setIsFetchingDestination] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  useEffect(() => {
    if (state?.errors) {
      setErrors(state.errors);
      // Find the first field with an error and navigate to its step
      const errorFields = Object.keys(state.errors);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        if (['destination', 'duration'].includes(firstErrorField)) {
          setCurrentStep(1);
        } else if (['accommodation', 'transport'].includes(firstErrorField)) {
          setCurrentStep(2);
        } else if (['interests', 'attractionType'].includes(firstErrorField)) {
          setCurrentStep(3);
        }
      }
    }
    
    if (!state.message) {
      return;
    }

    if (state.success && state.data) {
      toast({
        title: "Plans Generated!",
        description: "Redirecting to your new travel plans...",
        variant: "default",
      });

      const formInputToStore: NewTripFormState = {
        destination: clientFormData.destination,
        duration: parseInt(clientFormData.duration, 10),
        accommodation: clientFormData.accommodation,
        transport: clientFormData.transport,
        interests: clientFormData.interests.split(',').map(i => i.trim()).filter(i => i),
        attractionType: clientFormData.attractionType,
        includeSurroundings: clientFormData.includeSurroundings,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_STORAGE_GENERATED_PLANS_KEY, JSON.stringify(state.data));
        sessionStorage.setItem(SESSION_STORAGE_FORM_INPUT_KEY, JSON.stringify(formInputToStore));
      }

      router.push(`/new-trip/plans`);
    } else if (!state.success && !state.errors) {
      toast({
        title: "Error Generating Plans",
        description: state.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }, [state, clientFormData, router, toast]);

  const fetchDestinationSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setDestinationSuggestions([]);
      return;
    }
    setIsFetchingDestination(true);
    try {
      const response = await fetch(`/api/places-autocomplete-cities?input=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setDestinationSuggestions(data.predictions || []);
      if (data.predictions && data.predictions.length > 0) {
        setShowDestinationSuggestions(true);
      }
    } catch (error) {
      console.error("Failed to fetch destination suggestions:", error);
      setDestinationSuggestions([]);
    } finally {
      setIsFetchingDestination(false);
    }
  }, []);

  const debouncedFetch = useRef(debounce(fetchDestinationSuggestions, 300)).current;

  useEffect(() => {
    if (showDestinationSuggestions && clientFormData.destination) {
      debouncedFetch(clientFormData.destination);
    } else {
      debouncedFetch.cancel();
    }
  }, [clientFormData.destination, showDestinationSuggestions, debouncedFetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setClientFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setClientFormData(prev => ({ ...prev, includeSurroundings: checked }));
  };

  const handleSelectDestination = (suggestion: any) => {
    setClientFormData(prev => ({ ...prev, destination: suggestion.description }));
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
    if (errors.destination) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.destination;
            return newErrors;
        });
    }
  };

  const validateStep = (step: number) => {
    let fieldsToValidate: (keyof z.infer<typeof clientSchema>)[] = [];
    if (step === 1) {
      fieldsToValidate = ['destination', 'duration'];
    } else if (step === 2) {
      fieldsToValidate = ['accommodation', 'transport'];
    }

    if (fieldsToValidate.length === 0) return true;

    const stepSchema = clientSchema.pick(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    const result = stepSchema.safeParse(clientFormData);

    if (!result.success) {
      // Merge new errors with existing ones instead of overwriting
      setErrors(prev => ({ ...prev, ...result.error.flatten().fieldErrors }));
      return false;
    }

    // On success, clear errors only for the validated fields
    setErrors(prev => {
      const newErrors = { ...prev };
      for (const field of fieldsToValidate) {
        delete newErrors[field];
      }
      return newErrors;
    });
    return true;
  };


  const nextStep = () => {
    if (validateStep(currentStep)) {
      // If moving from step 2 to 3, clear any lingering errors for step 3 fields.
      // This ensures step 3 starts fresh and errors only appear after a submit attempt.
      if (currentStep === 2) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.interests;
          delete newErrors.attractionType;
          return newErrors;
        });
      }
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };
  
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Plan Your Next Adventure</CardTitle>
        <CardDescription>Follow these steps to create your personalized travel plan.</CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full mt-2" />
        <p className="text-sm text-muted-foreground mt-1 text-center">Step {currentStep} of {totalSteps}</p>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-6">
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }} className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-2">Destination & Duration</h3>
            <div>
              <Label htmlFor="destination">Where are you going?</Label>
              <div className="relative">
                <Input
                  id="destination"
                  name="destination"
                  placeholder="e.g., Paris, France"
                  value={clientFormData.destination}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (!showDestinationSuggestions) {
                      setShowDestinationSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (showDestinationSuggestions) {
                         setShowDestinationSuggestions(false);
                      }
                    }, 200);
                  }}
                  autoComplete="off"
                />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4">
                      {isFetchingDestination && <Loader2 className="h-full w-full animate-spin" />}
                    </div>
                 </div>
                 {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                      <ul className="py-1">
                          {destinationSuggestions.map((suggestion) => (
                              <li
                                  key={suggestion.place_id}
                                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                                  onMouseDown={() => handleSelectDestination(suggestion)}
                              >
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{suggestion.description}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
              </div>
              {errors?.destination && <p className="text-sm text-destructive mt-1">{errors.destination[0]}</p>}
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Switch
                id="includeSurroundings"
                checked={clientFormData.includeSurroundings}
                onCheckedChange={handleSwitchChange}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="includeSurroundings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Explore Surrounding Areas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Include locations up to 200km around.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">How many days?</Label>
              <Input id="duration" name="duration" type="number" min="1" placeholder="e.g., 7" value={clientFormData.duration} onChange={handleInputChange} />
              {errors?.duration && <p className="text-sm text-destructive mt-1">{errors.duration[0]}</p>}
            </div>
          </div>

          <div style={{ display: currentStep === 2 ? 'block' : 'none' }} className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-2">Accommodation & Transport</h3>
            <div>
              <Label htmlFor="accommodation">Preferred Accommodation</Label>
              <Select onValueChange={(value) => handleSelectChange('accommodation', value)} value={clientFormData.accommodation}>
                <SelectTrigger><SelectValue placeholder="Select accommodation type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                  <SelectItem value="Airbnb">Airbnb</SelectItem>
                  <SelectItem value="Resort">Resort</SelectItem>
                  <SelectItem value="Boutique Hotel">Boutique Hotel</SelectItem>
                </SelectContent>
              </Select>
              {errors?.accommodation && <p className="text-sm text-destructive mt-1">{errors.accommodation[0]}</p>}
            </div>
            <div>
              <Label htmlFor="transport">Preferred Transport</Label>
              <Select onValueChange={(value) => handleSelectChange('transport', value)} value={clientFormData.transport}>
                <SelectTrigger><SelectValue placeholder="Select transport type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">Rental Car / Own Car</SelectItem>
                  <SelectItem value="Public Transport">Public Transport</SelectItem>
                  <SelectItem value="Walking">Mostly Walking</SelectItem>
                  <SelectItem value="Ride-sharing">Ride-sharing / Taxis</SelectItem>
                  <SelectItem value="Mixed">Mixed (Car & Public)</SelectItem>
                </SelectContent>
              </Select>
              {errors?.transport && <p className="text-sm text-destructive mt-1">{errors.transport[0]}</p>}
            </div>
          </div>

          <div style={{ display: currentStep === 3 ? 'block' : 'none' }} className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-2">Interests & Attraction Style</h3>
            <div>
              <Label htmlFor="interests">Your Interests</Label>
              <Textarea id="interests" name="interests" placeholder="e.g., museums, hiking, local food, photography, nightlife (comma-separated)" value={clientFormData.interests} onChange={handleInputChange} />
              <p className="text-xs text-muted-foreground mt-1">Separate interests with a comma.</p>
              {errors?.interests && <p className="text-sm text-destructive mt-1">{errors.interests[0]}</p>}
            </div>
            <div>
              <Label htmlFor="attractionType">Attraction Style</Label>
              <Select onValueChange={(value) => handleSelectChange('attractionType', value)} value={clientFormData.attractionType}>
                <SelectTrigger><SelectValue placeholder="Select attraction style" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unique local spots">Unique Local Spots</SelectItem>
                  <SelectItem value="Typical touristic locations">Typical Tourist Locations</SelectItem>
                  <SelectItem value="Mix of both">A Mix of Both</SelectItem>
                  <SelectItem value="Off-the-beaten path">Off-the-beaten Path</SelectItem>
                </SelectContent>
              </Select>
              {errors?.attractionType && <p className="text-sm text-destructive mt-1">{errors.attractionType[0]}</p>}
            </div>
          </div>
          
          {/* Add hidden inputs to hold values from custom components for form submission */}
          <input type="hidden" name="accommodation" value={clientFormData.accommodation} />
          <input type="hidden" name="transport" value={clientFormData.transport} />
          <input type="hidden" name="attractionType" value={clientFormData.attractionType} />
          <input type="hidden" name="includeSurroundings" value={String(clientFormData.includeSurroundings)} />

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
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep} disabled={isPending}>
              Back
            </Button>
          ) : <div />}
          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep} disabled={isPending} className="ml-auto">
              Next
            </Button>
          ) : (
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
