import { createClient } from '@libsql/client';

console.log('Turso Database URL:', process.env.TURSO_DATABASE_URL);
console.log('Turso Auth Token:', process.env.TURSO_AUTH_TOKEN);

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

export interface Location {
  latitude: number;
  longitude: number;
}

export async function clockIn(userId: string, location: Location) {
  const { latitude, longitude } = location;
  const timestamp = new Date().toISOString();
  console.log('Clocking in with:', { userId, timestamp, latitude, longitude });

  try {

    await turso.execute({
      sql: 'INSERT INTO clock_ins (user_id, timestamp, latitude, longitude) VALUES (?,?,?,?)',
      args: [userId, timestamp, latitude, longitude],
    });
    console.log('Clock-in successful');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error executing query:', error.message);
    } else {
      console.error('Unknown error executing query:', error);
    }
    throw new Error('Database query failed');
  }
}
