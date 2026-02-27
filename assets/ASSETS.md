# Структура ассетов

Сюда класть итоговые файлы спрайтов, фонов и аудио. Точные имена и размеры — в **SPEC.md** (таблицы спрайтов и аудио).

## Папки

| Путь | Назначение | Примеры файлов |
|------|------------|----------------|
| **sprites/characters/taras/** | Тарас: idle, бросок, эмоции, падение | taras_idle.png, taras_throw.png, taras_happy.png, taras_sad.png, taras_fall.png |
| **sprites/characters/katya/** | Катя: стоять, бег влево/вправо, поймала, промах | katya_idle.png, katya_run_left.png, katya_run_right.png, katya_catch.png, katya_sad.png |
| **sprites/hearts/** | Сердца: в полёте, разбитое, над парой при победе | heart_whole.png, heart_broken.png, heart_float.png |
| **sprites/environment/** | Пол, фон комнаты, меню и «Об игре» | floor.png, bg_room.png, menu_bg.png, about_bg.png |
| **sprites/ui/** | Иконки жизней, «берутся за руки» | life_icon.png, taras_katya_hands.png |
| **audio/music/** | Музыка: меню, игра, победа, game over | music_menu.mp3, music_game.mp3, music_win.mp3, music_gameover.mp3 |
| **audio/sfx/** | Звуковые эффекты: ловля, разбитие, победа, проигрыш | sfx_catch.wav, sfx_break.wav, sfx_win.wav, sfx_gameover.wav |

## Замечания

- **Люстра** в текущей версии нарисована на **bg_room**; отдельный спрайт chandelier в коде не загружается.
- **Жизни** в игре — сердца Тараса; иконки жизней визуально могут перекликаться с темой «разбитых сердец».
- Разрешение игры: 480×854; фон комнаты — на весь экран.
- При загрузке в коде (Phaser/Vite) путь от корня сайта: `/assets/sprites/...`, `/assets/audio/...` (содержимое `public/` доступно по корню).
