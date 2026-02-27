import Phaser from 'phaser';
import { getMusicOn, getSfxOn, stopAllMusic } from '../utils/soundPrefs.js';

// Тёплая палитра под градиент: тёмные коричнево-красные, без чёрного — удобочитаемо и гармонично
const TEXT_TITLE = '#2c1810';         // главный заголовок
const TEXT_SUBTITLE = '#382218';     // подзаголовок, название игры
const TEXT_BODY = '#3d2818';         // основной текст
const TEXT_META = '#4a3020';         // мета (жанр, раунд)
const TEXT_ACCENT = '#452a1c';       // выделенные фразы
const TEXT_SECTION = '#2c1810';      // заголовки секций (жирные)
const TEXT_FOOTER = '#4a3020';       // заключительный блок
const TEXT_BTN = '#2c1810';          // кнопка

const CONTENT_PANEL_COLOR = 0xfff8f5;  // тёплый крем — подложка под текст для контраста
const CONTENT_PANEL_ALPHA = 0.92;
const BTN_PANEL_COLOR = 0xe8b4a8;
const BTN_PANEL_ALPHA = 0.2;
const PANEL_RADIUS = 16;
const OUTLINE_ALPHA = 0.12;

const PADDING_H = 28;
const PADDING_TOP = 36;
const LINE_SPACING = 8;
const PARAGRAPH_GAP = 18;
const SECTION_GAP = 26;
const DIVIDER_GAP = 16;
const DIVIDER_COLOR = 0x5c4030;
const DIVIDER_HEIGHT = 1;
const HEART_SIZE = 40;

function addDivider(scene, y, width) {
  scene.add.rectangle(width / 2, y, width - PADDING_H * 2, DIVIDER_HEIGHT, DIVIDER_COLOR).setOrigin(0.5, 0).setDepth(2);
}

function addContentPanel(scene, width, height) {
  const top = PADDING_TOP - 20;
  const bottom = height - 68;
  const panelW = width - 24;
  const panelH = bottom - top;
  const g = scene.add.graphics().setDepth(0);
  g.fillStyle(CONTENT_PANEL_COLOR, CONTENT_PANEL_ALPHA);
  g.fillRoundedRect((width - panelW) / 2, top, panelW, panelH, PANEL_RADIUS);
  g.lineStyle(1, 0x3d2818, OUTLINE_ALPHA);
  g.strokeRoundedRect((width - panelW) / 2, top, panelW, panelH, PANEL_RADIUS);
  return g;
}

function addRoundedPanel(scene, x, y, w, h, depth = 0) {
  const g = scene.add.graphics().setDepth(depth);
  const left = x - w / 2;
  const top = y - h / 2;
  g.fillStyle(BTN_PANEL_COLOR, BTN_PANEL_ALPHA);
  g.fillRoundedRect(left, top, w, h, PANEL_RADIUS);
  g.lineStyle(1, 0x3d2818, OUTLINE_ALPHA);
  g.strokeRoundedRect(left, top, w, h, PANEL_RADIUS);
  return g;
}

