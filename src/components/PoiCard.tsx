import type { PointOfInterest } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ArrowUp, ArrowDown, Trash2, Edit3, MapPin, Clock, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <Card className="mb-2 shadow-sm bg-card/50 flex items-center p-3 gap-3 transition-all duration-300 hover:shadow-md hover:bg-card/70 border-border/20">
      {isEditingPlan && <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0" />}
      <div className="flex-grow">
        <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <h4 className="font-semibold text-foreground text-md">
            {poi.name}
            </h4>
        </div>
        {poi.address && (
          <div className="flex items-start gap-2 mt-1">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground/90">{poi.address}</p>
          </div>
        )}
        {poi.description && <p className="text-sm text-muted-foreground mt-2">{poi.description}</p>}
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground/80">
          {poi.time != null && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{poi.time} min</span>
            </div>
          )}
          {poi.cost && (
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>{poi.cost}</span>
            </div>
          )}
        </div>

        <div className="mt-2">
          {poi.type === 'custom' ? (
            <Badge variant="default">Custom POI</Badge>
          ) : (
            <Badge variant="accent">Suggested POI</Badge>
          )}
        </div>
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
            <Edit3 className="w-4 h-4 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(poi.id)} aria-label="Delete POI">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )}
    </Card>
  );
}
