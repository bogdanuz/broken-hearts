import Phaser from 'phaser';
import { getMusicOn, getSfxOn, setMusicOn, setSfxOn, stopAllMusic } from '../utils/soundPrefs.js';
import { SHARE_MESSAGE, SHARE_BOT_URL } from '../utils/shareText.js';

const PADDING = 32;
const PANEL_RADIUS = 14;
// Палитра фона: персик/розовый (#F0C4B4, #E8B4A8), тени заголовка (#884820, #603028)
const CENTER_PANEL_ALPHA = 0.15;
const BOTTOM_PANEL_ALPHA = 0.15;
const CENTER_PANEL_COLOR = 0xe8b4a8;   // тон фона (розово-персиковый)
const BOTTOM_PANEL_COLOR = 0xe8b4a8;
const OUTLINE_COLOR = 0x000000;
const OUTLINE_WIDTH = 1;
const OUTLINE_ALPHA = 0.15;
// Тёмный контрастный текст по UX: читаемо на светлом фоне
const TEXT_DARK = '#3d2418';            // центральные кнопки
const TEXT_BOTTOM_DARK = '#2d1a14';     // под центральной панелью
const TEXT_FOOTER_DARK = '#1a100e';     // подвал (пол) — жирный, контраст на коричневом
const SHADOW_OFFSET = 1;                // пиксельная тень
const SHADOW_ALPHA = 0.175;             // лёгкая полупрозрачная тень в цвет текста

