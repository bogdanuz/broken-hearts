import Phaser from 'phaser';

/**
 * Катя: движется по нижней полосе (y ≈ 780), управление — тап левая/правая половина экрана.
 * Без ввода — анимация idle (стоит). При движении — run. При поймала — catch, при промахе — sad.
 * Хитбокс «сумка» 48×24 для коллизии с сердцами.
 */
export default class Katya extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture = 'katya_idle', frame = 0) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    // Логика Кати реализована в GameScene (движение по тапу, анимации, зона ловли).
  }
}
