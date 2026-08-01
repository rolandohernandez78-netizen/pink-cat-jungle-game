/* ==========================================================================
   GESTIÓN DE INTERFAZ DE USUARIO (UI & OVERLAYS MANAGER)
   ========================================================================== */

import { sound } from './audio.js';

export class UIManager {
    constructor(callbacks) {
        this.callbacks = callbacks;
        
        // Elementos DOM de pantallas
        this.screenStart = document.getElementById('screen-start');
        this.screenPause = document.getElementById('screen-pause');
        this.screenLevelClear = document.getElementById('screen-level-clear');
        this.screenGameOver = document.getElementById('screen-game-over');
        this.hud = document.getElementById('hud');
        this.touchControls = document.getElementById('touch-controls');

        // Elementos DOM del HUD
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

        // Botones de interfaz
        this.btnSound = document.getElementById('btn-sound');
        this.btnHomeHud = document.getElementById('btn-home-hud');
        this.btnPause = document.getElementById('btn-pause');
        
        this.highScore = parseInt(localStorage.getItem('pink_cat_high_score') || '0', 10);
        this.updateStartHighScoreDisplay();

        this.bindEvents();
    }

    bindEvents() {
        // Botones del Menú Principal
        document.getElementById('btn-mode-adventure').addEventListener('click', () => {
            sound.init();
            this.callbacks.onStartGame('adventure');
        });

        document.getElementById('btn-mode-endless').addEventListener('click', () => {
            sound.init();
            this.callbacks.onStartGame('endless');
        });

        // Botones del HUD (Pausa, Sonido y Menú Principal)
        this.btnPause.addEventListener('click', () => {
            this.callbacks.onTogglePause();
        });

        this.btnHomeHud.addEventListener('click', () => {
            this.callbacks.onGoToMainMenu();
        });

        this.btnSound.addEventListener('click', () => {
            sound.init();
            const isMuted = sound.toggleMute();
            this.btnSound.textContent = isMuted ? '🔇' : '🔊';
        });

        // Botones de Pausa
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.callbacks.onTogglePause();
        });

        document.getElementById('btn-restart-pause').addEventListener('click', () => {
            this.callbacks.onRestartLevel();
        });

        document.getElementById('btn-quit').addEventListener('click', () => {
            this.callbacks.onGoToMainMenu();
        });

        // Botones de Nivel Completado
        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.callbacks.onNextLevel();
        });

        // Botones de Juego Terminado
        document.getElementById('btn-retry').addEventListener('click', () => {
            this.callbacks.onRestartLevel();
        });

        document.getElementById('btn-main-menu-go').addEventListener('click', () => {
            this.callbacks.onGoToMainMenu();
        });

        // Eventos Táctiles (Touch Joystick & Pounce)
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
        this.screenStart.classList.remove('hidden');
        this.screenPause.classList.add('hidden');
        this.screenLevelClear.classList.add('hidden');
        this.screenGameOver.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.touchControls.classList.add('hidden');
    }

    showHUD(isMobile = false) {
        this.screenStart.classList.add('hidden');
        this.screenPause.classList.add('hidden');
        this.screenLevelClear.classList.add('hidden');
        this.screenGameOver.classList.add('hidden');
        this.hud.classList.remove('hidden');

        if (isMobile) {
            this.touchControls.classList.remove('hidden');
        }
    }

    showPauseScreen() {
        this.screenPause.classList.remove('hidden');
    }

    hidePauseScreen() {
        this.screenPause.classList.add('hidden');
    }

    showLevelClear(stats) {
        document.getElementById('stat-mice-caught').textContent = stats.miceCaught;
        document.getElementById('stat-level-score').textContent = stats.levelScore.toLocaleString();
        document.getElementById('stat-time-bonus').textContent = `+${stats.timeBonus.toLocaleString()}`;
        document.getElementById('stat-total-score').textContent = stats.totalScore.toLocaleString();

        this.screenLevelClear.classList.remove('hidden');
        sound.playLevelClear();
    }

    showGameOver(stats) {
        document.getElementById('go-stat-mice').textContent = stats.miceCaught;
        document.getElementById('go-stat-score').textContent = stats.totalScore.toLocaleString();

        const isNewRecord = this.checkHighScore(stats.totalScore);
        const recordTag = document.getElementById('new-high-score-tag');
        if (isNewRecord) {
            recordTag.classList.remove('hidden');
        } else {
            recordTag.classList.add('hidden');
        }

        this.screenGameOver.classList.remove('hidden');
        sound.playGameOver();
    }

    updateHUD(score, miceCaught, miceTarget, timerSeconds, pounceCooldownPct, powerupState) {
        this.scoreText.textContent = score.toLocaleString();
        this.miceCaughtText.textContent = miceCaught;
        this.miceTargetText.textContent = miceTarget > 0 ? miceTarget : '∞';
        this.timerText.textContent = Math.ceil(timerSeconds);

        // Barra de impulso / salto
        const barPct = Math.max(0, Math.min(100, (1 - pounceCooldownPct) * 100));
        this.pounceBarFill.style.width = `${barPct}%`;

        // Badge de Potenciador
        if (powerupState && powerupState.active) {
            this.activePowerupBadge.classList.remove('hidden');
            this.powerupIcon.textContent = powerupState.icon || '🌿';
            this.powerupName.textContent = powerupState.name || '¡POTENCIADOR!';
            this.powerupTimerFill.style.width = `${powerupState.pct * 100}%`;
        } else {
            this.activePowerupBadge.classList.add('hidden');
        }
    }

    showCombo(count) {
        if (count > 1) {
            this.comboText.textContent = `¡COMBO x${count}! 🔥`;
            this.comboBanner.classList.remove('hidden');

            setTimeout(() => {
                this.comboBanner.classList.add('hidden');
            }, 1200);
        }
    }
}
