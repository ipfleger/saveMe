export class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.joysticks = {
            left: { x: 0, y: 0, active: false, originX: 0, originY: 0, currentX: 0, currentY: 0, id: null },
            right: { x: 0, y: 0, active: false, originX: 0, originY: 0, currentX: 0, currentY: 0, id: null }
        };
        
        // Configuration
        this.maxStickDistance = 50; // Visual radius of the joystick
        this.deadZone = 0.1; // Prevent drift

        this.init();
    }

    init() {
        // Desktop Listeners
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', () => this.mouse.down = true);
        window.addEventListener('mouseup', () => this.mouse.down = false);

        // Mobile Touch Listeners
        const canvas = document.getElementById('gameCanvas'); // Attach to canvas to prevent scrolling
        
        canvas.addEventListener('touchstart', e => this.handleTouch(e, true), { passive: false });
        canvas.addEventListener('touchmove', e => this.handleTouch(e, false), { passive: false });
        canvas.addEventListener('touchend', e => this.handleTouchEnd(e));
    }

    handleTouch(e, isStart) {
        e.preventDefault(); // Stop scrolling!
        const width = window.innerWidth;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const halfScreen = width / 2;
            
            // Determine which joystick (Left or Right half of screen)
            let stick = (touch.clientX < halfScreen) ? this.joysticks.left : this.joysticks.right;

            // If starting a touch, set the origin (anchor point)
            if (isStart && !stick.active) {
                stick.id = touch.identifier;
                stick.active = true;
                stick.originX = touch.clientX;
                stick.originY = touch.clientY;
                stick.currentX = touch.clientX;
                stick.currentY = touch.clientY;
            } 
            // If moving the specific finger assigned to this stick
            else if (stick.id === touch.identifier) {
                stick.currentX = touch.clientX;
                stick.currentY = touch.clientY;
            }

            this.updateStickVectors(stick);
        }
    }

    handleTouchEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (this.joysticks.left.id === touch.identifier) this.resetStick(this.joysticks.left);
            if (this.joysticks.right.id === touch.identifier) this.resetStick(this.joysticks.right);
        }
    }

    updateStickVectors(stick) {
        let dx = stick.currentX - stick.originX;
        let dy = stick.currentY - stick.originY;
        const distance = Math.sqrt(dx*dx + dy*dy);

        // Normalize logic
        if (distance > this.maxStickDistance) {
            const angle = Math.atan2(dy, dx);
            dx = Math.cos(angle) * this.maxStickDistance;
            dy = Math.sin(angle) * this.maxStickDistance;
        }

        // Output values between -1 and 1
        stick.x = dx / this.maxStickDistance;
        stick.y = dy / this.maxStickDistance;
    }

    resetStick(stick) {
        stick.active = false;
        stick.id = null;
        stick.x = 0;
        stick.y = 0;
    }

    // Main getter for the game loop to ask "Where do I move?"
    getInput() {
        const res = { move: { x: 0, y: 0 }, aim: { x: 0, y: 0 }, isAttacking: false };

        // 1. Mobile Priority
        if (this.joysticks.left.active) {
            res.move.x = this.joysticks.left.x;
            res.move.y = this.joysticks.left.y;
        }
        if (this.joysticks.right.active) {
            res.aim.x = this.joysticks.right.x;
            res.aim.y = this.joysticks.right.y;
            // If stick is pushed past 50%, we are attacking
            res.isAttacking = (Math.abs(res.aim.x) > 0.5 || Math.abs(res.aim.y) > 0.5);
        }

        // 2. Desktop Fallback (if no mobile input)
        if (!this.joysticks.left.active) {
            if (this.keys['KeyW'] || this.keys['ArrowUp']) res.move.y = -1;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) res.move.y = 1;
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) res.move.x = -1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) res.move.x = 1;
        }
        
        // Normalize Keyboard diagonal movement
        if (res.move.x !== 0 || res.move.y !== 0) {
            const len = Math.sqrt(res.move.x**2 + res.move.y**2);
            if (len > 1) { res.move.x /= len; res.move.y /= len; }
        }

        if (!this.joysticks.right.active && this.mouse.down) {
            res.isAttacking = true;
            // Note: Aim calculation for mouse requires player position, handled in Game Loop usually
            // We just flag it here.
        }

        return res;
    }
}
