/**
 * Utility functions for browser Geolocation API and Nominatim Reverse Geocoding.
 */

export interface GPSLocationResult {
  lat: number;
  lng: number;
  address: string;
  area: string;
  error?: string;
}

// Default regional center if GPS is denied or unavailable (Bengaluru Default)
export const DEFAULT_COORDINATES: { lat: number; lng: number } = {
  lat: 12.9716,
  lng: 77.5946
};

/**
 * Capture raw browser GPS coordinates using Navigator Geolocation API.
 */
export async function getCurrentGPSPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (err) => {
        console.warn('[Geolocation] Browser GPS position unavailable:', err.message);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}

/**
 * Reverse-geocode coordinates using free Nominatim / OpenStreetMap API.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; area: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
      const suburb = addr.suburb || addr.district || addr.subdistrict || addr.city_district || addr.county || 'Local Sector';
      const city = addr.city || addr.town || addr.village || addr.state || '';

      const mainAddress = data.display_name 
        ? data.display_name.split(',').slice(0, 3).join(',').trim()
        : `${road ? road + ', ' : ''}${city}`;

      return {
        address: mainAddress || `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
        area: suburb || city || 'Current Location'
      };
    }
  } catch (err) {
    console.warn('[Geolocation] Reverse geocoding failed:', err);
  }

  return {
    address: `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    area: 'Current Location'
  };
}

/**
 * Helper to capture GPS location and reverse geocode address in one call.
 */
export async function getGPSLocationWithAddress(): Promise<GPSLocationResult> {
  try {
    const coords = await getCurrentGPSPosition();
    const geocoded = await reverseGeocode(coords.lat, coords.lng);
    return {
      lat: coords.lat,
      lng: coords.lng,
      address: geocoded.address,
      area: geocoded.area
    };
  } catch (err: any) {
    const geocoded = await reverseGeocode(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng);
    return {
      lat: DEFAULT_COORDINATES.lat,
      lng: DEFAULT_COORDINATES.lng,
      address: geocoded.address,
      area: geocoded.area,
      error: err?.message || 'Location access denied or unavailable. Using default coordinates.'
    };
  }
}
