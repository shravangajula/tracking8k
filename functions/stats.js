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
        
        const { deviceId, challengeStart, challengeEnd } = queryStringParameters || {};
        
        if (!deviceId) {
          resolve({
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'deviceId parameter required' })
          });
          return;
        }
        
        // Default challenge dates if not provided
        const startDate = challengeStart || '2024-07-01';
        const endDate = challengeEnd || '2024-07-31';
        
        // Get participant info
        const participant = await sql`
          SELECT * FROM participants 
          WHERE device_id = ${deviceId}
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
        
        const participantId = participant[0].id;
        
        // Get detailed statistics
        const stats = await sql`
          WITH daily_entries AS (
            SELECT 
              e.date,
              e.steps,
              e.notes,
              p.goal,
              CASE WHEN e.steps >= p.goal THEN 1 ELSE 0 END as goal_met,
              LAG(e.steps) OVER (ORDER BY e.date) as prev_steps,
              LAG(e.date) OVER (ORDER BY e.date) as prev_date
            FROM entries e
            JOIN participants p ON e.participant_id = p.id
            WHERE e.participant_id = ${participantId}
              AND e.date >= ${startDate}::date 
              AND e.date <= ${endDate}::date
            ORDER BY e.date
          ),
          streaks AS (
            SELECT 
              date,
              steps,
              goal_met,
              CASE 
                WHEN goal_met = 1 AND LAG(goal_met) OVER (ORDER BY date) = 1 THEN 1
                WHEN goal_met = 1 THEN 1
                ELSE 0
              END as streak_start,
              CASE 
                WHEN goal_met = 0 AND LAG(goal_met) OVER (ORDER BY date) = 1 THEN 1
                WHEN goal_met = 0 THEN 0
                ELSE 0
              END as streak_end
            FROM daily_entries
          ),
          streak_groups AS (
            SELECT 
              *,
              SUM(streak_start) OVER (ORDER BY date) as streak_group
            FROM streaks
          ),
          streak_lengths AS (
            SELECT 
              streak_group,
              COUNT(*) as streak_length,
              MIN(date) as streak_start_date,
              MAX(date) as streak_end_date
            FROM streak_groups
            WHERE goal_met = 1
            GROUP BY streak_group
          )
          SELECT 
            de.*,
            sl.streak_length,
            sl.streak_start_date,
            sl.streak_end_date
          FROM daily_entries de
          LEFT JOIN streak_groups sg ON de.date = sg.date
          LEFT JOIN streak_lengths sl ON sg.streak_group = sl.streak_group
          ORDER BY de.date
        `;
        
        // Calculate summary statistics
        const summary = await sql`
          SELECT 
            COUNT(*) as days_logged,
            COALESCE(SUM(steps), 0) as total_steps,
            COALESCE(AVG(steps), 0) as avg_daily_steps,
            COALESCE(MAX(steps), 0) as best_day,
            COALESCE(MIN(steps), 0) as worst_day,
            COALESCE(SUM(CASE WHEN steps >= goal THEN 1 ELSE 0 END), 0) as goal_days,
            COALESCE(MAX(CASE WHEN steps >= goal THEN 1 ELSE 0 END), 0) as current_streak_active
          FROM entries e
          JOIN participants p ON e.participant_id = p.id
          WHERE e.participant_id = ${participantId}
            AND e.date >= ${startDate}::date 
            AND e.date <= ${endDate}::date
        `;
        
        // Get current streak
        const currentStreak = await sql`
          SELECT COALESCE(COUNT(*), 0) as current_streak
          FROM (
            SELECT e.date, e.steps, p.goal
            FROM entries e
            JOIN participants p ON e.participant_id = p.id
            WHERE e.participant_id = ${participantId}
              AND e.date <= ${endDate}::date
            ORDER BY e.date DESC
            LIMIT 31
          ) recent_entries
          WHERE recent_entries.steps >= recent_entries.goal
        `;
        
        // Get longest streak
        const longestStreak = await sql`
          SELECT COALESCE(MAX(streak_length), 0) as longest_streak
          FROM (
            WITH daily_entries AS (
              SELECT 
                e.date,
                CASE WHEN e.steps >= p.goal THEN 1 ELSE 0 END as goal_met
              FROM entries e
              JOIN participants p ON e.participant_id = p.id
              WHERE e.participant_id = ${participantId}
                AND e.date >= ${startDate}::date 
                AND e.date <= ${endDate}::date
              ORDER BY e.date
            ),
            streaks AS (
              SELECT 
                date,
                goal_met,
                CASE 
                  WHEN goal_met = 1 AND LAG(goal_met) OVER (ORDER BY date) = 1 THEN 1
                  WHEN goal_met = 1 THEN 1
                  ELSE 0
                END as streak_start
              FROM daily_entries
            ),
            streak_groups AS (
              SELECT 
                *,
                SUM(streak_start) OVER (ORDER BY date) as streak_group
              FROM streaks
            )
            SELECT 
              streak_group,
              COUNT(*) as streak_length
            FROM streak_groups
            WHERE goal_met = 1
            GROUP BY streak_group
          ) streak_calc
        `;
        
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participant: participant[0],
            dailyStats: stats,
            summary: {
              ...summary[0],
              currentStreak: currentStreak[0]?.current_streak || 0,
              longestStreak: longestStreak[0]?.longest_streak || 0,
              goalPercentage: summary[0]?.days_logged > 0 
                ? Math.round((summary[0].goal_days / summary[0].days_logged) * 100 * 10) / 10
                : 0,
              overallProgress: participant[0].goal > 0
                ? Math.round((summary[0]?.total_steps / (participant[0].goal * 31)) * 100 * 10) / 10
                : 0
            },
            challengePeriod: {
              start: startDate,
              end: endDate
            },
            generatedAt: new Date().toISOString()
          })
        });
        
      } catch (error) {
        console.error('Stats error:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Internal server error', details: error.message })
        });
      }
    });
  });
}; 