# CASCADE Agentic AI - Quick Setup Guide

## ⚡ 15-Minute Setup

### Step 1: Google Cloud Project (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "cascade-agentic"
3. Enable billing
4. Note your Project ID

### Step 2: Firebase Setup (3 min)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
cd cascade-agentic
firebase init

# Select:
# - Firestore
# - Functions (Node.js 18)
# - Hosting

# Link project
firebase use --add
# Select your project ID
```

### Step 3: Enable APIs (2 min)

```bash
gcloud config set project YOUR_PROJECT_ID

gcloud services enable \
  firestore.googleapis.com \
  cloudfunctions.googleapis.com \
  gmail.googleapis.com \
  calendar-json.googleapis.com \
  sheets.googleapis.com \
  generativelanguage.googleapis.com
```

### Step 4: Get Gemini API Key (2 min)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Step 5: Service Account (3 min)

```bash
# Create service account
gcloud iam service-accounts create cascade-agent \
  --display-name="CASCADE Autonomous Agent"

# Grant roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:cascade-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

# Create key
gcloud iam service-accounts keys create functions/service-account-key.json \
  --iam-account=cascade-agent@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Step 6: Environment Variables (2 min)

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_from_firebase_console
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Create `functions/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_PROJECT=your_project_id
```

### Step 7: Deploy (1 min)

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Deploy
firebase deploy
```

---

## 🎯 Post-Deployment

### Seed Database

```bash
# Option 1: Firebase Console
# Go to Functions → seedDatabase → Test
# Input: {"count": 50}

# Option 2: cURL
curl -X POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/seedDatabase \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

### Test Agent

Wait 15 minutes for first agent run, or trigger manually:

```bash
# Trigger agent monitor
gcloud functions call agentMonitor --region=YOUR_REGION
```

### Open Dashboard

```bash
firebase hosting:channel:open live
```

---

## 🐛 Common Issues

### "Permission denied" on Firestore

Update `firestore.rules`:

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

Then: `firebase deploy --only firestore:rules`

### Functions not deploying

```bash
cd functions
rm -rf node_modules lib
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Gemini API errors

- Verify API key is correct
- Check `generativelanguage.googleapis.com` is enabled
- Ensure billing is enabled

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] APIs enabled
- [ ] Gemini API key obtained
- [ ] Service account created
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Deployed successfully
- [ ] Database seeded
- [ ] Dashboard accessible
- [ ] Agent running

---

## 📊 Test the System

### 1. Check Dashboard

Open your Firebase Hosting URL. You should see:
- Stats cards with data
- High-risk alerts (if any)
- Decision log (empty initially)
- Shipment map

### 2. Test Voice Command

1. Click "Ask CASCADE"
2. Say: "Which shipments are at risk?"
3. Wait for response
4. Should hear audio response

### 3. Verify Agent

Check Cloud Functions logs:

```bash
firebase functions:log --only agentMonitor
```

Should see:
```
🤖 CASCADE Agent Monitor started
Found X shipments to monitor
Decision for SHIP00001: reroute_shipment
✅ Agent Monitor completed: Y actions, Z escalations
```

### 4. Check MCP Actions

If agent executed actions, verify:
- Gmail: Check driver email inbox
- Calendar: Check Google Calendar
- Sheets: Open your Google Sheet

---

## 🚀 You're Live!

Your CASCADE Agentic AI system is now:
- ✅ Monitoring shipments every 15 minutes
- ✅ Predicting disruptions with Gemini
- ✅ Autonomously executing actions
- ✅ Logging to Google Sheets
- ✅ Updating in real-time

---

## 📞 Need Help?

- **Docs**: See README.md
- **Issues**: Check troubleshooting section
- **Logs**: `firebase functions:log`
- **Status**: `firebase deploy --only hosting`

---

**Congratulations! CASCADE is now autonomous. 🎉**