export default class AboutScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AboutScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    if (this.textures.exists('about_bg')) {
      this.add.image(width / 2, height / 2, 'about_bg').setOrigin(0.5).setDepth(-1);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    }

    const musicOn = getMusicOn();
    const sfxOn = getSfxOn();

    stopAllMusic(this.sound);
    if (musicOn && this.cache.audio.exists('music_menu')) {
      this.sound.play('music_menu', { loop: true, volume: 0.7 });
    }

    // Подложка под весь текст — тёплый крем, высокая контрастность
    addContentPanel(this, width, height);

    // Разбитое сердце в правом верхнем углу
    if (this.textures.exists('heart_broken')) {
      this.add.image(width - PADDING_H, PADDING_TOP, 'heart_broken')
        .setOrigin(1, 0)
        .setDisplaySize(HEART_SIZE, HEART_SIZE)
        .setDepth(3);
    }

    const maxWidth = width - PADDING_H * 2;
    let y = PADDING_TOP;

    // Главный заголовок — крупно и очень жирно
    const header = this.add.text(PADDING_H, y, 'Об игре', {
      fontSize: '26px',
      color: TEXT_TITLE,
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2);
    y += header.height + 6;

    const title = this.add.text(PADDING_H, y, 'Разбитые сердца Тараса', {
      fontSize: '19px',
      color: TEXT_SUBTITLE,
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2);
    title.setWordWrapWidth(maxWidth);
    y += title.height + 10;

    const sub = this.add.text(PADDING_H, y, 'Жанр: аркада · Раунд: ~2 минуты · Одиночная игра', {
      fontSize: '13px',
      color: TEXT_META,
    }).setOrigin(0, 0).setDepth(2);
    y += sub.height + SECTION_GAP;

    addDivider(this, y, width);
    y += DIVIDER_GAP;

    const bodyStyle = { fontSize: '15px', color: TEXT_BODY, lineSpacing: LINE_SPACING };

    const p1 = this.add.text(PADDING_H, y, 'Есть люди, которые могли бы быть парой.\nТарас знает это точно. Катя — делает вид, что нет.', bodyStyle).setOrigin(0, 0).setDepth(2);
    p1.setWordWrapWidth(maxWidth);
    y += p1.height + PARAGRAPH_GAP;

    const p2 = this.add.text(PADDING_H, y, 'Тарас сидит на люстре.\nКатя бегает внизу.\nОн бросает сердца. Она их ловит.', bodyStyle).setOrigin(0, 0).setDepth(2);
    p2.setWordWrapWidth(maxWidth);
    y += p2.height + PARAGRAPH_GAP;

    const p3 = this.add.text(PADDING_H, y, 'Всё просто. Всё честно. Всё немного больно.', {
      fontSize: '15px',
      color: TEXT_ACCENT,
      fontStyle: 'italic',
    }).setOrigin(0, 0).setDepth(2);
    p3.setWordWrapWidth(maxWidth);
    y += p3.height + SECTION_GAP;

    // Заголовок секции — крупнее и жирнее
    const howTitle = this.add.text(PADDING_H, y, 'Как это работает:', {
      fontSize: '18px',
      color: TEXT_SECTION,
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2);
    y += howTitle.height + 12;

    const p4 = this.add.text(PADDING_H, y, 'Тарас раз за разом достаёт сердце из груди и кидает его вниз — сначала медленно, потом всё быстрее, как это обычно бывает с чувствами. Катя ловит их. Каждое пойманное — маленький шаг к чему-то большему. Каждое разбитое — разочарование Тараса.', bodyStyle).setOrigin(0, 0).setDepth(2);
    p4.setWordWrapWidth(maxWidth);
    y += p4.height + PARAGRAPH_GAP;

    const highlight1 = this.add.text(PADDING_H, y, '30 сердец. 5 попыток. Один шанс.', {
      fontSize: '16px',
      color: TEXT_ACCENT,
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2);
    highlight1.setWordWrapWidth(maxWidth);
    y += highlight1.height + PARAGRAPH_GAP;

    const p5 = this.add.text(PADDING_H, y, 'Финал зависит только от тебя.', bodyStyle).setOrigin(0, 0).setDepth(2);
    p5.setWordWrapWidth(maxWidth);
    y += p5.height + PARAGRAPH_GAP;

    const patienceTitle = this.add.text(PADDING_H, y, 'Терпение — не бесконечное.', {
      fontSize: '18px',
      color: TEXT_SECTION,
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2);
    y += patienceTitle.height + 10;

    const p6 = this.add.text(PADDING_H, y, 'Сердца падают всё быстрее.\nПромахи считаются.', bodyStyle).setOrigin(0, 0).setDepth(2);
    p6.setWordWrapWidth(maxWidth);
    y += p6.height + SECTION_GAP;

    addDivider(this, y, width);
    y += DIVIDER_GAP;

    const p7 = this.add.text(PADDING_H, y, 'Это внутренняя шутка, которая стала аркадой.\nИстория в пикселях о двух людях, которым не хватило смелости.\nЗдесь нет морали. Зато есть кнопка «Играть снова».', {
      fontSize: '14px',
      color: TEXT_FOOTER,
      lineSpacing: LINE_SPACING,
    }).setOrigin(0, 0).setDepth(2);
    p7.setWordWrapWidth(maxWidth);
    y += p7.height + 28;

    // Кнопка ниже и меньше — не накладывается на подложку
    const backBtnY = height - 38;
    const backBtnW = 190;
    const backBtnH = 40;
    addRoundedPanel(this, width / 2, backBtnY, backBtnW, backBtnH, 1);

    const backBtn = this.add.text(width / 2, backBtnY, 'Вернуться в меню', {
      fontSize: '16px',
      color: TEXT_BTN,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      if (sfxOn && this.cache.audio.exists('sfx_select')) {
        this.sound.play('sfx_select');
      }
      this.scene.start('MenuScene');
    });
  }
}
