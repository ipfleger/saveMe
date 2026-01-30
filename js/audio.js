// Audio Manager - Handles background music and sound effects
const Audio = {
    bgMusic: null,
    audioEnabled: true,
    
    init: function() {
        // Load audio preference
        this.audioEnabled = Storage.getAudioEnabled();
        
        // Create background music
        this.bgMusic = new window.Audio();
        this.bgMusic.src = 'assets/bg-music.mp3';
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.3;
    },

    playBackgroundMusic: function() {
        if (this.audioEnabled && this.bgMusic) {
            this.bgMusic.play().catch(e => {
                console.log('Audio playback failed:', e);
            });
        }
    },

    stopBackgroundMusic: function() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    },

    toggleAudio: function() {
        this.audioEnabled = !this.audioEnabled;
        Storage.setAudioEnabled(this.audioEnabled);
        
        if (this.audioEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
    },

    // Play sound effect (placeholder for future implementation)
    playSoundEffect: function(soundType) {
        if (!this.audioEnabled) return;
        
        // Future: Add different sound effects
        // soundType can be: 'save', 'hit', 'gameOver', etc.
    }
};
