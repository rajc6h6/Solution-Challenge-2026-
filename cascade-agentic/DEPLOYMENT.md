# CASCADE Deployment Guide - 100% Free Tier

## Quick Start (5 minutes)

### Step 1: Get Firebase Admin Credentials

1. Go to https://console.firebase.google.com/project/skills-63137/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file
4. Open it and copy these values to `.env.local`:

```bash
FIREBASE_PROJECT_ID=skills-63137
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@skills-63137.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 2: Get Firebase Client Config

1. Go to https://console.firebase.google.com/project/skills-63137/settings/general
2. Scroll to "Your apps" section
3. Copy the config values to `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skills-63137.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=skills-63137
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skills-63137.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
```

### Step 3: Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Step 4: Seed Database

```bash
curl -X POST http://localhost:3000/api/agent/seed
```

### Step 5: Watch Agent Work

The agent automatically runs every 5 minutes. Watch the dashboard for:
- ✅ Auto-executed reroutes (green)
- ⚠️ Escalated decisions (yellow)
- 📊 Real-time predictions

## Deploy to Vercel (Free)

### Method 1: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Method 2: GitHub + Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "CASCADE autonomous agent"
git remote add origin https://github.com/YOUR_USERNAME/cascade-agentic.git
git push -u origin main
```

2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Add environment variables (copy from `.env.local`)
5. Deploy!

## Environment Variables for Vercel

Add these in Vercel Dashboard > Settings > Environment Variables:

```
GEMINI_API_KEY=AIzaSyCAK2Nx-G4H4yw5Ja84KIDcZiX2QGXBpM0
FIREBASE_PROJECT_ID=skills-63137
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@skills-63137.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skills-63137.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=skills-63137
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skills-63137.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
```

## After Deployment

### Seed Production Database

```bash
curl -X POST https://your-app.vercel.app/api/agent/seed
```

### Monitor Agent Activity

```bash
curl -X POST https://your-app.vercel.app/api/agent/monitor
```

### Add Vercel Cron (Optional)

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/agent/monitor",
    "schedule": "*/5 * * * *"
  }]
}
```

This replaces client-side polling with server-side cron (free tier: 2 cron jobs).

## Firestore Setup

Ensure Firestore rules allow reads/writes:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Testing

### Test Seed Endpoint
```bash
curl -X POST http://localhost:3000/api/agent/seed \
  -H "Content-Type: application/json" \
  -d '{"count": 100, "reset": true}'
```

### Test Monitor Endpoint
```bash
curl -X POST http://localhost:3000/api/agent/monitor
```

Expected response:
```json
{
  "success": true,
  "processed": 50,
  "autoExecuted": 5,
  "escalated": 3,
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

## Architecture Changes

### Before (Cloud Functions - Requires Billing)
```
Cloud Functions (scheduled) → Firestore → Frontend
❌ Requires Blaze plan ($$$)
```

### After (API Routes - 100% Free)
```
Client polling → API Routes → Firestore → Frontend
✅ Vercel free tier
✅ Firestore free tier
✅ Gemini free tier
```

## Free Tier Limits

| Service | Limit | Usage |
|---------|-------|-------|
| Vercel | 100GB-hours/month | ✅ ~1GB-hour/day |
| Firestore Reads | 50K/day | ✅ ~5K/day (500 shipments × 10 checks) |
| Firestore Writes | 20K/day | ✅ ~2K/day (predictions + decisions) |
| Gemini API | 15 req/min | ✅ ~10 req/5min (50 shipments) |

**Total cost: $0.00/month**

## Monitoring

### Check Firestore Usage
https://console.firebase.google.com/project/skills-63137/usage

### Check Vercel Usage
https://vercel.com/dashboard/usage

### Check Gemini Usage
https://aistudio.google.com/app/apikey

## Support

Issues? Check:
1. Environment variables are set correctly
2. Firebase Admin credentials are valid
3. Firestore rules allow access
4. Gemini API key is active

## Next Steps

- [ ] Deploy to Vercel
- [ ] Add Vercel Cron for scheduled monitoring
- [ ] Monitor usage in Firebase Console
- [ ] Add authentication (optional)
- [ ] Enable real MCP integrations (optional)
