
'use client';

import { useState, useEffect, useRef } from 'react';
import type { TravelPlan, DailyItinerary, PointOfInterest, NewTripFormState, AiGeneratedPlan, AiGeneratedPointOfInterest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import DailyItineraryView from './DailyItineraryView';
import AddPoiDialog from './AddPoiDialog';
import SavePlanDialog from './SavePlanDialog';
import { saveTravelPlan as savePlanToStorage } from '@/lib/localStorageUtils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Edit, Save, Trash2, PlusCircle, Loader2, List, Map as MapIcon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import dynamic from 'next/dynamic';
import { groupByDay } from '@/lib/itineraryOptimization';
import ActionButton from './ui/action-button';

// Dynamically import InteractiveMap to ensure it's client-side only
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[500px] bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading map...</p>
    </div>
  )
});


interface PlanDetailsViewProps {
  initialPlan: TravelPlan;
  mode: 'new' | 'existing' | 'editing-existing';
  onDeletePlan?: (planId: string) => void;
}
// Modified createTravelPlanFromAi to be async and await optimizeItinerary
export async function createTravelPlanFromAi(
  aiPlan: AiGeneratedPlan,
  formInput: NewTripFormState
): Promise<Omit<TravelPlan, 'id'>> {
  const numDays = formInput.duration;

  // Flatten all points of interest from the AI plan for optimization
  const allAiPois: PointOfInterest[] = Array.isArray(aiPlan.pointsOfInterest)
    ? aiPlan.pointsOfInterest.map((aiPoi: AiGeneratedPointOfInterest) => ({
      id: crypto.randomUUID(),
      name: aiPoi.name,
      description: aiPoi.description || `Details for ${aiPoi.name}`,
      address: aiPoi.address,
      location: {
        lat: aiPoi.latitude !== undefined ? aiPoi.latitude : 0,
        lng: aiPoi.longitude !== undefined ? aiPoi.longitude : 0,
      },
      type: 'generated' as 'generated',
      dayIndex: aiPoi.day,
      time: aiPoi.time,
      cost: aiPoi.cost,
      category: aiPoi.category
    }))
    : [];

  const optimizedPois = groupByDay(allAiPois);

  const dailyItineraries: DailyItinerary[] = optimizedPois;
  return {
    name: aiPlan.planName || `Trip to ${formInput.destination}`,
    destination: formInput.destination,
    duration: formInput.duration,
    accommodation: formInput.accommodation,
    transport: formInput.transport,
    interests: Array.isArray(formInput.interests) ? formInput.interests : (formInput.interests as string).split(',').map(s => s.trim()),
    attractionType: formInput.attractionType,
    dailyItineraries,
    originalFormInput: formInput,
  };
}


