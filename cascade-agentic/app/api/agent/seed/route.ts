export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in Vercel → Project → Settings → Environment Variables (Production).`);
  }
  return value;
}

function normalizePrivateKey(raw: string): string {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.replace(/\\n/g, '\n');
}

function getDb(): Firestore {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: requireEnv('FIREBASE_PROJECT_ID'),
        clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
        privateKey: normalizePrivateKey(requireEnv('FIREBASE_PRIVATE_KEY')),
      }),
    });
  }
  return getFirestore();
}

const CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Atlanta', lat: 33.7490, lon: -84.3880 },
];

const CARRIERS = ['FastFreight', 'PrimeCarrier', 'QuickShip', 'ReliableTransport'];
const ROUTES = ['Interstate 80', 'Highway 101', 'Interstate 5', 'Highway 280'];

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json().catch(() => ({}));
    const count = Math.min(body.count || 500, 500);
    const reset = body.reset === true;

    if (reset) {
      await clearCollections(db, ['shipments', 'predictions', 'decisions', 'actions_log']);
    }

    const batch = db.batch();
    for (let i = 0; i < count; i++) {
      const origin = CITIES[i % CITIES.length];
      const destination = CITIES[(i + 3) % CITIES.length];
      const now = new Date();
      const departure = new Date(now.getTime() + (i % 48) * 3600000);
      const arrival = new Date(departure.getTime() + (12 + (i % 30)) * 3600000);
      const priority = pickPriority(i);
      const shipmentId = `SHIP${String(i).padStart(5, '0')}`;

      const shipmentRef = db.collection('shipments').doc(shipmentId);
      batch.set(shipmentRef, {
        shipmentId,
        origin: { lat: origin.lat, lon: origin.lon, city: origin.name },
        destination: { lat: destination.lat, lon: destination.lon, city: destination.name },
        plannedDeparture: departure,
        plannedArrival: arrival,
        carrier: CARRIERS[i % CARRIERS.length],
        customerPriority: priority,
        status: 'active',
        currentRoute: ROUTES[i % ROUTES.length],
        valueUsd: 5000 + (i % 200) * 275,
        driverEmail: `driver.${shipmentId.toLowerCase()}@cascade.ai`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      shipmentsCreated: count,
      reset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed database error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}

async function clearCollections(db: Firestore, collections: string[]) {
  for (const name of collections) {
    const docs = await db.collection(name).limit(500).get();
    if (docs.empty) continue;
    const batch = db.batch();
    docs.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

function pickPriority(i: number): 'critical' | 'high' | 'normal' {
  if (i % 10 === 0) return 'critical';
  if (i % 3 === 0) return 'high';
  return 'normal';
}
