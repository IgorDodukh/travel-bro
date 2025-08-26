'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ActionButton from './ui/action-button';

interface SavePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (planName: string) => void;
  initialPlanName?: string;
}

export default function SavePlanDialog({ isOpen, onClose, onSavePlan, initialPlanName = '' }: SavePlanDialogProps) {
  const [planName, setPlanName] = useState(initialPlanName);

  useEffect(() => {
    setPlanName(initialPlanName);
  }, [initialPlanName, isOpen]);

  const handleSubmit = () => {
    if (planName.trim()) {
      onSavePlan(planName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Travel Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              Plan Name
            </Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Paris Adventure 2024"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <ActionButton title="Save Plan" onClick={handleSubmit} disabled={!planName.trim()} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
