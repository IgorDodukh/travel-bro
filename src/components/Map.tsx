'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { View } from 'lucide-react';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{ position: [number, number]; title: string }>;
  route?: Array<[number, number]>;
}

export default function Map({ center, zoom = 5, markers = [], route = [] }: MapProps) {
  return (
    <View></View>
    // <MapContainer 
    //   // 👇 THIS IS THE FIX
    //   // We use the coordinates as a key. This does two things:
    //   // 1. Prevents the "Map already initialized" error by forcing a fresh DOM node.
    //   // 2. Automatically updates the map view when you switch between Travel Plans.
    //   key={`${center[0]}-${center[1]}`} 
      
    //   center={center} 
    //   zoom={zoom} 
    //   scrollWheelZoom={false} 
    //   className="h-full w-full rounded-3xl outline-none" // added outline-none for cleaner UI
    // >
    //   <TileLayer
    //     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //     url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    //   />
    //   {markers.map((m, idx) => (
    //     <Marker key={idx} position={m.position} icon={icon}>
    //       <Popup>{m.title}</Popup>
    //     </Marker>
    //   ))}
    //   {route.length > 1 && <Polyline positions={route} color="#ff3c00" weight={4} />}
    // </MapContainer>
  );
}