/* ==========================================================================
   EL GATO ROSADO EN LA SELVA 🐱🌴 - GAME ENGINE (STANDALONE & AUTO-RUN)
   ========================================================================== */

// --------------------------------------------------------------------------
// 0. VIBRACIÓN TÁCTIL (VIBRATION API - degrada sin errores si no hay soporte)
// --------------------------------------------------------------------------
const VIBRATION_PATTERNS = {
    catch: 12,
    hit: [25, 15, 25],
    defeat: [30, 40, 30, 40, 60],
    victory: [40, 60, 40, 60, 40, 60, 120]
};

function vibrate(pattern) {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    } catch (e) {
        // Silenciosamente ignorado en navegadores sin soporte (ej. iOS Safari)
    }
}

// --------------------------------------------------------------------------
// 1. MÓDULO DE AUDIO SINTÉTICO (WEB AUDIO API)
// --------------------------------------------------------------------------
class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;

        this.musicPlaying = false;
        this.musicTimeoutId = null;
        this.musicGain = null;
        this.musicLoopDuration = 2.8;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API no disponible.", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    startMusic() {
        if (!this.ctx || this.musicPlaying) return;
        this.musicPlaying = true;
        if (!this.musicGain) {
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.07;
            this.musicGain.connect(this.ctx.destination);
        }
        this.scheduleMusicLoop();
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicTimeoutId) {
            clearTimeout(this.musicTimeoutId);
            this.musicTimeoutId = null;
        }
    }

    scheduleMusicLoop() {
        if (!this.musicPlaying || !this.ctx) return;

        if (!this.muted) {
            this.resume();
            this.playMusicBar();
        }

        this.musicTimeoutId = setTimeout(() => this.scheduleMusicLoop(), this.musicLoopDuration * 1000);
    }

    playMusicBar() {
        const now = this.ctx.currentTime;

        // Melodía juguetona en escala pentatónica (aventura selvática, apta para niños)
        const melody = [
            { note: 261.63, dur: 0.35 },
            { note: 329.63, dur: 0.35 },
            { note: 392.00, dur: 0.35 },
            { note: 329.63, dur: 0.35 },
            { note: 293.66, dur: 0.35 },
            { note: 392.00, dur: 0.35 },
            { note: 440.00, dur: 0.35 },
            { note: 392.00, dur: 0.7 }
        ];

        let t = now;
        for (const step of melody) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.value = step.note;
            filter.type = 'lowpass';
            filter.frequency.value = 2400;

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.9, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + step.dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            osc.start(t);
            osc.stop(t + step.dur + 0.05);
            t += step.dur;
        }

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.value = 130.81;
        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.5, now + 0.06);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + this.musicLoopDuration * 0.9);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + this.musicLoopDuration);
    }

    playMeow() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.linearRampToValueAtTime(2200, now + 0.15);
        filter.frequency.linearRampToValueAtTime(600, now + 0.35);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    playMouseSqueak() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const baseFreq = 2200 + Math.random() * 600;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.linearRampToValueAtTime(baseFreq + 400, now + 0.04);
        osc.frequency.linearRampToValueAtTime(baseFreq - 200, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playCatch() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.18, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.16);
        });
    }

    playPounce() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.24);
    }

    playPowerup() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const freqs = [440, 554.37, 659.25, 880, 1108.73];
        
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.15, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.26);
        });
    }

    playLevelClear() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.15 },
            { f: 1046.50, d: 0.4 }
        ];

        let offset = 0;
        melody.forEach(item => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, now + offset);

            gain.gain.setValueAtTime(0.2, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + item.d);
            offset += item.d;
        });
    }

    playGameOver() {
        if (this.muted || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [400, 350, 300, 220];

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + i * 0.18);

            gain.gain.setValueAtTime(0.18, now + i * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.18);
            osc.stop(now + i * 0.18 + 0.26);
        });
    }
}

const sound = new SoundSynthesizer();

// --------------------------------------------------------------------------
// 2. CLASE DEL GATO ROSADO (PINK CAT ENTITY)
// --------------------------------------------------------------------------
class PinkCat {
    constructor(x, y, scale = 1) {
        this.x = x;
        this.y = y;
        this.visualScale = scale;
        this.radius = 26; // tamaño base para el dibujo; el tamaño real de juego es radius * visualScale

        this.baseSpeed = 4.2 * scale;
        this.speed = this.baseSpeed;
        this.vx = 0;
        this.vy = 0;
        this.facingRight = true;
        this.isMoving = false;

        this.walkCycle = 0;
        this.tailAngle = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;

        this.isPouncing = false;
        this.pounceProgress = 0;
        this.pounceDuration = 22;
        this.pounceCooldown = 0;
        this.maxPounceCooldown = 120;
        this.pounceVx = 0;
        this.pounceVy = 0;

        this.catnipActive = false;
        this.catnipTimer = 0;
        this.magnetActive = false;
        this.magnetTimer = 0;
        this.magnetRadius = 180 * scale;

        this.inMud = false;
        this.accessory = null;
        this.isHappy = false;
    }

    update(keys, touchVector, canvasWidth, canvasHeight, step = 1) {
        if (this.pounceCooldown > 0) this.pounceCooldown = Math.max(0, this.pounceCooldown - step);

        if (this.catnipActive) {
            this.catnipTimer -= step;
            if (this.catnipTimer <= 0) {
                this.catnipActive = false;
            }
        }

        if (this.magnetActive) {
            this.magnetTimer -= step;
            if (this.magnetTimer <= 0) {
                this.magnetActive = false;
            }
        }

        let currentSpeed = this.baseSpeed;
        if (this.catnipActive) currentSpeed *= 1.65;
        if (this.inMud) currentSpeed *= 0.45;

        this.speed = currentSpeed;

        if (this.isPouncing) {
            this.pounceProgress += step;
            this.x += this.pounceVx * 1.8 * step;
            this.y += this.pounceVy * 1.8 * step;

            if (this.pounceProgress >= this.pounceDuration) {
                this.isPouncing = false;
                this.pounceProgress = 0;
            }
        } else {
            let dx = 0;
            let dy = 0;

            if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
            if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
            if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
            if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

            if (touchVector.active) {
                dx = touchVector.x;
                dy = touchVector.y;
            }

            const mag = Math.hypot(dx, dy);
            if (mag > 0.1) {
                this.vx = (dx / mag) * this.speed;
                this.vy = (dy / mag) * this.speed;
                this.isMoving = true;

                if (dx > 0.05) this.facingRight = true;
                if (dx < -0.05) this.facingRight = false;
            } else {
                this.vx = 0;
                this.vy = 0;
                this.isMoving = false;
            }

            this.x += this.vx * step;
            this.y += this.vy * step;
        }

        const margin = this.radius * this.visualScale;
        this.x = Math.max(margin, Math.min(canvasWidth - margin, this.x));
        this.y = Math.max(margin + 50, Math.min(canvasHeight - margin - 20, this.y));

        if (this.isMoving || this.isPouncing) {
            const walkSpeed = this.catnipActive ? 0.35 : 0.22;
            this.walkCycle = (this.walkCycle + walkSpeed * step) % (Math.PI * 2);
        } else {
            this.walkCycle = 0;
        }

        this.tailAngle = Math.sin(Date.now() * 0.005) * 0.35;

        this.blinkTimer += step;
        if (this.blinkTimer > 180 + Math.random() * 120) {
            this.isBlinking = true;
            if (this.blinkTimer > 195 + Math.random() * 120) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }
    }

    pounce() {
        if (this.pounceCooldown === 0 && !this.isPouncing) {
            this.isPouncing = true;
            this.pounceProgress = 0;
            this.pounceCooldown = this.maxPounceCooldown;

            let pounceAngle = 0;
            if (Math.hypot(this.vx, this.vy) > 0.1) {
                pounceAngle = Math.atan2(this.vy, this.vx);
            } else {
                pounceAngle = this.facingRight ? 0 : Math.PI;
            }

            const pounceSpeed = this.speed * 2.2;
            this.pounceVx = Math.cos(pounceAngle) * pounceSpeed;
            this.pounceVy = Math.sin(pounceAngle) * pounceSpeed;

            sound.playPounce();
        }
    }

    activateCatnip(durationFrames = 360) {
        this.catnipActive = true;
        this.catnipTimer = durationFrames;
        sound.playPowerup();
    }

