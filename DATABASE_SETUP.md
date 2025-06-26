# 🗄️ Database Setup Guide - Walking Challenge

## Neon Database Setup

### Step 1: Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project

### Step 2: Get Database Connection String
1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### Step 3: Set Up Database Tables
1. In Neon dashboard, go to "SQL Editor"
2. Copy and paste the contents of `database-setup.sql`
3. Click "Run" to create tables

### Step 4: Configure Netlify Environment Variables
1. In your Netlify dashboard, go to Site Settings
2. Click "Environment Variables"
3. Add: `DATABASE_URL` = your Neon connection string

## Netlify Deployment

### Step 1: Install Dependencies
```bash
cd functions
npm install
```

### Step 2: Deploy to Netlify
1. Push your code to GitHub
2. Connect repository to Netlify
3. Set build command: `cd functions && npm install`
4. Set publish directory: `.`
5. Add environment variable: `DATABASE_URL`

### Step 3: Test API Endpoints
Your API will be available at:
- `https://tracking8k.netlify.app/.netlify/functions/participants`
- `https://tracking8k.netlify.app/.netlify/functions/entries`

## Frontend Integration

The frontend will need to be updated to use these API endpoints instead of localStorage. Here's what needs to change:

### API Calls Instead of localStorage:
```javascript
// Get participants
const participants = await fetch('/.netlify/functions/participants').then(r => r.json());

// Add participant
const newParticipant = await fetch('/.netlify/functions/participants', {
  method: 'POST',
  body: JSON.stringify({ name, goal, deviceId })
}).then(r => r.json());

// Get entries
const entries = await fetch(`/.netlify/functions/entries?deviceId=${deviceId}`).then(r => r.json());

// Add entry
const newEntry = await fetch('/.netlify/functions/entries', {
  method: 'POST',
  body: JSON.stringify({ participantId, date, steps, notes })
}).then(r => r.json());
```

## Benefits of This Solution

✅ **True Cross-Device Sharing**: All devices see the same data  
✅ **Real-time Updates**: Changes appear immediately  
✅ **Reliable Database**: PostgreSQL with Neon  
✅ **Free Tier**: Neon free tier is generous  
✅ **Scalable**: Can handle many participants  
✅ **Secure**: Proper database security  

## Cost Breakdown

### Neon Database (Free Tier):
- **3 projects** allowed
- **0.5GB storage** (plenty for walking challenge)
- **10GB bandwidth** (more than enough)
- **No time limits**

### Netlify Functions (Free Tier):
- **125,000 requests/month**
- **100 hours runtime/month**
- **Perfect for this use case**

## Next Steps

1. **Set up Neon database** using the guide above
2. **Update frontend code** to use API endpoints
3. **Deploy to Netlify** with environment variables
4. **Test cross-device functionality**

This solution will give you **true real-time cross-device sharing** that works exactly as expected! 🚀 