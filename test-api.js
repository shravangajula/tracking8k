// Test script for Walking Challenge API endpoints
// Run this after deploying to Netlify to verify the API works

const API_BASE = 'https://your-site-name.netlify.app/.netlify/functions';

async function testAPI() {
    console.log('🧪 Testing Walking Challenge API...\n');

    // Test 1: Create a participant
    console.log('1. Testing participant creation...');
    try {
        const participantResponse = await fetch(`${API_BASE}/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                goal: 8000,
                deviceId: 'test-device-' + Date.now()
            })
        });

        if (participantResponse.ok) {
            const participant = await participantResponse.json();
            console.log('✅ Participant created:', participant.name);
            
            // Test 2: Add an entry
            console.log('\n2. Testing entry creation...');
            const entryResponse = await fetch(`${API_BASE}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantId: participant.id,
                    date: '2024-07-01',
                    steps: 8500,
                    notes: 'Test entry'
                })
            });

            if (entryResponse.ok) {
                const entry = await entryResponse.json();
                console.log('✅ Entry created:', entry.steps, 'steps');

                // Test 3: Get leaderboard
                console.log('\n3. Testing leaderboard...');
                const leaderboardResponse = await fetch(`${API_BASE}/leaderboard`);
                
                if (leaderboardResponse.ok) {
                    const leaderboard = await leaderboardResponse.json();
                    console.log('✅ Leaderboard loaded:', leaderboard.leaderboard.length, 'participants');

                    // Test 4: Get stats
                    console.log('\n4. Testing stats...');
                    const statsResponse = await fetch(`${API_BASE}/stats?deviceId=${participant.device_id}`);
                    
                    if (statsResponse.ok) {
                        const stats = await statsResponse.json();
                        console.log('✅ Stats loaded:', stats.summary.total_steps, 'total steps');
                    } else {
                        console.log('❌ Stats failed:', statsResponse.status);
                    }
                } else {
                    console.log('❌ Leaderboard failed:', leaderboardResponse.status);
                }
            } else {
                console.log('❌ Entry creation failed:', entryResponse.status);
            }
        } else {
            console.log('❌ Participant creation failed:', participantResponse.status);
        }
    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
    }

    console.log('\n🏁 API testing complete!');
}

// Instructions for use
console.log('📋 Instructions:');
console.log('1. Replace "your-site-name" in API_BASE with your actual Netlify site name');
console.log('2. Make sure your DATABASE_URL environment variable is set in Netlify');
console.log('3. Run this script with: node test-api.js');
console.log('4. Check the console output for test results\n');

// Uncomment the line below to run the test
// testAPI();

 