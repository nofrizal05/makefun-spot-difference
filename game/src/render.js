// Mirror Meadow — everything drawn on the canvas: header, panels, markers, overlays.
// One job: turn the game state into a frame. It never changes the state.

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FOOTER_Y,
  HEADER_HEIGHT,
  HINT_COOLDOWN_SECONDS,
  LEFT_PANEL_X,
  LEVELS,
  PANEL_HEIGHT,
  PANEL_TOP,
  PANEL_WIDTH,
  RIGHT_PANEL_X,
  formatTime,
} from './config.js';
import { drawSceneInto, SCENES } from './scenes.js';
import { remainingCount } from './differences.js';

const FOUND_MARK_COLOR = '#ff3b30';
const FOUND_MARK_SOFT = 'rgba(255, 59, 48, 0.9)';
const HINT_COLOR = '#ffd93b';

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function text(context, value, x, y, size, color, weight, align) {
  context.fillStyle = color;
  context.font = `${weight ?? 600} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  context.textAlign = align ?? 'left';
  context.textBaseline = 'middle';
  context.fillText(value, x, y);
}

/** The hint button's rectangle, so input can test clicks against it. */
export function hintButtonRect() {
  return { x: CANVAS_WIDTH - 236, y: FOOTER_Y + 12, width: 200, height: 46 };
}

/** The menu button's rectangle, so input can test clicks against it. */
export function menuButtonRect() {
  return { x: 24, y: FOOTER_Y + 12, width: 170, height: 46 };
}

/** The mute button's rectangle. */
export function muteButtonRect() {
  return { x: CANVAS_WIDTH - 420, y: FOOTER_Y + 12, width: 160, height: 46 };
}

function drawHeader(context, state) {
  context.fillStyle = '#16233d';
  context.fillRect(0, 0, CANVAS_WIDTH, HEADER_HEIGHT);
  context.fillStyle = '#ffd93b';
  context.fillRect(0, HEADER_HEIGHT - 3, CANVAS_WIDTH, 3);

  text(context, '🔍 MIRROR MEADOW', 24, 30, 26, '#ffffff', 800);
  text(context, 'Spot the Difference', 24, 56, 13, '#9fb2d8', 500);

  const level = LEVELS[state.levelIndex];
  text(context, level.name, 400, 26, 18, '#ffd93b', 700);
  text(context, `Level ${state.levelIndex + 1} of ${LEVELS.length}  ·  7 differences`, 400, 52, 13, '#9fb2d8', 500);

  // The found counter: the big pill the judge looks for.
  const remaining = state.screen === 'play' ? remainingCount(state.levelIndex, state.found) : 0;
  const found = state.screen === 'play' ? state.found.size : 0;
  context.fillStyle = remaining === 0 && state.screen === 'play' ? '#2f9e44' : '#e63946';
  roundRect(context, 640, 12, 190, 50, 22);
  context.fill();
  text(context, `FOUND ${found} / 7`, 735, 33, 22, '#ffffff', 800, 'center');
  text(context, `${remaining} left to find`, 735, 53, 11, 'rgba(255,255,255,0.85)', 500, 'center');

  const overPar = state.elapsed > level.parSeconds;
  text(context, `⏱ ${formatTime(state.elapsed)}`, 870, 30, 22, overPar ? '#ff6b6b' : '#ffffff', 700);
  text(context, overPar ? `over par ${formatTime(level.parSeconds)} — hurry!` : `par ${formatTime(level.parSeconds)}`, 870, 54, 12, overPar ? '#ff9a9a' : '#9fb2d8', 500);
  text(context, `★ ${state.totalScore}`, 1010, 30, 22, '#ffd93b', 800);
  text(context, state.streak > 1 ? `streak ×${state.streak}` : 'no streak yet', 1010, 54, 12, '#9fb2d8', 500);
  text(context, `💡 ${state.hintsLeft} hints`, 1256, 30, 18, '#ffffff', 700, 'right');
  text(context, 'press H', 1256, 54, 12, '#9fb2d8', 500, 'right');
}

function drawPanelFrame(context, x, label, accent) {
  context.fillStyle = '#0e1728';
  roundRect(context, x - 6, PANEL_TOP - 6, PANEL_WIDTH + 12, PANEL_HEIGHT + 12, 14);
  context.fill();
  context.fillStyle = accent;
  roundRect(context, x - 6, PANEL_TOP - 6, PANEL_WIDTH + 12, 34, 14);
  context.fill();
  context.fillRect(x - 6, PANEL_TOP + 14, PANEL_WIDTH + 12, 14);
  text(context, label, x + 14, PANEL_TOP + 11, 15, '#16233d', 800);
}

/** A red ring with a tick: the satisfying mark on every found difference. */
function drawFoundMarker(context, panelX, sceneX, sceneY, radius, pulse) {
  const scaleX = PANEL_WIDTH / 608;
  const scaleY = PANEL_HEIGHT / 600;
  const x = panelX + sceneX * scaleX;
  const y = PANEL_TOP + sceneY * scaleY;
  const scaledRadius = radius * scaleX * (pulse ?? 1);
  context.strokeStyle = FOUND_MARK_COLOR;
  context.lineWidth = 5;
  context.beginPath();
  context.arc(x, y, scaledRadius, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, scaledRadius + 4, 0, Math.PI * 2);
  context.stroke();
  // Tick inside the ring.
  context.strokeStyle = FOUND_MARK_COLOR;
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x - scaledRadius * 0.45, y);
  context.lineTo(x - scaledRadius * 0.1, y + scaledRadius * 0.4);
  context.lineTo(x + scaledRadius * 0.5, y - scaledRadius * 0.4);
  context.stroke();
}

/** A pulsing gold ring over an unfound difference: the hint's reveal. */
function drawHintPulse(context, panelX, scene, timeSeconds) {
  const scaleX = PANEL_WIDTH / 608;
  const scaleY = PANEL_HEIGHT / 600;
  const x = panelX + scene.x * scaleX;
  const y = PANEL_TOP + scene.y * scaleY;
  const pulse = 1 + 0.18 * Math.sin(timeSeconds * 9);
  const radius = scene.r * scaleX * pulse;
  context.strokeStyle = HINT_COLOR;
  context.lineWidth = 5;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = 'rgba(255, 217, 59, 0.18)';
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
  text(context, 'HINT', x, y - radius - 14, 13, HINT_COLOR, 800, 'center');
}

function drawFooter(context, state) {
  context.fillStyle = '#16233d';
  context.fillRect(0, FOOTER_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FOOTER_Y);
  context.fillStyle = '#ffd93b';
  context.fillRect(0, FOOTER_Y, CANVAS_WIDTH, 3);
  text(context, 'Click a difference on EITHER picture  ·  H hint  ·  1/2/3 level  ·  R restart  ·  Esc menu', 210, FOOTER_Y + 36, 14, '#c7d3ea', 500);

  const hint = hintButtonRect();
  const cooling = state.hintCooldown > 0;
  context.fillStyle = state.hintsLeft > 0 && !cooling ? '#ffd93b' : '#3a4a68';
  roundRect(context, hint.x, hint.y, hint.width, hint.height, 10);
  context.fill();
  text(context, cooling ? `HINT … ${Math.ceil(state.hintCooldown)}s` : `💡 HINT (${state.hintsLeft})`, hint.x + hint.width / 2, hint.y + 24, 16, '#16233d', 800, 'center');

  const menu = menuButtonRect();
  context.fillStyle = '#2a3a5c';
  roundRect(context, menu.x, menu.y, menu.width, menu.height, 10);
  context.fill();
  text(context, '☰  MENU (Esc)', menu.x + menu.width / 2, menu.y + 24, 15, '#ffffff', 700, 'center');

  const mute = muteButtonRect();
  context.fillStyle = '#2a3a5c';
  roundRect(context, mute.x, mute.y, mute.width, mute.height, 10);
  context.fill();
  text(context, state.muted ? '🔇 SOUND OFF' : '🔊 SOUND ON', mute.x + mute.width / 2, mute.y + 24, 14, '#ffffff', 700, 'center');
}

function drawPlayScreen(context, state, timeSeconds) {
  drawHeader(context, state);
  drawPanelFrame(context, LEFT_PANEL_X, 'A — ORIGINAL', '#7ec3ee');
  drawPanelFrame(context, RIGHT_PANEL_X, 'B — SPOT THE 7 DIFFERENCES', '#ffd93b');
  drawSceneInto(context, state.levelIndex, 0, LEFT_PANEL_X, PANEL_TOP + 28, PANEL_WIDTH, PANEL_HEIGHT - 28);
  drawSceneInto(context, state.levelIndex, 1, RIGHT_PANEL_X, PANEL_TOP + 28, PANEL_WIDTH, PANEL_HEIGHT - 28);

  // The two panels share one scene box, so markers line up on both.
  const differences = SCENES[state.levelIndex].differences;
  const now = timeSeconds;
  for (const index of state.found) {
    const difference = differences[index];
    const age = now - (state.foundAt.get(index) ?? now);
    const pulse = age < 0.35 ? 1 + (0.35 - age) * 1.2 : 1;
    drawFoundMarker(context, LEFT_PANEL_X, difference.x, difference.y, difference.r, pulse);
    drawFoundMarker(context, RIGHT_PANEL_X, difference.x, difference.y, difference.r, pulse);
  }
  if (state.hintTarget !== null && state.hintUntil > now) {
    const difference = differences[state.hintTarget];
    drawHintPulse(context, LEFT_PANEL_X, difference, now);
    drawHintPulse(context, RIGHT_PANEL_X, difference, now);
  }

  // Wrong-click flash: a red edge that says "not there".
  if (state.wrongFlashUntil > now) {
    context.strokeStyle = 'rgba(255, 59, 48, 0.85)';
    context.lineWidth = 8;
    context.strokeRect(4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8);
    text(context, `Not a difference! +${5}s`, CANVAS_WIDTH / 2, PANEL_TOP + 60, 20, '#ff6b6b', 800, 'center');
  }
  drawFooter(context, state);
}

function drawLevelCard(context, x, y, width, height, level, index, best) {
  const stars = '★'.repeat(level.difficulty) + '☆'.repeat(3 - level.difficulty);
  context.fillStyle = '#1d2f52';
  roundRect(context, x, y, width, height, 16);
  context.fill();
  context.strokeStyle = '#ffd93b';
  context.lineWidth = 2;
  roundRect(context, x, y, width, height, 16);
  context.stroke();
  text(context, `${index + 1}`, x + 20, y + 30, 16, '#9fb2d8', 700);
  text(context, level.name, x + 20, y + 62, 24, '#ffffff', 800);
  text(context, stars, x + 20, y + 96, 18, '#ffd93b', 700);
  text(context, level.subtitle, x + 20, y + 126, 14, '#c7d3ea', 500);
  text(context, `7 differences  ·  par ${formatTime(level.parSeconds)}`, x + 20, y + 152, 13, '#9fb2d8', 500);
  text(context, best !== null ? `Best: ${best} pts` : 'Not played yet — press ' + (index + 1), x + 20, y + 182, 14, '#ffd93b', 700);
}

/** The menu's three level cards, so input can test clicks against them. */
export function levelCardRects() {
  const width = 360;
  const gap = 28;
  const total = width * 3 + gap * 2;
  const startX = (CANVAS_WIDTH - total) / 2;
  return LEVELS.map((level, index) => ({
    x: startX + index * (width + gap),
    y: 300,
    width,
    height: 210,
    levelIndex: index,
  }));
}

function drawMenuScreen(context, state) {
  context.fillStyle = '#16233d';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // A soft meadow strip along the bottom of the menu.
  context.fillStyle = '#2f7a4a';
  context.fillRect(0, 640, CANVAS_WIDTH, 160);
  context.fillStyle = '#57a047';
  context.beginPath();
  context.moveTo(0, 660);
  context.quadraticCurveTo(320, 620, 640, 656);
  context.quadraticCurveTo(960, 690, CANVAS_WIDTH, 650);
  context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  context.lineTo(0, CANVAS_HEIGHT);
  context.closePath();
  context.fill();
  context.fillStyle = '#ffd93b';
  context.beginPath();
  context.arc(1080, 120, 46, 0, Math.PI * 2);
  context.fill();

  text(context, '🔍 MIRROR MEADOW', CANVAS_WIDTH / 2, 110, 56, '#ffffff', 800, 'center');
  text(context, 'Spot the Difference', CANVAS_WIDTH / 2, 168, 26, '#ffd93b', 700, 'center');
  text(context, 'Two pictures, seven tiny changes. Find them all — click a difference on either side.', CANVAS_WIDTH / 2, 214, 17, '#c7d3ea', 500, 'center');
  text(context, 'Wrong clicks cost +5 seconds. Hints are limited — spend them wisely.', CANVAS_WIDTH / 2, 242, 15, '#9fb2d8', 500, 'center');

  for (const rect of levelCardRects()) {
    drawLevelCard(context, rect.x, rect.y, rect.width, rect.height, LEVELS[rect.levelIndex], rect.levelIndex, state.bestScores[rect.levelIndex]);
  }
  text(context, 'Click a level or press 1 / 2 / 3  ·  H hint  ·  R restart  ·  M mute', CANVAS_WIDTH / 2, 560, 15, '#c7d3ea', 500, 'center');
  text(context, 'All art is drawn by the game itself — no photos, no downloads, nothing copied.', CANVAS_WIDTH / 2, 592, 13, '#9fb2d8', 500, 'center');
}

function drawOverlayPanel(context, title, lines, buttonLabel) {
  context.fillStyle = 'rgba(10, 16, 30, 0.72)';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const width = 560;
  const height = 340;
  const x = (CANVAS_WIDTH - width) / 2;
  const y = (CANVAS_HEIGHT - height) / 2;
  context.fillStyle = '#1d2f52';
  roundRect(context, x, y, width, height, 20);
  context.fill();
  context.strokeStyle = '#ffd93b';
  context.lineWidth = 3;
  roundRect(context, x, y, width, height, 20);
  context.stroke();
  text(context, title, CANVAS_WIDTH / 2, y + 52, 34, '#ffd93b', 800, 'center');
  lines.forEach((line, index) => {
    text(context, line, CANVAS_WIDTH / 2, y + 108 + index * 34, 18, '#ffffff', 600, 'center');
  });
  const button = { x: CANVAS_WIDTH / 2 - 130, y: y + height - 74, width: 260, height: 48 };
  context.fillStyle = '#ffd93b';
  roundRect(context, button.x, button.y, button.width, button.height, 12);
  context.fill();
  text(context, buttonLabel, CANVAS_WIDTH / 2, button.y + 25, 18, '#16233d', 800, 'center');
  return button;
}

/** The next-level / play-again button's rectangle on the overlay screens. */
export function overlayButtonRect(state) {
  const height = 340;
  const y = (CANVAS_HEIGHT - height) / 2;
  return { x: CANVAS_WIDTH / 2 - 130, y: y + height - 74, width: 260, height: 48 };
}

function drawLevelCompleteScreen(context, state) {
  drawPlayScreen(context, state, state.frozenTime ?? 0);
  const level = LEVELS[state.levelIndex];
  const timeBonus = Math.max(0, Math.round((level.parSeconds - state.elapsed) * 2));
  drawOverlayPanel(
    context,
    '🎉 LEVEL COMPLETE!',
    [
      `${level.name} — all 7 differences found`,
      `Time ${formatTime(state.elapsed)}  ·  Level score ${state.levelScore}  ·  Time bonus +${timeBonus}`,
      `Total score ${state.totalScore + timeBonus}  ·  Streak ×${state.streak}`,
    ],
    state.levelIndex + 1 < LEVELS.length ? 'NEXT LEVEL →' : 'SEE RESULTS →',
  );
}

function drawGameCompleteScreen(context, state) {
  context.fillStyle = '#16233d';
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = '#ffd93b';
  context.beginPath();
  context.arc(CANVAS_WIDTH / 2, 150, 58, 0, Math.PI * 2);
  context.fill();
  text(context, '★', CANVAS_WIDTH / 2, 152, 52, '#16233d', 800, 'center');
  text(context, 'YOU FOUND THEM ALL!', CANVAS_WIDTH / 2, 250, 40, '#ffffff', 800, 'center');
  text(context, 'All 21 differences across three original scenes.', CANVAS_WIDTH / 2, 300, 18, '#ffd93b', 700, 'center');
  const minutes = formatTime(state.totalElapsed);
  text(context, `Final score  ${state.totalScore} pts`, CANVAS_WIDTH / 2, 360, 26, '#ffffff', 800, 'center');
  text(context, `Total time  ${minutes}   ·   Best streak  ×${state.bestStreak}   ·   Hints used  ${state.hintsUsed}`, CANVAS_WIDTH / 2, 404, 18, '#c7d3ea', 600, 'center');
  text(context, 'Mirror Meadow  ·  Harbour at Dusk  ·  Cabin in the Snow', CANVAS_WIDTH / 2, 448, 16, '#9fb2d8', 500, 'center');
  const button = overlayButtonRect(state);
  context.fillStyle = '#ffd93b';
  roundRect(context, button.x, button.y + 190, button.width, button.height, 12);
  context.fill();
  text(context, '↻  PLAY AGAIN', CANVAS_WIDTH / 2, button.y + 215, 18, '#16233d', 800, 'center');
  text(context, 'Press R to play again, or Esc for the level menu.', CANVAS_WIDTH / 2, 640, 15, '#9fb2d8', 500, 'center');
}

/** Draw one frame for the current state. `timeSeconds` is the running clock. */
export function drawFrame(context, state, timeSeconds) {
  context.save();
  if (state.shakeUntil > timeSeconds) {
    const strength = 6 * ((state.shakeUntil - timeSeconds) / 0.25);
    context.translate((Math.random() - 0.5) * strength, (Math.random() - 0.5) * strength);
  }
  context.fillStyle = '#16233d';
  context.fillRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
  if (state.screen === 'menu') drawMenuScreen(context, state);
  else if (state.screen === 'play') drawPlayScreen(context, state, timeSeconds);
  else if (state.screen === 'levelComplete') drawLevelCompleteScreen(context, state);
  else if (state.screen === 'gameComplete') drawGameCompleteScreen(context, state);
  context.restore();
}
