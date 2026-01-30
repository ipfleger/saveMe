// Storage Manager - Handles high scores and game data persistence
const Storage = {
    // Get high score from local storage
    getHighScore: function() {
        const highScore = localStorage.getItem('saveMe_highScore');
        return highScore ? parseInt(highScore) : 0;
    },

    // Save high score to local storage
    setHighScore: function(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('saveMe_highScore', score.toString());
            return true; // New high score
        }
        return false;
    },

    // Get audio preference
    getAudioEnabled: function() {
        const audioEnabled = localStorage.getItem('saveMe_audioEnabled');
        return audioEnabled === null ? true : audioEnabled === 'true';
    },

    // Save audio preference
    setAudioEnabled: function(enabled) {
        localStorage.setItem('saveMe_audioEnabled', enabled.toString());
    },

    // Clear all saved data
    clearAll: function() {
        localStorage.removeItem('saveMe_highScore');
        localStorage.removeItem('saveMe_audioEnabled');
    }
};
