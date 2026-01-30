export default class AudioController {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.currentLoopTimeout = null;
        this.oscillators = [];
        this.currentTrack = null;
        
        // Volume Master
        this.musicVolume = 0.4;
        this.sfxVolume = 0.6;

        // Frequencies (From your file)
        this.N = {
            'c2':65.41,'d2':73.42,'e2':82.41,'f2':87.31,'g2':98.00,'a2':110.00,'b2':123.47,
            'c3':130.81,'d3':146.83,'e3':164.81,'f3':174.61,'g3':196.00,'gs3':207.65,'a3':220.00,'bb3':233.08,'b3':246.94,
            'c4':261.63,'cs4':277.18,'d4':293.66,'e4':329.63,'f4':349.23,'fs4':369.99,'g4':392.00,'gs4':415.30,'a4':440.00,'b4':493.88,
            'c5':523.25,'cs5':554.37,'d5':587.33,'ds5':622.25,'e5':659.25,'f5':698.46,'fs5':739.99,'g5':783.99,'gs5':830.61,'a5':880.00,'b5':987.77,
            'c6':1046.50,'d6':1174.66,'e6':1318.51, 'g6': 1567.98 // Added g6 for jingle
        };

        // Song Definitions
        this.songs = {
            // "Hyper Woods" -> PAUSE / MENU
            menu: { 
                tempo: 160, wave: 'square', bassWave: 'triangle',
                melody: ['c5','g5','e5','c6', 'g5','e5','c5',null, 'f5','a5','c6','f6', 'c6','a5','f5',null, 'd5','fs5','a5','d6', 'a5','fs5','d5',null, 'g5','b5','d6','g6', 'f6','d6','b5','g5', 'c5','e5','g5','c6', 'e6','c6','g5','e5', 'f5','a5','c6','a5', 'g5','e5','c5',null],
                bass: ['c3','c3','c3','c3', 'f3','f3','f3','f3', 'd3','d3','d3','d3', 'g3','g3','g3','g3', 'c3','c3','e3','e3', 'f3','f3','g3','g3']
            },
            // "God Mode" -> STANDARD BATTLE
            battle: { 
                tempo: 165, wave: 'square', bassWave: 'sawtooth', hasDrums: true,
                melody: ['a4',null,'a4','c5', 'e5',null,'d5','c5', 'b4',null,'g4','b4', 'd5',null,'c5','b4', 'a4',null,'e5',null, 'a5',null,'g5','e5', 'f5','e5','d5','c5', 'b4','c5','b4','g4', 'a4','a4','c5','c5', 'e5','e5','a5','a5'],
                bass: ['a2','a2','a2','a2', 'g2','g2','g2','g2', 'f2','f2','f2','f2', 'e2','e2','e2','e2', 'a2','a2','a2','a2', 'a2','a2','a2','a2']
            },
            // "Meltdown" -> BOSS / MINIBOSS
            boss: { 
                tempo: 200, wave: 'sawtooth', bassWave: 'square',
                melody: ['e4','f4','fs4','g4', 'gs4','a4','as4','b4', 'c5','b4','bb4','a4', 'gs4','g4','fs4','f4', 'e4','bb4','e4','bb4', 'e4','bb4','e4','bb4', 'f5','e5','ds5','d5', 'cs5','c5','b4','bb4', 'e4','e5','e4','e5', 'e4','e5','e4','e5'],
                bass: ['e2','e2','e2','e2', 'e2','e2','e2','e2', 'bb2','bb2','bb2','bb2', 'e2','e2','bb2','bb2', 'e2','f2','fs2','g2', 'gs2','a2','bb2','b2']
            },
            // "Pure Peace" -> WIN SCREEN
            win: { 
                tempo: 55, wave: 'sine', bassWave: 'sine',
                melody: ['e4',null,null,null, 'f4',null,null,null, 'g4',null,null,null, null,null,null,null, 'c5',null,'b4',null, 'a4',null,'g4',null, 'e4',null,null,null, 'c4',null,null,null, 'd4',null,null,null, 'c4',null,null,null, null,null,null,null, null,null,null,null],
                bass: ['c3',null,null,null, 'f3',null,null,null, 'c3',null,null,null, 'e3',null,null,null, 'f3',null,null,null, 'g3',null,null,null, 'c3',null,null,null, null,null,null,null]
            },
            // "Celebratory Ditty" -> VICTORY JINGLE
            jingle: {
                tempo: 300, wave: 'square', bassWave: 'triangle', loop: false, // Fast and runs once
                melody: ['c4','e4','g4','c5', 'e5','g5','c6','e6', 'g6',null,'c6',null], 
                bass:   ['c3',null,'e3',null, 'g3',null,'c4',null, 'e4',null,'c3',null]
            }
        };
    }

    // Must be called on user interaction (Start Button)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        this.ctx.resume();
    }

    playMusic(trackName) {
        if (this.currentTrack === trackName && this.isPlaying) return;
        
        this.stopMusic();
        this.init();
        
        this.currentTrack = trackName;
        this.isPlaying = true;
        this.scheduleSong(trackName);
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.currentLoopTimeout) clearTimeout(this.currentLoopTimeout);
        this.oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.oscillators = [];
    }

    scheduleSong(key) {
        if (!this.isPlaying) return;
        
        const song = this.songs[key];
        const secondsPerBeat = 60 / song.tempo;
        const noteDuration = secondsPerBeat / 2; // Eighth notes
        const now = this.ctx.currentTime;

        // Schedule Melody
        song.melody.forEach((note, i) => {
            if (note) this.playTone(this.N[note], song.wave, now + (i * noteDuration), noteDuration, 0.1 * this.musicVolume);
        });

        // Schedule Bass
        song.bass.forEach((note, i) => {
            if (note) this.playTone(this.N[note], song.bassWave, now + (i * noteDuration), noteDuration, 0.2 * this.musicVolume);
        });

        // Schedule Drums
        if (song.hasDrums) {
            for(let i=0; i<song.melody.length; i+=2) { 
                if (i % 4 !== 0) this.playNoise(now + (i * noteDuration), 0.1);
            }
        }

        // Loop Logic
        if (song.loop !== false) {
            const songLength = song.melody.length * noteDuration;
            this.currentLoopTimeout = setTimeout(() => {
                if(this.isPlaying) this.scheduleSong(key);
            }, songLength * 1000);
        }
    }

    // --- SYNTHESIS METHODS ---

    playTone(freq, type, startTime, duration, vol) {
        if (!freq || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
        this.oscillators.push(osc);
    }

    playNoise(startTime, duration) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        
        noiseGain.gain.setValueAtTime(0.15 * this.musicVolume, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        noise.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(startTime);
    }

    // --- SOUND EFFECTS (SFX) ---
    // Simple synthesized sounds so we don't need files
    
    playSFX(type) {
        this.init();
        const now = this.ctx.currentTime;
        
        if (type === 'shoot') {
            // High pitch decay (Pew)
            this.playTone(600, 'square', now, 0.1, 0.1 * this.sfxVolume);
        } 
        else if (type === 'hit') {
            // Low noise crunch
            this.playNoise(now, 0.1);
        } 
        else if (type === 'powerup') {
            // Ascending major third
            this.playTone(this.N['c5'], 'sine', now, 0.1, 0.2 * this.sfxVolume);
            this.playTone(this.N['e5'], 'sine', now + 0.1, 0.3, 0.2 * this.sfxVolume);
        }
        else if (type === 'warning') {
            // Two rapid low notes
            this.playTone(150, 'sawtooth', now, 0.1, 0.2 * this.sfxVolume);
            this.playTone(150, 'sawtooth', now + 0.15, 0.1, 0.2 * this.sfxVolume);
        }
    }
}