function addRoundedPanel(scene, x, y, w, h, color, alpha, depth = 0, outlineAlpha = 0) {
  const g = scene.add.graphics().setDepth(depth);
  const left = x - w / 2;
  const top = y - h / 2;
  const r = PANEL_RADIUS;
  g.fillStyle(color, alpha);
  g.fillRoundedRect(left, top, w, h, r);
  if (outlineAlpha > 0) {
    g.lineStyle(OUTLINE_WIDTH, OUTLINE_COLOR, outlineAlpha);
    g.strokeRoundedRect(left, top, w, h, r);
  }
  return g;
}

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.registerSpriteAnimations();

    let musicOn = getMusicOn();
    let sfxOn = getSfxOn();

    stopAllMusic(this.sound);
    if (musicOn && this.cache.audio.exists('music_menu')) {
      this.sound.play('music_menu', { loop: true, volume: 0.7 });
    }

    const tryStartMusicOnFirstTap = () => {
      if (!getMusicOn() || !this.cache.audio.exists('music_menu')) return;
      if (this.sound.get('music_menu')?.isPlaying) return;
      stopAllMusic(this.sound);
      this.sound.play('music_menu', { loop: true, volume: 0.7 });
      this.input.off('pointerdown', tryStartMusicOnFirstTap);
    };
    this.input.once('pointerdown', tryStartMusicOnFirstTap);

    if (this.textures.exists('menu_bg')) {
      this.add.image(width / 2, height / 2, 'menu_bg').setOrigin(0.5).setDepth(-1);
    }

    const playSelect = () => {
      if (getSfxOn() && this.cache.audio.exists('sfx_select')) {
        this.sound.play('sfx_select');
      }
    };

    // Центральный блок: в 1.3 раза меньше, по центру между заголовком и персонажами, прозрачность 15%, обводка 15%
    const titleZoneBottom = height * 0.28;
    const charactersZoneTop = height * 0.62;
    const centerY = (titleZoneBottom + charactersZoneTop) / 2;
    const centerPanelW = Math.round((260 * 1.5) / 1.3);
    const centerPanelH = Math.round((108 * 1.5) / 1.3);
    addRoundedPanel(this, width / 2, centerY, centerPanelW, centerPanelH, CENTER_PANEL_COLOR, CENTER_PANEL_ALPHA, 1, OUTLINE_ALPHA);

    const playBtnY = centerY - 26;
    const playBtnCx = width / 2;
    const playBtnShadow = this.add.text(playBtnCx + SHADOW_OFFSET, playBtnY + SHADOW_OFFSET, 'Начать игру', {
      fontSize: '32px',
      color: TEXT_DARK,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1).setAlpha(SHADOW_ALPHA);
    const playBtn = this.add.text(playBtnCx, playBtnY, 'Начать игру', {
      fontSize: '32px',
      color: TEXT_DARK,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

    playBtn.on('pointerdown', () => {
      playSelect();
      this.scene.start('GameScene');
    });

    this.tweens.add({
      targets: [playBtn, playBtnShadow],
      y: playBtnY - 5,
      scale: 1.04,
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const closeBtnShadow = this.add.text(width / 2 + SHADOW_OFFSET, centerY + 28 + SHADOW_OFFSET, 'Закрыть', {
      fontSize: '25px',
      color: TEXT_DARK,
    }).setOrigin(0.5).setDepth(1).setAlpha(SHADOW_ALPHA);
    const closeBtn = this.add.text(width / 2, centerY + 28, 'Закрыть', {
      fontSize: '25px',
      color: TEXT_DARK,
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      playSelect();
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close();
      }
    });

    // Подвал (пол): «Об игре» слева, «Поделиться» справа — жирный шрифт, контраст
    const footerY = height - 22;
    const FOOTER_FONT_SIZE = '17px';

    this.add.text(PADDING + SHADOW_OFFSET, footerY + SHADOW_OFFSET, 'Об игре', {
      fontSize: FOOTER_FONT_SIZE,
      color: TEXT_FOOTER_DARK,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(9).setAlpha(SHADOW_ALPHA);
    const aboutBtn = this.add.text(PADDING, footerY, 'Об игре', {
      fontSize: FOOTER_FONT_SIZE,
      color: TEXT_FOOTER_DARK,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
    aboutBtn.on('pointerdown', () => {
      playSelect();
      this.scene.start('AboutScene');
    });

    this.add.text(width - PADDING + SHADOW_OFFSET, footerY + SHADOW_OFFSET, 'Поделиться', {
      fontSize: FOOTER_FONT_SIZE,
      color: TEXT_FOOTER_DARK,
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(9).setAlpha(SHADOW_ALPHA);
    const shareBtn = this.add.text(width - PADDING, footerY, 'Поделиться', {
      fontSize: FOOTER_FONT_SIZE,
      color: TEXT_FOOTER_DARK,
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(10).setInteractive({ useHandCursor: true });
    shareBtn.on('pointerdown', () => {
      playSelect();
      this.shareGame();
    });

    // Под центральной панелью: «Музыка вкл» и «Эффекты вкл» в одну строку, выравнивание по краям центральной панели
    const settingsPanelY = centerY + 94;
    const settingsPanelW = centerPanelW;
    const settingsPanelH = 40;
    const settingsPadding = 16;
    addRoundedPanel(this, width / 2, settingsPanelY, settingsPanelW, settingsPanelH, BOTTOM_PANEL_COLOR, BOTTOM_PANEL_ALPHA, 1, 0);

    const settingsLeftX = width / 2 - centerPanelW / 2 + settingsPadding;
    const settingsRightX = width / 2 + centerPanelW / 2 - settingsPadding;
    const SETTINGS_FONT_SIZE = '17px';

    const musicBtnShadow = this.add.text(settingsLeftX + SHADOW_OFFSET, settingsPanelY + SHADOW_OFFSET, musicOn ? 'Музыка вкл' : 'Музыка выкл', {
      fontSize: SETTINGS_FONT_SIZE,
      color: TEXT_BOTTOM_DARK,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(1).setAlpha(SHADOW_ALPHA);
    const musicBtn = this.add.text(settingsLeftX, settingsPanelY, musicOn ? 'Музыка вкл' : 'Музыка выкл', {
      fontSize: SETTINGS_FONT_SIZE,
      color: TEXT_BOTTOM_DARK,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(2).setInteractive({ useHandCursor: true });

    musicBtn.on('pointerdown', () => {
      playSelect();
      musicOn = !musicOn;
      setMusicOn(musicOn);
      const musicLabel = musicOn ? 'Музыка вкл' : 'Музыка выкл';
      musicBtn.setText(musicLabel);
      musicBtnShadow.setText(musicLabel);
      musicBtn.setColor(TEXT_BOTTOM_DARK);

      if (!musicOn) {
        stopAllMusic(this.sound);
      } else if (this.cache.audio.exists('music_menu')) {
        stopAllMusic(this.sound);
        this.sound.play('music_menu', { loop: true, volume: 0.7 });
      }
    });

    const sfxBtnShadow = this.add.text(settingsRightX + SHADOW_OFFSET, settingsPanelY + SHADOW_OFFSET, sfxOn ? 'Эффекты вкл' : 'Эффекты выкл', {
      fontSize: SETTINGS_FONT_SIZE,
      color: TEXT_BOTTOM_DARK,
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(1).setAlpha(SHADOW_ALPHA);
    const sfxBtn = this.add.text(settingsRightX, settingsPanelY, sfxOn ? 'Эффекты вкл' : 'Эффекты выкл', {
      fontSize: SETTINGS_FONT_SIZE,
      color: TEXT_BOTTOM_DARK,
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(2).setInteractive({ useHandCursor: true });

    sfxBtn.on('pointerdown', () => {
      playSelect();
      sfxOn = !sfxOn;
      setSfxOn(sfxOn);
      const sfxLabel = sfxOn ? 'Эффекты вкл' : 'Эффекты выкл';
      sfxBtn.setText(sfxLabel);
      sfxBtnShadow.setText(sfxLabel);
      sfxBtn.setColor(TEXT_BOTTOM_DARK);
    });
  }

  registerSpriteAnimations() {
    if (this.anims.get('taras_idle')) return;
    this.anims.create({ key: 'taras_idle', frames: this.anims.generateFrameNumbers('taras_idle', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'taras_throw', frames: this.anims.generateFrameNumbers('taras_throw', { start: 0, end: 2 }), frameRate: 10, repeat: 0 });
    this.anims.create({
      key: 'taras_fall',
      frames: [
        { key: 'taras_fall', frame: 0, duration: 120 },
        { key: 'taras_fall', frame: 1, duration: 120 },
        { key: 'taras_fall', frame: 2, duration: 180 },
        { key: 'taras_fall', frame: 3, duration: 220 },
      ],
      repeat: 0,
    });
    this.anims.create({ key: 'katya_run_left', frames: this.anims.generateFrameNumbers('katya_run_left', { start: 0, end: 2 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'katya_run_right', frames: this.anims.generateFrameNumbers('katya_run_right', { start: 0, end: 2 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'katya_catch', frames: this.anims.generateFrameNumbers('katya_catch', { start: 0, end: 1 }), frameRate: 8, repeat: 0 });
    this.anims.create({ key: 'heart_float', frames: this.anims.generateFrameNumbers('heart_float', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
    this.anims.create({ key: 'taras_katya_hands', frames: this.anims.generateFrameNumbers('taras_katya_hands', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
  }

  shareGame() {
    if (window.Telegram?.WebApp?.openLink) {
      const tgShare = `https://t.me/share/url?url=${encodeURIComponent(SHARE_BOT_URL)}&text=${encodeURIComponent('Мини-игра о паре, которой не бывать.')}`;
      window.Telegram.WebApp.openLink(tgShare);
      return;
    }
    if (navigator.share) {
      navigator.share({
        title: 'Разбитые сердца',
        text: SHARE_MESSAGE,
      }).catch(() => {});
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(SHARE_MESSAGE).then(() => {
        this.showShareFeedback();
      }).catch(() => {});
    }
  }

  showShareFeedback() {
    const { width, height } = this.cameras.main;
    const msg = this.add.text(width / 2, height - 60, 'Ссылка скопирована', {
      fontSize: '15px',
      color: '#1a100e',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: msg, alpha: 0, duration: 1500, delay: 1000 });
    this.time.delayedCall(2600, () => msg.destroy());
  }
}