export default function PlanDetailsView({ initialPlan, mode: initialMode, onDeletePlan }: PlanDetailsViewProps) {
  const [plan, setPlan] = useState<TravelPlan>(initialPlan);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [isAddPoiDialogOpen, setIsAddPoiDialogOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState<PointOfInterest | null>(null);
  const [targetDayForNewPoi, setTargetDayForNewPoi] = useState<number | null>(null);
  const [isSavePlanDialogOpen, setIsSavePlanDialogOpen] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'map'>('list'); // State for view type
  const router = useRouter();
  const { toast } = useToast();

  const processedPlanIndexRef = useRef<string | null>(null);


  useEffect(() => {
    setPlan(initialPlan);
    setCurrentMode(initialMode);
  }, [initialPlan, initialMode]);

  const handleUpdateDayItinerary = (updatedDayItinerary: DailyItinerary) => {
    setPlan(prevPlan => ({
      ...prevPlan,
      dailyItineraries: prevPlan.dailyItineraries.map(d =>
        d.day === updatedDayItinerary.day ? updatedDayItinerary : d
      ),
    }));
  };

  const handleOpenAddPoiDialog = (dayNumber: number) => {
    setTargetDayForNewPoi(dayNumber);
    setEditingPoi(null);
    setIsAddPoiDialogOpen(true);
  };

  const handleOpenEditPoiDialog = (poiToEdit: PointOfInterest, dayNumber: number) => {
    setTargetDayForNewPoi(dayNumber);
    setEditingPoi(poiToEdit);
    setIsAddPoiDialogOpen(true);
  };

  const handleAddOrUpdatePoi = (poiData: Omit<PointOfInterest, 'id' | 'type' | 'dayIndex'>) => {
    if (targetDayForNewPoi === null) return;

    setPlan(prevPlan => {
      const newDailyItineraries = prevPlan.dailyItineraries.map(dayItinerary => {
        if (dayItinerary.day === targetDayForNewPoi) {
          let updatedPois: PointOfInterest[];
          if (editingPoi) {
            updatedPois = dayItinerary.pointsOfInterest.map(p =>
              p.id === editingPoi.id ? { ...p, ...poiData } : p
            );
          } else {
            const newPoi: PointOfInterest = {
              id: crypto.randomUUID(),
              type: 'custom',
              dayIndex: targetDayForNewPoi,
              ...poiData,
            };
            updatedPois = [...dayItinerary.pointsOfInterest, newPoi];
          }
          return { ...dayItinerary, pointsOfInterest: updatedPois };
        }
        return dayItinerary;
      });
      return { ...prevPlan, dailyItineraries: newDailyItineraries };
    });
    setEditingPoi(null);
    setTargetDayForNewPoi(null);
  };

  const handleSavePlan = (planNameFromDialog: string) => {
    const planToSave: TravelPlan = {
      ...plan,
      id: plan.id || crypto.randomUUID(),
      name: planNameFromDialog,
    };

    savePlanToStorage(planToSave);
    toast({
      title: "Plan Saved!",
      description: `"${planToSave.name}" has been successfully saved.`,
    });
    router.push(`/plan/${planToSave.id}`);
  };

  const handleSaveChanges = () => {
    savePlanToStorage(plan);
    toast({
      title: "Changes Saved!",
      description: `Your updates to "${plan.name}" have been saved.`,
    });
    setCurrentMode('existing');
  };

  const toggleEditMode = () => {
    if (currentMode === 'existing') {
      setCurrentMode('editing-existing');
    } else if (currentMode === 'editing-existing') {
      setCurrentMode('existing');
    }
  };

  const allPois = Array.isArray(plan.dailyItineraries) ? plan.dailyItineraries.flatMap(d => d.pointsOfInterest) : []; // Ensure dailyItineraries is an array

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card rounded-2xl shadow">
        <div>
          <ActionButton title="Back" isBack isSecondary onClick={() => router.back()} />
          {/* <Button variant="secondary" onClick={() => router.back()} className="mb-4 md:mb-0">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button> */}
          <h2 className="text-3xl font-bold font-headline text-foreground mt-2">{plan.name}</h2>
          <p className="text-muted-foreground">
            {plan.destination} - {plan.duration} days
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {currentMode === 'new' && (
            <Button onClick={() => setIsSavePlanDialogOpen(true)} variant="default">
              <Save className="w-4 h-4 mr-2" /> Save This Plan
            </Button>
          )}
          {currentMode === 'existing' && (
            <ActionButton title="Edit Plan" onClick={toggleEditMode} icon={<Edit className="w-4 h-4 mr-2" />} />
          )}
          {currentMode === 'editing-existing' && (
            <>
              <ActionButton title="Save" onClick={handleSaveChanges} icon={<Save className="w-4 h-4 mr-2" />} />
              <ActionButton title="Discard" onClick={toggleEditMode} icon={<X className="w-4 h-4 mr-2" />} isSecondary />
            </>
          )}
          {(currentMode === 'existing' || currentMode === 'editing-existing') && onDeletePlan && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/* <ActionButton title="Delete Plan" icon={<Trash2 className="w-4 h-4 mr-2" />} isDestructive /> */}
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground/90">
                    This action cannot be undone. This will permanently delete your travel plan "{plan.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeletePlan(plan.id)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {(currentMode === 'new' || currentMode === 'editing-existing') && (
        <Alert>
          <Edit className="h-4 w-4" />
          <AlertTitle>
            {currentMode === 'new' ? "Customize Your New Plan" : "Editing Plan"}
          </AlertTitle>
          <AlertDescription>
            You can reorder points of interest, add your own custom spots, or modify details for each day.
            {currentMode === 'new' ? " Don't forget to save your plan once you're happy with it!" : " Click 'Save Changes' when you're done."}
          </AlertDescription>
        </Alert>
      )}

      {/* View type toggle buttons */}
      <div className="flex justify-center gap-2 my-6">
        <Button
          variant={viewType === 'list' ? 'default' : 'secondary'}
          onClick={() => setViewType('list')}
          aria-pressed={viewType === 'list'}
        >
          <List className="w-4 h-4 mr-2" />
          Route View
        </Button>
        <Button
          variant={viewType === 'map' ? 'default' : 'secondary'}
          onClick={() => setViewType('map')}
          aria-pressed={viewType === 'map'}
        >
          <MapIcon className="w-4 h-4 mr-2" />
          Map View
        </Button>
      </div>

      {/* Conditional rendering based on viewType */}
      {viewType === 'list' && (
        <div className="mt-6"> {/* Ensure dailyItineraries is an array before mapping */}
          {plan.dailyItineraries.map((dayItin) => (
            <DailyItineraryView
              key={dayItin.day}
              dayItinerary={dayItin}
              onUpdateDayItinerary={handleUpdateDayItinerary}
              onAddPoiClick={handleOpenAddPoiDialog}
              onEditPoiClick={handleOpenEditPoiDialog}
              isEditingPlan={currentMode === 'new' || currentMode === 'editing-existing'}
            />
          ))}
          {(currentMode === 'new' || currentMode === 'editing-existing') && plan.dailyItineraries.length < plan.duration && (
            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => {
                const nextDayNumber = plan.dailyItineraries.length > 0 ? Math.max(...plan.dailyItineraries.map(d => d.day)) + 1 : 1;
                if (nextDayNumber <= plan.duration) {
                  setPlan(prev => ({
                    ...prev,
                    dailyItineraries: [...prev.dailyItineraries, { day: nextDayNumber, pointsOfInterest: [] }]
                  }));
                } else {
                  toast({ title: "Max duration reached", description: "Cannot add more days than specified.", variant: "destructive" });
                }
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add Day {plan.dailyItineraries.length + 1} (up to {plan.duration})
            </Button>
          )}
        </div>
      )}

      {viewType === 'map' && (
        <div className="mt-6">
          <InteractiveMap pointsOfInterest={allPois} />
        </div>
      )}

      <AddPoiDialog
        isOpen={isAddPoiDialogOpen}
        onClose={() => { setIsAddPoiDialogOpen(false); setEditingPoi(null); }}
        onAddPoi={handleAddOrUpdatePoi}
        editingPoi={editingPoi}
        destination={plan.destination}
      />
      <SavePlanDialog
        isOpen={isSavePlanDialogOpen}
        onClose={() => setIsSavePlanDialogOpen(false)}
        onSavePlan={handleSavePlan}
        initialPlanName={plan.name}
      />
    </div>
  );
}
