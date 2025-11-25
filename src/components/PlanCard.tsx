'use client';

import { MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PlanCardProps {
    id: string;
    title: string;
    image: string;
    destination: string;
    duration: string; // e.g. "7" or "7 Days"
    placesCount: number;
    date?: string;
}

export default function PlanCard({ id, title, image, destination, duration, placesCount, date }: PlanCardProps) {

    // Helper to mimic the 'getFirstAndLastSections' logic
    const formatDestination = (input: string) => {
        if (!input) return 'Unknown destination';
        const sections = input.split(',').map(s => s.trim());
        if (sections.length > 2) {
            return `${sections[0]}, ${sections[sections.length - 1]}`;
        }
        return sections.join(', ');
    };

    // Helper for pluralization logic from translation keys
    const getPlacesText = (count: number) => {
        return count === 1 ? '1 place' : `${count} places`;
    };

    const getDurationText = (dur: string) => {
        // Assuming input might be "7 Days", we just return it, 
        // or if it's just a number "7", append days.
        return dur.toLowerCase().includes('day') ? dur : `${dur} days`;
    };

    return (
        <Link
            href={`/plans/${id}`}
            className="block relative h-[220px] w-full rounded-[20px] overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all active:opacity-90"
        >
            {/* Background Image */}
            <img
                src={image || "/placeholder.jpg"}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Top Left Badge: Location */}
            {/* RN: BlurView intensity={12} tint={'light'} */}
            <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/40">
                    <MapPin size={12} className="text-white" />
                    <span className="text-white text-sm font-semibold leading-none pb-[1px]">
                        {formatDestination(destination)}
                    </span>
                </div>
            </div>

            {/* Bottom Section: Title & Stats */}
            {/* RN: BlurView intensity={16} tint={'light'} borderWidth: 0.5 */}
            <div className="absolute bottom-3 w-full px-3">
                <div className="bg-black/40 backdrop-blur-md rounded-[18px] border border-white/40 overflow-hidden">
                    <div className="flex flex-col items-start px-3 py-3 gap-1">

                        {/* Title */}
                        <h3 className="text-white text-lg font-semibold truncate w-full pr-2" title={title}>
                            {title || 'Untitled Plan'}
                        </h3>

                        {/* Stats Row */}
                        <div className="flex justify-between items-center w-full mt-1">
                            <div className="flex items-center gap-3">

                                {/* Places Count */}
                                <div className="flex items-center gap-1 opacity-90">
                                    {/* Using MapPin as substitute for map-marker-radius-outline */}
                                    <MapPin size={12} className="text-white" />
                                    <span className="text-white text-xs font-medium">
                                        {getPlacesText(placesCount)}
                                    </span>
                                </div>

                                {/* Duration */}
                                <div className="flex items-center gap-1 opacity-90">
                                    <Calendar size={12} className="text-white" />
                                    <span className="text-white text-xs font-medium">
                                        {getDurationText(duration)}
                                    </span>
                                </div>
                            </div>

                            {/* Date */}
                            {date && (
                                <div className="text-white/90 text-xs font-medium pr-1">
                                    {date}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}