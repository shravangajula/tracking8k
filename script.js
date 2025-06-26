// Simple Walking Challenge - Google Form Style with Neon Database

class SimpleWalkingChallenge {
    constructor() {
        this.participant = null;
        this.entries = [];
        this.challengeStartDate = new Date('2024-07-01');
        this.challengeEndDate = new Date('2024-07-31');
        this.defaultGoal = 8000;
        
        // API endpoints
        this.apiBase = '/.netlify/functions';
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.showAppropriateSection();
        this.setDefaultDate();
    }

    async loadData() {
        // Load local participant data
        const savedParticipant = localStorage.getItem('simpleWalkingChallenge_participant');
        this.participant = savedParticipant ? JSON.parse(savedParticipant) : null;
        
        // Load entries from database if participant exists
        if (this.participant) {
            await this.loadEntriesFromDatabase();
        }
    }

    async loadEntriesFromDatabase() {
        try {
            const response = await fetch(`${this.apiBase}/entries?deviceId=${this.participant.deviceId}`);
            if (response.ok) {
                this.entries = await response.json();
            } else {
                console.error('Failed to load entries:', response.statusText);
                this.entries = [];
            }
        } catch (error) {
            console.error('Error loading entries:', error);
            this.entries = [];
        }
    }

    async loadParticipantsFromDatabase() {
        try {
            const response = await fetch(`${this.apiBase}/participants`);
            if (response.ok) {
                return await response.json();
            } else {
                console.error('Failed to load participants:', response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error loading participants:', error);
            return [];
        }
    }

    saveData() {
        localStorage.setItem('simpleWalkingChallenge_participant', JSON.stringify(this.participant));
    }

    async saveParticipantToDatabase(participant) {
        try {
            const response = await fetch(`${this.apiBase}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: participant.name,
                    goal: participant.goal,
                    deviceId: participant.deviceId
                })
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to save participant');
            }
        } catch (error) {
            console.error('Error saving participant:', error);
            throw error;
        }
    }

    async saveEntryToDatabase(entry) {
        try {
            const response = await fetch(`${this.apiBase}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantId: this.participant.id,
                    date: entry.date,
                    steps: entry.steps,
                    notes: entry.notes || ''
                })
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to save entry');
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Registration form
        document.getElementById('registration-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerParticipant();
        });

        // Daily entry form
        document.getElementById('daily-entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDailyEntry();
        });

        // View progress button
        document.getElementById('view-progress-btn').addEventListener('click', () => {
            this.showProgressSection();
        });

        // Back to entry button
        document.getElementById('back-to-entry-btn').addEventListener('click', () => {
            this.showEntrySection();
        });

        // Change goal button
        document.getElementById('change-goal-btn').addEventListener('click', () => {
            this.showGoalModal();
        });

        // Goal form
        document.getElementById('goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateGoal();
        });

