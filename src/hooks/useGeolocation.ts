import { useState, useEffect } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  location_source: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
  village: string;
  landmark: string;
  district: string;
  state: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    location_source: 'GPS',
    village: '',
    landmark: '',
    district: '',
    state: '',
    loading: true,
    error: null,
  });

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'DisasterX-Emergency-App/1.0' } }
      );
      if (response.ok) {
        const json = await response.json();
        const address = json.address || {};
        const landmark = address.road || address.suburb || address.neighbourhood || address.amenity || 'Geographic vicinity';
        const village = address.village || address.town || address.suburb || address.city_district || 'District Urban';
        const district = address.state_district || address.county || address.city || 'District';
        const state = address.state || 'State';

        setLocation((prev) => ({
          ...prev,
          landmark,
          village,
          district,
          state,
        }));
      }
    } catch (err) {
      console.warn('[Geolocation] Reverse geocoding notice:', err);
    }
  };

  const requestGPS = () => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        location_source: 'MANUAL',
        error: 'GPS hardware unavailable on browser. Use map location selection.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          accuracy,
          location_source: 'GPS',
          loading: false,
          error: null,
        }));

        reverseGeocode(lat, lng);
      },
      (err) => {
        console.warn('[Geolocation] Error:', err.message);
        setLocation((prev) => ({
          ...prev,
          loading: false,
          location_source: 'MANUAL',
          error: 'Allow location access to automatically send your emergency location or select on map.',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestGPS();
  }, []);

  const setManualCoords = (lat: number, lng: number) => {
    setLocation((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      accuracy: 10,
      location_source: 'MANUAL',
      error: null,
    }));
    reverseGeocode(lat, lng);
  };

  const updateAddressDetails = (details: { village?: string; landmark?: string; district?: string; state?: string }) => {
    setLocation((prev) => ({
      ...prev,
      ...details,
    }));
  };

  return {
    location,
    requestGPS,
    setManualCoords,
    updateAddressDetails,
    reverseGeocode,
  };
}
