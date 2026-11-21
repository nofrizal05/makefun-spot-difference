// Mirror Meadow — the game itself: state, the frame loop and every action.
// One job: own the state machine (menu → play → level complete → game complete)
// and carry out the actions input.js names. Rendering lives in render.js,
// the pictures in scenes.js, the sounds in audio.js.

import {
  FIND_BASE_POINTS,
  HINTS_PER_LEVEL,
  HINT_COOLDOWN_SECONDS,
  HINT_PULSE_SECONDS,
  LEVELS,
  STREAK_BONUS_POINTS,
  WRONG_CLICK_PENALTY_SECONDS,
} from './config.js';
import { findDifferenceAt, levelIsComplete } from './differences.js';
import { drawFrame } from './render.js';
import { canvasPoint, clickAction, keyAction } from './input.js';
import { stageShot } from './shots.js';
import {
  ensureAudio,
  isMuted,
  playClickTick,
  playFindChime,
  playHintShimmer,
  playLevelFanfare,
  playWrongBuzz,
  toggleMute,
} from './audio.js';

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const statusLine = document.getElementById('status');

/** A fresh state: menu open, nothing found, nothing scored. */
export function createState() {
  return {
    screen: 'menu',
    levelIndex: 0,
    found: new Set(),
    foundAt: new Map(),
    elapsed: 0,
    totalElapsed: 0,
    levelScore: 0,
    totalScore: 0,
    streak: 0,
    bestStreak: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintsUsed: 0,
    hintTarget: null,
    hintUntil: 0,
    hintCooldown: 0,
    wrongFlashUntil: 0,
    shakeUntil: 0,
    clock: 0,
    frozenTime: 0,
    muted: false,
    bestScores: [null, null, null],
  };
}

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const state = createState();
if (shotName !== null) {
  const shotLevel = Math.min(2, Math.max(0, Number(params.get('level') ?? 0) || 0));
  stageShot(shotName, state, shotLevel);
}
const shotMode = shotName !== null;

function announce(message) {
  if (statusLine !== null) statusLine.textContent = message;
}

function startLevel(levelIndex) {
  state.levelIndex = levelIndex;
  state.screen = 'play';
  state.found = new Set();
  state.foundAt = new Map();
  state.elapsed = 0;
  state.levelScore = 0;
  state.streak = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintTarget = null;
  state.hintUntil = 0;
  state.hintCooldown = 0;
  state.wrongFlashUntil = 0;
  state.shakeUntil = 0;
  playClickTick();
  announce(`${LEVELS[levelIndex].name}: find 7 differences.`);
}

function finishLevel() {
  const level = LEVELS[state.levelIndex];
  const timeBonus = Math.max(0, Math.round((level.parSeconds - state.elapsed) * 2));
  state.totalScore += state.levelScore + timeBonus;
  state.totalElapsed += state.elapsed;
  state.bestScores[state.levelIndex] = Math.max(
    state.bestScores[state.levelIndex] ?? 0,
    state.levelScore + timeBonus,
  );
  state.frozenTime = state.clock;
  if (state.levelIndex + 1 >= LEVELS.length) {
    state.screen = 'gameComplete';
    announce(`Game complete! Final score ${state.totalScore}.`);
  } else {
    state.screen = 'levelComplete';
    announce(`${level.name} complete! Score ${state.totalScore}.`);
  }
  playLevelFanfare();
}

function markDifference(sceneX, sceneY) {
  const foundIndex = findDifferenceAt(state.levelIndex, state.found, sceneX, sceneY);
  if (foundIndex === null) {
    state.elapsed += WRONG_CLICK_PENALTY_SECONDS;
    state.streak = 0;
    state.wrongFlashUntil = state.clock + 0.6;
    state.shakeUntil = state.clock + 0.25;
    playWrongBuzz();
    announce('Not a difference. Five seconds added.');
    return;
  }
  const points = FIND_BASE_POINTS + STREAK_BONUS_POINTS * state.streak;
  state.found.add(foundIndex);
  state.foundAt.set(foundIndex, state.clock);
  state.levelScore += points;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  playFindChime();
  announce(`Found ${state.found.size} of 7 differences. ${points} points.`);
  if (levelIsComplete(state.levelIndex, state.found)) finishLevel();
}

function useHint() {
  if (state.hintsLeft <= 0 || state.hintCooldown > 0) return;
  const unfound = [];
  for (let index = 0; index < 7; index += 1) {
    if (!state.found.has(index)) unfound.push(index);
  }
  if (unfound.length === 0) return;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintTarget = pick;
  state.hintUntil = state.clock + HINT_PULSE_SECONDS;
  state.hintCooldown = HINT_COOLDOWN_SECONDS;
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  playHintShimmer();
  announce('Hint: watch the gold ring.');
}

function applyAction(action) {
  if (action === null) return;
  ensureAudio();
  if (action.type === 'startLevel') {
    startLevel(action.levelIndex);
  } else if (action.type === 'mark') {
    markDifference(action.sceneX, action.sceneY);
  } else if (action.type === 'hint') {
    useHint();
  } else if (action.type === 'menu') {
    state.screen = 'menu';
    state.hintTarget = null;
    playClickTick();
    announce('Level menu.');
  } else if (action.type === 'restart') {
    if (state.screen === 'play' || state.screen === 'levelComplete' || state.screen === 'gameComplete') {
      startLevel(state.screen === 'gameComplete' ? 0 : state.levelIndex);
    } else {
      startLevel(0);
    }
  } else if (action.type === 'mute') {
    state.muted = toggleMute();
    announce(state.muted ? 'Sound off.' : 'Sound on.');
  } else if (action.type === 'overlayButton') {
    if (state.screen === 'levelComplete') startLevel(state.levelIndex + 1);
    else if (state.screen === 'gameComplete') startLevel(0);
  }
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  applyAction(clickAction(state, canvasPoint(canvas, event)));
});

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  applyAction(keyAction(state, event.key));
});

let lastTimestamp = null;

/** The frame loop: advance the clock, then draw. Shot frames never advance. */
function frame(timestamp) {
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const delta = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;
  if (!shotMode) {
    state.clock += delta;
    if (state.screen === 'play') {
      state.elapsed += delta;
      state.hintCooldown = Math.max(0, state.hintCooldown - delta);
    }
  }
  drawFrame(context, state, shotMode ? state.frozenTime : state.clock);
  window.requestAnimationFrame(frame);
}

announce('Mirror Meadow. Choose a level to start spotting differences.');
window.requestAnimationFrame(frame);
