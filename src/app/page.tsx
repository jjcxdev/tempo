'use client';

import { useState } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Location } from '@/lib/turso';

const OFFICE_LOCATION = { latitude: 43.570280, longitude: -79.610970 }; // Office location
const RADIUS = 50; // Radius in meters

export default function Home() {
  const { data: session, status } = useSession();
  const [location, setLocation] = useState<Location | null>(null);
  const [message, setMessage] = useState<string>('');

  const checkGeofence = (userLocation: Location): boolean => {
    const distance = calculateDistance(userLocation, OFFICE_LOCATION);
    console.log('Calculated distance:, distance');
    return distance <= RADIUS;
  };

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371e3; // Earth's raddius in meters
    const φ1 = (loc1.latitude * Math.PI) / 180;
    const φ2 = (loc2.latitude * Math.PI) / 180;
    const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleClockIn = async () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('User location:', userLocation);
        setLocation(userLocation);

        if (checkGeofence(userLocation)) {
          try {
            const response = await axios.post('/api/clock-in', {
              location: userLocation,
            });

            setMessage(response.data.message);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              setMessage(error.response?.data.message || 'Error clocking in');
            } else {
              setMessage('Unkown error occured');
            }
          }
        } else {
          setMessage('You are not within the geofenced area');
        }
      },
      () => {
        setMessage('Unable to retrieve your location');
      }
    );
  };

  return (
    <div>
      <h1>Tempo</h1>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : !session ? (
        <>
          <button onClick={() => signIn()}>Sign in</button>
        </>
      ) : (
        <>
          <button onClick={handleClockIn}>Clock In</button>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
