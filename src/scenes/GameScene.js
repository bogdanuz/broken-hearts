import Phaser from 'phaser';
import { getMusicOn, getSfxOn } from '../utils/soundPrefs.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    const musicOn = getMusicOn();
    this.sfxOn = getSfxOn();

    // Меню-музыку всегда гасим при входе в игру
    this.sound.stopByKey('music_menu');

    if (musicOn && this.cache.audio.exists('music_game')) {
      this.sound.stopByKey('music_win');
      this.sound.stopByKey('music_gameover');
      if (!this.sound.get('music_game')) {
        this.sound.play('music_game', { loop: true, volume: 0.8 });
      }
    }

    // --- Фон комнаты ---
    if (this.textures.exists('bg_room')) {
      this.add.image(width / 2, height / 2, 'bg_room').setOrigin(0.5).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    }

    const cx = width / 2;
    const lampTopY = 62;

    // --- Тарас на люстре (idle-анимация; люстра нарисована на bg_room) ---
    const tarasW = 144;
    const tarasH = 216;
    this.tarasX = width / 2;
    this.tarasY = lampTopY;
    this.tarasSprite = this.add.sprite(this.tarasX, this.tarasY, 'taras_idle');
    this.tarasSprite.setOrigin(0.5, 0).setDepth(5);
    if (this.anims.get('taras_idle')) this.tarasSprite.anims.play('taras_idle', true);

    // --- Пол ---
    this.floorY = height - 60;
    if (this.textures.exists('floor')) {
      this.add.image(width / 2, height - 30, 'floor').setOrigin(0.5).setDepth(1);
    } else {
      this.add.rectangle(width / 2, height - 30, width, 60, 0x2d2d44).setDepth(1);
    }

    const katyaW = 144;
    const katyaH = 216;
    const katyaY = this.floorY;
    const margin = 0;
    this.katyaX = width / 2;
    this.katyaSpeed = 320;

    // --- Катя (спрайт: idle / run_left / run_right) ---
    this.katyaSprite = this.add.sprite(this.katyaX, katyaY, 'katya_idle');
    this.katyaSprite.setOrigin(0.5, 1).setDepth(10);
    this.katyaCatchPlaying = false;

    this.catchZoneW = 72;
    this.catchZoneH = 36;
    this.catchZoneY = katyaY - katyaH / 2 - 18;

    // --- Сердца: 30 за раунд; респаун и падение случайные; иногда два подряд ---
    this.hearts = this.add.group();
    this.heartSize = 48;
    this.spawnY = this.tarasY + 80;
    this.heartGravity = 420;
    this.totalHearts = 30;
    this.spawnDelayFirst = 1250;
    this.spawnDelayLast = 300;
    this.spawnDoubleChance = 0.05; // вероятность «два подряд» — следующее сердце почти сразу (0–100 мс)
    this.caughtCount = 0;
    this.resolvedCount = 0;
    this.lives = 5;
    this.gameEnded = false;
    this.paused = false;
    this.nextSpawnTimer = null;
    this.spawnHeartFromTaras(0);

    // --- Счётчик жизней: иконки сердец ---
    this.lifeIcons = [];
    const lifeSize = 24;
    const lifeGap = 5;
    const lifeX0 = 24;
    const lifeY0 = 36;
    const lifeKey = this.textures.exists('life_icon') ? 'life_icon' : null;
    for (let i = 0; i < 5; i++) {
      const x = lifeX0 + i * (lifeSize + lifeGap);
      if (lifeKey) {
        const icon = this.add.image(x, lifeY0, lifeKey).setOrigin(0, 0.5).setDepth(50);
        icon.setDisplaySize(lifeSize, lifeSize);
        this.lifeIcons.push(icon);
      } else {
        const rx = this.add.rectangle(x + lifeSize / 2, lifeY0, lifeSize, lifeSize, 0x4caf50).setDepth(50);
        this.lifeIcons.push(rx);
      }
    }

    // Фраза «Поймала!» / «Промах!» чуть выше, на фоне стены, контрастный цвет как в остальном UI
    this.statusText = this.add.text(width / 2, height * 0.38, '', {
      fontSize: '26px',
      color: '#2c1810',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100);
    this.statusClearTimer = null;

    this.moveLeft = false;
    this.moveRight = false;
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x < width / 2) this.moveLeft = true;
      else this.moveRight = true;
    });
    this.input.on('pointerup', () => {
      this.moveLeft = false;
      this.moveRight = false;
    });
    this.cursors = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    });

    this.katyaW = katyaW;
    this.katyaY = katyaY;
    this.margin = margin;
    this.gameHeight = height;

    // --- Кнопка паузы (вверху справа), в стиле фона и остальных кнопок ---
    const pauseBtnW = 44;
    const pauseBtnH = 44;
    const pauseBtnX = width - 28;
    const pauseBtnY = 36;
    const pausePanelColor = 0xe8b4a8;
    const pausePanelAlpha = 0.25;
    const pauseOutlineAlpha = 0.15;
    const gPause = this.add.graphics().setDepth(50);
    gPause.fillStyle(pausePanelColor, pausePanelAlpha);
    gPause.fillRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 10);
    gPause.lineStyle(1, 0x3d2818, pauseOutlineAlpha);
    gPause.strokeRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 10);
    const pauseBtn = this.add.rectangle(pauseBtnX, pauseBtnY, pauseBtnW, pauseBtnH).setDepth(50).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => {
      if (this.sfxOn && this.cache.audio.exists('sfx_select')) {
        this.sound.play('sfx_select');
      }
      this.togglePause();
    });
    this.add.text(pauseBtnX, pauseBtnY, 'II', { fontSize: '18px', color: '#2c1810', fontStyle: 'bold' }).setOrigin(0.5).setDepth(51);
  }

  togglePause() {
    if (this.gameEnded) return;
    if (this.paused) return; // снятие паузы — по тапу по оверлею с обратным отсчётом
    this.setPause(true);
  }

  setPause(on) {
    this.paused = on;
    if (this.nextSpawnTimer) this.nextSpawnTimer.paused = on;
    if (on) this.showPauseOverlay();
    else this.hidePauseOverlay();
  }

  showPauseOverlay() {
    const { width, height } = this.cameras.main;
    const depth = 150;
    this.pauseOverlay = this.add.graphics().fillStyle(0x000000, 0.5).fillRect(0, 0, width, height).setDepth(depth);
    this.pauseOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    const panelW = 260;
    const panelH = 100;
    const panelY = height / 2 - 20;
    this.pausePanel = this.add.graphics().setDepth(depth + 1);
    this.pausePanel.fillStyle(0xfff0e8, 0.92);
    this.pausePanel.fillRoundedRect((width - panelW) / 2, panelY - panelH / 2, panelW, panelH, 14);
    this.pausePanel.lineStyle(1, 0x3d2818, 0.2);
    this.pausePanel.strokeRoundedRect((width - panelW) / 2, panelY - panelH / 2, panelW, panelH, 14);
    this.pauseText = this.add.text(width / 2, panelY - 22, 'Пауза', { fontSize: '26px', color: '#2c1810', fontStyle: 'bold' }).setOrigin(0.5).setDepth(depth + 2);
    this.pauseHint = this.add.text(width / 2, panelY + 12, 'Тап — продолжение', { fontSize: '16px', color: '#4a3020' }).setOrigin(0.5).setDepth(depth + 2);
    this.pauseOverlay.on('pointerdown', () => this.startResumeCountdown());
  }

  hidePauseOverlay() {
    if (this.pauseOverlay) this.pauseOverlay.destroy();
    if (this.pausePanel) this.pausePanel.destroy();
    if (this.pauseText) this.pauseText.destroy();
    if (this.pauseHint) this.pauseHint.destroy();
    if (this.countdownText) this.countdownText.destroy();
    this.pauseOverlay = null;
    this.pausePanel = null;
    this.pauseText = null;
    this.pauseHint = null;
    this.countdownText = null;
  }

  startResumeCountdown() {
    const { width, height } = this.cameras.main;
    this.pauseText.setVisible(false);
    this.pauseHint.setVisible(false);
    if (this.pausePanel) this.pausePanel.setVisible(false);
    this.pauseOverlay.removeListener('pointerdown');
    const countdownStyle = { fontSize: '56px', color: '#e8e0d8', fontStyle: 'bold' };
    this.countdownText = this.add.text(width / 2, height / 2, '3', countdownStyle).setOrigin(0.5).setDepth(200);
    const stepMs = 500;
    this.time.delayedCall(stepMs, () => this.countdownText && this.countdownText.setText('2'), [], this);
    this.time.delayedCall(stepMs * 2, () => this.countdownText && this.countdownText.setText('1'), [], this);
    this.time.delayedCall(stepMs * 3, () => {
      this.hidePauseOverlay();
      this.setPause(false);
    }, [], this);
  }

  spawnHeartFromTaras(index) {
    if (this.paused || this.gameEnded) return;
    const x = this.tarasX + Phaser.Math.Between(-14, 14);
    const size = this.heartSize;
    const heartKey = this.textures.exists('heart_whole') ? 'heart_whole' : null;
    const heart = heartKey
      ? this.add.image(x, this.spawnY, heartKey)
      : this.add.rectangle(x, this.spawnY, size, size, 0xff1744);
    heart.setDepth(6);
    if (heartKey) heart.setDisplaySize(size, size);
    heart.vx = Phaser.Math.Between(-140, 140);
    heart.vy = 0;
    heart.onFloor = false;
    heart.gravityScale = Phaser.Math.FloatBetween(1.1, 1.5);
    this.hearts.add(heart);

    // Анимация броска Тараса (один раз, отражение по направлению)
    if (this.tarasSprite && this.anims.get('taras_throw')) {
      this.tarasSprite.setFlipX(heart.vx > 0);
      this.tarasSprite.anims.play('taras_throw', true);
      this.tarasSprite.once('animationcomplete', () => {
        if (this.tarasSprite && this.anims.get('taras_idle')) {
          this.tarasSprite.anims.play('taras_idle', true);
        }
      });
    }

    const next = index + 1;
    if (next < this.totalHearts) {
      const delay = Math.random() < this.spawnDoubleChance
        ? Phaser.Math.Between(0, 100)
        : Phaser.Math.Between(this.spawnDelayLast, this.spawnDelayFirst);
      this.nextSpawnTimer = this.time.addEvent({
        delay,
        callback: () => this.spawnHeartFromTaras(next),
        repeat: 0,
      });
    }
  }

  updateLifeDisplay() {
    this.lifeIcons.forEach((icon, i) => icon.setVisible(i < this.lives));
  }

  checkCatch(heart) {
    const cx = this.katyaX;
    const cy = this.catchZoneY;
    const cw = this.catchZoneW;
    const ch = this.catchZoneH;
    const hw = this.heartSize / 2;
    const hh = this.heartSize / 2;
    return (
      heart.x + hw > cx - cw / 2 &&
      heart.x - hw < cx + cw / 2 &&
      heart.y + hh > cy - ch / 2 &&
      heart.y - hh < cy + ch / 2
    );
  }

  hitFloor(heart) {
    if (heart.onFloor) return;
    heart.onFloor = true;
    heart.vx = 0;
    heart.vy = 0;
    const hh = this.heartSize / 2;
    heart.y = this.floorY - hh;
    if (this.sfxOn && this.cache.audio.exists('sfx_break')) {
      this.sound.play('sfx_break');
    }
    this.showStatusAndClear('Промах!');
    this.lives -= 1;
    this.resolvedCount += 1;
    this.updateLifeDisplay();
    if (this.lives <= 0) {
      this.gameEnded = true;
      this.hearts.getChildren().forEach((h) => h.destroy());
      if (this.tarasSprite) {
        this.tarasSprite.destroy();
        this.tarasSprite = null;
      }
      if (this.katyaSprite) {
        this.katyaSprite.destroy();
        this.katyaSprite = null;
      }
      this.scene.stop('GameScene');
      this.scene.start('GameOverScene', {
        caught: this.caughtCount,
        total: this.totalHearts,
        katyaX: this.katyaX,
      });
      return;
    }
    // На полу — показываем разбитое сердце (если есть текстура), затем исчезаем
    if (heart.setTexture && this.textures.exists('heart_broken')) {
      heart.setTexture('heart_broken');
      heart.setDisplaySize(this.heartSize, this.heartSize);
    }
    this.time.delayedCall(600, () => {
      if (!heart.active) return;
      this.tweens.add({
        targets: heart,
        alpha: 0,
        duration: 400,
        ease: 'Power2.Out',
        onComplete: () => heart.destroy(),
      });
    }, [], this);
  }

  update(time, delta) {
    if (this.gameEnded || this.paused) return;
    const { width, height } = this.cameras.main;
    const { margin, katyaW } = this;
    const dt = delta / 1000;

    // Движение Кати и анимация (run_left / run_right / idle; при ловле — catch)
    let dir = 0;
    if (this.moveLeft || this.cursors.left.isDown) dir = -1;
    else if (this.moveRight || this.cursors.right.isDown) dir = 1;
    if (dir !== 0) {
      this.katyaX += dir * this.katyaSpeed * dt;
      this.katyaX = Phaser.Math.Clamp(this.katyaX, margin + katyaW / 2, width - margin - katyaW / 2);
    }
    if (this.katyaSprite) {
      this.katyaSprite.x = this.katyaX;
      if (!this.katyaCatchPlaying) {
        if (dir < 0 && this.anims.get('katya_run_left')) this.katyaSprite.anims.play('katya_run_left', true);
        else if (dir > 0 && this.anims.get('katya_run_right')) this.katyaSprite.anims.play('katya_run_right', true);
        else if (dir === 0) this.katyaSprite.setTexture('katya_idle');
      }
    }

    const hh = this.heartSize / 2;

    // Движение сердец по параболе; при ударе о пол — остаются, потом исчезают
    this.hearts.getChildren().forEach((heart) => {
      if (!heart.active) return;
      if (heart.onFloor) return;

      heart.x += heart.vx * dt;
      heart.y += heart.vy * dt;
      heart.vy += this.heartGravity * (heart.gravityScale || 1) * dt;
      if (this.gameEnded) return;

      if (this.checkCatch(heart)) {
        if (this.sfxOn && this.cache.audio.exists('sfx_catch')) {
          this.sound.play('sfx_catch');
        }
        this.showStatusAndClear('Поймала!');
        this.caughtCount += 1;
        this.resolvedCount += 1;
        if (this.katyaSprite && this.anims.get('katya_catch')) {
          this.katyaCatchPlaying = true;
          this.katyaSprite.anims.play('katya_catch', true);
          this.katyaSprite.once('animationcomplete', () => {
            this.katyaCatchPlaying = false;
            if (this.katyaSprite) this.katyaSprite.setTexture('katya_idle');
          });
        }
        heart.destroy();
      } else if (heart.y + hh >= this.floorY) {
        this.hitFloor(heart);
      }
    });

    // Все сердца разобраны (пойманы или упали на пол и учтены) и жизни остались — победа
    if (
      !this.gameEnded &&
      this.resolvedCount >= this.totalHearts &&
      this.lives > 0
    ) {
      this.gameEnded = true;
      if (this.tarasSprite) {
        this.tarasSprite.destroy();
        this.tarasSprite = null;
      }
      if (this.katyaSprite) {
        this.katyaSprite.destroy();
        this.katyaSprite = null;
      }
      this.scene.stop('GameScene');
      this.scene.start('WinScene', {
        caught: this.caughtCount,
        total: this.totalHearts,
        katyaX: this.katyaX,
      });
    }
  }

  showStatusAndClear(text) {
    this.statusText.setText(text);
    if (this.statusClearTimer) this.statusClearTimer.remove();
    this.statusClearTimer = this.time.delayedCall(1200, () => {
      this.statusText.setText('');
      this.statusClearTimer = null;
    }, [], this);
  }
}
