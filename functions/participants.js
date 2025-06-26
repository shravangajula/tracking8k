const { neon } = require('@neondatabase/serverless');
const cors = require('cors')();

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
  // Enable CORS
  return new Promise((resolve, reject) => {
    cors(event, context, async () => {
      try {
        const { httpMethod, body } = event;
        
        switch (httpMethod) {
          case 'GET':
            // Get all participants
            const participants = await sql`
              SELECT * FROM participants 
              ORDER BY created_at DESC
            `;
            
            resolve({
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(participants)
            });
            break;
            
          case 'POST':
            // Add new participant
            const { name, goal, deviceId } = JSON.parse(body);
            
            const newParticipant = await sql`
              INSERT INTO participants (name, goal, device_id, created_at)
              VALUES (${name}, ${goal}, ${deviceId}, NOW())
              RETURNING *
            `;
            
            resolve({
              statusCode: 201,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newParticipant[0])
            });
            break;
            
          default:
            resolve({
              statusCode: 405,
              body: JSON.stringify({ error: 'Method not allowed' })
            });
        }
      } catch (error) {
        console.error('Database error:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      }
    });
  });
}; 