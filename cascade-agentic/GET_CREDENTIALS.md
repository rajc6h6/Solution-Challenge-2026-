# GET YOUR COMPLETE FIREBASE CREDENTIALS

## Step 1: Get Firebase Web App Config (Client SDK)

1. Open: https://console.firebase.google.com/project/skills-63137/settings/general
2. Scroll to "Your apps" section
3. Find the Web app (</> icon)
4. Click "Config" button
5. Copy the COMPLETE firebaseConfig object

It should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...COMPLETE_39_CHARACTERS",
  authDomain: "skills-63137.firebaseapp.com",
  projectId: "skills-63137",
  storageBucket: "skills-63137.appspot.com",
  messagingSenderId: "774927474359",
  appId: "1:774927474359:web:COMPLETE_APP_ID_HERE"
};
```

## Step 2: Get Firebase Admin SDK (Service Account)

1. Open: https://console.firebase.google.com/project/skills-63137/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file
4. Open it - it contains the COMPLETE private_key

## Step 3: Update .env.local

Replace these values with COMPLETE ones:
- NEXT_PUBLIC_FIREBASE_API_KEY (should be ~39 chars starting with AIzaSy)
- NEXT_PUBLIC_FIREBASE_APP_ID (should end with something like :web:abc123def456)
- FIREBASE_PRIVATE_KEY (the full key from downloaded JSON)

## Quick Test:

After updating, run:
```bash
npm run dev
```

If you see "invalid-api-key" error, the API key is still incomplete.
