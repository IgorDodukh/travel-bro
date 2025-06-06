
'use client';

import type { PointOfInterest } from '@/lib/types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type Map as LeafletMapInstance } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useRef } from 'react';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface InteractiveMapProps {
  pointsOfInterest: PointOfInterest[];
}

export default function InteractiveMap({ pointsOfInterest }: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState<number>(2);
  const mapRef = useRef<LeafletMapInstance | null>(null);

  useEffect(() => {
    if (pointsOfInterest.length > 0) {
      const firstValidPoi = pointsOfInterest.find(poi => poi.location && (poi.location.lat !== 0 || poi.location.lng !== 0));
      
      if (firstValidPoi && firstValidPoi.location) {
        setMapCenter([firstValidPoi.location.lat, firstValidPoi.location.lng]);
        setMapZoom(13); 
      } else if (pointsOfInterest.length > 0 && pointsOfInterest[0]?.location) { 
        setMapCenter([pointsOfInterest[0].location.lat, pointsOfInterest[0].location.lng]);
        setMapZoom(pointsOfInterest[0].location.lat === 0 && pointsOfInterest[0].location.lng === 0 ? 2 : 13); 
      } else {
        setMapCenter([20,0]);
        setMapZoom(2);
      }
    } else {
      setMapCenter([20,0]);
      setMapZoom(2);
    }
  }, [pointsOfInterest]);

  useEffect(() => {
    const currentMap = mapRef.current;
    return () => {
      if (currentMap) {
        currentMap.remove();
      }
    };
  }, []);


  if (typeof window === 'undefined') {
    return <p>Loading map...</p>; 
  }
  
  return (
    <MapContainer
      whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pointsOfInterest.map((poi) => (
        poi.location ? (
          <Marker key={poi.id} position={[poi.location.lat, poi.location.lng]}>
            <Popup>
              <h4 className="font-semibold">{poi.name}</h4>
              {poi.description && <p className="text-sm">{poi.description}</p>}
               <p className="text-xs text-muted-foreground">Lat: {poi.location.lat.toFixed(4)}, Lng: {poi.location.lng.toFixed(4)}</p>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
