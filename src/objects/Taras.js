import Phaser from 'phaser';

/**
 * Тарас: сидит на люстре, бросает сердца, эмоции (нейтральный / счастливый / грустный),
 * при проигрыше — падение (taras_fall), при победе — спрыгивает вниз.
 * Люстра — отдельный спрайт; Тарас — отдельный объект.
 */
export default class Taras extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture = 'taras_idle', frame = 0) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    // Логика Тараса реализована в GameScene (idle/throw на люстре, happy/sad/fall в Win/GameOver).
  }
}
