import Phaser from 'phaser';
import { getMusicOn, getSfxOn } from '../utils/soundPrefs.js';

// Палитра сцены: тёплые тона комнаты + тёмный оверлей — контрастные, читаемые
const TITLE_COLOR = '#c44a4a';           // заголовок «Игра окончена» — мягкий красный
const COUNTER_COLOR = '#e8e0d8';         // счётчик — тёплый светлый
const PANEL_COLOR = 0xfff0e8;            // подложки кнопок — крем
const PANEL_ALPHA = 0.92;
const PANEL_RADIUS = 14;
const OUTLINE_COLOR = 0x3d2818;
const OUTLINE_ALPHA = 0.2;
const BTN_TEXT_COLOR = '#2c1810';       // кнопки — тёмный, как в меню
const BTN_TEXT_SECONDARY = '#4a3020';

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

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
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
    this.sound.stopByKey('music_win');

    if (this.sfxOn && this.cache.audio.exists('sfx_gameover')) {
      this.sound.play('sfx_gameover');
    }
    if (musicOn && this.cache.audio.exists('music_gameover')) {
      this.time.delayedCall(350, () => {
        this.sound.play('music_gameover', { loop: false, volume: 0.9 });
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

    const titleStartY = 100;
    const counterStartY = 142;
    const titleFinalY = height / 2 - 50;
    const counterFinalY = height / 2 - 15;

    this.titleText = this.add.text(centerX, titleStartY, 'Игра окончена', {
      fontSize: '34px',
      color: TITLE_COLOR,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.counterText = this.add.text(centerX, counterStartY, `Поймано: ${caught} из ${total}`, {
      fontSize: '20px',
      color: COUNTER_COLOR,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.tarasSprite = this.textures.exists('taras_fall')
      ? this.add.sprite(centerX, 75, 'taras_fall').setOrigin(0.5, 0).setDepth(5)
      : this.add.rectangle(centerX, 75, tarasW, tarasH, 0x64b5f6).setDepth(5);
    if (this.tarasSprite.setDisplaySize) this.tarasSprite.setDisplaySize(tarasW, tarasH);

    const startX = Math.min(katyaX, katyaRightX - 80);
    this.katyaSprite = this.textures.exists('katya_sad')
      ? this.add.image(startX, standY, 'katya_sad').setOrigin(0.5, 1).setDepth(10)
      : this.add.rectangle(startX, standY, katyaW, katyaH, 0xff6699).setDepth(10);
    if (this.katyaSprite.setDisplaySize) this.katyaSprite.setDisplaySize(katyaW, katyaH);

    const totalAnimDuration = 1000 + 550 + 500;

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
            ease: 'Power2.InOut',
          });
          this.tweens.add({
            targets: this.counterText,
            y: counterFinalY,
            duration: totalAnimDuration,
            ease: 'Power2.InOut',
          });
        },
      });
    };

    const step1 = () => {
      this.tweens.add({
        targets: this.katyaSprite,
        x: katyaRightX,
        duration: 1000,
        ease: 'Power2.InOut',
        onComplete: () => step2(),
      });
    };

    const step2 = () => {
      const tarasLandedY = floorY - tarasH;
      const landScale = 1.5;
      if (this.tarasSprite.anims && this.anims.get('taras_fall')) {
        this.tarasSprite.anims.play('taras_fall', true);
      }
      this.tweens.add({
        targets: this.tarasSprite,
        y: tarasLandedY,
        duration: 550,
        ease: 'Power2.In',
        onComplete: () => {
          // Только 4-й кадр (лёжа) — увеличить в 1.5 раза
          if (this.tarasSprite.setScale) {
            this.tarasSprite.setScale(landScale);
            this.tarasSprite.y = tarasLandedY - tarasH * (landScale - 1);
          }
          this.time.delayedCall(500, step3, [], this);
        },
      });
    };

    const step3 = () => {
      this.add.graphics()
        .fillStyle(0x000000, 0.7)
        .fillRect(0, 0, width, height)
        .setDepth(90);
      this.time.delayedCall(100, () => this.showButtons(), [], this);
    };

    this.showButtons = () => {
      if (this.buttonsShown) return;
      this.buttonsShown = true;

      const btnBlockY = height / 2 + 72;
      const btnPanelW = 240;
      const btnPanelH = 118;
      const panelG = addRoundedPanel(this, centerX, btnBlockY, btnPanelW, btnPanelH, 95);
      panelG.setAlpha(0);

      const againBtn = this.add.text(centerX, height / 2 + 38, 'Начать сначала', {
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

      const menuBtn = this.add.text(centerX, height / 2 + 72, 'В меню', {
        fontSize: '19px',
        color: BTN_TEXT_COLOR,
      }).setOrigin(0.5).setDepth(300).setAlpha(0).setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => {
        if (this.sfxOn && this.cache.audio.exists('sfx_select')) {
          this.sound.play('sfx_select');
        }
        this.scene.start('MenuScene');
      });

      const closeBtn = this.add.text(centerX, height / 2 + 106, 'Закрыть', {
        fontSize: '17px',
        color: BTN_TEXT_SECONDARY,
      }).setOrigin(0.5).setDepth(300).setAlpha(0).setInteractive({ useHandCursor: true });
      closeBtn.on('pointerdown', () => {
        if (this.sfxOn && this.cache.audio.exists('sfx_select')) {
          this.sound.play('sfx_select');
        }
        if (window.Telegram?.WebApp) window.Telegram.WebApp.close();
      });

      const btnTargets = [panelG, againBtn, menuBtn, closeBtn];
      this.tweens.add({
        targets: btnTargets,
        alpha: 1,
        duration: 350,
        ease: 'Power2.Out',
      });
    };

    this.time.delayedCall(300, runSequence, [], this);
  }
}
