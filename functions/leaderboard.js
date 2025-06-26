const { neon } = require('@neondatabase/serverless');
const cors = require('cors')();

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
  // Enable CORS
  return new Promise((resolve, reject) => {
    cors(event, context, async () => {
      try {
        const { httpMethod, queryStringParameters } = event;
        
        if (httpMethod !== 'GET') {
          resolve({
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
          });
          return;
        }
        
        const { challengeStart, challengeEnd } = queryStringParameters || {};
        
        // Default challenge dates if not provided
        const startDate = challengeStart || '2024-07-01';
        const endDate = challengeEnd || '2024-07-31';
        
        // Get leaderboard data with aggregated statistics
        const leaderboardData = await sql`
          WITH participant_stats AS (
            SELECT 
              p.id,
              p.name,
              p.goal,
              p.device_id,
              COUNT(e.id) as days_logged,
              COALESCE(SUM(e.steps), 0) as total_steps,
              COALESCE(AVG(e.steps), 0) as avg_daily_steps,
              COALESCE(MAX(e.steps), 0) as best_day,
              COALESCE(MIN(e.steps), 0) as worst_day,
              COALESCE(SUM(CASE WHEN e.steps >= p.goal THEN 1 ELSE 0 END), 0) as goal_days,
              p.created_at
            FROM participants p
            LEFT JOIN entries e ON p.id = e.participant_id 
              AND e.date >= ${startDate}::date 
              AND e.date <= ${endDate}::date
            GROUP BY p.id, p.name, p.goal, p.device_id, p.created_at
          ),
          current_streaks AS (
            SELECT 
              p.id,
              COALESCE(
                (SELECT COUNT(*) 
                 FROM (
                   SELECT e.date, e.steps, p2.goal,
                          ROW_NUMBER() OVER (ORDER BY e.date DESC) as rn
                   FROM entries e
                   JOIN participants p2 ON e.participant_id = p2.id
                   WHERE p2.id = p.id 
                     AND e.date <= ${endDate}::date
                   ORDER BY e.date DESC
                 ) recent_entries
                 WHERE recent_entries.steps >= recent_entries.goal
                   AND recent_entries.rn <= (
                     SELECT COUNT(*) 
                     FROM entries e2
                     WHERE e2.participant_id = p.id 
                       AND e2.date <= ${endDate}::date
                       AND e2.steps >= p.goal
                   )
                ), 0
              ) as current_streak
            FROM participants p
          )
          SELECT 
            ps.*,
            cs.current_streak,
            CASE 
              WHEN ps.days_logged > 0 THEN 
                ROUND((ps.goal_days::float / ps.days_logged::float) * 100, 1)
              ELSE 0 
            END as goal_percentage,
            CASE 
              WHEN ps.goal > 0 THEN 
                ROUND((ps.total_steps::float / (ps.goal * 31)) * 100, 1)
              ELSE 0 
            END as overall_progress
          FROM participant_stats ps
          LEFT JOIN current_streaks cs ON ps.id = cs.id
          ORDER BY ps.total_steps DESC, ps.avg_daily_steps DESC
        `;
        
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leaderboard: leaderboardData,
            challengePeriod: {
              start: startDate,
              end: endDate
            },
            generatedAt: new Date().toISOString()
          })
        });
        
      } catch (error) {
        console.error('Leaderboard error:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error', details: error.message })
        });
      }
    });
  });
}; 