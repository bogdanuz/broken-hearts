import Phaser from 'phaser';

/**
 * Сердце: спавн у люстры, летит на левую или правую рампу, катится вниз, падает к Кате.
 * Скорость растёт от сердца к сердцу (heartIndex 0..24 для 25 сердец).
 * Коллизия с зоной «сумка» Кати → поймано; упало ниже экрана → разбилось (heart_broken анимация).
 */
export default class Heart extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'heart_whole', frame = 0) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Логика сердец реализована в GameScene (спавн, гравитация, коллизия, heart_broken).
  }
}
