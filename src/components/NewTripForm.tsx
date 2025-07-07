
'use client';

import { useState, useTransition, useActionState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleGeneratePlansAction, type NewTripFormActionState } from '@/app/new-trip/actions';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { NewTripFormState } from '@/lib/types';
import { Switch } from './ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const initialFormActionState: NewTripFormActionState = { success: false };
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
  interests: z.array(z.string()).min(1, { message: "At least one interest is required" }),
  attractionType: z.string().min(1, { message: "Attraction type is required" }),
});

const attractionStyleMap = [
  "Typical Tourist Locations",
  "Mix of Typical and Unique Places",
  "Unique Local Spots",
  "Extremely Unique Locations",
];

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

const defaultFormState: NewTripFormState = {
  destination: '',
  duration: 3,
  accommodation: '',
  transport: '',
  interests: [],
  attractionType: attractionStyleMap[1],
  includeSurroundings: false,
};

// Lazy initializer function to get state from sessionStorage on first render
const getInitialState = (): NewTripFormState => {
  if (typeof window === 'undefined') {
    return defaultFormState;
  }
  const savedData = sessionStorage.getItem(SESSION_STORAGE_FORM_INPUT_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      // Ensure all fields from default state are present
      return { ...defaultFormState, ...parsedData };
    } catch (e) {
      console.error("Failed to parse form data from session storage", e);
      return defaultFormState;
    }
  }
  return defaultFormState;
};