        // Success message continue button
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.hideSuccessMessage();
        });

        // Debug button
        document.getElementById('debug-btn').addEventListener('click', () => {
            this.showDebugInfo();
        });

        // Admin panel functionality
        this.setupAdminPanel();

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideGoalModal();
            });
        });

        // Modal overlay click
        document.getElementById('goal-modal').addEventListener('click', (e) => {
            if (e.target.id === 'goal-modal') {
                this.hideGoalModal();
            }
        });
    }

    showAppropriateSection() {
        if (!this.participant) {
            this.showRegistrationSection();
        } else {
            this.showEntrySection();
        }
    }

    showRegistrationSection() {
        document.getElementById('registration-section').classList.remove('hidden');
        document.getElementById('entry-section').classList.add('hidden');
        document.getElementById('progress-section').classList.add('hidden');
    }

    showEntrySection() {
        document.getElementById('registration-section').classList.add('hidden');
        document.getElementById('entry-section').classList.remove('hidden');
        document.getElementById('progress-section').classList.add('hidden');
        
        this.updateParticipantInfo();
    }

    showProgressSection() {
        document.getElementById('registration-section').classList.add('hidden');
        document.getElementById('entry-section').classList.add('hidden');
        document.getElementById('progress-section').classList.remove('hidden');
        
        this.updateProgressDisplay();
    }

    async registerParticipant() {
        const name = document.getElementById('participant-name').value.trim();
        const goal = parseInt(document.getElementById('daily-goal').value) || this.defaultGoal;

        if (!name) {
            alert('Please enter your name');
            return;
        }

        // Generate unique device ID for this user
        const deviceId = this.generateDeviceId();
        
        // Check if this name already exists in the database
        const allParticipants = await this.loadParticipantsFromDatabase();
        const existingParticipant = allParticipants.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (existingParticipant) {
            alert('A participant with this name already exists. Please choose a different name.');
            return;
        }

        this.participant = {
            id: Date.now(), // Temporary ID, will be replaced by database
            name: name,
            goal: goal,
            joinDate: this.formatDate(new Date()),
            deviceId: deviceId
        };

        try {
            // Save to database
            const savedParticipant = await this.saveParticipantToDatabase(this.participant);
            this.participant.id = savedParticipant.id; // Use database ID
            
            // Save to local storage
            this.saveData();
            this.showEntrySection();
            
            // Reset form
            document.getElementById('registration-form').reset();
            document.getElementById('daily-goal').value = this.defaultGoal;
        } catch (error) {
            alert('Failed to register. Please try again.');
            console.error('Registration error:', error);
        }
    }

    generateDeviceId() {
        // Generate a unique device ID based on browser fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = canvas.toDataURL();
        const hash = this.simpleHash(fingerprint + navigator.userAgent + screen.width + screen.height);
        
        return 'device_' + hash;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    updateParticipantInfo() {
        if (!this.participant) return;
        
        document.getElementById('welcome-name').textContent = this.participant.name;
        document.getElementById('current-goal').textContent = this.participant.goal.toLocaleString();
    }

    async addDailyEntry() {
        const date = document.getElementById('entry-date').value;
        const steps = parseInt(document.getElementById('step-count').value);
        const notes = document.getElementById('entry-notes').value.trim();

        if (!date || !steps) {
            alert('Please fill in all required fields');
            return;
        }

        if (steps < 0 || steps > 100000) {
            alert('Please enter a valid step count (0-100,000)');
            return;
        }

        // Check if entry already exists for this date
        const existingEntry = this.entries.find(e => e.date === date);

        if (existingEntry) {
            if (confirm('An entry already exists for this date. Do you want to update it?')) {
                existingEntry.steps = steps;
                existingEntry.notes = notes;
            } else {
                return;
            }
        } else {
            const newEntry = {
                id: Date.now(),
                date: date,
                steps: steps,
                notes: notes
            };
            this.entries.push(newEntry);
        }

        try {
            // Save to database
            await this.saveEntryToDatabase({
                date: date,
                steps: steps,
                notes: notes
            });
            
            this.showSuccessMessage(steps);
            
            // Reset form
            document.getElementById('daily-entry-form').reset();
            this.setDefaultDate();
        } catch (error) {
            alert('Failed to save entry. Please try again.');
            console.error('Entry save error:', error);
        }
    }

    showSuccessMessage(steps) {
        const goalMet = steps >= this.participant.goal;
        const successText = goalMet 
            ? `Great job! You exceeded your goal of ${this.participant.goal.toLocaleString()} steps!`
            : `Entry saved! You're ${(this.participant.goal - steps).toLocaleString()} steps away from your goal.`;
        
        document.getElementById('success-text').textContent = successText;
        document.getElementById('success-message').classList.remove('hidden');
    }

    hideSuccessMessage() {
        document.getElementById('success-message').classList.add('hidden');
    }

    showDebugInfo() {
        const debugInfo = `
Current Participant: ${this.participant ? this.participant.name : 'None'}
Device ID: ${this.participant ? this.participant.deviceId : 'None'}
Entries Count: ${this.entries.length}
All Participants: ${this.allParticipants.map(p => p.name).join(', ')}
        `;
        
        alert('Debug Information:\n' + debugInfo);
    }

    showGoalModal() {
        document.getElementById('new-goal').value = this.participant.goal;
        document.getElementById('goal-modal').classList.remove('hidden');
    }

    hideGoalModal() {
        document.getElementById('goal-modal').classList.add('hidden');
    }

    updateGoal() {
        const newGoal = parseInt(document.getElementById('new-goal').value);
        
        if (newGoal < 1000 || newGoal > 50000) {
            alert('Please enter a valid goal between 1,000 and 50,000 steps');
            return;
        }

        this.participant.goal = newGoal;
        this.saveData();
        this.updateParticipantInfo();
        this.hideGoalModal();
    }

    async updateProgressDisplay() {
        if (!this.participant) return;

        const stats = this.getParticipantStats();
        
        document.getElementById('total-days').textContent = stats.totalDays;
        document.getElementById('goal-days').textContent = stats.goalDays;
        document.getElementById('avg-steps').textContent = stats.avgSteps.toLocaleString();
        document.getElementById('success-rate').textContent = `${stats.successRate}%`;

        await this.updateLeaderboard();
        this.updateEntriesList();
    }

    async updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        // Get leaderboard data for all participants from database
        const leaderboardData = await this.getAllParticipantsStats();
        
        if (leaderboardData.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-item placeholder">No participants yet. Be the first to join!</div>';
            return;
        }

        // Sort by success rate (primary) and average steps (secondary)
        leaderboardData.sort((a, b) => {
            if (b.successRate !== a.successRate) {
                return b.successRate - a.successRate;
            }
            return b.avgSteps - a.avgSteps;
        });

        leaderboardData.forEach((participant, index) => {
            const rank = index + 1;
            const isCurrentUser = this.participant && participant.id === this.participant.id;
            
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;
            
            // Determine rank styling
            let rankClass = 'other';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            // Determine score color based on success rate
            let scoreClass = 'error';
            if (participant.successRate >= 80) scoreClass = 'success';
            else if (participant.successRate >= 60) scoreClass = 'warning';

            leaderboardItem.innerHTML = `
                <div class="leaderboard-rank ${rankClass}">${rank}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name ${isCurrentUser ? 'current-user' : ''}">${participant.name} ${isCurrentUser ? '(You)' : ''}</div>
                    <div class="leaderboard-stats">
                        <div class="leaderboard-stat">
                            <i class="fas fa-calendar-check"></i>
                            <span>${participant.totalDays} days</span>
                        </div>
                        <div class="leaderboard-stat">
                            <i class="fas fa-trophy"></i>
                            <span>${participant.goalDays} goals</span>
                        </div>
                        <div class="leaderboard-stat">
                            <i class="fas fa-walking"></i>
                            <span>${participant.avgSteps.toLocaleString()} avg</span>
                        </div>
                    </div>
                </div>
                <div class="leaderboard-score ${scoreClass}">${participant.successRate}%</div>
            `;

            leaderboardList.appendChild(leaderboardItem);
        });
    }

    async getAllParticipantsStats() {
        const stats = [];
        
        // Load all participants from database
        const allParticipants = await this.loadParticipantsFromDatabase();
        
        if (allParticipants.length === 0) {
            return stats;
        }
        
        // For each participant, we need to get their entries
        // Note: In a real app, you'd want to optimize this with a single query
        for (const participant of allParticipants) {
            let participantEntries = [];
            
            if (this.participant && participant.deviceId === this.participant.deviceId) {
                // This is the current user - use their loaded entries
                participantEntries = this.entries;
            } else {
                // For other participants, we'd need to load their entries
                // For now, we'll show them with 0 entries (you can enhance this later)
                participantEntries = [];
            }

            if (participantEntries.length === 0) {
                stats.push({
                    id: participant.id,
                    name: participant.name,
                    totalDays: 0,
                    goalDays: 0,
                    avgSteps: 0,
                    successRate: 0
                });
                continue;
            }

            const totalSteps = participantEntries.reduce((sum, entry) => sum + entry.steps, 0);
            const goalDays = participantEntries.filter(entry => entry.steps >= participant.goal).length;
            const avgSteps = Math.round(totalSteps / participantEntries.length);
            const successRate = Math.round((goalDays / participantEntries.length) * 100);

            stats.push({
                id: participant.id,
                name: participant.name,
                totalDays: participantEntries.length,
                goalDays: goalDays,
                avgSteps: avgSteps,
                successRate: successRate
            });
        }

        return stats;
    }

    updateEntriesList() {
        const entriesList = document.getElementById('entries-list');
        entriesList.innerHTML = '';

        if (this.entries.length === 0) {
            entriesList.innerHTML = '<p class="text-center" style="color: #666; padding: 20px;">No entries yet. Start tracking your steps!</p>';
            return;
        }

        const sortedEntries = this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedEntries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'entry-item';
            
            const goalMet = entry.steps >= this.participant.goal;
            const statusClass = goalMet ? 'success' : 'error';

            entryElement.innerHTML = `
                <div class="entry-info">
                    <div class="entry-date">${this.formatDisplayDate(entry.date)}</div>
                    <div class="entry-notes">${entry.notes || 'No notes'}</div>
                </div>
                <div class="entry-steps ${statusClass}">${entry.steps.toLocaleString()}</div>
            `;

            entriesList.appendChild(entryElement);
        });
    }

    getParticipantStats() {
        if (this.entries.length === 0) {
            return {
                totalDays: 0,
                goalDays: 0,
                avgSteps: 0,
                successRate: 0
            };
        }

        const totalSteps = this.entries.reduce((sum, entry) => sum + entry.steps, 0);
        const goalDays = this.entries.filter(entry => entry.steps >= this.participant.goal).length;
        const avgSteps = Math.round(totalSteps / this.entries.length);
        const successRate = Math.round((goalDays / this.entries.length) * 100);

        return {
            totalDays: this.entries.length,
            goalDays: goalDays,
            avgSteps: avgSteps,
            successRate: successRate
        };
    }

    setDefaultDate() {
        const today = new Date();
        document.getElementById('entry-date').value = this.formatDate(today);
    }

    getChallengeDates() {
        const dates = [];
        const currentDate = new Date(this.challengeStartDate);
        
        while (currentDate <= this.challengeEndDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatDisplayDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    }

    loadSharedParticipants() {
        // This function is no longer needed with database
        return [];
    }

    saveSharedParticipants() {
        // This function is no longer needed with database
    }

    // Admin panel functionality
    setupAdminPanel() {
        // Admin trigger - click top-right corner for 2 seconds to access
        let adminClickTimer = null;
        let isAdminTriggered = false;
        
        document.getElementById('admin-trigger').addEventListener('mousedown', () => {
            if (isAdminTriggered) return;
            
            adminClickTimer = setTimeout(() => {
                this.showAdminPanel();
                isAdminTriggered = true;
            }, 2000); // 2 seconds
        });
        
        document.getElementById('admin-trigger').addEventListener('mouseup', () => {
            if (adminClickTimer) {
                clearTimeout(adminClickTimer);
                adminClickTimer = null;
            }
        });
        
        document.getElementById('admin-trigger').addEventListener('mouseleave', () => {
            if (adminClickTimer) {
                clearTimeout(adminClickTimer);
                adminClickTimer = null;
            }
        });

        // Admin panel buttons
        document.getElementById('reset-all-data-btn').addEventListener('click', () => {
            this.resetAllData();
        });

        document.getElementById('reset-entries-only-btn').addEventListener('click', () => {
            this.resetEntriesOnly();
        });

        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('hide-admin-btn').addEventListener('click', () => {
            this.hideAdminPanel();
            isAdminTriggered = false; // Reset trigger state
        });
    }

    showAdminPanel() {
        document.getElementById('admin-panel').classList.remove('hidden');
        this.updateAdminStatus();
    }

    hideAdminPanel() {
        document.getElementById('admin-panel').classList.add('hidden');
    }

    updateAdminStatus() {
        const statusDiv = document.getElementById('admin-status');
        const totalParticipants = this.allParticipants ? this.allParticipants.length : 0;
        const totalEntries = this.entries.length;

        statusDiv.innerHTML = `
            <div class="admin-status-item">
                <span class="admin-status-label">Total Participants:</span>
                <span class="admin-status-value">${totalParticipants}</span>
            </div>
            <div class="admin-status-item">
                <span class="admin-status-label">Your Entries:</span>
                <span class="admin-status-value">${totalEntries}</span>
            </div>
            <div class="admin-status-item">
                <span class="admin-status-label">Challenge Start:</span>
                <span class="admin-status-value">July 1st, 2024</span>
            </div>
            <div class="admin-status-item">
                <span class="admin-status-label">Challenge End:</span>
                <span class="admin-status-value">July 31st, 2024</span>
            </div>
            <div class="admin-status-item">
                <span class="admin-status-label">Database:</span>
                <span class="admin-status-value">Neon PostgreSQL</span>
            </div>
        `;
    }

    resetAllData() {
        if (confirm('⚠️ WARNING: This will delete ALL data including participants and entries. This action cannot be undone. Are you sure you want to reset everything?')) {
            if (confirm('Final confirmation: This will completely reset the challenge. All participants and data will be lost. Continue?')) {
                // Clear local storage
                localStorage.removeItem('simpleWalkingChallenge_participant');
                
                // Reset app state
                this.participant = null;
                this.entries = [];
                
                // Note: Database reset would need to be done manually in Neon dashboard
                alert('Local data cleared. To reset database, please use the Neon dashboard to drop and recreate tables.');
                
                // Reload page
                location.reload();
            }
        }
    }

    resetEntriesOnly() {
        if (confirm('This will clear all step entries but keep participants. Are you sure?')) {
            // Clear only local entries
            this.entries = [];
            
            alert('Local entries cleared. To clear database entries, please use the Neon dashboard.');
            this.hideAdminPanel();
            this.updateProgressDisplay();
        }
    }

    exportData() {
        const exportData = {
            participants: this.allParticipants,
            entries: this.entries,
            currentParticipant: this.participant,
            exportDate: new Date().toISOString(),
            challengeInfo: {
                startDate: this.challengeStartDate,
                endDate: this.challengeEndDate,
                defaultGoal: this.defaultGoal
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `walking-challenge-backup-${this.formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    }
}

// Initialize the application when the page loads
let simpleChallenge;
document.addEventListener('DOMContentLoaded', () => {
    simpleChallenge = new SimpleWalkingChallenge();
});
