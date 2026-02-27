import Phaser from 'phaser';
import { getMusicOn, getSfxOn } from '../utils/soundPrefs.js';

// Палитра как в GameOver: читаемо и гармонично с комнатой
const TITLE_COLOR = '#c4844a';
const COUNTER_COLOR = '#e8e0d8';
const PANEL_COLOR = 0xfff0e8;
const PANEL_ALPHA = 0.92;
const PANEL_RADIUS = 14;
const OUTLINE_COLOR = 0x3d2818;
const OUTLINE_ALPHA = 0.2;
const BTN_TEXT_COLOR = '#2c1810';
const BTN_TEXT_SECONDARY = '#4a3020';
const HEART_FLOAT_SCALE = 1.25;

function addRoundedPanel(scene, x, y, w, h, depth) {
  const g = scene.add.graphics().setDepth(depth);
  const left = x - w / 2;
  const top = y - h / 2;
  g.fillStyle(PANEL_COLOR, PANEL_ALPHA);
  g.fillRoundedRect(left, top, w, h, PANEL_RADIUS);
  g.lineStyle(1, OUTLINE_COLOR, OUTLINE_ALPHA);
  g.strokeRoundedRect(left, top, w, h, PANEL_RADIUS);
  return g;
}

export default class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  create(data = {}) {
    const { width, height } = this.cameras.main;
    const caught = data.caught ?? 0;
    const total = data.total ?? 30;
    const katyaX = data.katyaX ?? width / 2;

    const musicOn = getMusicOn();
    this.sfxOn = getSfxOn();

    this.sound.stopByKey('music_menu');
    this.sound.stopByKey('music_game');
    this.sound.stopByKey('music_gameover');

    if (this.sfxOn && this.cache.audio.exists('sfx_win')) {
      this.sound.play('sfx_win');
    }
    if (musicOn && this.cache.audio.exists('music_win')) {
      this.time.delayedCall(350, () => {
        this.sound.play('music_win', { loop: false, volume: 0.9 });
      });
    }

    this.buttonsShown = false;

    if (this.textures.exists('bg_room')) {
      this.add.image(width / 2, height / 2, 'bg_room').setOrigin(0.5).setDepth(0);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    }

    const centerX = width / 2;
    const katyaW = 144;
    const katyaH = 216;
    const tarasW = 144;
    const tarasH = 216;
    const rightMargin = 40;
    const katyaRightX = width - katyaW / 2 - rightMargin;

    const floorY = height - 60;
    if (this.textures.exists('floor')) {
      this.add.image(width / 2, height - 30, 'floor').setOrigin(0.5).setDepth(1);
    } else {
      this.add.rectangle(width / 2, height - 30, width, 60, 0x2d2d44).setDepth(1);
    }
    const standY = floorY;

    const tarasFinalX = centerX - 50;
    const katyaFinalX = centerX + 50;

    const titleStartY = 100;
    const counterStartY = 142;
    const titleFinalY = height / 2 - 88;
    const counterFinalY = height / 2 - 53;

