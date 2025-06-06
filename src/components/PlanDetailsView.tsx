'use client';

import { useState, useEffect }  from 'react';
import type { TravelPlan, DailyItinerary, PointOfInterest, NewTripFormState, AiGeneratedPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyItineraryView from './DailyItineraryView';
import MapViewPlaceholder from './MapViewPlaceholder';
import AddPoiDialog from './AddPoiDialog';
import SavePlanDialog from './SavePlanDialog';
import { saveTravelPlan as savePlanToStorage } from '@/lib/localStorageUtils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Edit, Save, Trash2, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PlanDetailsViewProps {
  initialPlan: TravelPlan;
  mode: 'new' | 'existing' | 'editing-existing'; // 'new' for unsaved AI plan, 'existing' for saved, 'editing-existing' for editing a saved plan
  onDeletePlan?: (planId: string) => void; // For existing plans
}

// Helper to create a full TravelPlan from AI output and form input
export function createTravelPlanFromAi(
  aiPlan: AiGeneratedPlan,
  formInput: NewTripFormState
): Omit<TravelPlan, 'id'> {
  const dailyItineraries: DailyItinerary[] = [];
  const numDays = formInput.duration;
  const poisPerDay = Math.ceil(aiPlan.pointsOfInterest.length / numDays);

  for (let i = 0; i < numDays; i++) {
    const dayPois: PointOfInterest[] = aiPlan.pointsOfInterest
      .slice(i * poisPerDay, (i + 1) * poisPerDay)
      .map((poiName) => ({
        id: crypto.randomUUID(),
        name: poiName,
        description: `Explore ${poiName}`, // Generic description
        location: { lat: 0, lng: 0 }, // Placeholder location
        type: 'generated' as 'generated',
      }));
    dailyItineraries.push({ day: i + 1, pointsOfInterest: dayPois });
  }
   // If there are no POIs from AI, create empty daily itineraries
   if (aiPlan.pointsOfInterest.length === 0 && numDays > 0) {
    for (let i = 0; i < numDays; i++) {
      if (!dailyItineraries.find(d => d.day === i + 1)) {
         dailyItineraries.push({ day: i + 1, pointsOfInterest: [] });
      }
    }
  }


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
  const router = useRouter();
  const { toast } = useToast();

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
    setEditingPoi(null); // Ensure it's for adding new, not editing
    setIsAddPoiDialogOpen(true);
  };
  
  const handleOpenEditPoiDialog = (poiToEdit: PointOfInterest, dayNumber: number) => {
    setTargetDayForNewPoi(dayNumber);
    setEditingPoi(poiToEdit);
    setIsAddPoiDialogOpen(true);
  };

  const handleAddOrUpdatePoi = (poiData: Omit<PointOfInterest, 'id' | 'type'>) => {
    if (targetDayForNewPoi === null) return;

    setPlan(prevPlan => {
      const newDailyItineraries = prevPlan.dailyItineraries.map(dayItinerary => {
        if (dayItinerary.day === targetDayForNewPoi) {
          let updatedPois: PointOfInterest[];
          if (editingPoi) { // Editing existing POI
            updatedPois = dayItinerary.pointsOfInterest.map(p => 
              p.id === editingPoi.id ? { ...p, ...poiData } : p
            );
          } else { // Adding new POI
            const newPoi: PointOfInterest = {
              ...poiData,
              id: crypto.randomUUID(),
              type: 'custom',
              location: { lat: 0, lng: 0 }, // Placeholder
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
      id: plan.id || crypto.randomUUID(), // Assign new ID if it's a new plan
      name: planNameFromDialog,
    };
    
    savePlanToStorage(planToSave);
    toast({
      title: "Plan Saved!",
      description: `"${planToSave.name}" has been successfully saved.`,
    });
    router.push(`/plan/${planToSave.id}`); // Navigate to the saved plan's view
  };

  const handleSaveChanges = () => {
     savePlanToStorage(plan);
     toast({
        title: "Changes Saved!",
        description: `Your updates to "${plan.name}" have been saved.`,
     });
     setCurrentMode('existing'); // Switch back to view mode
     // Optionally, could re-fetch or router.refresh() if data source was external
  };

  const toggleEditMode = () => {
    if (currentMode === 'existing') {
      setCurrentMode('editing-existing');
    } else if (currentMode === 'editing-existing') {
      // Potentially ask to save changes if dirty
      setCurrentMode('existing');
    }
  };

  const allPois = plan.dailyItineraries.flatMap(d => d.pointsOfInterest);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div>
          <Button variant="outline" onClick={() => router.back()} className="mb-4 md:mb-0">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h2 className="text-3xl font-bold font-headline text-primary mt-2">{plan.name}</h2>
          <p className="text-muted-foreground">
            {plan.destination} - {plan.duration} days
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {currentMode === 'new' && (
            <Button onClick={() => setIsSavePlanDialogOpen(true)} className="bg-accent hover:bg-opacity-80 text-accent-foreground">
              <Save className="w-4 h-4 mr-2" /> Save This Plan
            </Button>
          )}
          {currentMode === 'existing' && (
            <Button onClick={toggleEditMode}>
              <Edit className="w-4 h-4 mr-2" /> Edit Plan
            </Button>
          )}
          {currentMode === 'editing-existing' && (
            <>
              <Button onClick={handleSaveChanges} className="bg-accent hover:bg-opacity-80 text-accent-foreground">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
              <Button variant="outline" onClick={toggleEditMode}>
                 Cancel Editing
              </Button>
            </>
          )}
          { (currentMode === 'existing' || currentMode === 'editing-existing') && onDeletePlan && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Plan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
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


      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="list">Itinerary List</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
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
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                    const nextDayNumber = plan.dailyItineraries.length > 0 ? Math.max(...plan.dailyItineraries.map(d => d.day)) + 1 : 1;
                    if (nextDayNumber <= plan.duration) {
                        setPlan(prev => ({
                            ...prev,
                            dailyItineraries: [...prev.dailyItineraries, { day: nextDayNumber, pointsOfInterest: []}]
                        }));
                    } else {
                        toast({ title: "Max duration reached", description: "Cannot add more days than specified.", variant: "destructive"});
                    }
                }}
             >
                <PlusCircle className="w-4 h-4 mr-2" /> Add Day {plan.dailyItineraries.length + 1} (up to {plan.duration})
             </Button>
          )}
        </TabsContent>
        <TabsContent value="map" className="mt-6">
          <MapViewPlaceholder pointsOfInterest={allPois} />
        </TabsContent>
      </Tabs>

      <AddPoiDialog
        isOpen={isAddPoiDialogOpen}
        onClose={() => {setIsAddPoiDialogOpen(false); setEditingPoi(null);}}
        onAddPoi={handleAddOrUpdatePoi}
        editingPoi={editingPoi}
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
