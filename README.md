# 30-Day Walking Challenge App

A simple, Google Form-style web application for tracking daily walking steps during a 30-day challenge.

## Features

- **Simple Registration**: One-time name and goal setup
- **Daily Step Tracking**: Easy daily entry with current date auto-fill
- **Progress Visualization**: Personal statistics and entry history
- **Leaderboard**: View all participants' progress (read-only)
- **Data Persistence**: All data saved locally in browser
- **Responsive Design**: Works on mobile and desktop
- **No Backend Required**: Pure frontend application

## Challenge Details

- **Duration**: July 1st - July 31st, 2024
- **Goal**: 8,000+ steps daily (customizable)
- **Participants**: Multiple users can join and compete

## How to Use

1. **First Visit**: Enter your name and daily goal
2. **Daily Use**: Add your step count for the current day
3. **View Progress**: Check your statistics and see the leaderboard
4. **Data Persistence**: Your information stays saved across browser sessions

## Deployment Options

### Option 1: GitHub Pages (Recommended - Free)

1. **Create a GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/walking-challenge.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Your app will be available at**: `https://yourusername.github.io/walking-challenge`

### Option 2: Netlify (Free)

1. **Drag & Drop Method**:
   - Go to [netlify.com](https://netlify.com)
   - Drag your project folder to the deploy area
   - Get instant URL

2. **GitHub Integration**:
   - Connect your GitHub repository
   - Automatic deployments on every push

### Option 3: Vercel (Free)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

### Option 4: Firebase Hosting (Free)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize and Deploy**:
   ```bash
   firebase login
   firebase init hosting
   firebase deploy
   ```

## File Structure

```
walking-challenge/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technical Details

- **Frontend Only**: No server required
- **Local Storage**: Data persists in user's browser
- **Responsive**: Mobile-first design
- **Cross-Browser**: Works on all modern browsers

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

### Modify Sample Participants
Edit the `allParticipants` array in `script.js` to add/remove sample users.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Privacy

- All data is stored locally in the user's browser
- No data is sent to external servers
- Each user's data is private to their device

## Support

For issues or questions, please create an issue in the GitHub repository.

## License

This project is open source and available under the MIT License. 