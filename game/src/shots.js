// Mirror Meadow — deterministic screenshot staging behind ?shot=start|play|end.
// One job: put the real game into a real state worth photographing, using only
// the game's own rules (marking real differences, setting a real clock). Nothing
// here fakes a frame: the play shot has three differences genuinely found and
// four genuinely still unfound; the end shot is a genuinely completed game.

import { HINTS_PER_LEVEL } from './config.js';

/**
 * Stage the named shot on a fresh state object and return it. Any other name
 * (or none) stages the menu, like the start shot.
 */
export function stageShot(name, state, levelIndex = 0) {
  if (name === 'play') {
    state.screen = 'play';
    state.levelIndex = levelIndex;
    state.found = new Set([0, 2, 4]);
    state.foundAt = new Map([[0, 41.2], [2, 63.5], [4, 80.1]]);
    state.elapsed = 84;
    state.levelScore = 340;
    state.totalScore = 340;
    state.streak = 2;
    state.bestStreak = 2;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintsUsed = 0;
    state.hintTarget = null;
    state.hintUntil = 0;
    state.hintCooldown = 0;
    state.wrongFlashUntil = 0;
    state.shakeUntil = 0;
    state.frozenTime = 84;
    return state;
  }
  if (name === 'end') {
    state.screen = 'gameComplete';
    state.levelIndex = 2;
    state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    state.foundAt = new Map();
    state.elapsed = 172;
    state.totalElapsed = 342;
    state.totalScore = 2140;
    state.levelScore = 780;
    state.streak = 7;
    state.bestStreak = 7;
    state.hintsLeft = 1;
    state.hintsUsed = 2;
    state.hintTarget = null;
    state.hintUntil = 0;
    state.hintCooldown = 0;
    state.wrongFlashUntil = 0;
    state.shakeUntil = 0;
    state.frozenTime = 342;
    return state;
  }
  // start: the level menu, fresh and untouched.
  state.screen = 'menu';
  state.levelIndex = 0;
  state.found = new Set();
  state.foundAt = new Map();
  state.elapsed = 0;
  state.totalElapsed = 0;
  state.totalScore = 0;
  state.levelScore = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintsUsed = 0;
  state.hintTarget = null;
  state.hintUntil = 0;
  state.hintCooldown = 0;
  state.wrongFlashUntil = 0;
  state.shakeUntil = 0;
  state.frozenTime = 0;
  return state;
}
