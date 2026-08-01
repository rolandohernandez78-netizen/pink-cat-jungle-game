/* ==========================================================================
   CLASES DE RATONES DE LA SELVA (MOUSE AI & CHEESE DROPS)
   ========================================================================== */

import { sound } from './audio.js';

export const MOUSE_TYPES = {
    STANDARD: { type: 'STANDARD', name: 'Ratón Común', color: '#a8a29e', points: 100, speed: 2.5, radius: 14 },
    GOLDEN:   { type: 'GOLDEN',   name: 'Ratón Dorado Veloz', color: '#fbbf24', points: 300, speed: 4.2, radius: 13 },
    SHADOW:   { type: 'SHADOW',   name: 'Ratón Camuflado', color: '#475569', points: 200, speed: 2.8, radius: 14 },
    CHEESE:   { type: 'CHEESE',   name: 'Ratón Quesero', color: '#f97316', points: 150, speed: 2.3, radius: 15 }
};

export class JungleMouse {
    constructor(x, y, config = MOUSE_TYPES.STANDARD) {
        this.x = x;
        this.y = y;
        this.config = config;
        this.radius = config.radius;
        this.speed = config.speed;
        this.points = config.points;
        this.type = config.type;

        // Dirección & Movimiento
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.facingRight = true;

        // Animación de correteo (patitas scuttling)
        this.scuttleCycle = Math.random() * Math.PI * 2;
        this.tailWiggle = 0;
        this.changeDirectionTimer = Math.floor(60 + Math.random() * 90);

        // Habilidades especiales
        this.stealthOpacity = 1;
        this.squeakTimer = Math.floor(180 + Math.random() * 300);
        this.cheeseTimer = this.type === 'CHEESE' ? 180 : 0;
    }

    update(cat, canvasWidth, canvasHeight, bushes = [], cheeses = []) {
        // Sonido ocasional de chido
        this.squeakTimer--;
        if (this.squeakTimer <= 0) {
            const distToCat = Math.hypot(this.x - cat.x, this.y - cat.y);
            if (distToCat < 350) {
                sound.playMouseSqueak();
            }
            this.squeakTimer = Math.floor(240 + Math.random() * 360);
        }

        // --- LÓGICA DE IA & HUIDA ---
        const dxToCat = this.x - cat.x;
        const dyToCat = this.y - cat.y;
        const distToCat = Math.hypot(dxToCat, dyToCat);

        // Si el Imán del Gato está activo
        if (cat.magnetActive && distToCat < cat.magnetRadius) {
            // Ser atraído por el gato
            const magnetPull = 3.5;
            this.vx = (-dxToCat / distToCat) * magnetPull;
            this.vy = (-dyToCat / distToCat) * magnetPull;
        } else if (distToCat < 180) {
            // Huir asustado del gato rosado
            const fleeSpeed = this.speed * 1.45;
            this.vx = (dxToCat / distToCat) * fleeSpeed;
            this.vy = (dyToCat / distToCat) * fleeSpeed;
        } else {
            // Buscar queso cercano si existe
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

            // Si no hay queso, vagar orgánicamente por la selva
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

        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;

        if (this.vx > 0.1) this.facingRight = true;
        if (this.vx < -0.1) this.facingRight = false;

        // Rebotes en bordes de pantalla
        const margin = this.radius + 10;
        if (this.x < margin) { this.x = margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.x > canvasWidth - margin) { this.x = canvasWidth - margin; this.vx *= -1; this.angle = Math.PI - this.angle; }
        if (this.y < margin + 50) { this.y = margin + 50; this.vy *= -1; this.angle = -this.angle; }
        if (this.y > canvasHeight - margin - 20) { this.y = canvasHeight - margin - 20; this.vy *= -1; this.angle = -this.angle; }

        // Animaciones
        this.scuttleCycle = (this.scuttleCycle + 0.35) % (Math.PI * 2);
        this.tailWiggle = Math.sin(Date.now() * 0.015) * 0.4;

        // Habilidad Ratón Ninja Camuflado (Transparencia en arbustos)
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

        // Resplandor si es Ratón Dorado
        if (this.type === 'GOLDEN') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
            ctx.fill();
        }

        // Sombra de ratoncito
        ctx.beginPath();
        ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        // 1. Cola de ratón rosadita
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.quadraticCurveTo(-18, -6 + this.tailWiggle * 5, -24, 0);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2. Patitas rápidas (4 patitas correteando)
        const legOffset = Math.sin(this.scuttleCycle) * 6;
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 6); ctx.lineTo(-6 + legOffset, 11);
        ctx.moveTo(4, 6); ctx.lineTo(4 - legOffset, 11);
        ctx.stroke();

        // 3. Cuerpo de Ratón
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.config.color;
        ctx.fill();

        // 4. Orejota de Ratón
        ctx.beginPath();
        ctx.arc(-2, -8, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = this.config.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-2, -8, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6'; // Centro rosa de la oreja
        ctx.fill();

        // 5. Ojo negro brillante
        ctx.beginPath();
        ctx.arc(6, -3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5.5, -3.5, 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 6. Naricita rosada y bigotitos
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

// Clase para trozos de Queso dejados en el suelo
export class CheeseDrop {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.lifetime = 420; // 7 segundos de duración
    }

    update() {
        this.lifetime--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Resplandor delicioso de queso
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.fill();

        // Cuña de queso
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

        // Agujeros de queso suizo
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath(); ctx.arc(-2, 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(3, -2, 1.5, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }
}
