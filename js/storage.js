import { STORAGE_KEY } from './constants.js';

export class StorageManager {
    constructor() {
        this.key = STORAGE_KEY;
        this.scores = this.loadScores();
    }

    // Returns array of top scores [1000, 500, 200...]
    loadScores() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    // Attempts to save a score. Returns true if it made the leaderboard.
    saveScore(newScore) {
        // Add new score
        this.scores.push(parseInt(newScore));
        
        // Sort descending (Big numbers first)
        this.scores.sort((a, b) => b - a);
        
        // Keep only top 5
        this.scores = this.scores.slice(0, 5);
        
        // Save to browser
        localStorage.setItem(this.key, JSON.stringify(this.scores));
        
        // Return true if this specific score is now on the board
        return this.scores.includes(newScore);
    }

    // Get formatted HTML string for the UI
    getHighScoresHTML() {
        if (this.scores.length === 0) return '<p>No High Scores Yet</p>';
        
        let html = '<ol>';
        this.scores.forEach(score => {
            html += `<li>${score}</li>`;
        });
        html += '</ol>';
        return html;
    }
}
