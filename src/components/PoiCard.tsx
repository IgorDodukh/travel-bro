import type { PointOfInterest } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ArrowUp, ArrowDown, Trash2, Edit3, MapPinIcon } from 'lucide-react';

interface PoiCardProps {
  poi: PointOfInterest;
  index: number;
  totalItems: number;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (poi: PointOfInterest) => void;
  isEditingPlan: boolean;
}

export default function PoiCard({ poi, index, totalItems, onMoveUp, onMoveDown, onDelete, onEdit, isEditingPlan }: PoiCardProps) {
  return (
    <Card className="mb-2 shadow-sm bg-card flex items-center p-3 gap-2 transition-all duration-300 hover:shadow-md">
      {isEditingPlan && <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0" />}
      <div className="flex-grow">
        <h4 className="font-semibold text-md flex items-center gap-1">
          <MapPinIcon className="w-4 h-4 text-primary" />
          {poi.name}
        </h4>
        {poi.description && <p className="text-sm text-muted-foreground mt-1">{poi.description}</p>}
        <p className="text-xs text-blue-500 mt-0.5">{poi.type === 'custom' ? 'Custom POI' : 'Suggested POI'}</p>
      </div>
      {isEditingPlan && (
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onMoveUp(poi.id)} disabled={index === 0} aria-label="Move up">
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onMoveDown(poi.id)} disabled={index === totalItems - 1} aria-label="Move down">
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(poi)} aria-label="Edit POI">
            <Edit3 className="w-4 h-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(poi.id)} aria-label="Delete POI">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )}
    </Card>
  );
}
