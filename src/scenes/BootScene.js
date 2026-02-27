import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.add.text(width / 2, height / 2 - 20, 'Загрузка... 0%', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Аудио (public/assets/audio/*) — музыка и эффекты.
    // ВАЖНО: без начального слэша, чтобы Vite корректно подставлял base ('/broken-hearts/') и в dev, и в проде.
    this.load.audio('music_menu', 'assets/audio/music/music_menu.mp3');
    this.load.audio('music_game', 'assets/audio/music/music_game.mp3');
    this.load.audio('music_win', 'assets/audio/music/music_win.mp3');
    this.load.audio('music_gameover', 'assets/audio/music/music_gameover.mp3');

    this.load.audio('sfx_catch', 'assets/audio/sfx/sfx_catch.wav');
    this.load.audio('sfx_break', 'assets/audio/sfx/sfx_break.wav');
    this.load.audio('sfx_win', 'assets/audio/sfx/sfx_win.wav');
    this.load.audio('sfx_gameover', 'assets/audio/sfx/sfx_gameover.wav');
    this.load.audio('sfx_select', 'assets/audio/sfx/sfx_select.wav');

    // Спрайты и фоны (пути как у аудио: assets/... без начального слэша)
    const env = 'assets/sprites/environment/';
    const taras = 'assets/sprites/characters/taras/';
    const katya = 'assets/sprites/characters/katya/';
    const hearts = 'assets/sprites/hearts/';
    const ui = 'assets/sprites/ui/';

    this.load.image('bg_room', env + 'bg_room.png');
    this.load.image('menu_bg', env + 'menu_bg.png');
    this.load.image('about_bg', env + 'about_bg.png');
    this.load.image('floor', env + 'floor.png');

    this.load.image('taras_happy', taras + 'taras_happy.png');
    this.load.image('taras_sad', taras + 'taras_sad.png');
    this.load.spritesheet('taras_idle', taras + 'taras_idle.png', { frameWidth: 144, frameHeight: 216 });
    this.load.spritesheet('taras_throw', taras + 'taras_throw.png', { frameWidth: 144, frameHeight: 216 });
    this.load.spritesheet('taras_fall', taras + 'taras_fall.png', { frameWidth: 144, frameHeight: 216 });

    this.load.image('katya_idle', katya + 'katya_idle.png');
    this.load.image('katya_sad', katya + 'katya_sad.png');
    this.load.spritesheet('katya_run_left', katya + 'katya_run_left.png', { frameWidth: 144, frameHeight: 216 });
    this.load.spritesheet('katya_run_right', katya + 'katya_run_right.png', { frameWidth: 144, frameHeight: 216 });
    this.load.spritesheet('katya_catch', katya + 'katya_catch.png', { frameWidth: 144, frameHeight: 216 });

    this.load.image('heart_whole', hearts + 'heart_whole.png');
    this.load.image('heart_broken', hearts + 'heart_broken.png');
    this.load.spritesheet('heart_float', hearts + 'heart_float.png', { frameWidth: 144, frameHeight: 144 });

    this.load.image('life_icon', ui + 'life_icon.png');
    this.load.spritesheet('taras_katya_hands', ui + 'taras_katya_hands.png', { frameWidth: 288, frameHeight: 216 });

    this.load.on('progress', (value) => {
      loadingText.setText(`Загрузка... ${Math.round(value * 100)}%`);
    });

    this.load.once('complete', () => {
      this.scene.start('MenuScene');
    });
  }

  create() {
    // Переход в MenuScene выполняется после события load.complete в preload()
  }
}