    activateMagnet(durationFrames = 480) {
        this.magnetActive = true;
        this.magnetTimer = durationFrames;
        sound.playPowerup();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.visualScale, this.visualScale);

        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        if (this.catnipActive) {
            const auraScale = 1 + Math.sin(Date.now() * 0.01) * 0.08;
            ctx.beginPath();
            ctx.arc(0, 0, (this.radius + 14) * auraScale, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 71, 148, 0.25)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 126, 187, 0.7)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (this.magnetActive) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, this.magnetRadius * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.restore();
        }

        ctx.beginPath();
        const shadowScale = this.isPouncing ? 0.7 : 1;
        ctx.ellipse(0, 20, 22 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(4, 15, 10, 0.35)';
        ctx.fill();

        let jumpOffsetY = 0;
        if (this.isPouncing) {
            jumpOffsetY = -Math.sin((this.pounceProgress / this.pounceDuration) * Math.PI) * 28;
        }

        ctx.translate(0, jumpOffsetY);

        // Cola
        ctx.save();
        ctx.translate(-18, 0);
        ctx.rotate(-0.4 + this.tailAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-15, -18, -26, -10);
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ff4794';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-26, -10, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9ebb';
        ctx.fill();
        ctx.restore();

        // Patas
        const legDistance = 14;
        const frontLegOffset = Math.sin(this.walkCycle) * legDistance;
        const backLegOffset = Math.sin(this.walkCycle + Math.PI) * legDistance;

        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#e63980';

        ctx.beginPath();
        ctx.moveTo(-10, 6); ctx.lineTo(-10 + backLegOffset, 20); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, 6); ctx.lineTo(10 + frontLegOffset, 20); ctx.stroke();

        ctx.strokeStyle = '#ff4794';
        ctx.beginPath();
        ctx.moveTo(-14, 8); ctx.lineTo(-14 - backLegOffset, 22); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, 8); ctx.lineTo(14 - frontLegOffset, 22); ctx.stroke();

        ctx.fillStyle = '#ffb6d1';
        ctx.beginPath();
        ctx.arc(-14 - backLegOffset, 22, 4, 0, Math.PI * 2);
        ctx.arc(14 - frontLegOffset, 22, 4, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4794';
        ctx.fill();

        // Barriga
        ctx.beginPath();
        ctx.ellipse(2, 4, 13, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb6d1';
        ctx.fill();

        // Cabeza
        ctx.beginPath();
        ctx.ellipse(14, -10, 16, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4794';
        ctx.fill();

        // Orejas
        ctx.beginPath();
        ctx.moveTo(4, -18); ctx.lineTo(10, -28); ctx.lineTo(16, -18); ctx.closePath();
        ctx.fillStyle = '#ff4794'; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(6, -19); ctx.lineTo(10, -26); ctx.lineTo(14, -19); ctx.closePath();
        ctx.fillStyle = '#ff8dc0'; ctx.fill();

        ctx.beginPath();
        ctx.moveTo(16, -18); ctx.lineTo(24, -27); ctx.lineTo(26, -16); ctx.closePath();
        ctx.fillStyle = '#ff4794'; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(18, -19); ctx.lineTo(23, -25); ctx.lineTo(24, -17); ctx.closePath();
        ctx.fillStyle = '#ff8dc0'; ctx.fill();

        // Ojos
        if (this.isHappy) {
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💕', 19, -12);
        } else if (this.isBlinking) {
            ctx.beginPath();
            ctx.arc(18, -12, 3, 0.1, Math.PI - 0.1);
            ctx.strokeStyle = '#3d061e';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.ellipse(19, -12, 4.5, 5.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(19.5, -12, 1.8, 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#064e3b';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(18, -14, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        // Nariz
        ctx.beginPath();
        ctx.moveTo(25, -9); ctx.lineTo(28, -9); ctx.lineTo(26.5, -7); ctx.closePath();
        ctx.fillStyle = '#ff1e75';
        ctx.fill();

        // Bigotes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(27, -8); ctx.lineTo(37, -12);
        ctx.moveTo(27, -7); ctx.lineTo(38, -6);
        ctx.moveTo(27, -6); ctx.lineTo(36, 0);
        ctx.stroke();

        this.drawAccessory(ctx);

        ctx.restore();
    }

    drawAccessory(ctx) {
        if (!this.accessory) return;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const positions = {
            crown: { x: 12, y: -30, size: 20 },
            bow: { x: 26, y: -22, size: 16 },
            flower: { x: 2, y: -20, size: 16 },
            scarf: { x: 2, y: 10, size: 22 },
            glasses: { x: 19, y: -12, size: 18 },
            cap: { x: 10, y: -28, size: 18 },
            necklace: { x: 4, y: 7, size: 14 },
            headphones: { x: 12, y: -15, size: 26 },
            champion_crown: { x: 12, y: -32, size: 22 }
        };
        const icons = {
            crown: '👑', bow: '🎀', flower: '🌸', scarf: '🧣', glasses: '🕶️',
            cap: '🧢', necklace: '💎', headphones: '🎧', champion_crown: '🏆'
        };

        const pos = positions[this.accessory];
        const icon = icons[this.accessory];
        if (!pos || !icon) { ctx.restore(); return; }

        ctx.font = `${pos.size}px sans-serif`;
        ctx.fillText(icon, pos.x, pos.y);

        ctx.restore();
    }
}

// --------------------------------------------------------------------------
// 3. RATONES DE LA SELVA (MOUSE AI)
// --------------------------------------------------------------------------
const MOUSE_TYPES = {
    STANDARD: { type: 'STANDARD', name: 'Ratón Común', color: '#a8a29e', points: 100, speed: 2.5, radius: 14 },
    GOLDEN:   { type: 'GOLDEN',   name: 'Ratón Dorado Veloz', color: '#fbbf24', points: 300, speed: 4.2, radius: 13 },
    SHADOW:   { type: 'SHADOW',   name: 'Ratón Camuflado', color: '#475569', points: 200, speed: 2.8, radius: 14 },
    CHEESE:   { type: 'CHEESE',   name: 'Ratón Quesero', color: '#f97316', points: 150, speed: 2.3, radius: 15 }
};

class JungleMouse {
    constructor(x, y, config = MOUSE_TYPES.STANDARD, scale = 1) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.visualScale = scale;
        this.radius = config.radius; // tamaño base para el dibujo; el tamaño real es radius * visualScale
        this.speed = config.speed * scale;
        this.points = config.points;
        this.type = config.type;

        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.facingRight = true;

        this.scuttleCycle = Math.random() * Math.PI * 2;
        this.tailWiggle = 0;
        this.changeDirectionTimer = Math.floor(60 + Math.random() * 90);

        this.stealthOpacity = 1;
        this.squeakTimer = Math.floor(180 + Math.random() * 300);
        this.cheeseTimer = this.type === 'CHEESE' ? 180 : 0;
    }

    update(cat, canvasWidth, canvasHeight, bushes = [], cheeses = [], step = 1) {
        this.squeakTimer -= step;
        if (this.squeakTimer <= 0) {
            const distToCat = Math.hypot(this.x - cat.x, this.y - cat.y);
            if (distToCat < 350) {
                sound.playMouseSqueak();
            }
            this.squeakTimer = Math.floor(240 + Math.random() * 360);
        }

        const dxToCat = this.x - cat.x;
        const dyToCat = this.y - cat.y;
        const distToCat = Math.hypot(dxToCat, dyToCat);

        if (cat.magnetActive && distToCat < cat.magnetRadius) {
            const magnetPull = 3.5;
            this.vx = (-dxToCat / distToCat) * magnetPull;
            this.vy = (-dyToCat / distToCat) * magnetPull;
        } else if (distToCat < 180) {
            const fleeSpeed = this.speed * 1.45;
            this.vx = (dxToCat / distToCat) * fleeSpeed;
            this.vy = (dyToCat / distToCat) * fleeSpeed;
        } else {
            let foundCheese = false;
            if (cheeses.length > 0) {
                let closestCheese = null;
                let minDist = 220;

                for (const cheese of cheeses) {
                    const d = Math.hypot(cheese.x - this.x, cheese.y - this.y);
                    if (d < minDist) {
                        minDist = d;
                        closestCheese = cheese;
                    }
                }

                if (closestCheese) {
                    const cDx = closestCheese.x - this.x;
                    const cDy = closestCheese.y - this.y;
                    this.vx = (cDx / minDist) * this.speed;
                    this.vy = (cDy / minDist) * this.speed;
                    foundCheese = true;
                }
            }

            if (!foundCheese) {
                this.changeDirectionTimer -= step;
                if (this.changeDirectionTimer <= 0) {
                    this.angle += (Math.random() - 0.5) * 1.5;
                    this.vx = Math.cos(this.angle) * this.speed;
                    this.vy = Math.sin(this.angle) * this.speed;
                    this.changeDirectionTimer = Math.floor(60 + Math.random() * 120);
                }
            }
        }

        this.x += this.vx * step;
        this.y += this.vy * step;

        if (this.vx > 0.1) this.facingRight = true;
        if (this.vx < -0.1) this.facingRight = false;

        const margin = (this.radius + 10) * this.visualScale;
        if (this.x < margin) { this.x = margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.x > canvasWidth - margin) { this.x = canvasWidth - margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.y < margin + 50) { this.y = margin + 50; this.vy *= -1; this.angle = -this.angle; }
        if (this.y > canvasHeight - margin - 20) { this.y = canvasHeight - margin - 20; this.vy *= -1; this.angle = -this.angle; }

        this.scuttleCycle = (this.scuttleCycle + 0.35 * step) % (Math.PI * 2);
        this.tailWiggle = Math.sin(Date.now() * 0.015) * 0.4;

        if (this.type === 'SHADOW') {
            let nearBush = false;
            for (const bush of bushes) {
                if (Math.hypot(this.x - bush.x, this.y - bush.y) < bush.radius + 20) {
                    nearBush = true;
                    break;
                }
            }
            this.stealthOpacity = nearBush ? 0.35 : 1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.visualScale, this.visualScale);
        ctx.globalAlpha = this.stealthOpacity;

        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        if (this.type === 'GOLDEN') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        // Cola
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.quadraticCurveTo(-18, -6 + this.tailWiggle * 5, -24, 0);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Patas
        const legOffset = Math.sin(this.scuttleCycle) * 6;
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 6); ctx.lineTo(-6 + legOffset, 11);
        ctx.moveTo(4, 6); ctx.lineTo(4 - legOffset, 11);
        ctx.stroke();

        // Cuerpo
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.config.color;
        ctx.fill();

        // Orejas
        ctx.beginPath();
        ctx.arc(-2, -8, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = this.config.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-2, -8, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();

        // Ojo
        ctx.beginPath();
        ctx.arc(6, -3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5.5, -3.5, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Nariz & Bigotes
        ctx.beginPath();
        ctx.arc(13, 0, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(12, 0); ctx.lineTo(18, -4);
        ctx.moveTo(12, 1); ctx.lineTo(18, 5);
        ctx.stroke();

        ctx.restore();
    }
}

class CheeseDrop {
    constructor(x, y, scale = 1) {
        this.x = x;
        this.y = y;
        this.visualScale = scale;
        this.radius = 12;
        this.lifetime = 420;
    }

    update(step = 1) {
        this.lifetime -= step;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.visualScale, this.visualScale);

        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(10, 8);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ca8a04';
        ctx.beginPath(); ctx.arc(-2, 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(3, -2, 1.5, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }
}

// --------------------------------------------------------------------------
// QUESO LANZADO (PROYECTIL PARA DISTRAER AL JEFE FINAL)
// --------------------------------------------------------------------------
class ThrownCheese {
    constructor(x, y, vx, vy, scale = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.visualScale = scale;
        this.radius = 10 * scale;
        this.life = 90;
        this.rotation = 0;
    }

    update(step = 1) {
        this.x += this.vx * step;
        this.y += this.vy * step;
        this.rotation += 0.2 * step;
        this.life -= step;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.visualScale, this.visualScale);

        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(8, 6);
        ctx.lineTo(0, -8);
        ctx.closePath();
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

// --------------------------------------------------------------------------
// JEFE FINAL: SÚPER RATÓN REY DE LA SELVA
// --------------------------------------------------------------------------
class SuperMouseBoss {
    constructor(x, y, maxHealth = 4, radius = 42, scale = 1) {
        this.x = x;
        this.y = y;
        // Todas las formas del dibujo de este jefe son proporcionales a this.radius,
        // así que basta con escalar el radio real (sin necesidad de ctx.scale al dibujar).
        this.radius = radius * scale;
        this.baseSpeed = 3.2 * scale;
        this.speed = this.baseSpeed;
        this.vx = 0;
        this.vy = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.facingRight = true;

        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.state = 'ROAMING'; // ROAMING | DISTRACTED | DEFEATED
        this.distractedTimer = 0;
        this.maxDistractedTime = 3;
        this.isFinal = true;

        this.scuttleCycle = 0;
        this.changeDirectionTimer = 60;
        this.hitFlash = 0;
    }

    distract() {
        if (this.state !== 'ROAMING') return;
        this.state = 'DISTRACTED';
        this.distractedTimer = this.maxDistractedTime;
        this.vx = 0;
        this.vy = 0;
    }

    takeHit() {
        this.health--;
        this.hitFlash = 0.3;
        if (this.health <= 0) {
            this.state = 'DEFEATED';
        } else {
            this.state = 'ROAMING';
            this.speed = this.baseSpeed + (this.maxHealth - this.health) * 0.5;
        }
    }

    update(cat, canvasWidth, canvasHeight, step = 1, dt = 0) {
        if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
        if (this.state === 'DEFEATED') return;

        if (this.state === 'DISTRACTED') {
            this.distractedTimer -= dt;
            this.scuttleCycle += 0.12 * step;
            if (this.distractedTimer <= 0) {
                this.state = 'ROAMING';
            }
            return;
        }

        const dxToCat = this.x - cat.x;
        const dyToCat = this.y - cat.y;
        const distToCat = Math.hypot(dxToCat, dyToCat) || 1;

        if (distToCat < 220) {
            const fleeSpeed = this.speed * 1.3;
            this.vx = (dxToCat / distToCat) * fleeSpeed;
            this.vy = (dyToCat / distToCat) * fleeSpeed;
        } else {
            this.changeDirectionTimer -= step;
            if (this.changeDirectionTimer <= 0) {
                this.angle += (Math.random() - 0.5) * 1.4;
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                this.changeDirectionTimer = Math.floor(50 + Math.random() * 80);
            }
        }

        this.x += this.vx * step;
        this.y += this.vy * step;

        if (this.vx > 0.1) this.facingRight = true;
        if (this.vx < -0.1) this.facingRight = false;

        const margin = this.radius + 10;
        if (this.x < margin) { this.x = margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.x > canvasWidth - margin) { this.x = canvasWidth - margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.y < margin + 50) { this.y = margin + 50; this.vy *= -1; this.angle = -this.angle; }
        if (this.y > canvasHeight - margin - 20) { this.y = canvasHeight - margin - 20; this.vy *= -1; this.angle = -this.angle; }

        this.scuttleCycle = (this.scuttleCycle + 0.3 * step) % (Math.PI * 2);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (!this.facingRight) ctx.scale(-1, 1);

        if (this.state === 'DISTRACTED') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 14, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
            ctx.fill();
        }

        if (this.hitFlash > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash})`;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.ellipse(0, this.radius * 0.75, this.radius * 0.9, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.7, 4);
        ctx.quadraticCurveTo(-this.radius * 1.3, -14, -this.radius * 1.7, 2);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        const legOffset = this.state === 'DISTRACTED' ? 0 : Math.sin(this.scuttleCycle) * (this.radius * 0.3);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.4, this.radius * 0.4); ctx.lineTo(-this.radius * 0.4 + legOffset, this.radius * 0.8);
        ctx.moveTo(this.radius * 0.3, this.radius * 0.4); ctx.lineTo(this.radius * 0.3 - legOffset, this.radius * 0.8);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.85, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#92400e';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(this.radius * 0.1, this.radius * 0.25, this.radius * 0.5, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#d6b98c';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-this.radius * 0.15, -this.radius * 0.55, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#92400e';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-this.radius * 0.15, -this.radius * 0.55, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fca5a5';
        ctx.fill();

        ctx.save();
        ctx.translate(this.radius * 0.05, -this.radius * 0.95);
        ctx.font = `${Math.round(this.radius * 0.65)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', 0, 0);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(this.radius * 0.45, -this.radius * 0.2, this.radius * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius * 0.4, -this.radius * 0.25, this.radius * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.radius * 0.9, 0, this.radius * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = '#fca5a5';
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.radius * 0.85, -this.radius * 0.05); ctx.lineTo(this.radius * 1.3, -this.radius * 0.25);
        ctx.moveTo(this.radius * 0.85, this.radius * 0.05); ctx.lineTo(this.radius * 1.3, this.radius * 0.3);
        ctx.stroke();

        ctx.restore();
    }
}

// --------------------------------------------------------------------------
// NATASHA: ESCENA ESPECIAL DE VICTORIA
// --------------------------------------------------------------------------
class NatashaGirl {
    constructor(x, y, facingRight, scale = 1) {
        this.x = x;
        this.y = y;
        this.facingRight = facingRight;
        this.visualScale = scale;
        this.walkCycle = 0;
        this.armRaise = 0;
    }

    update(step = 1) {
        this.walkCycle = (this.walkCycle + 0.2 * step) % (Math.PI * 2);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.visualScale, this.visualScale);

        // Nombre en rosa arriba de la cabeza. Se dibuja antes de espejar por
        // dirección para que el texto nunca salga al revés.
        ctx.save();
        ctx.font = "bold 16px 'Fredoka One', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.strokeText('NATASHA', 0, -54);
        ctx.fillStyle = '#ff4794';
        ctx.fillText('NATASHA', 0, -54);
        ctx.restore();

        if (!this.facingRight) ctx.scale(-1, 1);

        ctx.beginPath();
        ctx.ellipse(0, 24, 20, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        const legSwing = this.armRaise > 0.5 ? 0 : Math.sin(this.walkCycle) * 8;

        ctx.strokeStyle = '#fcd9b8';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6, 14); ctx.lineTo(-6 + legSwing, 26);
        ctx.moveTo(6, 14); ctx.lineTo(6 - legSwing, 26);
        ctx.stroke();

        ctx.fillStyle = '#d6336c';
        ctx.beginPath(); ctx.arc(-6 + legSwing, 27, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6 - legSwing, 27, 4, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-16, 14);
        ctx.lineTo(16, 14);
        ctx.lineTo(10, -12);
        ctx.lineTo(-10, -12);
        ctx.closePath();
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#fcd9b8';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(9, -6);
        ctx.lineTo(9 + 12, -6 - this.armRaise * 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-9, -6);
        ctx.lineTo(-9 - 8 - this.armRaise * 4, -2 - this.armRaise * 8);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -22, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#fcd9b8';
        ctx.fill();

        ctx.fillStyle = '#f2c94c';
        ctx.beginPath(); ctx.arc(-13, -20, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(13, -20, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -31, 12, Math.PI, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath(); ctx.arc(-13, -26, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(13, -26, 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#3d2b1f';
        ctx.beginPath(); ctx.arc(-4, -22, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, -22, 1.6, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -18, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.beginPath(); ctx.arc(-8, -18, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -18, 2.5, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }
}

// --------------------------------------------------------------------------
// TEMAS VISUALES DE LAS 5 ETAPAS DE AVENTURA
// --------------------------------------------------------------------------
const LEVEL_THEMES = [
    { name: 'Selva Verde', bg: ['#0a2318', '#0e3322', '#06170f'], accent: 'rgba(253, 224, 71, 0.04)', treeSilhouette: '#061e14', bushColors: ['#15803d', '#166534'], groundColor: '#3f2212', groundBorder: '#542f19', groundSpot: '#6b3d22' },
    { name: 'Playa Tropical', bg: ['#0a3b4a', '#125064', '#062733'], accent: 'rgba(255, 255, 255, 0.05)', treeSilhouette: '#0c2f38', bushColors: ['#0d9488', '#0f766e'], groundColor: '#2b8fae', groundBorder: '#1e6f88', groundSpot: '#7dd3fc' },
    { name: 'Selva Nevada', bg: ['#243447', '#31465e', '#141d29'], accent: 'rgba(255, 255, 255, 0.09)', treeSilhouette: '#1b2634', bushColors: ['#e2e8f0', '#cbd5e1'], groundColor: '#dbeafe', groundBorder: '#93c5fd', groundSpot: '#f0f9ff' },
    { name: 'Selva Nocturna', bg: ['#120a2e', '#1e0f4d', '#08041a'], accent: 'rgba(168, 85, 247, 0.06)', treeSilhouette: '#0c0620', bushColors: ['#4c1d95', '#5b21b6'], groundColor: '#1e1b4b', groundBorder: '#3730a3', groundSpot: '#818cf8' },
    { name: 'Guarida del Súper Ratón', bg: ['#3a0d0d', '#5c1414', '#1f0505'], accent: 'rgba(239, 68, 68, 0.07)', treeSilhouette: '#2a0808', bushColors: ['#7f1d1d', '#991b1b'], groundColor: '#450a0a', groundBorder: '#7f1d1d', groundSpot: '#f87171' }
];

// --------------------------------------------------------------------------
// 4. RENDERIZADO DE LA SELVA (JUNGLE ENVIRONMENT)
// --------------------------------------------------------------------------
class JungleEnvironment {
    constructor(canvasWidth, canvasHeight, scale = 1) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.scale = scale;
        this.theme = LEVEL_THEMES[0];

        this.trees = [];
        this.bushes = [];
        this.mudPuddles = [];
        this.catnipItems = [];

        this.spores = [];
        this.butterflies = [];
        this.scorePopups = [];
        this.catchParticles = [];

        this.generateTerrain();
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.generateTerrain();
    }

    setScale(scale) {
        this.scale = scale;
    }

    setTheme(theme) {
        this.theme = theme;
        this.generateTerrain();
    }

    generateTerrain() {
        this.trees = [];
        this.bushes = [];
        this.mudPuddles = [];
        this.spores = [];
        this.butterflies = [];

        const s = this.scale;
        const treeCount = Math.floor(this.width / 180) + 2;
        for (let i = 0; i < treeCount; i++) {
            this.trees.push({
                x: i * 200 + (Math.random() * 80 - 40),
                y: Math.random() * 80,
                trunkWidth: (40 + Math.random() * 30) * s,
                crownRadius: (90 + Math.random() * 50) * s
            });
        }

        const bushCount = Math.floor((this.width * this.height) / 120000) + 3;
        for (let i = 0; i < bushCount; i++) {
            this.bushes.push({
                x: 100 + Math.random() * (this.width - 200),
                y: 120 + Math.random() * (this.height - 240),
                radius: (38 + Math.random() * 25) * s,
                color: Math.random() > 0.5 ? this.theme.bushColors[0] : this.theme.bushColors[1]
            });
        }

        const mudCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < mudCount; i++) {
            this.mudPuddles.push({
                x: 120 + Math.random() * (this.width - 240),
                y: 140 + Math.random() * (this.height - 280),
                rx: (40 + Math.random() * 25) * s,
                ry: (24 + Math.random() * 15) * s
            });
        }

        for (let i = 0; i < 35; i++) {
            this.spores.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 1.5 + Math.random() * 2.5,
                speedY: -0.2 - Math.random() * 0.4,
                speedX: (Math.random() - 0.5) * 0.3,
                alpha: Math.random()
            });
        }

        for (let i = 0; i < 6; i++) {
            this.butterflies.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                wingCycle: Math.random() * Math.PI,
                color: Math.random() > 0.5 ? '#38bdf8' : '#fb7185'
            });
        }
    }

    spawnCatnip(x, y) {
        this.catnipItems.push({
            x: x,
            y: y,
            radius: 16, // tamaño base; el tamaño real es radius * this.scale
            rotation: 0,
            duration: 600
        });
    }

    addCatchParticles(x, y, color = '#ff4794') {
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.catchParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 4,
                color: color,
                alpha: 1,
                life: 1
            });
        }
    }

    addScorePopup(x, y, text, color = '#ffffff') {
        this.scorePopups.push({
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1,
            scale: 1.3,
            vy: -1.8
        });
    }

    update(step = 1) {
        for (const spore of this.spores) {
            spore.y += spore.speedY * step;
            spore.x += spore.speedX * step;
            spore.alpha += (Math.random() - 0.5) * 0.05;
            if (spore.alpha < 0.2) spore.alpha = 0.2;
            if (spore.alpha > 0.9) spore.alpha = 0.9;

            if (spore.y < 0) {
                spore.y = this.height;
                spore.x = Math.random() * this.width;
            }
        }

        for (const b of this.butterflies) {
            b.x += b.vx * step;
            b.y += b.vy * step;
            b.wingCycle += 0.2 * step;

            if (Math.random() < 0.03) {
                b.vx = (Math.random() - 0.5) * 1.8;
                b.vy = (Math.random() - 0.5) * 1.8;
            }

            if (b.x < 0 || b.x > this.width) b.vx *= -1;
            if (b.y < 0 || b.y > this.height) b.vy *= -1;
        }

        for (let i = this.catnipItems.length - 1; i >= 0; i--) {
            const item = this.catnipItems[i];
            item.rotation += 0.03 * step;
            item.duration -= step;
            if (item.duration <= 0) {
                this.catnipItems.splice(i, 1);
            }
        }

        for (let i = this.catchParticles.length - 1; i >= 0; i--) {
            const p = this.catchParticles[i];
            p.x += p.vx * step;
            p.y += p.vy * step;
            p.alpha -= 0.035 * step;
            if (p.alpha <= 0) {
                this.catchParticles.splice(i, 1);
            }
        }

        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            popup.y += popup.vy * step;
            popup.alpha -= 0.02 * step;
            popup.scale = Math.max(1, popup.scale - 0.015 * step);
            if (popup.alpha <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
    }

    drawBackground(ctx) {
        const theme = this.theme;
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, theme.bg[0]);
        bgGrad.addColorStop(0.5, theme.bg[1]);
        bgGrad.addColorStop(1, theme.bg[2]);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.fillStyle = theme.accent;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (this.width / 4) - 50, 0);
            ctx.lineTo(i * (this.width / 4) + 120, 0);
            ctx.lineTo(i * (this.width / 4) + 260, this.height);
            ctx.lineTo(i * (this.width / 4) + 50, this.height);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = theme.treeSilhouette;
        for (const tree of this.trees) {
            ctx.fillRect(tree.x, tree.y, tree.trunkWidth, this.height);
            ctx.beginPath();
            ctx.arc(tree.x + tree.trunkWidth / 2, tree.y + 40, tree.crownRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const mud of this.mudPuddles) {
            ctx.beginPath();
            ctx.ellipse(mud.x, mud.y, mud.rx, mud.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = theme.groundColor;
            ctx.fill();
            ctx.strokeStyle = theme.groundBorder;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = theme.groundSpot;
            ctx.beginPath();
            ctx.arc(mud.x - mud.rx * 0.3, mud.y - 2, 4, 0, Math.PI * 2);
            ctx.arc(mud.x + mud.rx * 0.2, mud.y + 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawMidground(ctx) {
        for (const bush of this.bushes) {
            ctx.save();
            ctx.translate(bush.x, bush.y);

            ctx.beginPath();
            ctx.ellipse(0, bush.radius * 0.7, bush.radius * 1.1, bush.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();

            ctx.fillStyle = bush.color;
            ctx.beginPath(); ctx.arc(-bush.radius * 0.4, 0, bush.radius * 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(bush.radius * 0.4, 0, bush.radius * 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -bush.radius * 0.4, bush.radius * 0.85, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#f43f5e';
            ctx.beginPath(); ctx.arc(0, -bush.radius * 0.3, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#facc15';
            ctx.beginPath(); ctx.arc(0, -bush.radius * 0.3, 2, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        }

        for (const item of this.catnipItems) {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);
            ctx.scale(this.scale, this.scale);

            ctx.beginPath();
            ctx.arc(0, 0, item.radius + 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
            ctx.fill();

            ctx.fillStyle = '#22c55e';
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
                ctx.beginPath();
                ctx.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 8, 4, a, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#ff7ebb';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    drawForeground(ctx) {
        for (const spore of this.spores) {
            ctx.beginPath();
            ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 243, 208, ${spore.alpha})`;
            ctx.fill();
        }

        for (const b of this.butterflies) {
            ctx.save();
            ctx.translate(b.x, b.y);
            const wingWidth = Math.abs(Math.sin(b.wingCycle)) * 9 + 2;

            ctx.fillStyle = b.color;
            ctx.beginPath(); ctx.ellipse(-wingWidth / 2, 0, wingWidth / 2, 6, -0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(wingWidth / 2, 0, wingWidth / 2, 6, 0.2, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        }

        for (const p of this.catchParticles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.font = "900 22px 'Fredoka One', sans-serif";
        ctx.textAlign = 'center';
        for (const popup of this.scorePopups) {
            ctx.save();
            ctx.translate(popup.x, popup.y);
            ctx.scale(popup.scale, popup.scale);
            ctx.globalAlpha = Math.max(0, popup.alpha);

            ctx.strokeStyle = '#040f0a';
            ctx.lineWidth = 4;
            ctx.strokeText(popup.text, 0, 0);

            ctx.fillStyle = popup.color;
            ctx.fillText(popup.text, 0, 0);

            ctx.restore();
        }
    }
}

// --------------------------------------------------------------------------
// 5. TIENDA DE LA SELVA (ACCESORIOS & POTENCIADORES)
// --------------------------------------------------------------------------
const SHOP_ACCESSORIES = [
    { id: 'flower', name: 'Flor Tropical', icon: '🌸', price: 15, desc: 'Una flor selvática en la oreja' },
    { id: 'bow', name: 'Moño Rosa', icon: '🎀', price: 20, desc: 'Un lindo moño para lucir' },
    { id: 'cap', name: 'Gorra Aventurera', icon: '🧢', price: 22, desc: 'Lista para explorar la selva' },
    { id: 'scarf', name: 'Bufanda', icon: '🧣', price: 25, desc: 'Bien abrigado en la selva' },
    { id: 'necklace', name: 'Collar de Gema', icon: '💎', price: 28, desc: 'Un brillo precioso en el cuello' },
    { id: 'glasses', name: 'Lentes Cool', icon: '🕶️', price: 30, desc: 'Para la caza con estilo' },
    { id: 'headphones', name: 'Audífonos DJ', icon: '🎧', price: 35, desc: 'Música mientras caza ratones' },
    { id: 'crown', name: 'Corona Real', icon: '👑', price: 50, desc: 'Eres la realeza de la selva' },
    { id: 'champion_crown', name: 'Corona de Campeón', icon: '🏆', price: 0, desc: 'Trofeo por vencer al Súper Ratón', locked: true }
];

const SHOP_POWERUPS = [
    { id: 'lucky_start', name: 'Hierba de la Suerte', icon: '🌿', price: 35, desc: 'Empieza cada partida con Súper Velocidad' },
    { id: 'quick_pounce', name: 'Salto Rápido', icon: '⚡', price: 60, desc: 'El enfriamiento del salto es 25% más corto' },
    { id: 'extra_time', name: 'Tiempo Extra', icon: '⏱️', price: 40, desc: '+10 segundos en cada nivel' },
    { id: 'cheese_stock', name: 'Reserva de Queso', icon: '🧀', price: 30, desc: '+4 quesos para el Súper Ratón final' }
];

// --------------------------------------------------------------------------
// 6. GESTOR DE INTERFAZ DE USUARIO (UI MANAGER)
// --------------------------------------------------------------------------
class UIManager {
    constructor(callbacks) {
        this.callbacks = callbacks;
        
        this.screenStart = document.getElementById('screen-start');
        this.screenPause = document.getElementById('screen-pause');
        this.screenLevelClear = document.getElementById('screen-level-clear');
        this.screenGameOver = document.getElementById('screen-game-over');
        this.hud = document.getElementById('hud');
        this.touchControls = document.getElementById('touch-controls');

        this.scoreText = document.getElementById('score-text');
        this.miceCaughtText = document.getElementById('mice-caught-text');
        this.miceTargetText = document.getElementById('mice-target-text');
        this.timerText = document.getElementById('timer-text');
        this.pounceBarFill = document.getElementById('pounce-bar-fill');
        this.activePowerupBadge = document.getElementById('active-powerup-badge');
        this.powerupTimerFill = document.getElementById('powerup-timer-fill');
        this.powerupIcon = document.getElementById('powerup-icon');
        this.powerupName = document.getElementById('powerup-name');
        this.comboBanner = document.getElementById('combo-banner');
        this.comboText = document.getElementById('combo-text');
        this.startHighScore = document.getElementById('start-high-score');

        this.milestoneBanner = document.getElementById('milestone-banner');
        this.milestoneText = document.getElementById('milestone-text');
        this.hudLevelCard = document.getElementById('hud-level-card');
        this.levelText = document.getElementById('level-text');
        this.hairballText = document.getElementById('hairball-text');
        this.startHairballs = document.getElementById('start-hairballs');
        this.shopHairballs = document.getElementById('shop-hairballs');
        this.bossHealthBar = document.getElementById('boss-health-bar');
        this.bossHealthFill = document.getElementById('boss-health-fill');
        this.screenShop = document.getElementById('screen-shop');
        this.screenVictory = document.getElementById('screen-victory');

        this.btnSound = document.getElementById('btn-sound');
        this.btnHomeHud = document.getElementById('btn-home-hud');
        this.btnPause = document.getElementById('btn-pause');

        this.highScore = parseInt(localStorage.getItem('pink_cat_high_score') || '0', 10);
        this.hairballs = parseInt(localStorage.getItem('pink_cat_hairballs') || '0', 10);
        this.ownedAccessories = JSON.parse(localStorage.getItem('pink_cat_owned_accessories') || '[]');
        this.equippedAccessory = localStorage.getItem('pink_cat_equipped_accessory') || null;
        this.ownedPowerups = JSON.parse(localStorage.getItem('pink_cat_owned_powerups') || '[]');

        this.updateStartHighScoreDisplay();
        this.updateHairballDisplays();

        this.bindEvents();
    }

    updateHairballDisplays() {
        const text = this.hairballs.toLocaleString();
        if (this.startHairballs) this.startHairballs.textContent = text;
        if (this.shopHairballs) this.shopHairballs.textContent = text;
        if (this.hairballText) this.hairballText.textContent = text;
    }

    addHairballs(amount) {
        if (amount <= 0) return;
        this.hairballs += amount;
        localStorage.setItem('pink_cat_hairballs', this.hairballs.toString());
        this.updateHairballDisplays();
    }

    spendHairballs(amount) {
        if (amount > this.hairballs) return false;
        this.hairballs -= amount;
        localStorage.setItem('pink_cat_hairballs', this.hairballs.toString());
        this.updateHairballDisplays();
        return true;
    }

    ownsAccessory(id) {
        return this.ownedAccessories.includes(id);
    }

    buyAccessory(id, price) {
        if (this.ownsAccessory(id) || !this.spendHairballs(price)) return false;
        this.ownedAccessories.push(id);
        localStorage.setItem('pink_cat_owned_accessories', JSON.stringify(this.ownedAccessories));
        this.equipAccessory(id);
        return true;
    }

    unlockTrophyAccessory(id) {
        if (this.ownsAccessory(id)) return false;
        this.ownedAccessories.push(id);
        localStorage.setItem('pink_cat_owned_accessories', JSON.stringify(this.ownedAccessories));
        return true;
    }

    equipAccessory(id) {
        this.equippedAccessory = this.equippedAccessory === id ? null : id;
        localStorage.setItem('pink_cat_equipped_accessory', this.equippedAccessory || '');
    }

    ownsPowerup(id) {
        return this.ownedPowerups.includes(id);
    }

    buyPowerup(id, price) {
        if (this.ownsPowerup(id) || !this.spendHairballs(price)) return false;
        this.ownedPowerups.push(id);
        localStorage.setItem('pink_cat_owned_powerups', JSON.stringify(this.ownedPowerups));
        return true;
    }

    bindEvents() {
        const advBtn = document.getElementById('btn-mode-adventure');
        if (advBtn) {
            advBtn.addEventListener('click', () => {
                sound.init();
                this.callbacks.onStartGame('adventure');
            });
        }

        const endlessBtn = document.getElementById('btn-mode-endless');
        if (endlessBtn) {
            endlessBtn.addEventListener('click', () => {
                sound.init();
                this.callbacks.onStartGame('endless');
            });
        }

        if (this.btnPause) {
            this.btnPause.addEventListener('click', () => {
                this.callbacks.onTogglePause();
            });
        }

        if (this.btnHomeHud) {
            this.btnHomeHud.addEventListener('click', () => {
                this.callbacks.onGoToMainMenu();
            });
        }

        if (this.btnSound) {
            this.btnSound.addEventListener('click', () => {
                sound.init();
                const isMuted = sound.toggleMute();
                this.btnSound.textContent = isMuted ? '🔇' : '🔊';
            });
        }

        const resumeBtn = document.getElementById('btn-resume');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.callbacks.onTogglePause();
            });
        }

        const restartPauseBtn = document.getElementById('btn-restart-pause');
        if (restartPauseBtn) {
            restartPauseBtn.addEventListener('click', () => {
                this.callbacks.onRestartLevel();
            });
        }

        const quitBtn = document.getElementById('btn-quit');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.callbacks.onGoToMainMenu();
            });
        }

        const nextLevelBtn = document.getElementById('btn-next-level');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => {
                this.callbacks.onNextLevel();
            });
        }

        const retryBtn = document.getElementById('btn-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.callbacks.onRestartLevel();
            });
        }

        const mainMenuGoBtn = document.getElementById('btn-main-menu-go');
        if (mainMenuGoBtn) {
            mainMenuGoBtn.addEventListener('click', () => {
                this.callbacks.onGoToMainMenu();
            });
        }

        const victoryMenuBtn = document.getElementById('btn-victory-menu');
        if (victoryMenuBtn) {
            victoryMenuBtn.addEventListener('click', () => {
                this.callbacks.onGoToMainMenu();
            });
        }

        const openShopBtn = document.getElementById('btn-open-shop');
        if (openShopBtn) {
            openShopBtn.addEventListener('click', () => {
                sound.init();
                this.showShop();
            });
        }

        const closeShopBtn = document.getElementById('btn-close-shop');
        if (closeShopBtn) {
            closeShopBtn.addEventListener('click', () => {
                this.hideShop();
            });
        }

        const tabAccessories = document.getElementById('tab-accessories');
        const tabPowerups = document.getElementById('tab-powerups');
        if (tabAccessories && tabPowerups) {
            tabAccessories.addEventListener('click', () => this.switchShopTab('accessories'));
            tabPowerups.addEventListener('click', () => this.switchShopTab('powerups'));
        }

        this.setupTouchControls();
    }

    switchShopTab(tab) {
        const tabAccessories = document.getElementById('tab-accessories');
        const tabPowerups = document.getElementById('tab-powerups');
        const gridAccessories = document.getElementById('shop-grid-accessories');
        const gridPowerups = document.getElementById('shop-grid-powerups');

        const isAccessories = tab === 'accessories';
        tabAccessories.classList.toggle('active', isAccessories);
        tabPowerups.classList.toggle('active', !isAccessories);
        gridAccessories.classList.toggle('hidden', !isAccessories);
        gridPowerups.classList.toggle('hidden', isAccessories);
    }

    showShop() {
        this.renderShopGrid('accessories', SHOP_ACCESSORIES, document.getElementById('shop-grid-accessories'));
        this.renderShopGrid('powerups', SHOP_POWERUPS, document.getElementById('shop-grid-powerups'));
        this.switchShopTab('accessories');
        if (this.screenStart) this.screenStart.classList.add('hidden');
        if (this.screenShop) this.screenShop.classList.remove('hidden');
    }

    hideShop() {
        if (this.screenShop) this.screenShop.classList.add('hidden');
        if (this.screenStart) this.screenStart.classList.remove('hidden');
    }

    renderShopGrid(kind, items, container) {
        if (!container) return;
        container.innerHTML = '';

        for (const item of items) {
            const owned = kind === 'accessories' ? this.ownsAccessory(item.id) : this.ownsPowerup(item.id);
            const equipped = kind === 'accessories' && this.equippedAccessory === item.id;
            const canAfford = this.hairballs >= item.price;
            const isLocked = !!item.locked && !owned;

            const card = document.createElement('div');
            card.className = 'shop-item';

            let btnLabel;
            if (isLocked) {
                btnLabel = '🔒 Vence al Jefe';
            } else if (owned) {
                btnLabel = kind === 'accessories' ? (equipped ? '✅ Equipado' : 'Usar') : '✅ Comprado';
            } else {
                btnLabel = `🧶 ${item.price}`;
            }
            const btnDisabled = isLocked || (!owned && !canAfford);

            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <button class="shop-item-btn ${equipped ? 'equipped' : ''}" ${btnDisabled ? 'disabled' : ''}>${btnLabel}</button>
            `;

            const btn = card.querySelector('.shop-item-btn');
            btn.addEventListener('click', () => {
                if (isLocked) return;
                if (kind === 'accessories') {
                    if (this.ownsAccessory(item.id)) {
                        this.equipAccessory(item.id);
                    } else {
                        this.buyAccessory(item.id, item.price);
                    }
                } else {
                    if (!this.ownsPowerup(item.id)) {
                        this.buyPowerup(item.id, item.price);
                    }
                }
                this.renderShopGrid(kind, items, container);
            });

            container.appendChild(card);
        }
    }

    showMilestone(text) {
        if (this.milestoneText) this.milestoneText.textContent = text;
        if (this.milestoneBanner) {
            this.milestoneBanner.classList.remove('hidden');
            clearTimeout(this._milestoneTimeout);
            this._milestoneTimeout = setTimeout(() => {
                if (this.milestoneBanner) this.milestoneBanner.classList.add('hidden');
            }, 1800);
        }
    }

    updateLevelDisplay(level, maxLevel) {
        if (!this.hudLevelCard || !this.levelText) return;
        if (maxLevel > 0) {
            this.hudLevelCard.classList.remove('hidden');
            this.levelText.textContent = `${level}/${maxLevel}`;
        } else {
            this.hudLevelCard.classList.add('hidden');
        }
    }

    updateBossHealth(pct) {
        if (pct === null) {
            if (this.bossHealthBar) this.bossHealthBar.classList.add('hidden');
            return;
        }
        if (this.bossHealthBar) this.bossHealthBar.classList.remove('hidden');
        if (this.bossHealthFill) this.bossHealthFill.style.width = `${Math.max(0, pct) * 100}%`;
    }

    showVictory(stats) {
        const scoreEl = document.getElementById('victory-stat-score');
        const hairballsEl = document.getElementById('victory-stat-hairballs');
        const trophyEl = document.getElementById('victory-trophy-tag');
        if (scoreEl) scoreEl.textContent = stats.totalScore.toLocaleString();
        if (hairballsEl) hairballsEl.textContent = `+${stats.hairballsEarned}`;
        if (trophyEl) trophyEl.classList.toggle('hidden', !stats.newTrophy);

        this.addHairballs(stats.hairballsEarned);
        this.checkHighScore(stats.totalScore);
        if (this.screenVictory) this.screenVictory.classList.remove('hidden');
        sound.playLevelClear();
    }

    setupTouchControls() {
        const pounceBtn = document.getElementById('btn-touch-pounce');
        if (pounceBtn) {
            pounceBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.callbacks.onPounce();
            });
        }

        const cheeseBtn = document.getElementById('btn-touch-cheese');
        if (cheeseBtn) {
            cheeseBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.callbacks.onThrowCheese();
            });
        }
    }

    setBossMode(active, cheeseCount = 0, isFinal = true) {
        const cheeseBtn = document.getElementById('btn-touch-cheese');
        if (cheeseBtn) cheeseBtn.classList.toggle('hidden', !active);

        const labelEl = document.getElementById('boss-label-text');
        if (labelEl) {
            labelEl.textContent = isFinal ? '👑 SÚPER RATÓN 👑' : '🐭 RATÓN TRAVIESO 🐭';
        }

        if (active) {
            this.updateCheeseStock(cheeseCount);
        } else {
            this.updateBossHealth(null);
        }
    }

    updateCheeseStock(count) {
        const el = document.getElementById('touch-cheese-count');
        if (el) el.textContent = `x${count}`;
    }

    updateStartHighScoreDisplay() {
        if (this.startHighScore) {
            this.startHighScore.textContent = this.highScore.toLocaleString();
        }
    }

    checkHighScore(newScore) {
        if (newScore > this.highScore) {
            this.highScore = newScore;
            localStorage.setItem('pink_cat_high_score', this.highScore.toString());
            this.updateStartHighScoreDisplay();
            return true;
        }
        return false;
    }

    showStartScreen() {
        if (this.screenStart) this.screenStart.classList.remove('hidden');
        if (this.screenPause) this.screenPause.classList.add('hidden');
        if (this.screenLevelClear) this.screenLevelClear.classList.add('hidden');
        if (this.screenGameOver) this.screenGameOver.classList.add('hidden');
        if (this.screenVictory) this.screenVictory.classList.add('hidden');
        if (this.screenShop) this.screenShop.classList.add('hidden');
        if (this.hud) this.hud.classList.add('hidden');
        if (this.touchControls) this.touchControls.classList.add('hidden');
        this.updateHairballDisplays();
    }

    showHUD(isMobile = false) {
        if (this.screenStart) this.screenStart.classList.add('hidden');
        if (this.screenPause) this.screenPause.classList.add('hidden');
        if (this.screenLevelClear) this.screenLevelClear.classList.add('hidden');
        if (this.screenGameOver) this.screenGameOver.classList.add('hidden');
        if (this.screenVictory) this.screenVictory.classList.add('hidden');
        if (this.screenShop) this.screenShop.classList.add('hidden');
        if (this.hud) this.hud.classList.remove('hidden');

        if (isMobile && this.touchControls) {
            this.touchControls.classList.remove('hidden');
        }
    }

    showPauseScreen() {
        if (this.screenPause) this.screenPause.classList.remove('hidden');
    }

    hidePauseScreen() {
        if (this.screenPause) this.screenPause.classList.add('hidden');
    }

    showLevelClear(stats) {
        const miceEl = document.getElementById('stat-mice-caught');
        const scoreEl = document.getElementById('stat-level-score');
        const bonusEl = document.getElementById('stat-time-bonus');
        const totalEl = document.getElementById('stat-total-score');
        const hairballsEl = document.getElementById('stat-hairballs-earned');

        if (miceEl) miceEl.textContent = stats.miceCaught;
        if (scoreEl) scoreEl.textContent = stats.levelScore.toLocaleString();
        if (bonusEl) bonusEl.textContent = `+${stats.timeBonus.toLocaleString()}`;
        if (totalEl) totalEl.textContent = stats.totalScore.toLocaleString();
        if (hairballsEl) hairballsEl.textContent = `+${stats.hairballsEarned}`;

        this.addHairballs(stats.hairballsEarned);

        if (this.screenLevelClear) this.screenLevelClear.classList.remove('hidden');
        sound.playLevelClear();
    }

    showGameOver(stats) {
        const miceEl = document.getElementById('go-stat-mice');
        const scoreEl = document.getElementById('go-stat-score');
        const hairballsEl = document.getElementById('go-stat-hairballs');

        if (miceEl) miceEl.textContent = stats.miceCaught;
        if (scoreEl) scoreEl.textContent = stats.totalScore.toLocaleString();
        if (hairballsEl) hairballsEl.textContent = `+${stats.hairballsEarned}`;

        this.addHairballs(stats.hairballsEarned);

        const isNewRecord = this.checkHighScore(stats.totalScore);
        const recordTag = document.getElementById('new-high-score-tag');
        if (recordTag) {
            if (isNewRecord) recordTag.classList.remove('hidden');
            else recordTag.classList.add('hidden');
        }

        if (this.screenGameOver) this.screenGameOver.classList.remove('hidden');
        sound.playGameOver();
    }

    updateHUD(score, miceCaught, miceTarget, timerSeconds, pounceCooldownPct, powerupState) {
        if (this.scoreText) this.scoreText.textContent = score.toLocaleString();
        if (this.miceCaughtText) this.miceCaughtText.textContent = miceCaught;
        if (this.miceTargetText) this.miceTargetText.textContent = miceTarget > 0 ? miceTarget : '∞';
        if (this.timerText) this.timerText.textContent = Math.ceil(timerSeconds);

        const barPct = Math.max(0, Math.min(100, (1 - pounceCooldownPct) * 100));
        if (this.pounceBarFill) this.pounceBarFill.style.width = `${barPct}%`;

        if (powerupState && powerupState.active) {
            if (this.activePowerupBadge) this.activePowerupBadge.classList.remove('hidden');
            if (this.powerupIcon) this.powerupIcon.textContent = powerupState.icon || '🌿';
            if (this.powerupName) this.powerupName.textContent = powerupState.name || '¡POTENCIADOR!';
            if (this.powerupTimerFill) this.powerupTimerFill.style.width = `${powerupState.pct * 100}%`;
        } else {
            if (this.activePowerupBadge) this.activePowerupBadge.classList.add('hidden');
        }
    }

    showCombo(count) {
        if (count > 1) {
            if (this.comboText) this.comboText.textContent = `¡COMBO x${count}! 🔥`;
            if (this.comboBanner) this.comboBanner.classList.remove('hidden');

            setTimeout(() => {
                if (this.comboBanner) this.comboBanner.classList.add('hidden');
            }, 1200);
        }
    }
}

// --------------------------------------------------------------------------
// 6. MOTOR DEL JUEGO (GAME ENGINE)
// --------------------------------------------------------------------------
const GAME_STATES = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    LEVEL_CLEAR: 'LEVEL_CLEAR',
    GAME_OVER: 'GAME_OVER',
    VICTORY_SCENE: 'VICTORY_SCENE',
    VICTORY: 'VICTORY'
};

const MAX_ADVENTURE_LEVEL = 5;
const MINI_BOSS_LEVELS = [2, 4];

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error("No se encontró el elemento canvas #gameCanvas");
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        this.width = window.innerWidth || document.documentElement.clientWidth || 800;
        this.height = window.innerHeight || document.documentElement.clientHeight || 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.worldScale = this.computeWorldScale();

        this.state = GAME_STATES.START;
        this.mode = 'adventure';

        this.currentLevel = 1;
        this.score = 0;
        this.levelScore = 0;
        this.miceCaught = 0;
        this.miceTarget = 15;
        this.timer = 60;
        this.comboCount = 0;
        this.comboTimer = 0;

        this.sessionMiceCaught = 0;
        this.sessionBestCombo = 0;

        this.boss = null;
        this.thrownCheeses = [];
        this.cheeseStock = 0;

        this.natasha = null;
        this.victoryHearts = [];
        this.victoryPhase = null;
        this.victoryPhaseTimer = 0;
        this.natashaTargetX = 0;

        this.cat = new PinkCat(this.width / 2, this.height / 2, this.worldScale);
        this.mice = [];
        this.cheeses = [];
        this.jungle = new JungleEnvironment(this.width, this.height, this.worldScale);

        this.keys = {};
        this.touchVector = { active: false, x: 0, y: 0 };
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.ui = new UIManager({
            onStartGame: (mode) => this.startGame(mode),
            onTogglePause: () => this.togglePause(),
            onRestartLevel: () => this.restartLevel(),
            onNextLevel: () => this.nextLevel(),
            onGoToMainMenu: () => this.goToMainMenu(),
            onPounce: () => this.cat.pounce(),
            onThrowCheese: () => this.throwCheeseAtBoss()
        });

        this.bindEvents();
        this.setupVirtualJoystick();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    // El mundo del juego (gato, ratones, árboles) usa tamaños fijos en píxeles,
    // así que sin este factor se ve diminuto en monitores grandes de PC y hay
    // que achicar la ventana para jugar cómodo. Se recalcula en cada resize,
    // pero solo afecta a las entidades que se crean de ahí en adelante (no
    // reescala de golpe al gato o los ratones que ya están en pantalla).
    computeWorldScale() {
        const raw = this.height / 720;
        return Math.max(0.85, Math.min(raw, 2.0));
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth || document.documentElement.clientWidth || 800;
            this.height = window.innerHeight || document.documentElement.clientHeight || 600;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.worldScale = this.computeWorldScale();
            this.jungle.setScale(this.worldScale);

            // Solo se regenera el terreno (árboles, arbustos, charcos) fuera de una partida
            // activa, para que nunca aparezca un obstáculo de golpe debajo del gato.
            if (this.state === GAME_STATES.PLAYING) {
                this.jungle.width = this.width;
                this.jungle.height = this.height;
            } else {
                this.jungle.resize(this.width, this.height);
            }
        });

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // En la pantalla de inicio, presionar Enter o Espacio inicia el juego directamente
            if (this.state === GAME_STATES.START && (e.code === 'Enter' || e.code === 'Space')) {
                e.preventDefault();
                this.startGame('adventure');
                return;
            }

            if (e.code === 'Space' && this.state === GAME_STATES.PLAYING) {
                e.preventDefault();
                this.cat.pounce();
            }

            if (e.code === 'KeyC' && this.state === GAME_STATES.PLAYING) {
                e.preventDefault();
                this.throwCheeseAtBoss();
            }

            if ((e.code === 'KeyP' || e.code === 'Escape') && (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED)) {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('pointerdown', (e) => {
            if (this.state === GAME_STATES.PLAYING && !this.isMobile) {
                this.cat.pounce();
            }
        });
    }

    setupVirtualJoystick() {
        const zone = document.getElementById('joystick-zone');
        const stick = document.getElementById('joystick-stick');
        if (!zone || !stick) return;

        let activeTouchId = null;
        let startX = 0;
        let startY = 0;

        zone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            activeTouchId = touch.identifier;
            const rect = zone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (activeTouchId === null) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeTouchId) {
                    const dx = touch.clientX - startX;
                    const dy = touch.clientY - startY;
                    const dist = Math.hypot(dx, dy);
                    const maxDist = 45;

                    const clampDist = Math.min(dist, maxDist);
                    const angle = Math.atan2(dy, dx);

                    const stickX = Math.cos(angle) * clampDist;
                    const stickY = Math.sin(angle) * clampDist;

                    stick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

                    this.touchVector.active = true;
                    this.touchVector.x = dx / maxDist;
                    this.touchVector.y = dy / maxDist;
                }
            }
        });

        const resetJoystick = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === activeTouchId) {
                    activeTouchId = null;
                    stick.style.transform = `translate(-50%, -50%)`;
                    this.touchVector.active = false;
                    this.touchVector.x = 0;
                    this.touchVector.y = 0;
                }
            }
        };

        zone.addEventListener('touchend', resetJoystick);
        zone.addEventListener('touchcancel', resetJoystick);
    }

    startGame(mode = 'adventure') {
        this.mode = mode;
        this.currentLevel = 1;
        this.score = 0;
        this.sessionMiceCaught = 0;
        this.sessionBestCombo = 0;
        this.initLevel();
        this.state = GAME_STATES.PLAYING;
        this.ui.showHUD(this.isMobile);
        sound.playMeow();
        sound.startMusic();
    }

    initLevel() {
        this.levelScore = 0;
        this.miceCaught = 0;
        this.comboCount = 0;
        this.boss = null;
        this.thrownCheeses = [];
        this.cheeseStock = 0;
        this.natasha = null;
        this.victoryHearts = [];

        const isBossLevel = this.mode === 'adventure' && this.currentLevel >= MAX_ADVENTURE_LEVEL;

        const theme = this.mode === 'adventure'
            ? LEVEL_THEMES[Math.min(this.currentLevel - 1, LEVEL_THEMES.length - 1)]
            : LEVEL_THEMES[0];
        this.jungle.setTheme(theme);

        this.cat = new PinkCat(this.width / 2, this.height / 2, this.worldScale);
        this.cat.accessory = this.ui.equippedAccessory;
        if (this.ui.ownsPowerup('quick_pounce')) {
            this.cat.maxPounceCooldown = Math.round(this.cat.maxPounceCooldown * 0.75);
        }
        if (this.currentLevel === 1 && this.ui.ownsPowerup('lucky_start')) {
            this.cat.activateCatnip();
        }

        this.mice = [];
        this.cheeses = [];
        this.jungle.catnipItems = [];

        if (isBossLevel) {
            this.miceTarget = -1;
            this.timer = 90;
            this.cheeseStock = 8 + (this.ui.ownsPowerup('cheese_stock') ? 4 : 0);
            this.boss = new SuperMouseBoss(this.width / 2, this.height / 2 - 80, 4, 42, this.worldScale);
            this.boss.isFinal = true;
            this.ui.setBossMode(true, this.cheeseStock, true);
        } else {
            if (this.mode === 'adventure') {
                this.miceTarget = 10 + this.currentLevel * 5;
                this.timer = Math.max(35, 65 - this.currentLevel * 3);
            } else {
                this.miceTarget = -1;
                this.timer = 90;
            }

            const initialMiceCount = Math.min(18, 7 + this.currentLevel * 2);
            for (let i = 0; i < initialMiceCount; i++) {
                this.spawnMouse();
            }

            this.jungle.spawnCatnip(
                150 + Math.random() * (this.width - 300),
                150 + Math.random() * (this.height - 300)
            );

            const isMiniBossLevel = this.mode === 'adventure' && MINI_BOSS_LEVELS.includes(this.currentLevel);
            if (isMiniBossLevel) {
                this.cheeseStock = 4 + (this.ui.ownsPowerup('cheese_stock') ? 2 : 0);
                this.boss = new SuperMouseBoss(this.width * 0.7, this.height * 0.3, 2, 30, this.worldScale);
                this.boss.isFinal = false;
                this.ui.setBossMode(true, this.cheeseStock, false);
            } else {
                this.ui.setBossMode(false);
            }
        }

        if (this.ui.ownsPowerup('extra_time')) {
            this.timer += 10;
        }
    }

    spawnMouse() {
        const margin = 100;
        const x = margin + Math.random() * (this.width - margin * 2);
        const y = margin + Math.random() * (this.height - margin * 2);

        const rand = Math.random();
        let mouseConfig = MOUSE_TYPES.STANDARD;

        if (rand < 0.20) {
            mouseConfig = MOUSE_TYPES.GOLDEN;
        } else if (rand < 0.40) {
            mouseConfig = MOUSE_TYPES.SHADOW;
        } else if (rand < 0.60) {
            mouseConfig = MOUSE_TYPES.CHEESE;
        }

        this.mice.push(new JungleMouse(x, y, mouseConfig, this.worldScale));
    }

    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            this.ui.showPauseScreen();
            sound.stopMusic();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.ui.hidePauseScreen();
            sound.startMusic();
        }
    }

    restartLevel() {
        this.initLevel();
        this.state = GAME_STATES.PLAYING;
        this.ui.showHUD(this.isMobile);
        sound.startMusic();
    }

    nextLevel() {
        this.currentLevel++;
        this.initLevel();
        this.state = GAME_STATES.PLAYING;
        this.ui.showHUD(this.isMobile);
        sound.playMeow();
        sound.startMusic();
    }

    goToMainMenu() {
        this.state = GAME_STATES.START;
        this.natasha = null;
        this.victoryHearts = [];
        this.ui.showStartScreen();
        sound.stopMusic();
    }

    loop(timestamp) {
        // Se limita el dt a un máximo de 50ms (equivalente a 20 FPS) para evitar
        // saltos bruscos de tiempo si el usuario cambia de pestaña y vuelve.
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        if (this.state === GAME_STATES.PLAYING) {
            this.update(dt);
        } else if (this.state === GAME_STATES.VICTORY_SCENE) {
            this.updateVictoryScene(dt, dt * 60);
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // "step" normaliza toda la animación/movimiento a una base de 60 FPS,
        // para que el juego se sienta igual de rápido sin importar el monitor o dispositivo.
        const step = dt * 60;

        if (this.timer > 0) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.timer = 0;
                if (this.mode === 'adventure' && this.miceCaught < this.miceTarget) {
                    this.triggerGameOver();
                } else if (this.mode === 'endless') {
                    this.triggerGameOver();
                }
            }
        }

        if (this.comboCount > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        let inMud = false;
        for (const mud of this.jungle.mudPuddles) {
            const dx = (this.cat.x - mud.x) / mud.rx;
            const dy = (this.cat.y - mud.y) / mud.ry;
            if (dx * dx + dy * dy <= 1) {
                inMud = true;
                break;
            }
        }
        this.cat.inMud = inMud;

        this.cat.update(this.keys, this.touchVector, this.width, this.height, step);
        this.jungle.update(step);

        for (let i = this.cheeses.length - 1; i >= 0; i--) {
            const cheese = this.cheeses[i];
            cheese.update(step);
            if (cheese.lifetime <= 0) {
                this.cheeses.splice(i, 1);
            }
        }

        for (let i = this.mice.length - 1; i >= 0; i--) {
            const mouse = this.mice[i];
            mouse.update(this.cat, this.width, this.height, this.jungle.bushes, this.cheeses, step);

            const dist = Math.hypot(this.cat.x - mouse.x, this.cat.y - mouse.y);
            const catchDistance = this.cat.radius * this.cat.visualScale + mouse.radius * mouse.visualScale + (this.cat.isPouncing ? 16 * this.cat.visualScale : 0);

            if (dist < catchDistance) {
                this.catchMouse(mouse, i);
            }
        }

        for (let i = this.jungle.catnipItems.length - 1; i >= 0; i--) {
            const item = this.jungle.catnipItems[i];
            if (Math.hypot(this.cat.x - item.x, this.cat.y - item.y) < this.cat.radius * this.cat.visualScale + item.radius * this.jungle.scale) {
                this.cat.activateCatnip();
                this.jungle.catnipItems.splice(i, 1);
                this.jungle.addScorePopup(item.x, item.y, '¡SUPER VELOCIDAD!', '#22c55e');
            }
        }

        const finalBossActive = this.boss && this.boss.isFinal;

        if (!finalBossActive && this.mice.length < 10) {
            this.spawnMouse();
        }

        if (this.boss) {
            this.updateBossFight(step, dt);
        }

        if (!finalBossActive && this.mode === 'adventure' && this.miceCaught >= this.miceTarget) {
            this.triggerLevelClear();
        }

        const powerupState = {
            active: this.cat.catnipActive,
            icon: '🌿',
            name: '¡HIERBA GATUNA!',
            pct: this.cat.catnipTimer / 360
        };

        this.ui.updateHUD(
            this.score,
            this.miceCaught,
            this.miceTarget,
            this.timer,
            this.cat.pounceCooldown / this.cat.maxPounceCooldown,
            powerupState
        );

        this.ui.updateLevelDisplay(this.currentLevel, this.mode === 'adventure' ? MAX_ADVENTURE_LEVEL : 0);
    }

    updateBossFight(step, dt) {
        this.boss.update(this.cat, this.width, this.height, step, dt);

        const distToBoss = Math.hypot(this.cat.x - this.boss.x, this.cat.y - this.boss.y);
        const catchDistance = this.cat.radius * this.cat.visualScale + this.boss.radius + (this.cat.isPouncing ? 16 * this.cat.visualScale : 0);

        if (this.boss.state === 'DISTRACTED' && distToBoss < catchDistance) {
            this.hitBoss();
            if (!this.boss) return; // el jefe fue derrotado y comenzó la escena de victoria
        }

        for (let i = this.thrownCheeses.length - 1; i >= 0; i--) {
            const tc = this.thrownCheeses[i];
            tc.update(step);

            const dCheese = Math.hypot(tc.x - this.boss.x, tc.y - this.boss.y);
            if (this.boss.state === 'ROAMING' && dCheese < this.boss.radius + tc.radius) {
                this.boss.distract();
                this.jungle.addScorePopup(this.boss.x, this.boss.y, '¡A COMER! 🧀', '#facc15');
                this.thrownCheeses.splice(i, 1);
                continue;
            }

            if (tc.life <= 0 || tc.x < 0 || tc.x > this.width || tc.y < 0 || tc.y > this.height) {
                this.thrownCheeses.splice(i, 1);
            }
        }

        this.ui.updateBossHealth(this.boss.health / this.boss.maxHealth);
    }

    hitBoss() {
        this.boss.takeHit();
        this.jungle.addCatchParticles(this.boss.x, this.boss.y, '#facc15');
        sound.playCatch();
        vibrate(VIBRATION_PATTERNS.hit);

        if (this.boss.state === 'DEFEATED') {
            if (this.boss.isFinal) {
                this.startVictoryScene();
            } else {
                this.defeatMiniBoss();
            }
        } else {
            this.jungle.addScorePopup(this.boss.x, this.boss.y, '¡GOLPE!', '#ef4444');
        }
    }

    defeatMiniBoss() {
        const bonus = 800;
        this.score += bonus;
        this.levelScore += bonus;
        const hairballBonus = 15;

        this.jungle.addCatchParticles(this.boss.x, this.boss.y, '#fbbf24');
        this.jungle.addScorePopup(this.boss.x, this.boss.y, `¡RATÓN TRAVIESO! +${bonus}`, '#fbbf24');
        this.ui.addHairballs(hairballBonus);
        this.ui.showMilestone(`🐭👑 ¡MINI-JEFE DERROTADO! +${hairballBonus} 🧶`);
        sound.playLevelClear();
        vibrate(VIBRATION_PATTERNS.defeat);

        this.boss = null;
        this.thrownCheeses = [];
        this.ui.setBossMode(false);
    }

    startVictoryScene() {
        this.state = GAME_STATES.VICTORY_SCENE;
        this.boss = null;
        this.thrownCheeses = [];
        sound.stopMusic();
        vibrate(VIBRATION_PATTERNS.victory);

        this.cat.isPouncing = false;
        this.cat.vx = 0;
        this.cat.vy = 0;
        this.cat.isMoving = false;

        const enterFromRight = this.cat.x < this.width / 2;
        const startX = enterFromRight ? this.width + 60 : -60;
        this.natasha = new NatashaGirl(startX, this.cat.y, !enterFromRight, this.worldScale);
        this.natashaTargetX = this.cat.x + (enterFromRight ? 36 : -36) * this.worldScale;
        this.cat.facingRight = enterFromRight;

        this.victoryHearts = [];
        this.victoryPhase = 'walking';
        this.victoryPhaseTimer = 0;

        this.ui.setBossMode(false);
    }

    updateVictoryScene(dt, step) {
        this.jungle.update(step);

        if (this.victoryPhase === 'walking') {
            const dir = this.natashaTargetX > this.natasha.x ? 1 : -1;
            this.natasha.x += dir * 3.4 * this.worldScale * step;
            this.natasha.update(step);

            if (Math.abs(this.natasha.x - this.natashaTargetX) < 6) {
                this.natasha.x = this.natashaTargetX;
                this.victoryPhase = 'hugging';
                this.victoryPhaseTimer = 0;
                this.cat.isHappy = true;
                sound.playMeow();
                this.jungle.addScorePopup(this.cat.x, this.cat.y - 55, '¡MIAU! 💕', '#ff4794');
            }
        } else if (this.victoryPhase === 'hugging') {
            const prevTimer = this.victoryPhaseTimer;
            this.victoryPhaseTimer += dt;
            this.natasha.armRaise = Math.min(1, this.victoryPhaseTimer * 2);
            this.natasha.update(step * 0.25);

            if (Math.floor(this.victoryPhaseTimer * 3) !== Math.floor(prevTimer * 3)) {
                this.spawnVictoryHeart();
            }

            if (this.victoryPhaseTimer >= 3) {
                this.triggerVictory();
            }
        }

        for (let i = this.victoryHearts.length - 1; i >= 0; i--) {
            const h = this.victoryHearts[i];
            h.x += h.vx * step;
            h.y += h.vy * step;
            h.alpha -= 0.012 * step;
            h.scale = Math.min(1.2, h.scale + 0.02 * step);
            if (h.alpha <= 0) this.victoryHearts.splice(i, 1);
        }
    }

    spawnVictoryHeart() {
        const midX = (this.cat.x + this.natasha.x) / 2;
        const midY = this.cat.y - 40;
        const icons = ['💗', '💕', '✨', '💖'];
        this.victoryHearts.push({
            x: midX + (Math.random() - 0.5) * 30,
            y: midY,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -1.2 - Math.random() * 0.8,
            alpha: 1,
            scale: 0.6,
            icon: icons[Math.floor(Math.random() * icons.length)]
        });
    }

    drawVictoryHearts(ctx) {
        if (this.victoryHearts.length === 0) return;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const h of this.victoryHearts) {
            ctx.globalAlpha = Math.max(0, h.alpha);
            ctx.font = `${Math.round(18 * h.scale)}px sans-serif`;
            ctx.fillText(h.icon, h.x, h.y);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    throwCheeseAtBoss() {
        if (!this.boss || this.boss.state === 'DEFEATED' || this.cheeseStock <= 0) return;

        this.cheeseStock--;
        this.ui.updateCheeseStock(this.cheeseStock);

        const dx = this.boss.x - this.cat.x;
        const dy = this.boss.y - this.cat.y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 9 * this.worldScale;

        this.thrownCheeses.push(new ThrownCheese(this.cat.x, this.cat.y, (dx / dist) * speed, (dy / dist) * speed, this.worldScale));
        sound.playPounce();
    }

    catchMouse(mouse, index) {
        this.mice.splice(index, 1);
        this.miceCaught++;
        this.sessionMiceCaught++;

        this.comboCount++;
        this.comboTimer = 2.5;

        const comboMultiplier = Math.min(4, 1 + (this.comboCount - 1) * 0.5);
        const earnedPoints = Math.round(mouse.points * comboMultiplier);
        this.score += earnedPoints;
        this.levelScore += earnedPoints;

        sound.playCatch();
        vibrate(VIBRATION_PATTERNS.catch);
        this.jungle.addCatchParticles(mouse.x, mouse.y, mouse.config.color);
        this.jungle.addScorePopup(mouse.x, mouse.y, `+${earnedPoints}`, mouse.type === 'GOLDEN' ? '#fbbf24' : '#ffffff');

        if (this.comboCount > 1) {
            this.ui.showCombo(this.comboCount);
        }

        if (mouse.type === 'GOLDEN') {
            this.cat.activateCatnip(240);
        } else if (mouse.type === 'CHEESE') {
            this.cheeses.push(new CheeseDrop(mouse.x, mouse.y, this.worldScale));
        }

        this.checkMilestones();

        setTimeout(() => {
            if (this.state === GAME_STATES.PLAYING) {
                this.spawnMouse();
            }
        }, 1200);
    }

    checkMilestones() {
        if (this.sessionMiceCaught > 0 && this.sessionMiceCaught % 5 === 0) {
            this.ui.addHairballs(5);
            this.cat.activateMagnet();
            this.ui.showMilestone(`🐭 ¡${this.sessionMiceCaught} RATONES! +5 🧶`);
        }

        if (this.comboCount > this.sessionBestCombo) {
            this.sessionBestCombo = this.comboCount;
            if (this.comboCount >= 3) {
                this.ui.addHairballs(8);
                this.cat.activateCatnip(300);
                this.ui.showMilestone(`🔥 ¡NUEVO RÉCORD DE COMBO x${this.comboCount}! +8 🧶`);
            }
        }
    }

    computeHairballs(scoreAmount) {
        return Math.max(1, Math.round(scoreAmount / 150));
    }

    triggerLevelClear() {
        this.state = GAME_STATES.LEVEL_CLEAR;
        sound.stopMusic();
        const timeBonus = Math.round(this.timer * 50);
        this.score += timeBonus;
        const hairballsEarned = this.computeHairballs(this.levelScore + timeBonus);

        this.ui.showLevelClear({
            miceCaught: this.miceCaught,
            levelScore: this.levelScore,
            timeBonus: timeBonus,
            totalScore: this.score,
            hairballsEarned: hairballsEarned
        });
    }

    triggerGameOver() {
        this.state = GAME_STATES.GAME_OVER;
        sound.stopMusic();
        const hairballsEarned = this.computeHairballs(this.levelScore);
        this.ui.showGameOver({
            miceCaught: this.miceCaught,
            totalScore: this.score,
            hairballsEarned: hairballsEarned
        });
    }

    triggerVictory() {
        this.state = GAME_STATES.VICTORY;
        this.score += 500;
        const hairballsEarned = this.computeHairballs(this.levelScore) + 50;
        this.ui.setBossMode(false);
        const newTrophy = this.ui.unlockTrophyAccessory('champion_crown');

        this.ui.showVictory({
            totalScore: this.score,
            hairballsEarned: hairballsEarned,
            newTrophy: newTrophy
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.jungle.drawBackground(this.ctx);

        for (const cheese of this.cheeses) {
            cheese.draw(this.ctx);
        }

        this.jungle.drawMidground(this.ctx);

        for (const mouse of this.mice) {
            mouse.draw(this.ctx);
        }

        if (this.boss) {
            this.boss.draw(this.ctx);
        }

        this.cat.draw(this.ctx);

        if (this.natasha) {
            this.natasha.draw(this.ctx);
        }

        for (const tc of this.thrownCheeses) {
            tc.draw(this.ctx);
        }

        this.drawVictoryHearts(this.ctx);

        this.jungle.drawForeground(this.ctx);
    }
}

// Inicialización infalible (Auto-ejecución sin importar el ciclo de carga del navegador)
function bootPinkCatGame() {
    if (!window.pinkCatGameInstance) {
        window.pinkCatGameInstance = new GameEngine();
    }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bootPinkCatGame();
} else {
    window.addEventListener('DOMContentLoaded', bootPinkCatGame);
    window.addEventListener('load', bootPinkCatGame);
}

// Registro del Service Worker (PWA instalable). Solo funciona si el juego se
// sirve por http/https (ej. un servidor local o publicado en internet); en
// file:// (doble clic) el navegador ignora esto sin errores y el juego
// sigue funcionando normal, simplemente sin opción de "instalar".
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            // Silenciosamente ignorado: el juego funciona igual sin PWA.
        });
    });
}
