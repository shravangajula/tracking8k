const { neon } = require('@neondatabase/serverless');
const cors = require('cors')();

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
  // Enable CORS
  return new Promise((resolve, reject) => {
    cors(event, context, async () => {
      try {
        const { httpMethod, body, queryStringParameters } = event;
        
        switch (httpMethod) {
          case 'GET':
            const { deviceId: queryDeviceId } = queryStringParameters || {};
            
            if (queryDeviceId) {
              // Get specific participant by device ID
              const participant = await sql`
                SELECT * FROM participants 
                WHERE device_id = ${queryDeviceId}
                LIMIT 1
              `;
              
              if (participant.length === 0) {
                resolve({
                  statusCode: 404,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ error: 'Participant not found' })
                });
                return;
              }
              
              resolve({
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(participant[0])
              });
            } else {
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
            }
            break;
            
          case 'POST':
            // Add new participant
            const { name, goal, deviceId: postDeviceId } = JSON.parse(body);
            
            // Validate input
            if (!name || !postDeviceId) {
              resolve({
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Name and deviceId are required' })
              });
              return;
            }
            
            // Check if device ID already exists
            const existingParticipant = await sql`
              SELECT * FROM participants 
              WHERE device_id = ${postDeviceId}
              LIMIT 1
            `;
            
            if (existingParticipant.length > 0) {
              resolve({
                statusCode: 409,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Device ID already registered' })
              });
              return;
            }
            
            const newParticipant = await sql`
              INSERT INTO participants (name, goal, device_id, created_at)
              VALUES (${name}, ${goal || 8000}, ${postDeviceId}, NOW())
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
            
          case 'PUT':
            // Update participant goal
            const { id, newGoal } = JSON.parse(body);
            
            if (!id || !newGoal) {
              resolve({
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'ID and newGoal are required' })
              });
              return;
            }
            
            const updatedParticipant = await sql`
              UPDATE participants 
              SET goal = ${newGoal}, updated_at = NOW()
              WHERE id = ${id}
              RETURNING *
            `;
            
            if (updatedParticipant.length === 0) {
              resolve({
                statusCode: 404,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Participant not found' })
              });
              return;
            }
            
            resolve({
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedParticipant[0])
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
          body: JSON.stringify({ error: 'Internal server error', details: error.message })
        });
      }
    });
  });
}; 