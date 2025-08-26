'use client';

import { useState, useTransition, useActionState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { handleGeneratePlansAction, type NewTripFormActionState } from '@/app/new-trip/actions';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2, MapPin, X, Sparkles, Calendar, Plane, Hotel, Heart, ChevronRight, Wand2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { NewTripFormState } from '@/lib/types';
import { Switch } from './ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useApiLimit } from '@/contexts/ApiLimitContext';
import { LimitExceededPopup } from './LimitExceedsPopup';
import ActionButton from './ui/action-button';
import { Landmark, Blend } from 'lucide-react';


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

// A simple debounce function with a cancel method
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  const debouncedFunc = function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };

  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunc;
}

const attractionOptions = [
  { value: 'Typical', label: 'Typical', icon: <Landmark className="w-5 h-5" /> },
  { value: 'Mix', label: 'Mix', icon: <Blend className="w-5 h-5" /> },
  { value: 'Unique', label: 'Unique', icon: <Sparkles className="w-5 h-5" /> },
];

const defaultFormState: NewTripFormState = {
  destination: '',
  duration: 3,
  accommodation: '',
  transport: '',
  interests: [],
  attractionType: attractionOptions[1].value,
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
  const { canMakeApiCall, useApiCall, remainingCalls, getTimeUntilReset } = useApiLimit();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction, isPending] = useActionState(handleGeneratePlansAction, initialFormActionState);
  const [isTransitioning, startTransition] = useTransition();

  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const [clientFormData, setClientFormData] = useState<NewTripFormState>(getInitialState);
  const [interestInput, setInterestInput] = useState('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);

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

  const handleGenerateClick = async () => {
    if (!canMakeApiCall()) {
      setShowLimitPopup(true);
      return;
    }

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

    await useApiCall();
    startTransition(async () => {
      formAction(formData);
    });
  };

  const stepTitles = ['Where & When', 'Stay & Travel', 'Interests & Vibe'];
  const stepIcons = [MapPin, Hotel, Heart];


  return (
    <div>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Plan Your Dream Adventure
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us your travel dreams, and we'll create a personalized itinerary that's uniquely yours
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8 mb-8">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const StepIcon = stepIcons[index];

              return (
                <div key={stepNumber} className="flex items-center">
                  <div className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 
                    ${isActive ? 'bg-gradient-to-r from-[#ff3c00] to-[#e73827] shadow-lg scale-110' :
                      isCompleted ? 'bg-green-500 shadow-md' : 'bg-gray-200'}
                  `}>
                    <StepIcon className={`w-5 h-5 ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`} />
                    {isActive && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3c00] to-[#e73827] rounded-full opacity-20 animate-pulse" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      Step {stepNumber}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-[#ff3c00]' : 'text-gray-400'}`}>
                      {stepTitles[index]}
                    </div>
                  </div>
                  {index < totalSteps - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300 mx-4 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative">
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff3c00] to-[#e73827] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
          {isPreloaded && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">Welcome Back!</h4>
                    <p className="text-sm text-amber-700">Your previous preferences are loaded. Make changes and generate again.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetForm}
                  className="border-amber-200 text-amber-700 hover:bg-amber-100"
                >
                  Start Fresh
                </Button>
              </div>
            </div>
          )}

          <form noValidate className="relative">
            <CardContent className="p-8 min-h-[500px]">
              {/* Step 1: Where & When */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Where would you like to go?</h2>
                    <p className="text-gray-600">Choose your destination and trip duration</p>
                  </div>

                  <div className="space-y-6">
                    {/* Destination */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-gray-900">Destination</Label>
                      <div className="relative">
                        <div className="relative">
                          <Input
                            id="destination"
                            name="destination"
                            placeholder="Where do you want to explore?"
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
                            className="pl-12 pr-12 h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-[#ff3c00] focus:ring-0 transition-colors"
                            autoComplete="off"
                          />
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ff3c00]" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {isFetchingDestination && <Loader2 className="w-5 h-5 animate-spin text-[#ff3c00]" />}
                          </div>
                        </div>

                        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                          <div className="absolute top-full z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                            {destinationSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.place_id}
                                type="button"
                                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                onMouseDown={() => handleSelectDestination(suggestion)}
                              >
                                <MapPin className="w-4 h-4 text-[#ff3c00] flex-shrink-0" />
                                <span className="text-gray-900">{suggestion.description}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors?.destination && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.destination[0]}</span>
                        </p>
                      )}
                    </div>

                    {/* Include Surroundings */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center space-x-4">
                        <Switch
                          id="includeSurroundings"
                          checked={clientFormData.includeSurroundings}
                          onCheckedChange={handleSwitchChange}
                          className="data-[state=checked]:bg-[#ff3c00]"
                        />
                        <div>
                          <Label htmlFor="includeSurroundings" className="text-base font-semibold text-gray-900">
                            Explore Surrounding Areas
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            Include amazing spots within 100km of your destination
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-gray-900">Trip Duration</Label>
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-[#ff3c00] to-[#e73827] text-white px-4 py-2 rounded-full">
                          <Calendar className="w-4 h-4" />
                          <span className="font-bold">
                            {clientFormData.duration} {clientFormData.duration === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-6">
                        <Slider
                          value={[clientFormData.duration]}
                          onValueChange={(value) => handleSelectChange('duration', value[0].toString())}
                          max={5}
                          min={1}
                          step={1}
                          className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#ff3c00] [&_[role=slider]]:to-[#e73827] [&_[role=slider]]:border-0 [&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_.relative]:bg-gradient-to-r [&_.relative]:from-gray-400 [&_.relative]:to-gray-400"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-3">
                          <span>1 day</span>
                          <span>5 days</span>
                        </div>
                      </div>
                      {errors?.duration && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.duration[0]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Stay & Travel */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to travel?</h2>
                    <p className="text-gray-600">Choose your accommodation and transportation preferences</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Accommodation */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                        <Hotel className="w-5 h-5 text-[#ff3c00]" />
                        <span>Where will you stay?</span>
                      </Label>
                      <Select
                        value={clientFormData.accommodation || undefined}
                        onValueChange={(value) => handleSelectChange('accommodation', value)}
                      >
                        <SelectTrigger className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-[#ff3c00]">
                          <SelectValue placeholder="Choose accommodation" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Hotel" className="py-3">🏨 Hotel</SelectItem>
                          <SelectItem value="Hostel" className="py-3">🏠 Hostel</SelectItem>
                          <SelectItem value="Airbnb" className="py-3">🏡 Airbnb</SelectItem>
                          <SelectItem value="Resort" className="py-3">🏖️ Resort</SelectItem>
                          <SelectItem value="Boutique Hotel" className="py-3">✨ Boutique Hotel</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors?.accommodation && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.accommodation[0]}</span>
                        </p>
                      )}
                    </div>

                    {/* Transport */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                        <Plane className="w-5 h-5 text-[#ff3c00]" />
                        <span>How will you get around?</span>
                      </Label>
                      <Select
                        value={clientFormData.transport || undefined}
                        onValueChange={(value) => handleSelectChange('transport', value)}
                      >
                        <SelectTrigger className="h-14 text-base border-2 border-gray-200 rounded-xl focus:border-[#ff3c00]">
                          <SelectValue placeholder="Choose transport" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Car" className="py-3">🚗 Rental Car / Own Car</SelectItem>
                          <SelectItem value="Public Transport" className="py-3">🚊 Public Transport</SelectItem>
                          <SelectItem value="Walking" className="py-3">🚶 Mostly Walking</SelectItem>
                          <SelectItem value="Ride-sharing" className="py-3">🚕 Ride-sharing / Taxis</SelectItem>
                          <SelectItem value="Mixed" className="py-3">🚗🚊 Mixed Transport</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors?.transport && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.transport[0]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Interests & Vibe */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">What excites you most?</h2>
                    <p className="text-gray-600">Tell us your interests and preferred attraction style</p>
                  </div>

                  <div className="space-y-8">
                    {/* Interests */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span>Your Interests</span>
                      </Label>
                      <div className="min-h-[120px] p-4 border-2 border-gray-200 rounded-xl focus-within:border-[#ff3c00] transition-colors">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {clientFormData.interests.map((interest) => (
                            <Badge
                              key={interest}
                              variant="secondary"
                              className="bg-gradient-to-r from-[#ff3c00] to-[#ff3c00] text-white border-0 px-3 py-1 text-sm hover:from-[#ff3c00bb] hover:to-[#ff3c00cc] transition-colors"
                            >
                              {interest}
                              <button
                                type="button"
                                onClick={() => handleRemoveInterest(interest)}
                                className="ml-2 hover:text-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder={clientFormData.interests.length > 0 ? "Add another interest..." : "e.g., museums, hiking, local food, nightlife..."}
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyDown={handleInterestKeyDown}
                          className="border-0 shadow-none focus-visible:ring-0 p-0 text-base bg-transparent placeholder:text-gray-400"
                          autoComplete="off"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Press Enter or comma to add interests</p>
                      {errors?.interests && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.interests[0]}</span>
                        </p>
                      )}
                    </div>

                    {/* Attraction Style */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-900">What's your travel vibe?</Label>
                      <div className="bg-gray-100 rounded-xl p-2 flex items-center space-x-2">
                        {attractionOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelectChange('attractionType', option.value)}
                            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-md font-bold transition-all duration-200 ease-in-out focus:outline-none focus:ring-0 ${clientFormData.attractionType === option.value
                              ? 'bg-[#ff3c00] text-white shadow-md'
                              : 'bg-transparent text-gray-500 hover:bg-gray-200'
                              }`}
                          >
                            {/* {option.icon} */}
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                      {errors?.attractionType && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.attractionType[0]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden form fields */}
              <input type="hidden" name="destination" value={clientFormData.destination} />
              <input type="hidden" name="duration" value={String(clientFormData.duration)} />
              <input type="hidden" name="accommodation" value={clientFormData.accommodation} />
              <input type="hidden" name="transport" value={clientFormData.transport} />
              <input type="hidden" name="interests" value={clientFormData.interests.join(',')} />
              <input type="hidden" name="attractionType" value={clientFormData.attractionType} />
              <input type="hidden" name="includeSurroundings" value={String(clientFormData.includeSurroundings)} />

              {/* Error/Success Messages */}
              {state?.message && !state.success && !state.errors && (
                <Alert variant="destructive" className="mt-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Oops! Something went wrong</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
              {state?.message && state.success && (
                <Alert className="mt-6 border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            {/* Navigation Footer */}
            <CardFooter className="bg-gray-50/50 backdrop-blur-sm p-8 border-t border-gray-100">
              <div className="flex justify-between items-center w-full">
                {currentStep > 1 ? (
                  <ActionButton title="Back" isSecondary onClick={prevStep} />
                ) : (
                  <div />
                )}

                {currentStep < totalSteps ? (
                  <ActionButton title="Next" onClick={nextStep} />
                ) : (
                  <Button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isPending || isTransitioning}
                    className="flex items-center text-white font-bold space-x-2 px-8 py-4 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isPending || isTransitioning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Magic...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate My Trip</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* API Limit Info */}
        {remainingCalls !== null && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              {remainingCalls > 0 ? (
                <>You have <span className="font-semibold text-blue-600">{remainingCalls}</span> trips left today</>
              ) : (
                <>Trip limit reached. Resets {getTimeUntilReset()}</>
              )}
            </p>
          </div>
        )}
      </div>

      <LimitExceededPopup
        isOpen={showLimitPopup}
        onClose={() => setShowLimitPopup(false)}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}