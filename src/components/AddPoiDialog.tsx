'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PointOfInterest } from '@/lib/types';

interface AddPoiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPoi: (poi: Omit<PointOfInterest, 'id' | 'type'>) => void;
  editingPoi?: PointOfInterest | null; // For editing existing POI
}

export default function AddPoiDialog({ isOpen, onClose, onAddPoi, editingPoi }: AddPoiDialogProps) {
  const [name, setName] = useState(editingPoi?.name || '');
  const [description, setDescription] = useState(editingPoi?.description || '');

  useState(() => {
    if (editingPoi) {
      setName(editingPoi.name);
      setDescription(editingPoi.description || '');
    } else {
      setName('');
      setDescription('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPoi, isOpen]); // Reset form when dialog opens or editingPoi changes


  const handleSubmit = () => {
    if (name.trim()) {
      onAddPoi({ name, description });
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPoi ? 'Edit Point of Interest' : 'Add Custom Point of Interest'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="poi-name" className="text-right">
              Name
            </Label>
            <Input
              id="poi-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Eiffel Tower"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="poi-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="poi-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional: notes, address, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={!name.trim()}>
            {editingPoi ? 'Save Changes' : 'Add POI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
