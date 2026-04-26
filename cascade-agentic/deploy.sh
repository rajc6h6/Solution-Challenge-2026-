#!/bin/bash

# CASCADE Agentic AI - Deployment Script
# This script automates the deployment process

set -e

echo "🚀 CASCADE Agentic AI - Deployment Script"
echo "=========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "📝 Checking Firebase authentication..."
firebase login:ci

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd functions && npm install && cd ..

# Build TypeScript
echo "🔨 Building TypeScript..."
cd functions && npm run build && cd ..

# Build Next.js
echo "🏗️  Building Next.js app..."
npm run build

# Deploy Firestore rules and indexes
echo "🔥 Deploying Firestore..."
firebase deploy --only firestore

# Deploy Cloud Functions
echo "⚡ Deploying Cloud Functions..."
firebase deploy --only functions

# Deploy Hosting
echo "🌐 Deploying Frontend..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. Seed database: Call the 'seedDatabase' function"
echo "2. Test agent: Wait 15 minutes for first agent run"
echo "3. Open dashboard: firebase hosting:channel:open live"
echo ""
echo "🎉 CASCADE is now live!"
