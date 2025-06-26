# Walking Challenge Backend API

This document describes the backend implementation for the Walking Challenge application using Netlify Functions and Neon PostgreSQL.

## Architecture

- **Frontend**: HTML/CSS/JavaScript (Single Page Application)
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon PostgreSQL
- **Deployment**: Netlify

## API Endpoints

### 1. Participants API (`/.netlify/functions/participants`)

#### GET `/participants`
Get all participants or a specific participant by device ID.

**Query Parameters:**
- `deviceId` (optional): Get specific participant by device ID

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "goal": 8000,
  "device_id": "abc123",
  "created_at": "2024-07-01T00:00:00Z",
  "updated_at": "2024-07-01T00:00:00Z"
}
```

#### POST `/participants`
Create a new participant.

**Request Body:**
```json
{
  "name": "John Doe",
  "goal": 8000,
  "deviceId": "abc123"
}
```

#### PUT `/participants`
Update participant goal.

**Request Body:**
```json
{
  "id": 1,
  "newGoal": 10000
}
```

### 2. Entries API (`/.netlify/functions/entries`)

#### GET `/entries`
Get entries for a specific participant or all entries.

**Query Parameters:**
- `deviceId`: Get entries for specific participant
- `all=true`: Get all entries for leaderboard

**Response:**
```json
[
  {
    "id": 1,
    "participant_id": 1,
    "date": "2024-07-01",
    "steps": 8500,
    "notes": "Great walk today!",
    "created_at": "2024-07-01T00:00:00Z",
    "updated_at": "2024-07-01T00:00:00Z"
  }
]
```

#### POST `/entries`
Create or update an entry.

**Request Body:**
```json
{
  "participantId": 1,
  "date": "2024-07-01",
  "steps": 8500,
  "notes": "Great walk today!"
}
```

#### DELETE `/entries`
Delete an entry.

**Query Parameters:**
- `entryId`: ID of entry to delete

### 3. Leaderboard API (`/.netlify/functions/leaderboard`)

#### GET `/leaderboard`
Get aggregated leaderboard data for all participants.

**Query Parameters:**
- `challengeStart`: Challenge start date (default: 2024-07-01)
- `challengeEnd`: Challenge end date (default: 2024-07-31)

**Response:**
```json
{
  "leaderboard": [
    {
      "id": 1,
      "name": "John Doe",
      "goal": 8000,
      "device_id": "abc123",
      "days_logged": 15,
      "total_steps": 120000,
      "avg_daily_steps": 8000,
      "best_day": 12000,
      "worst_day": 5000,
      "goal_days": 12,
      "current_streak": 5,
      "goal_percentage": 80.0,
      "overall_progress": 48.4,
      "created_at": "2024-07-01T00:00:00Z"
    }
  ],
  "challengePeriod": {
    "start": "2024-07-01",
    "end": "2024-07-31"
  },
  "generatedAt": "2024-07-15T10:30:00Z"
}
```

### 4. Stats API (`/.netlify/functions/stats`)

#### GET `/stats`
Get detailed statistics for a specific participant.

**Query Parameters:**
- `deviceId`: Participant device ID (required)
- `challengeStart`: Challenge start date (default: 2024-07-01)
- `challengeEnd`: Challenge end date (default: 2024-07-31)

**Response:**
```json
{
  "participant": {
    "id": 1,
    "name": "John Doe",
    "goal": 8000,
    "device_id": "abc123",
    "created_at": "2024-07-01T00:00:00Z"
  },
  "dailyStats": [
    {
      "date": "2024-07-01",
      "steps": 8500,
      "notes": "Great walk today!",
      "goal": 8000,
      "goal_met": 1,
      "streak_length": 1,
      "streak_start_date": "2024-07-01",
      "streak_end_date": "2024-07-01"
    }
  ],
  "summary": {
    "days_logged": 15,
    "total_steps": 120000,
    "avg_daily_steps": 8000,
    "best_day": 12000,
    "worst_day": 5000,
    "goal_days": 12,
    "current_streak": 5,
    "longest_streak": 8,
    "goal_percentage": 80.0,
    "overall_progress": 48.4
  },
  "challengePeriod": {
    "start": "2024-07-01",
    "end": "2024-07-31"
  },
  "generatedAt": "2024-07-15T10:30:00Z"
}
```

## Database Schema

### Participants Table
```sql
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal INTEGER NOT NULL DEFAULT 8000,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Entries Table
```sql
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER NOT NULL CHECK (steps >= 0),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(participant_id, date)
);
```

## Environment Variables

Set these environment variables in your Netlify dashboard:

- `DATABASE_URL`: Your Neon PostgreSQL connection string

## Dependencies

The project uses a top-level `package.json` to manage all dependencies:

```bash
npm install
```

Key dependencies:
- `@neondatabase/serverless`: Neon PostgreSQL client
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware
- `express-rate-limit`: Rate limiting

The `@netlify/plugin-functions-install-core` plugin automatically installs dependencies for Netlify Functions.

## Deployment

1. **Set up Neon Database:**
   - Create a Neon account and project
   - Run the SQL commands from `database-setup.sql`
   - Copy the connection string

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set the `DATABASE_URL` environment variable
   - Deploy

3. **Configure Functions:**
   - Netlify will automatically detect and deploy the functions
   - Functions are available at `/.netlify/functions/[function-name]`

## Features

### Data Persistence
- All data is stored in PostgreSQL database
- Automatic timestamps and updates
- Data integrity with foreign key constraints

### Real-time Statistics
- Aggregated leaderboard calculations
- Streak tracking
- Goal completion percentages
- Overall progress tracking

### API Features
- CORS enabled for cross-origin requests
- Input validation and error handling
- Proper HTTP status codes
- Detailed error messages

### Security
- SQL injection prevention with parameterized queries
- Input sanitization
- Rate limiting (can be added with express-rate-limit)

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (missing/invalid parameters)
- `404`: Not Found
- `405`: Method Not Allowed
- `409`: Conflict (duplicate device ID)
- `500`: Internal Server Error

Error responses include a message and optional details:

```json
{
  "error": "Participant not found",
  "details": "Additional error information"
}
```

## Performance Considerations

- Database indexes on frequently queried columns
- Efficient SQL queries with proper joins
- Serverless functions for automatic scaling
- Connection pooling with Neon

## Monitoring

- Function logs available in Netlify dashboard
- Database performance monitoring in Neon dashboard
- Error tracking and debugging information

## Future Enhancements

- Authentication and authorization
- Real-time updates with WebSockets
- Data export functionality
- Advanced analytics and reporting
- Mobile app support
- Social features (comments, likes, etc.) 