'use client';

import type { PointOfInterest } from '@/lib/types';
import { MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, Source, Layer } from 'react-map-gl';

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
  
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);

  // Calculate the total number of unique days
  const dayIndexes = Array.from(new Set(pointsOfInterest.map(p => p.dayIndex))).sort((a,b) => a - b);
  const totalDays = dayIndexes.length;

  // Effect to center map on the points of the selected day
  useEffect(() => {
    // Filter POIs for the currently selected day
    const poisForSelectedDay = pointsOfInterest.filter(
      (poi) => poi.dayIndex === selectedDayIndex && poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0)
    );

    if (poisForSelectedDay.length > 0) {
      // Center on the first POI of the selected day
      const firstPoi = poisForSelectedDay[0];
      setViewport(v => ({
        ...v,
        latitude: firstPoi.location!.lat,
        longitude: firstPoi.location!.lng,
        zoom: 13,
      }));
    } else if (pointsOfInterest.length > 0) {
        // Fallback to the very first POI if the selected day has no valid points
        const firstValidPoi = pointsOfInterest.find(poi => poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0));
        
        if (firstValidPoi && firstValidPoi.location) {
          const { lat, lng } = firstValidPoi.location;
          setViewport(v => ({ ...v, latitude: lat, longitude: lng, zoom: 13 }));
        }

    } else {
      setViewport({ longitude: 0, latitude: 20, zoom: 1.5 });
    }
  }, [pointsOfInterest, selectedDayIndex]);


  // Effect to fetch and display the route for the selected day
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      // Reset state before fetching
      setRouteGeoJSON(null);
      setRouteError(null);
      
      const poisForSelectedDay = pointsOfInterest.filter(
        (poi) => poi.dayIndex === selectedDayIndex && poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0)
      );

      if (poisForSelectedDay.length < 2) {
        // Don't show an error if there are just not enough points, it's not a failure
        return;
      }

      setIsLoadingRoute(true);
      
      try {
        const coordinates = poisForSelectedDay.map(poi => `${poi.location!.lng},${poi.location!.lat}`).join(';');
        // Use the improved URL with higher resolution geometry
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          setRouteGeoJSON({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry,
            }],
          });
        } else {
          console.error('No route found for the selected points:', data.message);
          setRouteError('Could not find a route for the selected points.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        setRouteError('Failed to load the route. Please check your connection.');
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [pointsOfInterest, selectedDayIndex]);

  if (typeof window === 'undefined') {
    return <div className="flex justify-center items-center h-[500px] bg-muted rounded-lg text-muted-foreground">Loading map...</div>;
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Mapbox Access Token Missing</h3>
        <p className="text-center">Please add your Mapbox access token to the .env file.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '500px', width: '100%' }} className="relative rounded-lg shadow-md overflow-hidden">
      {/* Day Selector Tabs UI */}
      {totalDays > 1 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-lg flex space-x-1">
          {dayIndexes.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(day)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedDayIndex === day
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'bg-transparent hover:bg-primary/10 text-primary'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

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

        {/* Render Polyline for the route */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-layer"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round"
              }}
              paint={{
                'line-color': '#3B82F6',
                'line-width': 4,
                'line-opacity': 0.8,
              }}
            />
          </Source>
        )}
        
        {/* Render all markers, with color based on selected day */}
        {pointsOfInterest.map((poi) => {
          if (!poi.location) return null;

          const isActive = poi.dayIndex === selectedDayIndex;
          const pinColor = isActive ? '#84cc16' : '#5a5a5a'; // Light green for active, grey for inactive
          const pinOpacity = isActive ? 1 : 0.6;

          return (
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
              <div style={{ opacity: pinOpacity }}>
                <MapPin
                  className="w-6 h-6 cursor-pointer drop-shadow-lg"
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              </div>
            </Marker>
          );
        })}

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
            display: none;
          }
        `}</style>
      </Map>
       {/* UI for loading and error states */}
       {isLoadingRoute && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-white/80 p-2 rounded-lg shadow-md">
            <p className="text-sm text-primary">Generating route...</p>
          </div>
        )}
        {routeError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-red-100 p-2 rounded-lg shadow-md">
            <p className="text-sm text-red-700">{routeError}</p>
          </div>
        )}
    </div>
  );
}
