// input.js
export class InputHandler {
    constructor() {
        this.keys = {};
        // Left Joystick (Movement)
        this.joystick = { x: 0, y: 0, active: false, originX: 0, originY: 0, currentX: 0, currentY: 0, id: null };
        
        // Gesture Tracking
        this.touchStart = { x: 0, y: 0, time: 0 };
        this.gestureAction = null; // { type: 'SWIPE'|'TAP'|'HOLD', data: ... }
        this.holdTimer = null;
        this.isHolding = false;

        this.init();
    }

    init() {
        // Keyboard (Fallback)
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);

        // Touch Logic
        const canvas = document.getElementById('gameCanvas');
        
        canvas.addEventListener('touchstart', e => this.handleStart(e), { passive: false });
        canvas.addEventListener('touchmove', e => this.handleMove(e), { passive: false });
        canvas.addEventListener('touchend', e => this.handleEnd(e), { passive: false });
        
        // Mouse as Touch (for testing on PC)
        canvas.addEventListener('mousedown', e => {
            this.handleStart({ changedTouches: [{ identifier: 999, clientX: e.clientX, clientY: e.clientY }], preventDefault: ()=>{} });
        });
        window.addEventListener('mousemove', e => {
            if (this.joystick.active || this.isHolding) {
                this.handleMove({ changedTouches: [{ identifier: 999, clientX: e.clientX, clientY: e.clientY }], preventDefault: ()=>{} });
            }
        });
        window.addEventListener('mouseup', e => {
            this.handleEnd({ changedTouches: [{ identifier: 999, clientX: e.clientX, clientY: e.clientY }], preventDefault: ()=>{} });
        });
    }

    handleStart(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const width = window.innerWidth;

        // LEFT HALF = Movement Joystick
        if (touch.clientX < width / 2) {
            if (!this.joystick.active) {
                this.joystick.id = touch.identifier;
                this.joystick.active = true;
                this.joystick.originX = touch.clientX;
                this.joystick.originY = touch.clientY;
                this.joystick.currentX = touch.clientX;
                this.joystick.currentY = touch.clientY;
                this.updateJoystick();
            }
        } 
        // RIGHT HALF = Combat Gestures
        else {
            this.touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
            this.isHolding = false;
            
            // Start Hold Timer
            this.holdTimer = setTimeout(() => {
                this.isHolding = true;
                // Signal game to show charging effect
            }, 300); // 300ms hold triggers magic charge
        }
    }

    handleMove(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // Move Joystick
            if (touch.identifier === this.joystick.id) {
                this.joystick.currentX = touch.clientX;
                this.joystick.currentY = touch.clientY;
                this.updateJoystick();
            }
            // If holding magic, we might update aim here later
        }
    }

    handleEnd(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            // Release Joystick
            if (touch.identifier === this.joystick.id) {
                this.joystick.active = false;
                this.joystick.x = 0;
                this.joystick.y = 0;
            }
            // Release Gesture
            else if (touch.clientX > window.innerWidth / 2 || touch.identifier === 999) {
                clearTimeout(this.holdTimer);
                const dt = Date.now() - this.touchStart.time;
                const dx = touch.clientX - this.touchStart.x;
                const dy = touch.clientY - this.touchStart.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (this.isHolding) {
                    // RELEASE HOLD -> MAGIC
                    this.gestureAction = { type: 'MAGIC', x: touch.clientX, y: touch.clientY };
                } else if (dt < 200 && dist < 20) {
                    // SHORT TAP -> BOW
                    this.gestureAction = { type: 'BOW', x: touch.clientX, y: touch.clientY };
                } else if (dist > 30) {
                    // SWIPE -> SWORD
                    const angle = Math.atan2(dy, dx);
                    this.gestureAction = { type: 'SWORD', angle: angle };
                }
                this.isHolding = false;
            }
        }
    }

    updateJoystick() {
        const maxDist = 50;
        let dx = this.joystick.currentX - this.joystick.originX;
        let dy = this.joystick.currentY - this.joystick.originY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > maxDist) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * maxDist;
            dy = Math.sin(angle) * maxDist;
        }
        this.joystick.x = dx / maxDist;
        this.joystick.y = dy / maxDist;
    }

    getCommand() {
        // Consumes the action so it only fires once per frame
        const action = this.gestureAction;
        this.gestureAction = null; 

        return {
            move: { x: this.joystick.x, y: this.joystick.y },
            action: action
        };
    }
}
