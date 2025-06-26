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
            const { deviceId, all } = queryStringParameters || {};
            
            if (all === 'true') {
              // Get all entries for leaderboard (without device ID filter)
              const allEntries = await sql`
                SELECT e.*, p.name, p.goal, p.device_id 
                FROM entries e
                JOIN participants p ON e.participant_id = p.id
                ORDER BY e.date DESC, p.name ASC
              `;
              
              resolve({
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(allEntries)
              });
            } else if (deviceId) {
              // Get entries for a specific participant
              const entries = await sql`
                SELECT e.* FROM entries e
                JOIN participants p ON e.participant_id = p.id
                WHERE p.device_id = ${deviceId}
                ORDER BY e.date DESC
              `;
              
              resolve({
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(entries)
              });
            } else {
              resolve({
                statusCode: 400,
                body: JSON.stringify({ error: 'deviceId parameter required or use all=true for all entries' })
              });
            }
            break;
            
          case 'POST':
            // Add new entry
            const { participantId, date, steps, notes } = JSON.parse(body);
            
            // Validate input
            if (!participantId || !date || steps === undefined || steps === null) {
              resolve({
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'participantId, date, and steps are required' })
              });
              return;
            }
            
            // Validate steps is a positive number
            if (steps < 0) {
              resolve({
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Steps must be a positive number' })
              });
              return;
            }
            
            // Check if entry already exists for this date and participant
            const existingEntry = await sql`
              SELECT * FROM entries 
              WHERE participant_id = ${participantId} AND date = ${date}
            `;
            
            if (existingEntry.length > 0) {
              // Update existing entry
              const updatedEntry = await sql`
                UPDATE entries 
                SET steps = ${steps}, notes = ${notes || ''}, updated_at = NOW()
                WHERE participant_id = ${participantId} AND date = ${date}
                RETURNING *
              `;
              
              resolve({
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEntry[0])
              });
            } else {
              // Create new entry
              const newEntry = await sql`
                INSERT INTO entries (participant_id, date, steps, notes, created_at)
                VALUES (${participantId}, ${date}, ${steps}, ${notes || ''}, NOW())
                RETURNING *
              `;
              
              resolve({
                statusCode: 201,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry[0])
              });
            }
            break;
            
          case 'DELETE':
            // Delete entry
            const { entryId } = queryStringParameters || {};
            
            if (!entryId) {
              resolve({
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'entryId parameter required' })
              });
              return;
            }
            
            const deletedEntry = await sql`
              DELETE FROM entries 
              WHERE id = ${entryId}
              RETURNING *
            `;
            
            if (deletedEntry.length === 0) {
              resolve({
                statusCode: 404,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ error: 'Entry not found' })
              });
              return;
            }
            
            resolve({
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: 'Entry deleted successfully' })
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