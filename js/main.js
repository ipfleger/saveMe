// Main - Entry point for the game
(function() {
    // Initialize systems
    function init() {
        // Initialize renderer
        Renderer.init('gameCanvas');
        
        // Initialize input
        Input.init();
        
        // Initialize audio
        Audio.init();
        
        // Initialize game
        Game.init();
        
        // Setup UI event listeners
        setupUI();
        
        // Start game loop
        startGameLoop();
    }
    
    // Setup UI button event listeners
    function setupUI() {
        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            document.getElementById('menu').classList.add('hidden');
            Game.start();
        });
        
        // Instructions button
        document.getElementById('instructionsButton').addEventListener('click', () => {
            document.getElementById('menu').classList.add('hidden');
            document.getElementById('instructions').classList.remove('hidden');
        });
        
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            document.getElementById('instructions').classList.add('hidden');
            document.getElementById('menu').classList.remove('hidden');
        });
        
        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            document.getElementById('gameOver').classList.add('hidden');
            Game.start();
        });
    }
    
    // Main game loop
    function startGameLoop() {
        function gameLoop() {
            Game.update();
            Game.draw();
            requestAnimationFrame(gameLoop);
        }
        
        gameLoop();
    }
    
    // Start the game when page loads
    window.addEventListener('load', init);
})();
