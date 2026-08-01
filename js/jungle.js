/* ==========================================================================
   RENDERIZADO DE LA SELVA TROPICAL (JUNGLE ENVIRONMENT & PARTICLES)
   ========================================================================== */

export class JungleEnvironment {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;

        // Elementos estáticos de la selva
        this.trees = [];
        this.bushes = [];
        this.mudPuddles = [];
        this.catnipItems = [];

        // Partículas atmosféricas
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

        // Generar árboles gigantescos de fondo
        const treeCount = Math.floor(this.width / 180) + 2;
        for (let i = 0; i < treeCount; i++) {
            this.trees.push({
                x: i * 200 + (Math.random() * 80 - 40),
                y: Math.random() * 80,
                trunkWidth: 40 + Math.random() * 30,
                crownRadius: 90 + Math.random() * 50
            });
        }

        // Generar arbustos selváticos (donde los ratones intentan esconderse)
        const bushCount = Math.floor((this.width * this.height) / 120000) + 3;
        for (let i = 0; i < bushCount; i++) {
            this.bushes.push({
                x: 100 + Math.random() * (this.width - 200),
                y: 120 + Math.random() * (this.height - 240),
                radius: 38 + Math.random() * 25,
                color: Math.random() > 0.5 ? '#15803d' : '#166534'
            });
        }

        // Generar charcos de barro (ralentizan al gato rosado)
        const mudCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < mudCount; i++) {
            this.mudPuddles.push({
                x: 120 + Math.random() * (this.width - 240),
                y: 140 + Math.random() * (this.height - 280),
                rx: 40 + Math.random() * 25,
                ry: 24 + Math.random() * 15
            });
        }

        // Generar esporas brillantes flotando en la selva
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

        // Generar mariposas tropicales
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

    // Agregar ítem de Hierba Gatuna (Powerup)
    spawnCatnip(x, y) {
        this.catnipItems.push({
            x: x,
            y: y,
            radius: 16,
            rotation: 0,
            duration: 600 // 10 segundos antes de desaparecer
        });
    }

    // Crear estallido de partículas al atrapar un ratón
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

    // Agregar popup flotante de texto de puntos (+100, ¡COMBO!)
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
        // Actualizar esporas flotantes
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

        // Actualizar mariposas
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

        // Actualizar ítems de Hierba Gatuna
        for (let i = this.catnipItems.length - 1; i >= 0; i--) {
            const item = this.catnipItems[i];
            item.rotation += 0.03;
            item.duration--;
            if (item.duration <= 0) {
                this.catnipItems.splice(i, 1);
            }
        }

        // Actualizar partículas de captura
        for (let i = this.catchParticles.length - 1; i >= 0; i--) {
            const p = this.catchParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.035;
            if (p.alpha <= 0) {
                this.catchParticles.splice(i, 1);
            }
        }

        // Actualizar popups de puntos
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

    // Dibujar Fondo & Paralaje de la Selva
    drawBackground(ctx) {
        // Gradient Selvático Profundo
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#0a2318');
        bgGrad.addColorStop(0.5, '#0e3322');
        bgGrad.addColorStop(1, '#06170f');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Rayos de Sol Celestiales entre el follaje (Sunbeams)
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

        // Troncos de árboles lejanos
        ctx.fillStyle = '#061e14';
        for (const tree of this.trees) {
            ctx.fillRect(tree.x, tree.y, tree.trunkWidth, this.height);
            ctx.beginPath();
            ctx.arc(tree.x + tree.trunkWidth / 2, tree.y + 40, tree.crownRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Charcos de Barro
        for (const mud of this.mudPuddles) {
            ctx.beginPath();
            ctx.ellipse(mud.x, mud.y, mud.rx, mud.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#3f2212'; // Barro marrón selvático
            ctx.fill();
            ctx.strokeStyle = '#542f19';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Burbujitas en el barro
            ctx.fillStyle = '#6b3d22';
            ctx.beginPath();
            ctx.arc(mud.x - mud.rx * 0.3, mud.y - 2, 4, 0, Math.PI * 2);
            ctx.arc(mud.x + mud.rx * 0.2, mud.y + 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Dibujar Vegetación de Capa Media (Arbustos & Catnip)
    drawMidground(ctx) {
        // Arbustos tropicales frondosos
        for (const bush of this.bushes) {
            ctx.save();
            ctx.translate(bush.x, bush.y);

            // Sombra de arbusto
            ctx.beginPath();
            ctx.ellipse(0, bush.radius * 0.7, bush.radius * 1.1, bush.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();

            // Hojas del arbusto (Múltiples círculos superpuestos)
            ctx.fillStyle = bush.color;
            ctx.beginPath(); ctx.arc(-bush.radius * 0.4, 0, bush.radius * 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(bush.radius * 0.4, 0, bush.radius * 0.75, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, -bush.radius * 0.4, bush.radius * 0.85, 0, Math.PI * 2); ctx.fill();

            // Flores exóticas en arbustos
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath(); ctx.arc(0, -bush.radius * 0.3, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#facc15';
            ctx.beginPath(); ctx.arc(0, -bush.radius * 0.3, 2, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        }

        // Ítems de Hierba Gatuna (Catnip Powerup en el mapa)
        for (const item of this.catnipItems) {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);

            // Aura de luz rosada-verde
            ctx.beginPath();
            ctx.arc(0, 0, item.radius + 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
            ctx.fill();

            // Planta de Hierba Gatuna (Hojas verdes brillantes con florecitas)
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

    // Dibujar Capa Superior (Partículas, Esporas, Mariposas, Textos)
    drawForeground(ctx) {
        // Esporas brillantes
        for (const spore of this.spores) {
            ctx.beginPath();
            ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 243, 208, ${spore.alpha})`;
            ctx.fill();
        }

        // Mariposas
        for (const b of this.butterflies) {
            ctx.save();
            ctx.translate(b.x, b.y);
            const wingWidth = Math.abs(Math.sin(b.wingCycle)) * 9 + 2;

            ctx.fillStyle = b.color;
            // Ala izquierda
            ctx.beginPath(); ctx.ellipse(-wingWidth / 2, 0, wingWidth / 2, 6, -0.2, 0, Math.PI * 2); ctx.fill();
            // Ala derecha
            ctx.beginPath(); ctx.ellipse(wingWidth / 2, 0, wingWidth / 2, 6, 0.2, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        }

        // Partículas de Captura
        for (const p of this.catchParticles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Textos emergentes de puntos (+100, ¡COMBO!)
        ctx.font = "900 22px 'Fredoka One', sans-serif";
        ctx.textAlign = 'center';
        for (const popup of this.scorePopups) {
            ctx.save();
            ctx.translate(popup.x, popup.y);
            ctx.scale(popup.scale, popup.scale);
            ctx.globalAlpha = Math.max(0, popup.alpha);

            // Borde oscuro del texto
            ctx.strokeStyle = '#040f0a';
            ctx.lineWidth = 4;
            ctx.strokeText(popup.text, 0, 0);

            // Relleno de color
            ctx.fillStyle = popup.color;
            ctx.fillText(popup.text, 0, 0);

            ctx.restore();
        }
    }
}
