# CASCADE - Autonomous Agentic Supply Chain AI

**100% Free Tier Deployment** - No billing required!

## Architecture

- **Frontend**: Next.js 14 (React)
- **Backend**: Next.js API Routes (replaces Cloud Functions)
- **Database**: Firestore (free tier: 50K reads/day, 20K writes/day)
- **AI**: Gemini 2.0 Flash (free tier)
- **Deployment**: Vercel (free tier)
- **Monitoring**: Client-side polling (every 5 minutes)

## Features

✅ Autonomous agent that monitors shipments 24/7
✅ Real-time disruption predictions using Gemini AI
✅ Auto-executes reroutes when risk > 70% and confidence > 85%
✅ Escalates to humans when needed
✅ Live dashboard with Firestore real-time listeners
✅ Voice interface for natural language queries
✅ MCP-style tool integration (Gmail, Calendar, Sheets simulation)

## Setup Instructions

### 1. Get Firebase Credentials

#### A. Get Firebase Client SDK Config
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `skills-63137`
3. Go to Project Settings > General
4. Scroll to "Your apps" > Web app
5. Copy the config values

#### B. Get Firebase Admin SDK Credentials
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract these values:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the \n characters)

### 2. Configure Environment Variables

Update `.env.local`:

```bash
# Gemini API (already set)
GEMINI_API_KEY="AIzaSyCAK2Nx-G4H4yw5Ja84KIDcZiX2QGXBpM0"
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyCAK2Nx-G4H4yw5Ja84KIDcZiX2QGXBpM0"

# Firebase Admin SDK (for API routes)
FIREBASE_PROJECT_ID=skills-63137
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@skills-63137.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skills-63137.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=skills-63137
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=skills-63137.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Seed Database

Once the app is running, seed the database with test data:

```bash
curl -X POST http://localhost:3000/api/agent/seed
```

Or click the "Seed Database" button in the UI.

Expected response:
```json
{
  "success": true,
  "shipmentsCreated": 500,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Trigger Agent Manually

The agent runs automatically every 5 minutes, but you can trigger it manually:

```bash
curl -X POST http://localhost:3000/api/agent/monitor
```

Or click "Run Agent Now" button in the UI.

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

## Deploy to Vercel (Free)

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables in Vercel dashboard
6. Deploy!

### Set Environment Variables in Vercel

Go to: Project Settings > Environment Variables

Add all variables from `.env.local`:
- GEMINI_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

## API Routes

### POST /api/agent/monitor
Runs the autonomous agent cycle:
- Fetches active shipments from Firestore
- Generates predictions using Gemini
- Auto-executes reroutes for high-risk shipments
- Escalates complex decisions to humans

### POST /api/agent/seed
Seeds the database with test shipments:
- Creates 500 sample shipments
- Randomized routes, priorities, carriers
- Ready for agent monitoring

## How It Works

1. **Client-side polling** triggers `/api/agent/monitor` every 5 minutes
2. **Agent fetches** active shipments from Firestore (free tier: 50K reads/day)
3. **Gemini AI** analyzes weather, traffic, historical data
4. **Autonomous decisions**:
   - Risk > 70% + Confidence > 85% + Cost < $500 → AUTO-EXECUTE reroute
   - Risk > 70% but low confidence or high cost → ESCALATE to human
   - Risk 40-70% → MONITOR and notify
   - Risk < 40% → CONTINUE monitoring
5. **Real-time UI** updates via Firestore listeners (no polling needed)

## Cost Breakdown (100% Free)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| Vercel | Unlimited bandwidth, 100GB-hours compute | ✅ Covered |
| Firestore | 50K reads/day, 20K writes/day | ✅ ~500 shipments = 5K reads/day |
| Gemini API | 15 requests/min, 1M tokens/day | ✅ ~50 predictions/5min = 600/hour |
| Open-Meteo | Unlimited weather API | ✅ Free forever |

**Total monthly cost: $0.00**

## Firestore Collections

- `shipments` - Active shipments being monitored
- `predictions` - AI-generated disruption predictions
- `decisions` - Autonomous agent decisions (auto-execute, escalate, monitor)
- `actions_log` - MCP action logs (Gmail, Calendar, Sheets)

## Demo Mode

All MCP actions (Gmail, Calendar, Sheets) are simulated in demo mode. To enable real integrations:

1. Set up Google Service Account
2. Enable Gmail, Calendar, Sheets APIs
3. Add credentials to `.env.local`
4. Set `demoMode: false` in decision logs

## Troubleshooting

### "Firebase Admin not initialized"
- Check FIREBASE_PRIVATE_KEY has proper \n characters
- Verify FIREBASE_CLIENT_EMAIL is correct
- Ensure all Firebase Admin env vars are set

### "Gemini API error"
- Verify GEMINI_API_KEY is valid
- Check rate limits (15 req/min)
- Try gemini-1.5-flash if 2.0 unavailable

### "No shipments found"
- Run seed endpoint: `POST /api/agent/seed`
- Check Firestore rules allow reads/writes
- Verify Firebase project ID matches

## Next Steps

- [ ] Add Vercel Cron for scheduled monitoring (free: 2 cron jobs)
- [ ] Implement real MCP integrations (Gmail, Calendar, Sheets)
- [ ] Add authentication (Clerk free tier)
- [ ] Deploy to production on Vercel
- [ ] Monitor Firestore usage in Firebase Console

## License

MIT
