import { Injectable } from '@angular/core';
import { GeoPoint } from '../models/emergency.model';

/**
 * Topics: Promises, async/await, Fetch API, error handling.
 */
@Injectable({ providedIn: 'root' })
export class LocationService {
  /** Wraps the callback-based Geolocation API in a Promise. */
  getCurrentPosition(): Promise<GeoPoint> {
    return new Promise<GeoPoint>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Location is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(new Error(err.message || 'Location permission was denied.')),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  /** Uses the Fetch API to turn coordinates into an address (OpenStreetMap Nominatim). */
  async reverseGeocode(point: GeoPoint): Promise<string> {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${point.latitude}&lon=${point.longitude}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`Address lookup failed (HTTP ${response.status}).`);
    }
    const data: { display_name?: string } = await response.json();
    return data.display_name ?? 'Address not available';
  }

  /** async/await chain: position first, then address (falls back to coordinates). */
  async locateWithAddress(): Promise<GeoPoint> {
    const point = await this.getCurrentPosition();
    try {
      point.address = await this.reverseGeocode(point);
    } catch {
      point.address = `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
    }
    return point;
  }
}
