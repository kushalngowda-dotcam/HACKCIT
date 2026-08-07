import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Resource, Hospital, Shelter, RoadBlockage, EvacuationRoute, AIRiskZone } from '../types';
import { INITIAL_RISK_ZONES } from '../data/mockData';
import { Layers, ShieldAlert, Sparkles, Truck } from 'lucide-react';

import 'leaflet/dist/leaflet.css';

interface DisasterMapProps {
  incidents: Incident[];
  resources: Resource[];
  hospitals: Hospital[];
  shelters: Shelter[];
  blockages: RoadBlockage[];
  routes: EvacuationRoute[];
  riskZones?: AIRiskZone[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectResource?: (resource: Resource) => void;
  onSelectRiskZone?: (zone: AIRiskZone) => void;
  onDispatchResource?: (incidentId: string, resourceId: string) => void;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.2 });
  }, [center, map]);
  return null;
}

const createIncidentIcon = (severity: string) => {
  const color = severity === 'CRITICAL' ? '#ff3838' : severity === 'HIGH' ? '#ff9f43' : '#00f2fe';
  const pulseClass = severity === 'CRITICAL' ? 'marker-pulse-critical' : 'marker-pulse-high';

  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
        <div class="absolute inset-0 rounded-full ${pulseClass}" style="background-color: ${color}40; border: 2px solid ${color};"></div>
        <div class="relative w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-black shadow-lg" style="background-color: ${color};">
          🚨
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createResourceIcon = (type: string, status: string) => {
  const iconSymbol = type === 'AMBULANCE' ? '🚑' : type === 'FIRE_ENGINE' ? '🚒' : type === 'RESCUE_BOAT' ? '🚤' : '🚓';
  const isBusy = status === 'DISPATCHED' || status === 'EN_ROUTE' || status === 'ON_SITE';
  const badgeColor = isBusy ? '#ff9f43' : '#00d26a';

  return L.divIcon({
    className: 'custom-resource-marker',
    html: `
      <div class="relative flex items-center justify-center w-7 h-7 bg-white border-2 rounded-lg shadow-md hover:scale-110 transition-transform cursor-pointer" style="border-color: ${badgeColor};">
        <span class="text-xs">${iconSymbol}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createHospitalIcon = (status: string) => {
  const color = status === 'CRITICAL_OVERLOAD' ? '#ff3838' : status === 'HIGH_CAPACITY' ? '#ff9f43' : '#00d26a';
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div class="w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center text-xs font-bold shadow-lg" style="border-color: ${color}; color: ${color};">
        🏥
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createShelterIcon = () => {
  return L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div class="w-7 h-7 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-xs shadow-lg">
        ⛺
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const DisasterMap: React.FC<DisasterMapProps> = ({
  incidents,
  resources,
  hospitals,
  shelters,
  blockages,
  routes,
  riskZones = INITIAL_RISK_ZONES,
  selectedIncident,
  onSelectIncident,
  onSelectResource,
  onSelectRiskZone,
  onDispatchResource
}) => {
  const [showRiskLayer, setShowRiskLayer] = useState<boolean>(true);

  const center: [number, number] = selectedIncident 
    ? [selectedIncident.location.lat, selectedIncident.location.lng]
    : [12.9716, 77.5946];

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-md z-0 font-sans">
      
      {/* Top Floating Control Layer Toggle */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center space-x-2">
        <button
          onClick={() => setShowRiskLayer(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center space-x-1.5 shadow-lg cursor-pointer ${
            showRiskLayer
              ? 'bg-red-600 text-white border-red-500 shadow-red-500/20 animate-pulse'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showRiskLayer ? '⚡ AI Risk Layer: ON' : 'AI Risk Layer: OFF'}</span>
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Feature 4: AI Risk Layer (Rendered as translucent heatmap circles when active) */}
        {showRiskLayer && riskZones.map(zone => {
          const color = zone.level === 'CRITICAL' ? '#ef4444' : zone.level === 'HIGH' ? '#f97316' : '#eab308';
          return (
            <Circle
              key={`risk-circle-${zone.id}`}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '6, 6'
              }}
              eventHandlers={{
                click: () => onSelectRiskZone && onSelectRiskZone(zone)
              }}
            >
              <Tooltip sticky direction="top">
                <div className="font-sans text-xs">
                  <div className="font-bold text-red-600">⚡ {zone.name}</div>
                  <div className="text-[10px] text-slate-600">Exposure: {zone.population_exposure.toLocaleString()} pax</div>
                  <div className="text-[10px] text-teal-600 font-bold">Click for AI Risk Assessment</div>
                </div>
              </Tooltip>
            </Circle>
          );
        })}

        {incidents.map(inc => (
          <CircleMarker
            key={`circle-${inc.id}`}
            center={[inc.location.lat, inc.location.lng]}
            radius={inc.severity === 'CRITICAL' ? 35 : inc.severity === 'HIGH' ? 25 : 15}
            pathOptions={{
              color: inc.severity === 'CRITICAL' ? '#ff3838' : inc.severity === 'HIGH' ? '#ff9f43' : '#00f2fe',
              fillColor: inc.severity === 'CRITICAL' ? '#ff3838' : inc.severity === 'HIGH' ? '#ff9f43' : '#00f2fe',
              fillOpacity: 0.15,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          />
        ))}

        {incidents.map(inc => (
          <Marker
            key={inc.id}
            position={[inc.location.lat, inc.location.lng]}
            icon={createIncidentIcon(inc.severity)}
            eventHandlers={{
              click: () => onSelectIncident(inc)
            }}
          >
            <Popup className="eoc-popup">
              <div className="p-2 space-y-2 max-w-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    PRIORITY {inc.priority_score}/100
                  </span>
                </div>

                <h4 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(inc);
                  }}
                  className="font-bold text-sm text-slate-800 leading-snug cursor-pointer hover:text-teal-600 transition-colors"
                >
                  {inc.title}
                </h4>
                
                <p className="text-xs text-slate-300">{inc.location.address}</p>

                <div className="text-xs text-amber-300 font-medium">
                  👥 {inc.people_at_risk} People at Risk
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-400 font-semibold leading-tight">
                    AI Verification: {inc.verification_status} ({inc.verification_score}%)
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectIncident(inc);
                    }}
                    className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-xs rounded-lg shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Feature 8: Live Resource Digital Twin Marker Click Handlers */}
        {resources.map(res => (
          <Marker
            key={res.id}
            position={[res.current_location.lat, res.current_location.lng]}
            icon={createResourceIcon(res.type, res.status)}
            eventHandlers={{
              click: () => onSelectResource && onSelectResource(res)
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div className="text-xs font-sans">
                <span className="font-bold">{res.unit_code}</span> — {res.name} ({res.status})
                <div className="text-[10px] text-teal-600 font-bold">Click for Digital Twin Telemetry</div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {hospitals.map(hosp => (
          <Marker
            key={hosp.id}
            position={[hosp.location.lat, hosp.location.lng]}
            icon={createHospitalIcon(hosp.status)}
          >
            <Popup>
              <div className="p-2 space-y-1 font-sans">
                <h4 className="font-bold text-xs text-slate-900">{hosp.name}</h4>
                <div className="text-xs text-slate-500">{hosp.location.address}</div>
                <div className="text-xs text-emerald-600 font-mono font-bold">
                  Beds Available: {hosp.available_beds} / {hosp.total_beds} ({hosp.icu_available} ICU)
                </div>
                <div className="text-[10px] text-slate-400">Status: {hosp.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {shelters.map(shelt => (
          <Marker
            key={shelt.id}
            position={[shelt.location.lat, shelt.location.lng]}
            icon={createShelterIcon()}
          >
            <Tooltip direction="top" opacity={0.9}>
              <div className="text-xs font-sans font-bold">
                ⛺ {shelt.name} (Cap: {shelt.current_occupancy}/{shelt.capacity})
              </div>
            </Tooltip>
          </Marker>
        ))}

        {blockages.map(blk => (
          <Polyline
            key={blk.id}
            positions={blk.coordinates}
            pathOptions={{ color: '#ff3838', weight: 5, opacity: 0.85, dashArray: '8, 8' }}
          >
            <Tooltip sticky>
              <span className="text-xs text-red-600 font-bold">🚫 BLOCKED: {blk.road_name} ({blk.cause})</span>
            </Tooltip>
          </Polyline>
        ))}

        {routes.map(rt => (
          <Polyline
            key={rt.id}
            positions={rt.path}
            pathOptions={{ color: '#00f2fe', weight: 4, opacity: 0.9 }}
          >
            <Tooltip sticky>
              <span className="text-xs text-cyan-600 font-bold">🗺️ {rt.name} (Safety Score: {rt.safety_score}%)</span>
            </Tooltip>
          </Polyline>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 border border-slate-200 backdrop-blur-md p-3 rounded-xl shadow-lg text-xs font-sans space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-600 text-[11px] uppercase tracking-wider mb-1">GIS Map Legend</div>
        <div className="flex items-center space-x-2 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span>Critical Incident Node</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60"></span>
          <span>⚡ AI Risk Zone Layer</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Trauma Center / Safe Shelter</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-700">
          <span className="w-4 h-1 bg-cyan-400"></span>
          <span>AI Evacuation Polyline</span>
        </div>
      </div>
    </div>
  );
};
