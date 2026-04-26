import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
    privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50) || 'missing',
  });
}
