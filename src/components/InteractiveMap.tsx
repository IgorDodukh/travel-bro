
'use client';

import type { PointOfInterest } from '@/lib/types';
import { MapPin, X } from 'lucide-react';
import { useEffect, useState, Fragment } from 'react';
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
  let selectedDayIndex = 1;

  useEffect(() => {
    if (pointsOfInterest.length > 0) {
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

    // Effect to fetch and display the route for the selected day
    const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
    useEffect(() => {
      console.log(`EFSEFSE@@@@@@@: ${JSON.stringify(pointsOfInterest)}`)
      const fetchRoute = async () => {
        if (selectedDayIndex === undefined || selectedDayIndex === null) {
          setRouteGeoJSON(null);
          console.error("selectedDayIndex is undefined or null")
          return;
        }
        // Filter POIs for the selected day
        const poisForSelectedDay = pointsOfInterest.filter(
          (poi) => poi.dayIndex === selectedDayIndex && poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0)
        );
        if (poisForSelectedDay.length < 2) {
          setRouteGeoJSON(null);
          console.error(`Not enough points for a route: ${poisForSelectedDay.length}`)
          return;
        }
        // Create coordinates string for the Mapbox Directions API
        const coordinates = poisForSelectedDay.map(poi => `${poi.location!.lng},${poi.location!.lat}`).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            setRouteGeoJSON({
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: data.routes[0].geometry.coordinates,
                  },
                },
              ],
            });
          } else {
            setRouteGeoJSON(null);
            console.error('No route found for the selected points.');
          }
        } catch (error) {
          console.error('Error fetching route:', error);
          setRouteGeoJSON(null);
        }
      };
      fetchRoute();
    }, [pointsOfInterest, selectedDayIndex]); // Rerun when pointsOfInterest or selectedDayIndex changes
  

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

        {/* Render Polyline for the route */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-layer"
              type="line"
              paint={{
                'line-color': '#3B82F6', // Tailwind blue-500
                'line-width': 4,
                'line-opacity': 0.75,
              }}
            />
          </Source>
        )}
        
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
