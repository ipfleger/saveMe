// Configuration for the 10 Waves
export const WAVE_DATA = [
    // Wave 1: Intro (Just Triangles)
    { count: 10, types: [0], interval: 2.0 }, 
    
    // Wave 2: Mix of Triangles and Squares
    { count: 15, types: [0, 1], interval: 1.8 },
    
    // Wave 3: Speeders introduced
    { count: 20, types: [0, 2], interval: 1.5 },
    
    // Wave 4: The Tanky Pentagons
    { count: 20, types: [1, 3], interval: 1.5 },
    
    // Wave 5: MINI-BOSS Round
    // We spawn 10 fodder + 1 Boss (Type 5)
    { count: 11, types: [0, 5], interval: 1.0, isBoss: true },
    
    // Wave 6: High density swarm
    { count: 30, types: [2, 3], interval: 1.0 },
    
    // Wave 7: Elites
    { count: 25, types: [4, 6], interval: 1.2 },
    
    // Wave 8: Octagons
    { count: 30, types: [6, 7], interval: 0.9 },
    
    // Wave 9: The Darkness (Black Squares)
    { count: 35, types: [8, 2], interval: 0.8 },
    
    // Wave 10: FINAL BOSS
    { count: 1, types: [9], interval: 5.0, isBoss: true }
];

export function getSpawnPoint(gameWidth, gameHeight) {
    // 8 Cardinal/Ordinal directions off-screen
    const offset = 50;
    const midX = gameWidth / 2;
    const midY = gameHeight / 2;
    
    const spawns = [
        { x: midX, y: -offset }, // N
        { x: gameWidth + offset, y: -offset }, // NE
        { x: gameWidth + offset, y: midY }, // E
        { x: gameWidth + offset, y: gameHeight + offset }, // SE
        { x: midX, y: gameHeight + offset }, // S
        { x: -offset, y: gameHeight + offset }, // SW
        { x: -offset, y: midY }, // W
        { x: -offset, y: -offset } // NW
    ];

    // Pick random index 0-7
    const index = Math.floor(Math.random() * spawns.length);
    return spawns[index];
}
