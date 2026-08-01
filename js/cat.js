/* ==========================================================================
   CLASE DEL GATO ROSADO (PINK CAT ENTITY & ANIMATION)
   ========================================================================== */

import { sound } from './audio.js';

export class PinkCat {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 26; // Radio de colisión principal
        
        // Movimiento & Velocidad
        this.baseSpeed = 4.2;
        this.speed = this.baseSpeed;
        this.vx = 0;
        this.vy = 0;
        this.facingRight = true;
        this.isMoving = false;
        
        // Animaciones
        this.walkCycle = 0; // Ángulo de la fase de caminata (0 a 2*PI)
        this.tailAngle = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;

        // Mecánica de Abalanzarse (Pounce / Salto)
        this.isPouncing = false;
        this.pounceProgress = 0;
        this.pounceDuration = 22; // Frames de la animación de abalanzarse
        this.pounceCooldown = 0;
        this.maxPounceCooldown = 120; // 2 segundos a 60 FPS
        this.pounceVx = 0;
        this.pounceVy = 0;

        // Estados de Potenciadores
        this.catnipActive = false;
        this.catnipTimer = 0;
        this.magnetActive = false;
        this.magnetTimer = 0;
        this.magnetRadius = 180;
        
        // Efecto de Ralentización (Barro)
        this.inMud = false;
    }

    update(keys, touchVector, canvasWidth, canvasHeight) {
        // Cooldowns
        if (this.pounceCooldown > 0) this.pounceCooldown--;

        // Actualizar temporizadores de potenciadores
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

        // Calcular velocidad actual según estados
        let currentSpeed = this.baseSpeed;
        if (this.catnipActive) currentSpeed *= 1.65;
        if (this.inMud) currentSpeed *= 0.45;

        this.speed = currentSpeed;

        // Manejar animación de Abalanzarse (Pounce)
        if (this.isPouncing) {
            this.pounceProgress++;
            this.x += this.pounceVx * 1.8;
            this.y += this.pounceVy * 1.8;

            if (this.pounceProgress >= this.pounceDuration) {
                this.isPouncing = false;
                this.pounceProgress = 0;
            }
        } else {
            // Calcular dirección según entrada de Teclado o Joystick Táctil
            let dx = 0;
            let dy = 0;

            if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
            if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
            if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
            if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

            // Entrada táctil
            if (touchVector.active) {
                dx = touchVector.x;
                dy = touchVector.y;
            }

            // Normalización de vector de movimiento
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

            // Movimiento
            this.x += this.vx;
            this.y += this.vy;
        }

        // Límites de pantalla (Canvas)
        const margin = this.radius;
        this.x = Math.max(margin, Math.min(canvasWidth - margin, this.x));
        this.y = Math.max(margin + 50, Math.min(canvasHeight - margin - 20, this.y));

        // Actualizar ciclos de animación
        if (this.isMoving || this.isPouncing) {
            const walkSpeed = this.catnipActive ? 0.35 : 0.22;
            this.walkCycle = (this.walkCycle + walkSpeed) % (Math.PI * 2);
        } else {
            this.walkCycle = 0;
        }

        // Animación de cola
        this.tailAngle = Math.sin(Date.now() * 0.005) * 0.35;

        // Parpadeo aleatorio de ojos
        this.blinkTimer++;
        if (this.blinkTimer > 180 + Math.random() * 120) {
            this.isBlinking = true;
            if (this.blinkTimer > 195 + Math.random() * 120) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }
    }

    // Activar Salto / Abalanzarse
    pounce() {
        if (this.pounceCooldown === 0 && !this.isPouncing) {
            this.isPouncing = true;
            this.pounceProgress = 0;
            this.pounceCooldown = this.maxPounceCooldown;

            // Determinar dirección del pounce
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

        // Voltear horizontalmente si el gato camina a la izquierda
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // --- EFECTOS VISUALES DE POTENCIADORES ---

        // Aura de Hierba Gatuna (Pink Glow)
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

        // Anillo Magnético Trazado
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

        // Sombra en el suelo
        ctx.beginPath();
        const shadowScale = this.isPouncing ? 0.7 : 1;
        ctx.ellipse(0, 20, 22 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(4, 15, 10, 0.35)';
        ctx.fill();

        // Desplazamiento por Salto (Pounce Height Arc)
        let jumpOffsetY = 0;
        if (this.isPouncing) {
            jumpOffsetY = -Math.sin((this.pounceProgress / this.pounceDuration) * Math.PI) * 28;
        }

        ctx.translate(0, jumpOffsetY);

        // --- DIBUJO PROCEDURAL DEL GATO ROSADO ---

        // 1. Cola Rosa Animada
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

        // Punta de la cola rosa claro
        ctx.beginPath();
        ctx.arc(-26, -10, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9ebb';
        ctx.fill();
        ctx.restore();

        // 2. Patas Caminantes (4 Patas animadas con fase sinoidal)
        const legDistance = 14;
        const frontLegOffset = Math.sin(this.walkCycle) * legDistance;
        const backLegOffset = Math.sin(this.walkCycle + Math.PI) * legDistance;

        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#e63980'; // Tono rosa pata trasera

        // Pata Trasera Izquierda
        ctx.beginPath();
        ctx.moveTo(-10, 6);
        ctx.lineTo(-10 + backLegOffset, 20);
        ctx.stroke();

        // Pata Delantera Izquierda
        ctx.beginPath();
        ctx.moveTo(10, 6);
        ctx.lineTo(10 + frontLegOffset, 20);
        ctx.stroke();

        ctx.strokeStyle = '#ff4794'; // Tono rosa principal

        // Pata Trasera Derecha
        ctx.beginPath();
        ctx.moveTo(-14, 8);
        ctx.lineTo(-14 - backLegOffset, 22);
        ctx.stroke();

        // Pata Delantera Derecha
        ctx.beginPath();
        ctx.moveTo(14, 8);
        ctx.lineTo(14 - frontLegOffset, 22);
        ctx.stroke();

        // Patitas (Huellitas rosaditas claras)
        ctx.fillStyle = '#ffb6d1';
        ctx.beginPath();
        ctx.arc(-14 - backLegOffset, 22, 4, 0, Math.PI * 2);
        ctx.arc(14 - frontLegOffset, 22, 4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Cuerpo Rosado
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4794';
        ctx.fill();

        // Barriga Rosa Claro
        ctx.beginPath();
        ctx.ellipse(2, 4, 13, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb6d1';
        ctx.fill();

        // 4. Cabeza del Gato
        ctx.beginPath();
        ctx.ellipse(14, -10, 16, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4794';
        ctx.fill();

        // Oreja Izquierda
        ctx.beginPath();
        ctx.moveTo(4, -18);
        ctx.lineTo(10, -28);
        ctx.lineTo(16, -18);
        ctx.closePath();
        ctx.fillStyle = '#ff4794';
        ctx.fill();
        // Interior de Oreja
        ctx.beginPath();
        ctx.moveTo(6, -19);
        ctx.lineTo(10, -26);
        ctx.lineTo(14, -19);
        ctx.closePath();
        ctx.fillStyle = '#ff8dc0';
        ctx.fill();

        // Oreja Derecha
        ctx.beginPath();
        ctx.moveTo(16, -18);
        ctx.lineTo(24, -27);
        ctx.lineTo(26, -16);
        ctx.closePath();
        ctx.fillStyle = '#ff4794';
        ctx.fill();
        // Interior de Oreja
        ctx.beginPath();
        ctx.moveTo(18, -19);
        ctx.lineTo(23, -25);
        ctx.lineTo(24, -17);
        ctx.closePath();
        ctx.fillStyle = '#ff8dc0';
        ctx.fill();

        // 5. Ojos Verde Esmeralda Selvático
        if (this.isBlinking) {
            // Ojos cerrados (Líneas felices)
            ctx.beginPath();
            ctx.arc(18, -12, 3, 0.1, Math.PI - 0.1);
            ctx.strokeStyle = '#3d061e';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Ojo Abierto
            ctx.beginPath();
            ctx.ellipse(19, -12, 4.5, 5.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981'; // Verde selvático
            ctx.fill();

            // Pupila negra de gato
            ctx.beginPath();
            ctx.ellipse(19.5, -12, 1.8, 4, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#064e3b';
            ctx.fill();

            // Brillo en el ojo
            ctx.beginPath();
            ctx.arc(18, -14, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        // Nariz Rosadita
        ctx.beginPath();
        ctx.moveTo(25, -9);
        ctx.lineTo(28, -9);
        ctx.lineTo(26.5, -7);
        ctx.closePath();
        ctx.fillStyle = '#ff1e75';
        ctx.fill();

        // Bigotes Blancos Elegantes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;

        // Bigotes superiores e inferiores
        ctx.beginPath();
        ctx.moveTo(27, -8); ctx.lineTo(37, -12);
        ctx.moveTo(27, -7); ctx.lineTo(38, -6);
        ctx.moveTo(27, -6); ctx.lineTo(36, 0);
        ctx.stroke();

        ctx.restore();
    }
}
