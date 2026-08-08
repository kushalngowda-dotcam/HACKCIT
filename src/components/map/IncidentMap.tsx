import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Incident, Resource, HospitalCapacity, Shelter, Ambulance } from '../../types/database';
import { Layers } from 'lucide-react';
import { generateGoogleMapsNavigationUrl } from '../../services/mapPlacesService';

interface IncidentMapProps {
  incidents?: Incident[];
  resources?: Resource[];
  hospitals?: HospitalCapacity[];
  shelters?: Shelter[];
  ambulances?: Ambulance[];
  onSelectIncident?: (incident: Incident) => void;
  onLocationSelect?: (coords: { latitude: number; longitude: number }) => void;
  selectedIncidentId?: string;
  center?: [number, number];
  zoom?: number;
  interactiveSelectMode?: boolean;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents = [],
  resources = [],
  hospitals = [],
  shelters = [],
  ambulances = [],
  onSelectIncident,
  onLocationSelect,
  selectedIncidentId,
  center,
  zoom = 12,
  interactiveSelectMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const selectMarkerRef = useRef<L.Marker | null>(null);

  const [showIncidents, setShowIncidents] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showAmbulances, setShowAmbulances] = useState(true);

  // Initialize Map & auto-center based on actual GPS or markers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        const initialCenter: [number, number] = center || [12.9716, 77.5946];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom,
          zoomControl: false,
        });

        // CartoDB Voyager Light Mode Tile Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        layerGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;

        // Attempt device GPS centering if no explicit center prop was supplied
        if (!center && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (mapInstanceRef.current && incidents.length === 0) {
                mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 13);
              }
            },
            () => {},
            { timeout: 5000 }
          );
        }
      } catch (err) {
        console.warn('[IncidentMap] Initialization handled:', err);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Interactive Map Selection Mode (Click to place marker)
  useEffect(() => {
    if (!mapInstanceRef.current || !interactiveSelectMode) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!selectMarkerRef.current) {
        const pinIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div style="background:#dc2626;width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">📍</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        selectMarkerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(mapInstanceRef.current!);
        selectMarkerRef.current.on('dragend', (evt: any) => {
          const draggedLatLng = evt.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({ latitude: draggedLatLng.lat, longitude: draggedLatLng.lng });
          }
        });
      } else {
        selectMarkerRef.current.setLatLng([lat, lng]);
      }

      if (onLocationSelect) {
        onLocationSelect({ latitude: lat, longitude: lng });
      }
    };

    mapInstanceRef.current.on('click', handleMapClick);
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
      }
    };
  }, [interactiveSelectMode, onLocationSelect]);

  // Render database-driven markers & dynamic bounds fitting
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();
    const boundsPoints: [number, number][] = [];

    // 1. Red Target Pin Incident Markers
    if (showIncidents) {
      incidents.forEach((inc) => {
        if (!inc.latitude || !inc.longitude) return;
        boundsPoints.push([inc.latitude, inc.longitude]);

        const isSelected = inc.id === selectedIncidentId;
        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="
              position: relative;
              background-color: #dc2626;
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              border-radius: 50%;
              border: 3px solid #ffffff;
              box-shadow: 0 0 12px rgba(220, 38, 38, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: ${isSelected ? '14px' : '11px'};
              cursor: pointer;
            ">
              📍
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${inc.latitude},${inc.longitude}`;

        const popupContent = `
          <div style="color: #0f172a; font-family: system-ui, sans-serif; padding: 6px; max-width: 240px;">
            <div style="font-weight: 800; font-size: 14px; color: #dc2626; margin-bottom: 4px;">📍 ${inc.title}</div>
            <div style="font-size: 11px; color: #334155; line-height: 1.5;">
              <span style="background-color: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">✓ GPS VERIFIED</span><br/>
              <strong style="color: #475569;">Coordinates:</strong>
              <code style="background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-weight: bold; color: #0284c7;">
                ${inc.latitude.toFixed(5)}, ${inc.longitude.toFixed(5)}
              </code><br/>
              <strong>Severity:</strong> ${inc.severity}<br/>
              <strong>Status:</strong> ${inc.status}<br/>
              <strong>Affected:</strong> ${inc.affected_count_est} victims<br/>
              <strong>Location:</strong> ${inc.location_name || 'Emergency Site'}<br/>
              <a href="${gmapsUrl}" target="_blank" style="display: inline-block; margin-top: 6px; padding: 4px 8px; background-color: #0284c7; color: white; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 10px;">
                📍 VIEW ON GOOGLE MAPS
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectIncident) onSelectIncident(inc);
        });

        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 2. Rescuer Unit Markers
    if (showResources) {
      resources.forEach((res) => {
        if (res.latitude === undefined || res.longitude === undefined) return;
        boundsPoints.push([res.latitude, res.longitude]);

        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="
              background-color: #0284c7;
              width: 26px;
              height: 26px;
              border-radius: 6px;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px rgba(2, 132, 199, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            ">
              🚒
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([res.latitude, res.longitude], { icon: customIcon });
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${res.latitude},${res.longitude}`;

        const popupContent = `
          <div style="color: #0f172a; font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-weight: 700; font-size: 13px; color: #0284c7;">🚒 ${res.name} (${res.code})</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.5;">
              <span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">✓ LIVE FIELD UNIT</span><br/>
              <strong>Status:</strong> ${res.status}<br/>
              <strong>GPS Position:</strong> ${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}<br/>
              <a href="${gmapsUrl}" target="_blank" style="display: inline-block; margin-top: 6px; padding: 4px 8px; background-color: #0284c7; color: white; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 10px;">
                📍 VIEW ON GOOGLE MAPS
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 3. Hospital Markers
    if (showHospitals) {
      hospitals.forEach((h) => {
        if (!h.hospital || !h.hospital.latitude || !h.hospital.longitude) return;
        boundsPoints.push([h.hospital.latitude, h.hospital.longitude]);

        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="
              background-color: #059669;
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px rgba(5, 150, 105, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
            ">
              🏥
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([h.hospital.latitude, h.hospital.longitude], { icon: customIcon });
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${h.hospital.latitude},${h.hospital.longitude}`;

        const popupContent = `
          <div style="color: #0f172a; font-family: system-ui, sans-serif; padding: 4px; max-width: 230px;">
            <div style="font-weight: 700; font-size: 13px; color: #059669;">🏥 ${h.hospital.name}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.5;">
              <span style="background-color: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">✓ REGISTERED HOSPITAL</span><br/>
              <strong>Free Beds:</strong> ${h.available_beds} / ${h.total_beds}<br/>
              <strong>Free ICU:</strong> ${h.available_icu_beds} / ${h.total_icu_beds}<br/>
              <strong>Emergency Dept:</strong> ${h.emergency_status || 'OPEN'}<br/>
              <a href="${gmapsUrl}" target="_blank" style="display: inline-block; margin-top: 6px; padding: 4px 8px; background-color: #059669; color: white; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 10px;">
                📍 VIEW ON GOOGLE MAPS
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 4. Ambulance Markers
    if (showAmbulances) {
      ambulances.forEach((amb) => {
        if (!amb.latitude || !amb.longitude) return;
        boundsPoints.push([amb.latitude, amb.longitude]);

        const customIcon = L.divIcon({
          className: 'custom-map-icon',
          html: `
            <div style="
              background-color: #7c3aed;
              width: 24px;
              height: 24px;
              border-radius: 6px;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px rgba(124, 58, 237, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
            ">
              🚑
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([amb.latitude, amb.longitude], { icon: customIcon });
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${amb.latitude},${amb.longitude}`;

        const popupContent = `
          <div style="color: #0f172a; font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
            <div style="font-weight: 700; font-size: 13px; color: #7c3aed;">🚑 ${amb.code}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.5;">
              <strong>Status:</strong> ${amb.status}<br/>
              <strong>Driver:</strong> ${amb.driver_name || 'Driver'}<br/>
              <a href="${gmapsUrl}" target="_blank" style="display: inline-block; margin-top: 6px; padding: 4px 8px; background-color: #7c3aed; color: white; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 10px;">
                📍 VIEW ON GOOGLE MAPS
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // Dynamic Map Bounds Auto-Fit Centering
    if (boundsPoints.length > 1 && mapInstanceRef.current && !center) {
      try {
        const bounds = L.latLngBounds(boundsPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (err) {
        console.warn('[IncidentMap] fitBounds notice:', err);
      }
    } else if (boundsPoints.length === 1 && mapInstanceRef.current && !center) {
      mapInstanceRef.current.setView(boundsPoints[0], 14);
    }
  }, [
    incidents,
    resources,
    hospitals,
    shelters,
    ambulances,
    selectedIncidentId,
    showIncidents,
    showResources,
    showHospitals,
    showAmbulances,
    center,
  ]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Database-Driven Dynamic Layer Controls */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl text-xs space-y-1.5 shadow-xl text-slate-200">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Database Layers
        </div>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showIncidents}
            onChange={(e) => setShowIncidents(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-0"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span>Incidents ({incidents.length})</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showResources}
            onChange={(e) => setShowResources(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-cyan-600 focus:ring-0"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
          <span>Rescuers ({resources.length})</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showHospitals}
            onChange={(e) => setShowHospitals(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>Hospitals ({hospitals.length})</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showAmbulances}
            onChange={(e) => setShowAmbulances(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-0"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
          <span>Ambulances ({ambulances.length})</span>
        </label>
      </div>
    </div>
  );
};
