const fs = require('fs');
const path = require('path');

console.log('\n🔍 CASCADE Configuration Checker\n');
console.log('='.repeat(60));

// Check .env.local
const envPath = path.join(__dirname, '.env.local');
let envExists = false;
let config = {};

if (fs.existsSync(envPath)) {
  envExists = true;
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      config[key.trim()] = valueParts.join('=').trim();
    }
  });
}

console.log('\n📁 File Status:');
console.log(`   .env.local: ${envExists ? '✅ EXISTS' : '❌ MISSING'}`);

console.log('\n🔑 Required Keys (Minimum to run):');
console.log('─'.repeat(60));

const required = [
  { key: 'GEMINI_API_KEY', desc: 'Backend Gemini API', critical: true },
  { key: 'NEXT_PUBLIC_GEMINI_API_KEY', desc: 'Frontend Gemini API', critical: true }
];

const optional = [
  { key: 'FIREBASE_PROJECT_ID', desc: 'Firebase project (for Firestore)' },
  { key: 'GOOGLE_MAPS_API_KEY', desc: 'Google Maps (uses mock if missing)' },
  { key: 'GOOGLE_SERVICE_ACCOUNT_KEY', desc: 'MCPs (Gmail/Calendar/Sheets)' },
  { key: 'ESCALATION_EMAIL', desc: 'Email for escalations' }
];

let missingCritical = [];
let missingOptional = [];

required.forEach(({ key, desc, critical }) => {
  const value = config[key] || '';
  const hasValue = value.length > 0 && value !== 'your_gemini_api_key_here';
  
  if (hasValue) {
    console.log(`   ✅ ${key}`);
    console.log(`      ${desc}`);
    console.log(`      Value: ${value.substring(0, 20)}...${value.substring(value.length - 10)}`);
  } else {
    console.log(`   ❌ ${key}`);
    console.log(`      ${desc}`);
    console.log(`      Status: MISSING OR EMPTY`);
    if (critical) missingCritical.push(key);
  }
  console.log('');
});

console.log('\n🔧 Optional Keys (System works without these):');
console.log('─'.repeat(60));

optional.forEach(({ key, desc }) => {
  const value = config[key] || '';
  const hasValue = value.length > 0;
  
  if (hasValue) {
    console.log(`   ✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`   ⚠️  ${key}: Not configured`);
    console.log(`      ${desc}`);
    missingOptional.push(key);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary:');

if (missingCritical.length === 0) {
  console.log('   ✅ All CRITICAL keys configured - System will run!');
} else {
  console.log(`   ❌ Missing ${missingCritical.length} CRITICAL keys:`);
  missingCritical.forEach(k => console.log(`      - ${k}`));
}

if (missingOptional.length > 0) {
  console.log(`   ⚠️  Missing ${missingOptional.length} optional keys (system will use fallbacks)`);
}

console.log('\n🚀 Next Steps:');
if (missingCritical.length > 0) {
  console.log('   1. Get Gemini API key: https://ai.google.dev/');
  console.log('   2. Edit .env.local and add your key');
  console.log('   3. Run this checker again: node check-config.js');
} else {
  console.log('   ✅ Configuration complete!');
  console.log('   Run: npm run dev');
}

console.log('\n' + '='.repeat(60) + '\n');

// Exit with error code if critical keys missing
process.exit(missingCritical.length > 0 ? 1 : 0);
