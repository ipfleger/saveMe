// Input Handler - Manages keyboard input
const Input = {
    keys: {},
    
    init: function() {
        // Listen for keydown events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Prevent arrow keys from scrolling the page
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Listen for keyup events
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    },
    
    isKeyPressed: function(key) {
        return this.keys[key] === true;
    },
    
    // Helper methods for common keys
    isUpPressed: function() {
        return this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.isKeyPressed('W');
    },
    
    isDownPressed: function() {
        return this.isKeyPressed('ArrowDown') || this.isKeyPressed('s') || this.isKeyPressed('S');
    },
    
    isLeftPressed: function() {
        return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A');
    },
    
    isRightPressed: function() {
        return this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D');
    }
};
