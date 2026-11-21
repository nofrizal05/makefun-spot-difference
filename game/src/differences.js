// Mirror Meadow — finding differences: hit-testing clicks and tracking what is found.
// One job: given a click in scene coordinates, say which difference (if any) it found.

import { SCENES } from './scenes.js';

/** The differences of a scene, in scene-box coordinates. */
export function differencesOf(sceneIndex) {
  return SCENES[sceneIndex].differences;
}

/**
 * Find the unfound difference nearest a click (scene coordinates), if the click
 * lands inside its circle; otherwise null. The nearest match wins when circles overlap.
 */
export function findDifferenceAt(sceneIndex, found, sceneX, sceneY) {
  const differences = differencesOf(sceneIndex);
  let best = null;
  let bestDistance = Infinity;
  for (let index = 0; index < differences.length; index += 1) {
    if (found.has(index)) continue;
    const difference = differences[index];
    const distance = Math.hypot(sceneX - difference.x, sceneY - difference.y);
    if (distance <= difference.r && distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  }
  return best;
}

/** How many differences are still unfound in this level. */
export function remainingCount(sceneIndex, found) {
  return differencesOf(sceneIndex).length - found.size;
}

/** True when every difference of the scene has been found. */
export function levelIsComplete(sceneIndex, found) {
  return found.size >= differencesOf(sceneIndex).length;
}
