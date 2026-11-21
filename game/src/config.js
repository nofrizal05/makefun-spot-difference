// Mirror Meadow — shared constants: canvas size, panel geometry, levels and scoring.
// One job: every number the rest of the game agrees on lives here.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

export const HEADER_HEIGHT = 72;
export const FOOTER_Y = 700;
export const PANEL_GAP = 16;
export const PANEL_MARGIN = 24;
export const PANEL_WIDTH = (CANVAS_WIDTH - PANEL_MARGIN * 2 - PANEL_GAP) / 2;
export const PANEL_HEIGHT = 600;
export const PANEL_TOP = 84;
export const LEFT_PANEL_X = PANEL_MARGIN;
export const RIGHT_PANEL_X = PANEL_MARGIN + PANEL_WIDTH + PANEL_GAP;

export const DIFFERENCES_PER_LEVEL = 7;
export const HINTS_PER_LEVEL = 3;
export const HINT_COOLDOWN_SECONDS = 5;
export const HINT_PULSE_SECONDS = 2.2;
export const WRONG_CLICK_PENALTY_SECONDS = 5;
export const FIND_BASE_POINTS = 100;
export const STREAK_BONUS_POINTS = 25;

/** The three levels, easiest first: name, flavour line, par time and star rating. */
export const LEVELS = [
  {
    id: 'meadow',
    name: 'Mirror Meadow',
    subtitle: 'A sunny garden, full of small wonders',
    difficulty: 1,
    parSeconds: 120,
  },
  {
    id: 'harbour',
    name: 'Harbour at Dusk',
    subtitle: 'Boats, gulls and a lighthouse going home',
    difficulty: 2,
    parSeconds: 150,
  },
  {
    id: 'cabin',
    name: 'Cabin in the Snow',
    subtitle: 'A quiet mountain night — look closely',
    difficulty: 3,
    parSeconds: 180,
  },
];

/** Seeded random numbers, so every decorative flower and star lands in the same place. */
export function mulberry32(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Format seconds as mm:ss for the timer. */
export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