    this.titleText = this.add.text(centerX, titleStartY, 'Победа!', {
      fontSize: '34px',
      color: TITLE_COLOR,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.counterText = this.add.text(centerX, counterStartY, `Поймано: ${caught} из ${total}`, {
      fontSize: '20px',
      color: COUNTER_COLOR,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    // Тарас: сначала сверху (спрыгнет вниз), потом taras_happy на полу
    this.tarasSprite = this.textures.exists('taras_happy')
      ? this.add.image(centerX, 90, 'taras_happy').setOrigin(0.5, 0).setDepth(5)
      : this.add.rectangle(centerX, 90, tarasW, tarasH, 0x64b5f6).setDepth(5);
    if (this.tarasSprite.setDisplaySize) this.tarasSprite.setDisplaySize(tarasW, tarasH);

    const startX = Math.min(katyaX, katyaRightX - 80);
    this.katyaSprite = this.textures.exists('katya_idle')
      ? this.add.image(startX, standY, 'katya_idle').setOrigin(0.5, 1).setDepth(10)
      : this.add.rectangle(startX, standY, katyaW, katyaH, 0xff6699).setDepth(10);
    if (this.katyaSprite.setDisplaySize) this.katyaSprite.setDisplaySize(katyaW, katyaH);

    const step1Duration = 950;
    const step2Duration = 800;
    const step3Duration = 750;
    const step4Fade = 500;
    const step4Delay = 1200;
    const totalAnimDuration = step1Duration + step2Duration + step3Duration + step4Fade + step4Delay;

    const runSequence = () => {
      this.tweens.add({
        targets: [this.titleText, this.counterText],
        alpha: 1,
        duration: 400,
        ease: 'Power2.Out',
        onComplete: () => {
          step1();
          this.tweens.add({
            targets: this.titleText,
            y: titleFinalY,
            duration: totalAnimDuration,
            ease: 'Sine.InOut',
          });
          this.tweens.add({
            targets: this.counterText,
            y: counterFinalY,
            duration: totalAnimDuration,
            ease: 'Sine.InOut',
          });
        },
      });
    };

    const tarasLandY = floorY - tarasH;

    const step1 = () => {
      this.tweens.add({
        targets: this.katyaSprite,
        x: katyaRightX,
        duration: step1Duration,
        ease: 'Sine.Out',
        onComplete: () => step2(),
      });
    };

    const step2 = () => {
      this.tweens.add({
        targets: this.tarasSprite,
        y: tarasLandY,
        x: tarasFinalX,
        duration: step2Duration,
        ease: 'Sine.Out',
        onComplete: () => step3(),
      });
    };

    const step3 = () => {
      this.tweens.add({
        targets: this.katyaSprite,
        x: katyaFinalX,
        duration: step3Duration,
        ease: 'Sine.Out',
        onComplete: () => step4(),
      });
    };

    const step4 = () => {
      if (this.step4Done) return;
      this.step4Done = true;
      if (this.tarasSprite) this.tarasSprite.setVisible(false);
      if (this.katyaSprite) this.katyaSprite.setVisible(false);

      const aboveY = floorY - katyaH - 80;
      const showTargets = [];
      if (this.textures.exists('heart_float')) {
        this.heartFloatSprite = this.add.sprite(centerX, aboveY, 'heart_float').setDepth(8).setAlpha(0).setScale(HEART_FLOAT_SCALE);
        showTargets.push(this.heartFloatSprite);
        if (this.anims.get('heart_float')) this.heartFloatSprite.anims.play('heart_float', true);
      }
      if (this.textures.exists('taras_katya_hands')) {
        this.handsSprite = this.add.sprite(centerX, floorY - katyaH / 2, 'taras_katya_hands').setDepth(7).setAlpha(0).setScale(1.1);
        showTargets.push(this.handsSprite);
        if (this.anims.get('taras_katya_hands')) this.handsSprite.anims.play('taras_katya_hands', true);
      }
      if (showTargets.length > 0) {
        this.tweens.add({ targets: showTargets, alpha: 1, duration: step4Fade, ease: 'Sine.Out', onComplete: () => this.time.delayedCall(step4Delay, step5, [], this) });
      } else {
        this.time.delayedCall(step4Delay + step4Fade, step5, [], this);
      }
    };

    const step5 = () => {
      this.add.graphics()
        .fillStyle(0x000000, 0.6)
        .fillRect(0, 0, width, height)
        .setDepth(90);
      this.time.delayedCall(100, () => this.showButtons(), [], this);
    };

    this.showButtons = () => {
      if (this.buttonsShown) return;
      this.buttonsShown = true;

      const btnBlockY = height / 2 + 42;
      const btnPanelW = 240;
      const btnPanelH = 148;
      const panelG = addRoundedPanel(this, centerX, btnBlockY, btnPanelW, btnPanelH, 95);
      panelG.setAlpha(0);

      const againBtn = this.add.text(centerX, height / 2 - 12, 'Начать сначала', {
        fontSize: '21px',
        color: BTN_TEXT_COLOR,
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(300).setAlpha(0).setInteractive({ useHandCursor: true });
      againBtn.on('pointerdown', () => {
        if (this.sfxOn && this.cache.audio.exists('sfx_select')) {
          this.sound.play('sfx_select');
        }
        this.scene.start('GameScene');
      });

      const menuBtn = this.add.text(centerX, height / 2 + 22, 'В меню', {
        fontSize: '19px',
        color: BTN_TEXT_COLOR,
      }).setOrigin(0.5).setDepth(300).setAlpha(0).setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => {
        if (this.sfxOn && this.cache.audio.exists('sfx_select')) {
          this.sound.play('sfx_select');
        }
        this.scene.start('MenuScene');
      });

      const closeBtn = this.add.text(centerX, height / 2 + 56, 'Закрыть', {
        fontSize: '17px',
        color: BTN_TEXT_SECONDARY,
      }).setOrigin(0.5).setDepth(300).setAlpha(0).setInteractive({ useHandCursor: true });
      closeBtn.on('pointerdown', () => {
        if (this.sfxOn && this.cache.audio.exists('sfx_select')) {
          this.sound.play('sfx_select');
        }
        if (window.Telegram?.WebApp) window.Telegram.WebApp.close();
      });

      const shareBtn = this.add.text(centerX, height / 2 + 92, 'Поделиться', {
        fontSize: '17px',
        color: BTN_TEXT_COLOR,
      }).setOrigin(0.5).setDepth(300).setAlpha(0).setInteractive({ useHandCursor: true });
      shareBtn.on('pointerdown', () => this.shareGame());

      const btnTargets = [panelG, againBtn, menuBtn, closeBtn, shareBtn];
      this.tweens.add({
        targets: btnTargets,
        alpha: 1,
        duration: 350,
        ease: 'Power2.Out',
      });
    };

    this.shareGame = () => {
      const url = typeof window !== 'undefined' && window.location ? window.location.href : '';
      const text = 'Разбитые сердца — ТАРАСА';
      if (window.Telegram?.WebApp?.switchInlineQuery) {
        window.Telegram.WebApp.switchInlineQuery(`${text} ${url}`);
      } else if (navigator.share) {
        navigator.share({ title: 'Разбитые сердца', text, url: url || undefined }).catch(() => {});
      } else if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url || text).catch(() => {});
      }
    };

    this.time.delayedCall(300, runSequence, [], this);
  }
}
