/* ==========================================================================
   MOTOR PRINCIPAL DEL JUEGO (GAME ENGINE & LOOP)
   ========================================================================== */

import { PinkCat } from './cat.js';
import { JungleMouse, MOUSE_TYPES, CheeseDrop } from './mouse.js';
import { JungleEnvironment } from './jungle.js';
import { UIManager } from './ui.js';
import { sound } from './audio.js';

export const GAME_STATES = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    LEVEL_CLEAR: 'LEVEL_CLEAR',
    GAME_OVER: 'GAME_OVER'
};

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.state = GAME_STATES.START;
        this.mode = 'adventure'; // 'adventure' o 'endless'

        // Nivel & Puntuación
        this.currentLevel = 1;
        this.score = 0;
        this.levelScore = 0;
        this.miceCaught = 0;
        this.miceTarget = 15;
        this.timer = 60; // segundos
        this.comboCount = 0;
        this.comboTimer = 0;

        // Entidades
        this.cat = new PinkCat(this.width / 2, this.height / 2);
        this.mice = [];
        this.cheeses = [];
        this.jungle = new JungleEnvironment(this.width, this.height);

        // Control de Entradas
        this.keys = {};
        this.touchVector = { active: false, x: 0, y: 0 };
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Gestor de UI
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

        // Iniciar Bucle del Juego
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.jungle.resize(this.width, this.height);
        });

        // Teclado
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Tecla Espacio para Abalanzarse / Salto
            if (e.code === 'Space' && this.state === GAME_STATES.PLAYING) {
                e.preventDefault();
                this.cat.pounce();
            }

            // Tecla P o Esc para Pausa
            if ((e.code === 'KeyP' || e.code === 'Escape') && (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED)) {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Clic / Tap directo en Canvas para Abalanzarse
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
            this.miceTarget = -1; // Infinito
            this.timer = 90;
        }

        // Posicionar al Gato Rosado en el centro
        this.cat = new PinkCat(this.width / 2, this.height / 2);
        this.mice = [];
        this.cheeses = [];
        this.jungle.catnipItems = [];

        // Engendrar ratones iniciales según el nivel
        const initialMiceCount = Math.min(18, 7 + this.currentLevel * 2);
        for (let i = 0; i < initialMiceCount; i++) {
            this.spawnMouse();
        }

        // Engendrar ítem de Hierba Gatuna inicial
        this.jungle.spawnCatnip(
            150 + Math.random() * (this.width - 300),
            150 + Math.random() * (this.height - 300)
        );
    }

    spawnMouse() {
        const margin = 100;
        const x = margin + Math.random() * (this.width - margin * 2);
        const y = margin + Math.random() * (this.height - margin * 2);

        // Elegir tipo de ratón con probabilidades según nivel
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

    // --- BUCLE PRINCIPAL (GAMELOOP) ---
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
        // Temporizador de Nivel
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

        // Temporizador de Combo
        if (this.comboCount > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        // Verificar si el gato está en barro
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

        // Actualizar Entidades
        this.cat.update(this.keys, this.touchVector, this.width, this.height);
        this.jungle.update();

        // Actualizar Quesos
        for (let i = this.cheeses.length - 1; i >= 0; i--) {
            const cheese = this.cheeses[i];
            cheese.update();
            if (cheese.lifetime <= 0) {
                this.cheeses.splice(i, 1);
            }
        }

        // Actualizar Ratones & Detectar Colisión con Gato Rosado
        for (let i = this.mice.length - 1; i >= 0; i--) {
            const mouse = this.mice[i];
            mouse.update(this.cat, this.width, this.height, this.jungle.bushes, this.cheeses);

            // Colisión con Gato Rosado (Captura)
            const dist = Math.hypot(this.cat.x - mouse.x, this.cat.y - mouse.y);
            const catchDistance = this.cat.radius + mouse.radius + (this.cat.isPouncing ? 16 : 0);

            if (dist < catchDistance) {
                this.catchMouse(mouse, i);
            }
        }

        // Colisión con Hierba Gatuna (Powerup)
        for (let i = this.jungle.catnipItems.length - 1; i >= 0; i--) {
            const item = this.jungle.catnipItems[i];
            if (Math.hypot(this.cat.x - item.x, this.cat.y - item.y) < this.cat.radius + item.radius) {
                this.cat.activateCatnip();
                this.jungle.catnipItems.splice(i, 1);
                this.jungle.addScorePopup(item.x, item.y, '¡SUPER VELOCIDAD!', '#22c55e');
            }
        }

        // Mantener población de ratones en la selva
        if (this.mice.length < 10) {
            this.spawnMouse();
        }

        // Condición de Victoria en Modo Aventura
        if (this.mode === 'adventure' && this.miceCaught >= this.miceTarget) {
            this.triggerLevelClear();
        }

        // Actualizar HUD
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

        // Sistema de Combos
        this.comboCount++;
        this.comboTimer = 2.5; // 2.5 segundos para encadenar capturas

        const comboMultiplier = Math.min(4, 1 + (this.comboCount - 1) * 0.5);
        const earnedPoints = Math.round(mouse.points * comboMultiplier);
        this.score += earnedPoints;
        this.levelScore += earnedPoints;

        // Sonido y Efectos Visuales
        sound.playCatch();
        this.jungle.addCatchParticles(mouse.x, mouse.y, mouse.config.color);
        this.jungle.addScorePopup(mouse.x, mouse.y, `+${earnedPoints}`, mouse.type === 'GOLDEN' ? '#fbbf24' : '#ffffff');

        if (this.comboCount > 1) {
            this.ui.showCombo(this.comboCount);
        }

        // Recompensas por tipo de ratón
        if (mouse.type === 'GOLDEN') {
            this.cat.activateCatnip(240); // 4 seg de velocidad
        } else if (mouse.type === 'CHEESE') {
            // Dejar queso en el suelo
            this.cheeses.push(new CheeseDrop(mouse.x, mouse.y));
        }

        // Reengendrar un nuevo ratón
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

        // 1. Capa de Fondo (Árboles lejanos, rayos de sol, barro)
        this.jungle.drawBackground(this.ctx);

        // 2. Quesos en el suelo
        for (const cheese of this.cheeses) {
            cheese.draw(this.ctx);
        }

        // 3. Capa Media (Arbustos selváticos y Hierba Gatuna)
        this.jungle.drawMidground(this.ctx);

        // 4. Ratones
        for (const mouse of this.mice) {
            mouse.draw(this.ctx);
        }

        // 5. Gato Rosado (Protagonista)
        this.cat.draw(this.ctx);

        // 6. Capa Superior (Partículas, Esporas, Mariposas, Textos flotantes)
        this.jungle.drawForeground(this.ctx);
    }
}

// Inicializar el juego al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    new GameEngine();
});
