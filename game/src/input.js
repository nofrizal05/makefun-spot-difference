// Mirror Meadow — mouse and keyboard input.
// One job: turn clicks and key presses into game actions (find, hint, restart, menu).
// It knows the canvas geometry and the button rectangles, and nothing else.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LEFT_PANEL_X,
  PANEL_HEIGHT,
  PANEL_TOP,
  PANEL_WIDTH,
  RIGHT_PANEL_X,
} from './config.js';
import { hintButtonRect, levelCardRects, menuButtonRect, muteButtonRect, overlayButtonRect } from './render.js';

function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

/** Convert a pointer event's client position into canvas coordinates (1280 x 800). */
export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

/**
 * Which panel (0 left, 1 right) a canvas point is over, with scene coordinates —
 * or null when the point is outside both pictures. The scene box is the panel
 * below its 28px title strip.
 */
export function panelHit(point) {
  const sceneTop = PANEL_TOP + 28;
  const sceneHeight = PANEL_HEIGHT - 28;
  if (point.y < sceneTop || point.y > sceneTop + sceneHeight) return null;
  for (const [panel, panelX] of [[0, LEFT_PANEL_X], [1, RIGHT_PANEL_X]]) {
    if (point.x >= panelX && point.x <= panelX + PANEL_WIDTH) {
      return {
        panel,
        sceneX: ((point.x - panelX) / PANEL_WIDTH) * 608,
        sceneY: ((point.y - sceneTop) / sceneHeight) * 600,
      };
    }
  }
  return null;
}

/**
 * Handle a click: returns an action for main.js to carry out, or null.
 * Buttons are checked first; a click on a picture becomes a "mark" action.
 */
export function clickAction(state, point) {
  if (state.screen === 'menu') {
    for (const rect of levelCardRects()) {
      if (inside(rect, point.x, point.y)) return { type: 'startLevel', levelIndex: rect.levelIndex };
    }
    return null;
  }
  if (state.screen === 'levelComplete' || state.screen === 'gameComplete') {
    if (inside(overlayButtonRect(state), point.x, point.y) || (state.screen === 'gameComplete' && point.y > 660)) {
      return { type: 'overlayButton' };
    }
    return null;
  }
  if (state.screen !== 'play') return null;
  if (inside(hintButtonRect(), point.x, point.y)) return { type: 'hint' };
  if (inside(menuButtonRect(), point.x, point.y)) return { type: 'menu' };
  if (inside(muteButtonRect(), point.x, point.y)) return { type: 'mute' };
  const hit = panelHit(point);
  if (hit !== null) return { type: 'mark', sceneX: hit.sceneX, sceneY: hit.sceneY };
  return null;
}

/**
 * Handle a key press: returns an action for main.js, or null.
 * H hint, 1/2/3 level, R restart, Esc menu, M mute.
 */
export function keyAction(state, key) {
  const lower = key.toLowerCase();
  if (lower === 'm') return { type: 'mute' };
  if (key === 'Escape') return { type: 'menu' };
  if (lower === 'r') return { type: 'restart' };
  if (state.screen === 'menu' && ['1', '2', '3'].includes(key)) {
    return { type: 'startLevel', levelIndex: Number(key) - 1 };
  }
  if (state.screen === 'play' && lower === 'h') return { type: 'hint' };
  if ((state.screen === 'levelComplete' || state.screen === 'gameComplete') && key === 'Enter') {
    return { type: 'overlayButton' };
  }
  return null;
}
