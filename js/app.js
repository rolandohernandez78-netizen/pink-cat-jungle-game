/* ==========================================================================
   EL GATO ROSADO EN LA SELVA 🐱🌴 - GAME ENGINE (STANDALONE & AUTO-RUN)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. MÓDULO DE AUDIO SINTÉTICO (WEB AUDIO API)
// --------------------------------------------------------------------------
class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 26;
        
        this.baseSpeed = 4.2;
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
        this.magnetRadius = 180;
        
        this.inMud = false;
    }

    update(keys, touchVector, canvasWidth, canvasHeight) {
        if (this.pounceCooldown > 0) this.pounceCooldown--;

        if (this.catnipActive) {
            this.catnipTimer--;
            if (this.catnipTimer <= 0) {
                this.catnipActive = false;
            }
        }

        if (this.magnetActive) {
            this.magnetTimer--;
            if (this.magnetTimer <= 0) {
                this.magnetActive = false;
            }
        }

        let currentSpeed = this.baseSpeed;
        if (this.catnipActive) currentSpeed *= 1.65;
        if (this.inMud) currentSpeed *= 0.45;

        this.speed = currentSpeed;

        if (this.isPouncing) {
            this.pounceProgress++;
            this.x += this.pounceVx * 1.8;
            this.y += this.pounceVy * 1.8;

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

            this.x += this.vx;
            this.y += this.vy;
        }

        const margin = this.radius;
        this.x = Math.max(margin, Math.min(canvasWidth - margin, this.x));
        this.y = Math.max(margin + 50, Math.min(canvasHeight - margin - 20, this.y));

        if (this.isMoving || this.isPouncing) {
            const walkSpeed = this.catnipActive ? 0.35 : 0.22;
            this.walkCycle = (this.walkCycle + walkSpeed) % (Math.PI * 2);
        } else {
            this.walkCycle = 0;
        }

        this.tailAngle = Math.sin(Date.now() * 0.005) * 0.35;

        this.blinkTimer++;
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
        if (this.isBlinking) {
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
    constructor(x, y, config = MOUSE_TYPES.STANDARD) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.radius = config.radius;
        this.speed = config.speed;
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

    update(cat, canvasWidth, canvasHeight, bushes = [], cheeses = []) {
        this.squeakTimer--;
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
                this.changeDirectionTimer--;
                if (this.changeDirectionTimer <= 0) {
                    this.angle += (Math.random() - 0.5) * 1.5;
                    this.vx = Math.cos(this.angle) * this.speed;
                    this.vy = Math.sin(this.angle) * this.speed;
                    this.changeDirectionTimer = Math.floor(60 + Math.random() * 120);
                }
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.vx > 0.1) this.facingRight = true;
        if (this.vx < -0.1) this.facingRight = false;

        const margin = this.radius + 10;
        if (this.x < margin) { this.x = margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.x > canvasWidth - margin) { this.x = canvasWidth - margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.y < margin + 50) { this.y = margin + 50; this.vy *= -1; this.angle = -this.angle; }
        if (this.y > canvasHeight - margin - 20) { this.y = canvasHeight - margin - 20; this.vy *= -1; this.angle = -this.angle; }

        this.scuttleCycle = (this.scuttleCycle + 0.35) % (Math.PI * 2);
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.lifetime = 420;
    }

    update() {
        this.lifetime--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

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
// 4. RENDERIZADO DE LA SELVA (JUNGLE ENVIRONMENT)
// --------------------------------------------------------------------------
class JungleEnvironment {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;

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

    generateTerrain() {
        this.trees = [];
        this.bushes = [];
        this.mudPuddles = [];
        this.spores = [];
        this.butterflies = [];

        const treeCount = Math.floor(this.width / 180) + 2;
        for (let i = 0; i < treeCount; i++) {
            this.trees.push({
                x: i * 200 + (Math.random() * 80 - 40),
                y: Math.random() * 80,
                trunkWidth: 40 + Math.random() * 30,
                crownRadius: 90 + Math.random() * 50
            });
        }

        const bushCount = Math.floor((this.width * this.height) / 120000) + 3;
        for (let i = 0; i < bushCount; i++) {
            this.bushes.push({
                x: 100 + Math.random() * (this.width - 200),
                y: 120 + Math.random() * (this.height - 240),
                radius: 38 + Math.random() * 25,
                color: Math.random() > 0.5 ? '#15803d' : '#166534'
            });
        }

        const mudCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < mudCount; i++) {
            this.mudPuddles.push({
                x: 120 + Math.random() * (this.width - 240),
                y: 140 + Math.random() * (this.height - 280),
                rx: 40 + Math.random() * 25,
                ry: 24 + Math.random() * 15
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
            radius: 16,
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

    update() {
        for (const spore of this.spores) {
            spore.y += spore.speedY;
            spore.x += spore.speedX;
            spore.alpha += (Math.random() - 0.5) * 0.05;
            if (spore.alpha < 0.2) spore.alpha = 0.2;
            if (spore.alpha > 0.9) spore.alpha = 0.9;

            if (spore.y < 0) {
                spore.y = this.height;
                spore.x = Math.random() * this.width;
            }
        }

        for (const b of this.butterflies) {
            b.x += b.vx;
            b.y += b.vy;
            b.wingCycle += 0.2;

            if (Math.random() < 0.03) {
                b.vx = (Math.random() - 0.5) * 1.8;
                b.vy = (Math.random() - 0.5) * 1.8;
            }

            if (b.x < 0 || b.x > this.width) b.vx *= -1;
            if (b.y < 0 || b.y > this.height) b.vy *= -1;
        }

        for (let i = this.catnipItems.length - 1; i >= 0; i--) {
            const item = this.catnipItems[i];
            item.rotation += 0.03;
            item.duration--;
            if (item.duration <= 0) {
                this.catnipItems.splice(i, 1);
            }
        }

        for (let i = this.catchParticles.length - 1; i >= 0; i--) {
            const p = this.catchParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.035;
            if (p.alpha <= 0) {
                this.catchParticles.splice(i, 1);
            }
        }

        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            popup.y += popup.vy;
            popup.alpha -= 0.02;
            popup.scale = Math.max(1, popup.scale - 0.015);
            if (popup.alpha <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
    }

    drawBackground(ctx) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#0a2318');
        bgGrad.addColorStop(0.5, '#0e3322');
        bgGrad.addColorStop(1, '#06170f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.fillStyle = 'rgba(253, 224, 71, 0.04)';
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

        ctx.fillStyle = '#061e14';
        for (const tree of this.trees) {
            ctx.fillRect(tree.x, tree.y, tree.trunkWidth, this.height);
            ctx.beginPath();
            ctx.arc(tree.x + tree.trunkWidth / 2, tree.y + 40, tree.crownRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        for (const mud of this.mudPuddles) {
            ctx.beginPath();
            ctx.ellipse(mud.x, mud.y, mud.rx, mud.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#3f2212';
            ctx.fill();
            ctx.strokeStyle = '#542f19';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#6b3d22';
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
// 5. GESTOR DE INTERFAZ DE USUARIO (UI MANAGER)
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

        this.btnSound = document.getElementById('btn-sound');
        this.btnHomeHud = document.getElementById('btn-home-hud');
        this.btnPause = document.getElementById('btn-pause');
        
        this.highScore = parseInt(localStorage.getItem('pink_cat_high_score') || '0', 10);
        this.updateStartHighScoreDisplay();

        this.bindEvents();
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

        this.setupTouchControls();
    }

    setupTouchControls() {
        const pounceBtn = document.getElementById('btn-touch-pounce');
        if (pounceBtn) {
            pounceBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.callbacks.onPounce();
            });
        }
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
        if (this.hud) this.hud.classList.add('hidden');
        if (this.touchControls) this.touchControls.classList.add('hidden');
    }

    showHUD(isMobile = false) {
        if (this.screenStart) this.screenStart.classList.add('hidden');
        if (this.screenPause) this.screenPause.classList.add('hidden');
        if (this.screenLevelClear) this.screenLevelClear.classList.add('hidden');
        if (this.screenGameOver) this.screenGameOver.classList.add('hidden');
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

        if (miceEl) miceEl.textContent = stats.miceCaught;
        if (scoreEl) scoreEl.textContent = stats.levelScore.toLocaleString();
        if (bonusEl) bonusEl.textContent = `+${stats.timeBonus.toLocaleString()}`;
        if (totalEl) totalEl.textContent = stats.totalScore.toLocaleString();

        if (this.screenLevelClear) this.screenLevelClear.classList.remove('hidden');
        sound.playLevelClear();
    }

    showGameOver(stats) {
        const miceEl = document.getElementById('go-stat-mice');
        const scoreEl = document.getElementById('go-stat-score');

        if (miceEl) miceEl.textContent = stats.miceCaught;
        if (scoreEl) scoreEl.textContent = stats.totalScore.toLocaleString();

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
    GAME_OVER: 'GAME_OVER'
};

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

        this.cat = new PinkCat(this.width / 2, this.height / 2);
        this.mice = [];
        this.cheeses = [];
        this.jungle = new JungleEnvironment(this.width, this.height);

        this.keys = {};
        this.touchVector = { active: false, x: 0, y: 0 };
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.ui = new UIManager({
            onStartGame: (mode) => this.startGame(mode),
            onTogglePause: () => this.togglePause(),
            onRestartLevel: () => this.restartLevel(),
            onNextLevel: () => this.nextLevel(),
            onGoToMainMenu: () => this.goToMainMenu(),
            onPounce: () => this.cat.pounce()
        });

        this.bindEvents();
        this.setupVirtualJoystick();

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth || document.documentElement.clientWidth || 800;
            this.height = window.innerHeight || document.documentElement.clientHeight || 600;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.jungle.resize(this.width, this.height);
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
        this.initLevel();
        this.state = GAME_STATES.PLAYING;
        this.ui.showHUD(this.isMobile);
        sound.playMeow();
    }

    initLevel() {
        this.levelScore = 0;
        this.miceCaught = 0;
        this.comboCount = 0;

        if (this.mode === 'adventure') {
            this.miceTarget = 10 + this.currentLevel * 5;
            this.timer = Math.max(35, 65 - this.currentLevel * 3);
        } else {
            this.miceTarget = -1;
            this.timer = 90;
        }

        this.cat = new PinkCat(this.width / 2, this.height / 2);
        this.mice = [];
        this.cheeses = [];
        this.jungle.catnipItems = [];

        const initialMiceCount = Math.min(18, 7 + this.currentLevel * 2);
        for (let i = 0; i < initialMiceCount; i++) {
            this.spawnMouse();
        }

        this.jungle.spawnCatnip(
            150 + Math.random() * (this.width - 300),
            150 + Math.random() * (this.height - 300)
        );
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

        this.mice.push(new JungleMouse(x, y, mouseConfig));
    }

    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            this.ui.showPauseScreen();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.ui.hidePauseScreen();
        }
    }

    restartLevel() {
        this.initLevel();
        this.state = GAME_STATES.PLAYING;
        this.ui.showHUD(this.isMobile);
    }

    nextLevel() {
        this.currentLevel++;
        this.initLevel();
        this.state = GAME_STATES.PLAYING;
        this.ui.showHUD(this.isMobile);
        sound.playMeow();
    }

    goToMainMenu() {
        this.state = GAME_STATES.START;
        this.ui.showStartScreen();
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state === GAME_STATES.PLAYING) {
            this.update(dt);
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
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

        this.cat.update(this.keys, this.touchVector, this.width, this.height);
        this.jungle.update();

        for (let i = this.cheeses.length - 1; i >= 0; i--) {
            const cheese = this.cheeses[i];
            cheese.update();
            if (cheese.lifetime <= 0) {
                this.cheeses.splice(i, 1);
            }
        }

        for (let i = this.mice.length - 1; i >= 0; i--) {
            const mouse = this.mice[i];
            mouse.update(this.cat, this.width, this.height, this.jungle.bushes, this.cheeses);

            const dist = Math.hypot(this.cat.x - mouse.x, this.cat.y - mouse.y);
            const catchDistance = this.cat.radius + mouse.radius + (this.cat.isPouncing ? 16 : 0);

            if (dist < catchDistance) {
                this.catchMouse(mouse, i);
            }
        }

        for (let i = this.jungle.catnipItems.length - 1; i >= 0; i--) {
            const item = this.jungle.catnipItems[i];
            if (Math.hypot(this.cat.x - item.x, this.cat.y - item.y) < this.cat.radius + item.radius) {
                this.cat.activateCatnip();
                this.jungle.catnipItems.splice(i, 1);
                this.jungle.addScorePopup(item.x, item.y, '¡SUPER VELOCIDAD!', '#22c55e');
            }
        }

        if (this.mice.length < 10) {
            this.spawnMouse();
        }

        if (this.mode === 'adventure' && this.miceCaught >= this.miceTarget) {
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
    }

    catchMouse(mouse, index) {
        this.mice.splice(index, 1);
        this.miceCaught++;

        this.comboCount++;
        this.comboTimer = 2.5;

        const comboMultiplier = Math.min(4, 1 + (this.comboCount - 1) * 0.5);
        const earnedPoints = Math.round(mouse.points * comboMultiplier);
        this.score += earnedPoints;
        this.levelScore += earnedPoints;

        sound.playCatch();
        this.jungle.addCatchParticles(mouse.x, mouse.y, mouse.config.color);
        this.jungle.addScorePopup(mouse.x, mouse.y, `+${earnedPoints}`, mouse.type === 'GOLDEN' ? '#fbbf24' : '#ffffff');

        if (this.comboCount > 1) {
            this.ui.showCombo(this.comboCount);
        }

        if (mouse.type === 'GOLDEN') {
            this.cat.activateCatnip(240);
        } else if (mouse.type === 'CHEESE') {
            this.cheeses.push(new CheeseDrop(mouse.x, mouse.y));
        }

        setTimeout(() => {
            if (this.state === GAME_STATES.PLAYING) {
                this.spawnMouse();
            }
        }, 1200);
    }

    triggerLevelClear() {
        this.state = GAME_STATES.LEVEL_CLEAR;
        const timeBonus = Math.round(this.timer * 50);
        this.score += timeBonus;

        this.ui.showLevelClear({
            miceCaught: this.miceCaught,
            levelScore: this.levelScore,
            timeBonus: timeBonus,
            totalScore: this.score
        });
    }

    triggerGameOver() {
        this.state = GAME_STATES.GAME_OVER;
        this.ui.showGameOver({
            miceCaught: this.miceCaught,
            totalScore: this.score
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

        this.cat.draw(this.ctx);

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