export default function NewTripForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const router = useRouter();
  const { toast } = useToast();
  
  const [state, formAction, isPending] = useActionState(handleGeneratePlansAction, initialFormActionState);
  const [isTransitioning, startTransition] = useTransition();
  
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const [clientFormData, setClientFormData] = useState<NewTripFormState>(getInitialState);
  const [interestInput, setInterestInput] = useState('');
  
  const [isPreloaded, setIsPreloaded] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem(SESSION_STORAGE_FORM_INPUT_KEY);
  });

  useEffect(() => {
    if (isPending || !state || !state.message) {
      return;
    }

    if (state.success && state.data) {
      toast({
        title: "Plans Generated!",
        description: "Redirecting to your new travel plans...",
        variant: "default",
      });

      if (typeof window !== 'undefined' && state.submittedInput) {
        sessionStorage.setItem(SESSION_STORAGE_GENERATED_PLANS_KEY, JSON.stringify(state.data));
        sessionStorage.setItem(SESSION_STORAGE_FORM_INPUT_KEY, JSON.stringify(state.submittedInput));
      }

      router.push(`/new-trip/plans`);
    } else if (!state.success && state.errors) {
      setErrors(state.errors);
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
    } else if (!state.success && !state.errors) {
      toast({
        title: "Error Generating Plans",
        description: state.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }, [state, isPending, router, toast]);

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

  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isFetchingDestination, setIsFetchingDestination] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const debouncedFetch = useRef(debounce(fetchDestinationSuggestions, 300)).current;

  useEffect(() => {
    if (showDestinationSuggestions && clientFormData.destination) {
      debouncedFetch(clientFormData.destination);
    } else {
      debouncedFetch.cancel();
    }
  }, [clientFormData.destination, showDestinationSuggestions, debouncedFetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const valueToSet = name === 'duration' ? parseInt(value, 10) || 0 : value;
    setClientFormData(prev => ({ ...prev, [name]: valueToSet }));
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
  
  const handleSliderChange = (value: number[]) => {
    const numericValue = value[0];
    handleSelectChange('attractionType', attractionStyleMap[numericValue]);
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

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newInterest = interestInput.trim();
        if (newInterest && !clientFormData.interests.includes(newInterest)) {
            const newInterests = [...clientFormData.interests, newInterest];
            setClientFormData(prev => ({ ...prev, interests: newInterests }));
            if (errors.interests) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.interests;
                    return newErrors;
                });
            }
        }
        setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
      setClientFormData(prev => ({
          ...prev,
          interests: prev.interests.filter(interest => interest !== interestToRemove)
      }));
  };

  const validateStep = (step: number) => {
    const validationData = {
        ...clientFormData,
        duration: String(clientFormData.duration),
    };

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
    
    const result = stepSchema.safeParse(validationData);

    if (!result.success) {
      setErrors(prev => ({ ...prev, ...result.error.flatten().fieldErrors }));
      return false;
    }

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
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };
  
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
  const handleResetForm = () => {
    setClientFormData(defaultFormState);
    setInterestInput('');
    setErrors({});
    setCurrentStep(1);
    setIsPreloaded(false);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_STORAGE_FORM_INPUT_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_GENERATED_PLANS_KEY);
    }

    toast({
      title: "Form Cleared",
      description: "You can now start planning a new trip from scratch.",
    });
  };

  const handleGenerateClick = () => {
    const validationData = {
      ...clientFormData,
      duration: String(clientFormData.duration),
    };
    const result = clientSchema.safeParse(validationData);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      toast({
        title: "Validation Failed",
        description: "Please check all steps for errors.",
        variant: "destructive"
      });
      const errorFields = Object.keys(result.error.flatten().fieldErrors);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        if (['destination', 'duration', 'includeSurroundings'].includes(firstErrorField)) setCurrentStep(1);
        else if (['accommodation', 'transport'].includes(firstErrorField)) setCurrentStep(2);
        else setCurrentStep(3);
      }
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.append('destination', clientFormData.destination);
    formData.append('duration', String(clientFormData.duration));
    formData.append('accommodation', clientFormData.accommodation);
    formData.append('transport', clientFormData.transport);
    formData.append('interests', clientFormData.interests.join(','));
    formData.append('attractionType', clientFormData.attractionType);
    formData.append('includeSurroundings', String(clientFormData.includeSurroundings || false));

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Plan Your Next Adventure</CardTitle>
        <CardDescription>Follow these steps to create your personalized travel plan.</CardDescription>
        <Progress value={(currentStep / totalSteps) * 100} className="w-full mt-2" />
        <p className="text-sm text-muted-foreground mt-1 text-center">Step {currentStep} of {totalSteps}</p>
      </CardHeader>
      <form noValidate>
        <CardContent className="space-y-6">
          {isPreloaded && (
            <Alert variant="default" className="flex items-center justify-between animate-fadeIn">
              <div>
                <AlertTitle className="font-semibold">Editing Preferences</AlertTitle>
                <AlertDescription>
                  Your previous choices are loaded. Make changes and generate again.
                </AlertDescription>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleResetForm}>
                Start Over
              </Button>
            </Alert>
          )}

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
                  className="pl-10"
                />
                 <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                 </div>
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
                                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
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
                name="includeSurroundings"
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
              <div className="max-w-[120px]">
                <Input id="duration" name="duration" type="number" min="1" placeholder="e.g., 7" value={String(clientFormData.duration)} onChange={handleInputChange} />
              </div>
              {errors?.duration && <p className="text-sm text-destructive mt-1">{errors.duration[0]}</p>}
            </div>
          </div>

          <div style={{ display: currentStep === 2 ? 'block' : 'none' }} className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold mb-2">Accommodation & Transport</h3>
            <div>
              <Label htmlFor="accommodation">Preferred Accommodation</Label>
              <Select name="accommodation" onValueChange={(value) => handleSelectChange('accommodation', value)} value={clientFormData.accommodation || undefined}>
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
              <Select name="transport" onValueChange={(value) => handleSelectChange('transport', value)} value={clientFormData.transport || undefined}>
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
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-transparent bg-input p-2 min-h-[48px]">
                  {clientFormData.interests.map((interest) => (
                      <Badge key={interest} variant="default" className="flex items-center gap-1.5 py-1 px-2">
                          {interest}
                          <button
                              type="button"
                              className="rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                              onClick={() => handleRemoveInterest(interest)}
                              aria-label={`Remove ${interest}`}
                          >
                              <X className="h-3 w-3" />
                          </button>
                      </Badge>
                  ))}
                  <Input
                      id="interests"
                      placeholder={clientFormData.interests.length > 0 ? "Add more..." : "e.g., museums, hiking, local food..."}
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={handleInterestKeyDown}
                      className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-8 bg-transparent min-w-[120px]"
                      autoComplete="off"
                  />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Enter or a comma to add an interest.</p>
              {errors?.interests && <p className="text-sm text-destructive mt-1">{errors.interests[0]}</p>}
            </div>
             <div>
              <Label htmlFor="attractionType">Attraction Style</Label>
              <div className="pt-4">
                <Slider
                  id="attractionType"
                  name="attractionType"
                  min={0}
                  max={3}
                  step={1}
                  value={[attractionStyleMap.indexOf(clientFormData.attractionType)]}
                  onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Typical</span>
                  <span>Unique</span>
                </div>
                <p className="text-sm text-center text-muted-foreground mt-3 h-10 flex items-center justify-center">
                  {clientFormData.attractionType}
                </p>
              </div>
              {errors?.attractionType && <p className="text-sm text-destructive mt-1">{errors.attractionType[0]}</p>}
            </div>
          </div>
          
          <input type="hidden" name="destination" value={clientFormData.destination} />
          <input type="hidden" name="duration" value={String(clientFormData.duration)} />
          <input type="hidden" name="accommodation" value={clientFormData.accommodation} />
          <input type="hidden" name="transport" value={clientFormData.transport} />
          <input type="hidden" name="interests" value={clientFormData.interests.join(',')} />
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
            <Button type="button" variant="secondary" onClick={prevStep} disabled={isPending}>
              Back
            </Button>
          ) : <div />}
          {currentStep < totalSteps ? (
            <Button type="button" variant="default" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleGenerateClick} disabled={isPending || isTransitioning} variant="default" className="ml-auto">
              {(isPending || isTransitioning) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Plans
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
