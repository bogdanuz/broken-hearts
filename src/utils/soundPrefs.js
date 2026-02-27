/** Настройки звука (localStorage). Используются меню и при подключении аудио в игре. */
export const STORAGE_MUSIC = 'bh_music';
export const STORAGE_SFX = 'bh_sfx';

const MUSIC_KEYS = ['music_menu', 'music_game', 'music_win', 'music_gameover'];
/** Остановить всю музыку (чтобы не накладывалась при переключении сцен и вкл/выкл). */
export function stopAllMusic(sound) {
  if (!sound) return;
  MUSIC_KEYS.forEach((k) => sound.stopByKey(k));
}

export function getMusicOn() {
  try {
    const v = localStorage.getItem(STORAGE_MUSIC);
    return v === null || v === '1';
  } catch (_) {
    return true;
  }
}

export function getSfxOn() {
  try {
    const v = localStorage.getItem(STORAGE_SFX);
    return v === null || v === '1';
  } catch (_) {
    return true;
  }
}

export function setMusicOn(on) {
  try {
    localStorage.setItem(STORAGE_MUSIC, on ? '1' : '0');
  } catch (_) {}
}

export function setSfxOn(on) {
  try {
    localStorage.setItem(STORAGE_SFX, on ? '1' : '0');
  } catch (_) {}
}
