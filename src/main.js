import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import AboutScene from './scenes/AboutScene.js';
import GameScene from './scenes/GameScene.js';
import WinScene from './scenes/WinScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const GAME_WIDTH = 480;
const GAME_HEIGHT = 854;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, AboutScene, GameScene, WinScene, GameOverScene],
};

const game = new Phaser.Game(config);

// Telegram Web App: при открытии в Mini App — инициализация
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// Админ-панель: только в браузере; в Telegram не показывать
(function () {
  const inTelegram = !!(typeof window !== 'undefined' && window.Telegram?.WebApp?.initData);
  const panel = document.getElementById('admin-panel');
  const container = document.getElementById('game-container');
  if (panel && container && !inTelegram) {
    panel.style.display = 'flex';
    container.style.marginLeft = '160px';
  }
})();

// Админ-панель (godmode): нажатие всегда перезапускает сцену, обнуляет текущий процесс
function adminFeedback(text) {
  const el = document.getElementById('admin-feedback');
  if (el) el.textContent = text;
}

function adminGoToScene(sceneKey, data = {}) {
  adminFeedback(`Вызвано: ${sceneKey === 'WinScene' ? 'Выиграть' : sceneKey === 'GameOverScene' ? 'Проиграть' : sceneKey === 'GameScene' ? 'Начать заново' : 'В меню'}`);
  game.scene.getScenes(true).forEach((s) => game.scene.stop(s.scene.key));
  game.scene.start(sceneKey, data);
}

game.events.once('ready', () => {
  const winBtn = document.getElementById('admin-btn-win');
  const loseBtn = document.getElementById('admin-btn-lose');
  const restartBtn = document.getElementById('admin-btn-restart');
  const menuBtn = document.getElementById('admin-btn-menu');
  if (winBtn) winBtn.onclick = () => adminGoToScene('WinScene', { caught: 28, total: 30, katyaX: 240 });
  if (loseBtn) loseBtn.onclick = () => adminGoToScene('GameOverScene', { caught: 5, total: 30, katyaX: 300 });
  if (restartBtn) restartBtn.onclick = () => adminGoToScene('GameScene');
  if (menuBtn) menuBtn.onclick = () => adminGoToScene('MenuScene');
});

export { game, GAME_WIDTH, GAME_HEIGHT };
