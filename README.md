# 30-Day Walking Challenge App

A modern web application for tracking daily walking steps during a 30-day challenge, featuring a full backend with real-time data persistence and leaderboard functionality.

## Features

- **Simple Registration**: One-time name and goal setup
- **Daily Step Tracking**: Easy daily entry with current date auto-fill
- **Progress Visualization**: Personal statistics and entry history
- **Real-time Leaderboard**: View all participants' progress with live updates
- **Data Persistence**: All data stored in PostgreSQL database
- **Responsive Design**: Works on mobile and desktop
- **Full Backend API**: Serverless functions with comprehensive endpoints
- **Advanced Analytics**: Streak tracking, goal completion rates, and detailed statistics

## Challenge Details

- **Duration**: July 1st - July 31st, 2024
- **Goal**: 8,000+ steps daily (customizable)
- **Participants**: Multiple users can join and compete
- **Real-time Updates**: Live leaderboard and statistics

## Architecture

- **Frontend**: HTML/CSS/JavaScript (Single Page Application)
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon PostgreSQL
- **Deployment**: Netlify

## API Endpoints

The application includes a comprehensive REST API:

- `GET/POST/PUT /participants` - Participant management
- `GET/POST/DELETE /entries` - Step entry management
- `GET /leaderboard` - Real-time leaderboard data
- `GET /stats` - Detailed participant statistics

See [BACKEND_README.md](BACKEND_README.md) for complete API documentation.

## Quick Start

### 1. Set up Neon Database

1. Create a [Neon](https://neon.tech) account
2. Create a new project
3. Run the SQL commands from `database-setup.sql`
4. Copy your connection string

### 2. Deploy to Netlify

1. **Fork/Clone this repository**
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build settings:
     - Build command: (leave empty)
     - Publish directory: `.`

3. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add `DATABASE_URL` with your Neon connection string

4. **Deploy**: Netlify will automatically deploy your site

### 3. Test the API

Use the included test script to verify everything works:

```bash
# Edit test-api.js to use your site URL
node test-api.js
```

## File Structure

```
walking-challenge/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── script.js               # Frontend JavaScript
├── functions/              # Netlify Functions (Backend)
│   ├── participants.js     # Participant management API
│   ├── entries.js          # Entry management API
│   ├── leaderboard.js      # Leaderboard API
│   ├── stats.js            # Statistics API
│   └── package.json        # Dependencies
├── database-setup.sql      # Database schema
├── netlify.toml           # Netlify configuration
├── test-api.js            # API testing script
├── BACKEND_README.md      # Backend documentation
└── README.md              # This file
```

## Features Breakdown

### Frontend Features
- **Simple Interface**: Google Form-style design for easy use
- **Real-time Updates**: Live leaderboard and statistics
- **Responsive Design**: Works perfectly on all devices
- **Data Validation**: Input validation and error handling
- **Progress Tracking**: Visual progress indicators and statistics

### Backend Features
- **Serverless API**: Scalable Netlify Functions
- **Database Integration**: PostgreSQL with Neon
- **Real-time Statistics**: Advanced analytics and calculations
- **Data Integrity**: Foreign key constraints and validation
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Cross-origin request handling

### Database Features
- **Automatic Timestamps**: Created/updated tracking
- **Data Constraints**: Validation and integrity checks
- **Efficient Queries**: Optimized with proper indexes
- **Scalable**: Handles multiple concurrent users

## Customization

### Change Challenge Dates
Edit `script.js`:
```javascript
this.challengeStartDate = new Date('2024-07-01');
this.challengeEndDate = new Date('2024-07-31');
```

### Change Default Goal
Edit `script.js`:
```javascript
this.defaultGoal = 8000;
```

### Modify API Endpoints
Edit the functions in the `functions/` directory to customize API behavior.

## Environment Variables

Required environment variables in Netlify:

- `DATABASE_URL`: Your Neon PostgreSQL connection string

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance

- **Serverless**: Automatic scaling with demand
- **Database**: Optimized queries with proper indexing
- **CDN**: Global content delivery via Netlify
- **Caching**: Efficient data caching strategies

## Security

- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Server-side validation
- **CORS Protection**: Controlled cross-origin access
- **Error Handling**: Secure error responses

## Monitoring

- **Function Logs**: Available in Netlify dashboard
- **Database Monitoring**: Neon dashboard analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Real-time performance data

## Support

For issues or questions:
1. Check the [BACKEND_README.md](BACKEND_README.md) for API documentation
2. Review the test script for API verification
3. Check Netlify function logs for debugging
4. Create an issue in the GitHub repository

## License

This project is open source and available under the MIT License. 