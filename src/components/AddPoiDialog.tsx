'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PointOfInterest } from '@/lib/types';
import { Loader2, MapPin } from 'lucide-react';
import ActionButton from './ui/action-button';

interface AddPoiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPoi: (poi: Omit<PointOfInterest, 'id' | 'type' | 'dayIndex'>) => void;
  editingPoi?: PointOfInterest | null;
  destination: string;
}

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

export default function AddPoiDialog({ isOpen, onClose, onAddPoi, editingPoi, destination }: AddPoiDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSelectionInProgress, setIsSelectionInProgress] = useState(false);

  // Use a ref to prevent suggestions from showing on initial mount/focus
  const isMounted = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (editingPoi) {
        setName(editingPoi.name);
        setDescription(editingPoi.description || '');
        setAddress(editingPoi.address || null);
        setLocation(editingPoi.location || null);
      } else {
        // Reset form when opening for a new POI
        setName('');
        setDescription('');
        setAddress(null);
        setLocation(null);
        setSuggestions([]);
      }
      // Set mounted ref after a short delay to prevent initial fetch on open
      setTimeout(() => {
        isMounted.current = true;
      }, 100);
    } else {
      isMounted.current = false;
    }
  }, [editingPoi, isOpen]);


  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(query)}&destination=${encodeURIComponent(destination)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsFetching(false);
    }
  }, [destination]);

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    // We only fetch suggestions if the user is typing, a final location has NOT been selected,
    // and we are not in the middle of processing a selection.
    if (isMounted.current && name && !location && !isSelectionInProgress) {
      debouncedFetch(name);
    } else {
      // In all other cases (e.g., after selection, on clear), cancel pending fetches and clear suggestions.
      debouncedFetch.cancel();
      setSuggestions([]);
    }

    return () => {
      debouncedFetch.cancel();
    }
  }, [name, location, isSelectionInProgress, debouncedFetch]);

  const handleSelectSuggestion = async (suggestion: any) => {
    debouncedFetch.cancel(); // Cancel any pending suggestion fetches
    setIsSelectionInProgress(true); // Prevent useEffect from re-fetching while we get details
    setName(suggestion.description);
    setSuggestions([]);
    setIsFetching(true);
    try {
      const response = await fetch(`/api/place-details?placeid=${suggestion.place_id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.result) {
        const { lat, lng } = data.result.geometry.location;
        setLocation({ lat, lng });
        setAddress(data.result.formatted_address);
        setName(data.result.name); // Use the official name from details
      }
    } catch (error) {
      console.error("Failed to fetch place details:", error);
      setAddress('Could not fetch address.');
      setLocation(null);
    } finally {
      setIsFetching(false);
      setIsSelectionInProgress(false); // Re-enable suggestions on new user input
    }
  };


  const handleSubmit = () => {
    // A location must be selected to add a POI
    if (name.trim() && location) {
      onAddPoi({ name, description, location, address: address || '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingPoi ? 'Edit Point of Interest' : 'Add Custom Point of Interest'}</DialogTitle>
          <DialogDescription>
            Search for a location to add it to your itinerary.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="poi-name">
              Location Name
            </Label>
            <div className="relative">
              <Input
                id="poi-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Clear location if user starts typing again, allowing a new search
                  if (location) {
                    setLocation(null);
                    setAddress(null);
                  }
                }}
                placeholder="e.g., Eiffel Tower, Paris"
                autoComplete="off"
              />
              {isFetching && !isSelectionInProgress && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                  <ul className="py-1">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion.place_id}
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          {address && (
            <div className="grid gap-2">
              <Label>Address</Label>
              <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">{address}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="poi-description">
              Description / Notes
            </Label>
            <Textarea
              id="poi-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Personal notes, reservation times, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <ActionButton title={editingPoi ? 'Save Changes' : 'Add POI'} onClick={handleSubmit} disabled={!location || isFetching} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
