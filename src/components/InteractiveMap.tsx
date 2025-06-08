
'use client';

import type { PointOfInterest } from '@/lib/types';
import { MapPin, X } from 'lucide-react';
import { useEffect, useState, Fragment } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl';

interface InteractiveMapProps {
  pointsOfInterest: PointOfInterest[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Viewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

export default function InteractiveMap({ pointsOfInterest }: InteractiveMapProps) {
  const [viewport, setViewport] = useState<Viewport>({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);

  useEffect(() => {
    if (pointsOfInterest.length > 0) {
      console.log(`POOOOOOOI: ${pointsOfInterest[0].name}`)
      console.log(`POOOOOOOI: ${pointsOfInterest[0].location?.lat}`)
      console.log(`POOOOOOOI: ${pointsOfInterest[0].location?.lng}`)
      const firstValidPoi = pointsOfInterest.find(
        (poi) => poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0)
      );

      if (firstValidPoi?.location) {
        setViewport({
          latitude: firstValidPoi.location.lat,
          longitude: firstValidPoi.location.lng,
          zoom: 13,
        });
      } else if (pointsOfInterest[0]?.location) {
        setViewport({
          latitude: pointsOfInterest[0].location.lat,
          longitude: pointsOfInterest[0].location.lng,
          zoom: pointsOfInterest[0].location.lat === 0 && pointsOfInterest[0].location.lng === 0 ? 1.5 : 13,
        });
      } else {
        setViewport({ longitude: 0, latitude: 20, zoom: 1.5 });
      }
    } else {
      setViewport({ longitude: 0, latitude: 20, zoom: 1.5 });
    }
  }, [pointsOfInterest]);

  if (typeof window === 'undefined') {
    return <div className="flex justify-center items-center h-[500px] bg-muted rounded-lg text-muted-foreground">Loading map...</div>;
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Mapbox Access Token Missing</h3>
        <p className="text-center">
          Please add your Mapbox access token to the .env file as <br />
          <code className="bg-destructive/20 px-1 py-0.5 rounded text-sm">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '500px', width: '100%' }} className="rounded-lg shadow-md overflow-hidden">
      <Map
        {...viewport}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        onMove={(evt) => setViewport(evt.viewState)}
        maxPitch={85}
        terrain={{source: 'mapbox-dem', exaggeration: 1.5}}
      >
        <ScaleControl />
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        
        {pointsOfInterest.map((poi) => (
          poi.location ? (
            <Marker
              key={poi.id}
              longitude={poi.location.lng}
              latitude={poi.location.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedPoi(poi);
              }}
              anchor="bottom"
            >
              <MapPin className="w-6 h-6 text-primary cursor-pointer" fill="hsl(var(--primary))" strokeWidth={1.5} />
            </Marker>
          ) : null
        ))}

        {selectedPoi && selectedPoi.location && (
          <Popup
            longitude={selectedPoi.location.lng}
            latitude={selectedPoi.location.lat}
            onClose={() => setSelectedPoi(null)}
            closeButton={false}
            className="mapboxgl-popup-content-custom"
            anchor="top"
            offset={25}
          >
            <div className="p-1 max-w-xs">
              <button
                onClick={() => setSelectedPoi(null)}
                className="absolute top-1 right-1 p-0.5 bg-white/70 hover:bg-white rounded-full transition-colors"
                aria-label="Close popup"
              >
                <X size={14} className="text-gray-600 hover:text-gray-800" />
              </button>
              <h4 className="font-semibold text-md mb-0.5">{selectedPoi.name}</h4>
              {selectedPoi.description && (
                <p className="text-xs text-muted-foreground leading-tight mb-1">{selectedPoi.description}</p>
              )}
              <p className="text-xs text-muted-foreground/70">
                Lat: {selectedPoi.location.lat.toFixed(4)}, Lng: {selectedPoi.location.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        )}
         <style jsx global>{`
          .mapboxgl-popup-content-custom {
            padding: 0;
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .mapboxgl-popup-close-button {
            display: none; /* Using custom close button */
          }
        `}</style>
      </Map>
    </div>
  );
}
