// Mirror Meadow — the three scenes and their seven differences each.
// One job: draw a scene twice (variant 0 for the left panel, variant 1 for the right)
// and name where the two versions differ. All art is drawn procedurally on canvas;
// nothing is loaded from a file and no picture is copied from anywhere else.
// Every scene is drawn in a 608 x 600 box; difference coordinates use that box.

import { mulberry32 } from './config.js';

const SCENE_WIDTH = 608;
const SCENE_HEIGHT = 600;

function skyGradient(context, stops, height) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  context.fillStyle = gradient;
  context.fillRect(0, 0, SCENE_WIDTH, height);
}

function ellipse(context, x, y, radiusX, radiusY, fill) {
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
}

function circle(context, x, y, radius, fill) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
}

function cloud(context, x, y, scale) {
  context.fillStyle = 'rgba(255, 255, 255, 0.95)';
  circle(context, x, y, 26 * scale, 'rgba(255, 255, 255, 0.95)');
  circle(context, x + 24 * scale, y + 6 * scale, 20 * scale, 'rgba(255, 255, 255, 0.95)');
  circle(context, x - 26 * scale, y + 8 * scale, 18 * scale, 'rgba(255, 255, 255, 0.95)');
  context.fillRect(x - 28 * scale, y, 56 * scale, 16 * scale);
}

function drawButterfly(context, x, y) {
  context.save();
  context.translate(x, y);
  context.fillStyle = '#ff8c42';
  context.beginPath();
  context.ellipse(-9, -7, 10, 13, -0.5, 0, Math.PI * 2);
  context.ellipse(9, -7, 10, 13, 0.5, 0, Math.PI * 2);
  context.ellipse(-7, 8, 8, 10, 0.4, 0, Math.PI * 2);
  context.ellipse(7, 8, 8, 10, -0.4, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ffd166';
  circle(context, -9, -7, 4, '#ffd166');
  circle(context, 9, -7, 4, '#ffd166');
  context.fillStyle = '#3a2e2a';
  context.fillRect(-2, -12, 4, 26);
  context.restore();
}

function drawBee(context, x, y) {
  context.save();
  context.translate(x, y);
  context.fillStyle = 'rgba(255, 255, 255, 0.75)';
  context.beginPath();
  context.ellipse(-8, -8, 9, 5, -0.6, 0, Math.PI * 2);
  context.ellipse(8, -8, 9, 5, 0.6, 0, Math.PI * 2);
  context.fill();
  ellipse(context, 0, 0, 13, 9, '#f7c948');
  context.fillStyle = '#3a2e2a';
  context.fillRect(-4, -9, 4, 18);
  context.fillRect(4, -9, 4, 18);
  context.restore();
}

function drawDuck(context, x, y) {
  ellipse(context, x, y, 22, 13, '#f4f1de');
  circle(context, x + 18, y - 12, 10, '#f4f1de');
  context.fillStyle = '#e07a2f';
  context.beginPath();
  context.moveTo(x + 26, y - 14);
  context.lineTo(x + 36, y - 10);
  context.lineTo(x + 26, y - 8);
  context.closePath();
  context.fill();
  circle(context, x + 20, y - 15, 2, '#222222');
  context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x - 34, y + 12, 10, 0.2, Math.PI - 0.4);
  context.stroke();
}

/** Level 1 — Mirror Meadow: a sunny garden. Differences are big and friendly. */
function drawMeadow(context, variant) {
  skyGradient(context, [[0, '#7ec3ee'], [0.6, '#cfeefb'], [1, '#eafaf0']], 400);
  circle(context, 92, 82, 40, '#ffd93b');
  context.strokeStyle = '#ffd93b';
  context.lineWidth = 5;
  context.lineCap = 'round';
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    context.beginPath();
    context.moveTo(92 + Math.cos(angle) * 50, 82 + Math.sin(angle) * 50);
    context.lineTo(92 + Math.cos(angle) * 64, 82 + Math.sin(angle) * 64);
    context.stroke();
  }
  cloud(context, 250, 70, 1);
  cloud(context, 520, 130, 0.8);
  // Difference 5: a small extra cloud, only in the left picture.
  if (variant === 0) cloud(context, 430, 78, 0.55);

  // Rolling hills and grass.
  context.fillStyle = '#7cc46a';
  context.beginPath();
  context.moveTo(0, 400);
  context.quadraticCurveTo(180, 330, 360, 392);
  context.quadraticCurveTo(500, 440, SCENE_WIDTH, 380);
  context.lineTo(SCENE_WIDTH, SCENE_HEIGHT);
  context.lineTo(0, SCENE_HEIGHT);
  context.closePath();
  context.fill();
  context.fillStyle = '#5da94f';
  context.fillRect(0, 470, SCENE_WIDTH, 130);

  // A winding dirt path.
  context.fillStyle = '#e8c98f';
  context.beginPath();
  context.moveTo(270, SCENE_HEIGHT);
  context.quadraticCurveTo(290, 520, 250, 470);
  context.quadraticCurveTo(220, 430, 250, 400);
  context.lineTo(300, 400);
  context.quadraticCurveTo(280, 440, 320, 480);
  context.quadraticCurveTo(350, 530, 340, SCENE_HEIGHT);
  context.closePath();
  context.fill();

  // The pond with its lily pads.
  ellipse(context, 210, 452, 112, 42, '#4aa3c7');
  ellipse(context, 210, 452, 96, 34, '#63b3d4');
  ellipse(context, 160, 440, 18, 7, '#4e9b58');
  ellipse(context, 262, 462, 16, 6, '#4e9b58');
  // Difference 4: a duck on the pond, only in the left picture.
  if (variant === 0) drawDuck(context, 205, 448);

  // The big tree on the right.
  context.fillStyle = '#7a5230';
  context.fillRect(492, 250, 26, 150);
  context.fillStyle = '#4e9b58';
  circle(context, 505, 210, 78, '#4e9b58');
  circle(context, 450, 250, 52, '#5da94f');
  circle(context, 560, 250, 52, '#5da94f');
  circle(context, 505, 160, 52, '#69b455');
  // Apples on the tree: three in the left picture, two in the right.
  circle(context, 468, 218, 9, '#e63946');
  circle(context, 540, 232, 9, '#e63946');
  if (variant === 0) circle(context, 505, 176, 9, '#e63946');

  // A picket fence along the lower left.
  context.fillStyle = '#f4ede1';
  for (let index = 0; index < 5; index += 1) {
    const x = 52 + index * 30;
    // Difference 6: the second fence post is missing in the right picture.
    if (variant === 1 && index === 1) continue;
    context.beginPath();
    context.moveTo(x, 470);
    context.lineTo(x + 7, 458);
    context.lineTo(x + 14, 470);
    context.lineTo(x + 14, 512);
    context.lineTo(x, 512);
    context.closePath();
    context.fill();
  }
  context.fillRect(40, 486, 160, 7);

  // Wildflowers, placed by a fixed seed so both panels agree.
  const random = mulberry32(20261121);
  const petalColors = ['#ff6b9d', '#ffd166', '#c77dff', '#ff8c42', '#ffffff'];
  for (let index = 0; index < 26; index += 1) {
    const x = 30 + random() * 540;
    const y = 500 + random() * 80;
    if (x > 150 && x < 330 && y > 420 && y < 500) continue; // keep the pond clear
    const color = petalColors[Math.floor(random() * petalColors.length)];
    context.strokeStyle = '#3f7a37';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y - 12);
    context.stroke();
    circle(context, x, y - 15, 5, color);
    circle(context, x, y - 15, 2, '#ffd93b');
  }

  // The tulip by the path: red in the left picture, yellow in the right.
  context.strokeStyle = '#3f7a37';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(300, 520);
  context.lineTo(300, 486);
  context.stroke();
  context.fillStyle = variant === 0 ? '#e63946' : '#ffd93b';
  context.beginPath();
  context.moveTo(300, 462);
  context.quadraticCurveTo(284, 478, 288, 492);
  context.quadraticCurveTo(300, 500, 312, 492);
  context.quadraticCurveTo(316, 478, 300, 462);
  context.fill();

  // Difference 1: a butterfly over the grass, only in the left picture.
  if (variant === 0) drawButterfly(context, 150, 205);
  // Difference 7: a bee near the flowers, only in the left picture.
  if (variant === 0) drawBee(context, 372, 238);
}

/** Level 2 — Harbour at Dusk: boats, gulls and a lighthouse. Look twice. */
function drawHarbour(context, variant) {
  skyGradient(context, [[0, '#2b2a55'], [0.45, '#7a4a7d'], [0.75, '#e8703a'], [1, '#f7b267']], 360);
  circle(context, 486, 300, 34, '#ffb347');
  circle(context, 486, 300, 44, 'rgba(255, 179, 71, 0.25)');
  // Gulls in the dusk sky; one extra gull only in the left picture.
  context.strokeStyle = '#2b2a55';
  context.lineWidth = 3;
  context.lineCap = 'round';
  const gulls = [[150, 110], [230, 80], [330, 130], [420, 90]];
  for (const [x, y] of gulls) {
    context.beginPath();
    context.moveTo(x - 12, y);
    context.quadraticCurveTo(x - 4, y - 8, x, y);
    context.quadraticCurveTo(x + 4, y - 8, x + 12, y);
    context.stroke();
  }
  if (variant === 0) {
    context.beginPath();
    context.moveTo(238, 200);
    context.quadraticCurveTo(246, 192, 250, 200);
    context.quadraticCurveTo(254, 192, 262, 200);
    context.stroke();
  }
  cloud(context, 120, 200, 0.9);
  cloud(context, 380, 170, 0.7);

  // The sea.
  const sea = context.createLinearGradient(0, 340, 0, SCENE_HEIGHT);
  sea.addColorStop(0, '#3d6e9e');
  sea.addColorStop(1, '#1d3a5c');
  context.fillStyle = sea;
  context.fillRect(0, 340, SCENE_WIDTH, 260);
  context.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  context.lineWidth = 2;
  for (const [x, y, length] of [[60, 420, 70], [300, 470, 90], [480, 430, 60], [150, 540, 80], [380, 550, 70]]) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length, y);
    context.stroke();
  }
  // Sun glitter on the water.
  context.fillStyle = 'rgba(255, 179, 71, 0.5)';
  for (let index = 0; index < 8; index += 1) {
    context.fillRect(452 + (index % 2) * 22, 360 + index * 24, 34 - index * 2, 4);
  }

  // The lighthouse on the left rocks.
  context.fillStyle = '#5b4a68';
  context.beginPath();
  context.moveTo(40, 380);
  context.lineTo(80, 300);
  context.lineTo(160, 300);
  context.lineTo(200, 380);
  context.closePath();
  context.fill();
  context.fillStyle = '#f4ede1';
  context.beginPath();
  context.moveTo(88, 300);
  context.lineTo(96, 170);
  context.lineTo(144, 170);
  context.lineTo(152, 300);
  context.closePath();
  context.fill();
  context.fillStyle = '#e63946';
  context.fillRect(92, 210, 56, 26);
  context.fillRect(95, 258, 50, 22);
  context.fillStyle = '#2b2a55';
  context.fillRect(98, 150, 44, 22);
  circle(context, 120, 161, 10, '#ffe66d');
  // Difference 1: the lighthouse beam shines only in the left picture.
  if (variant === 0) {
    context.fillStyle = 'rgba(255, 230, 109, 0.35)';
    context.beginPath();
    context.moveTo(140, 158);
    context.lineTo(320, 120);
    context.lineTo(320, 196);
    context.closePath();
    context.fill();
  }

  // The wooden pier.
  context.fillStyle = '#8a6b4a';
  context.fillRect(30, 400, 260, 14);
  context.fillStyle = '#6f543a';
  for (let index = 0; index < 6; index += 1) context.fillRect(44 + index * 42, 414, 10, 26);
  context.fillStyle = '#3a2e2a';
  context.fillRect(52, 356, 8, 46);
  // Difference 6: a little red flag on the pier post, only in the left picture.
  if (variant === 0) {
    context.fillStyle = '#e63946';
    context.beginPath();
    context.moveTo(60, 356);
    context.lineTo(84, 363);
    context.lineTo(60, 371);
    context.closePath();
    context.fill();
  }
  // Difference 7: a crate on the pier, only in the left picture.
  if (variant === 0) {
    context.fillStyle = '#b08954';
    context.fillRect(196, 372, 30, 28);
    context.strokeStyle = '#7a5a34';
    context.lineWidth = 2;
    context.strokeRect(196, 372, 30, 28);
    context.beginPath();
    context.moveTo(196, 372);
    context.lineTo(226, 400);
    context.moveTo(226, 372);
    context.lineTo(196, 400);
    context.stroke();
  }

  // The sailboat: red sail in the left picture, white in the right.
  context.fillStyle = '#7a5230';
  context.beginPath();
  context.moveTo(268, 330);
  context.lineTo(368, 330);
  context.lineTo(352, 356);
  context.lineTo(284, 356);
  context.closePath();
  context.fill();
  context.strokeStyle = '#3a2e2a';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(318, 330);
  context.lineTo(318, 210);
  context.stroke();
  context.fillStyle = variant === 0 ? '#e63946' : '#f4ede1';
  context.beginPath();
  context.moveTo(318, 216);
  context.lineTo(318, 322);
  context.lineTo(272, 322);
  context.closePath();
  context.fill();
  context.fillStyle = '#f4ede1';
  context.beginPath();
  context.moveTo(324, 232);
  context.lineTo(324, 322);
  context.lineTo(362, 322);
  context.closePath();
  context.fill();

  // The harbour house with its window: lit in the left picture, dark in the right.
  context.fillStyle = '#4a3b52';
  context.fillRect(500, 300, 82, 62);
  context.fillStyle = '#e63946';
  context.beginPath();
  context.moveTo(494, 302);
  context.lineTo(541, 268);
  context.lineTo(588, 302);
  context.closePath();
  context.fill();
  context.fillStyle = variant === 0 ? '#ffe66d' : '#2b2a55';
  context.fillRect(528, 318, 24, 26);
  context.strokeStyle = '#2b2a55';
  context.lineWidth = 2;
  context.strokeRect(528, 318, 24, 26);

  // A bobbing buoy: only in the left picture.
  if (variant === 0) {
    context.fillStyle = '#e63946';
    context.beginPath();
    context.moveTo(430, 470);
    context.lineTo(446, 470);
    context.lineTo(442, 452);
    context.lineTo(434, 452);
    context.closePath();
    context.fill();
    circle(context, 438, 450, 5, '#e63946');
    context.fillStyle = '#f4ede1';
    context.fillRect(431, 460, 14, 5);
  }
}

/** Level 3 — Cabin in the Snow: a quiet mountain night. The hardest hunt. */
function drawCabin(context, variant) {
  skyGradient(context, [[0, '#0d1530'], [0.6, '#1d2f5e'], [1, '#33497e']], 430);
  // Stars, placed by a fixed seed so both panels agree.
  const random = mulberry32(777);
  context.fillStyle = '#ffffff';
  for (let index = 0; index < 70; index += 1) {
    const x = random() * SCENE_WIDTH;
    const y = random() * 260;
    const radius = 0.8 + random() * 1.6;
    circle(context, x, y, radius, 'rgba(255, 255, 255, 0.9)');
  }
  // Difference 2: a shooting star, only in the left picture.
  if (variant === 0) {
    context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(150, 84);
    context.lineTo(210, 118);
    context.stroke();
    circle(context, 210, 118, 3, '#ffffff');
  }
  // The moon.
  circle(context, 520, 92, 36, '#f4f1de');
  circle(context, 508, 82, 7, '#d8d2b8');
  circle(context, 532, 104, 5, '#d8d2b8');
  circle(context, 524, 76, 4, '#d8d2b8');

  // Mountain ridges.
  context.fillStyle = '#2a3d66';
  context.beginPath();
  context.moveTo(0, 430);
  context.lineTo(120, 240);
  context.lineTo(220, 360);
  context.lineTo(330, 210);
  context.lineTo(450, 380);
  context.lineTo(560, 260);
  context.lineTo(SCENE_WIDTH, 360);
  context.lineTo(SCENE_WIDTH, 430);
  context.closePath();
  context.fill();
  context.fillStyle = '#eaf2fb';
  context.beginPath();
  context.moveTo(120, 240);
  context.lineTo(150, 292);
  context.lineTo(120, 306);
  context.lineTo(96, 288);
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(330, 210);
  context.lineTo(362, 268);
  context.lineTo(330, 282);
  context.lineTo(304, 262);
  context.closePath();
  context.fill();

  // Snowy ground.
  context.fillStyle = '#dfe9f5';
  context.fillRect(0, 430, SCENE_WIDTH, 170);
  context.fillStyle = '#c9d8ec';
  ellipse(context, 120, 470, 90, 14, '#c9d8ec');
  ellipse(context, 480, 520, 110, 16, '#c9d8ec');

  // Pine trees.
  function pine(x, y, scale) {
    context.fillStyle = '#2f5d3a';
    for (let tier = 0; tier < 3; tier += 1) {
      const width = (58 - tier * 14) * scale;
      const top = y - 84 * scale + tier * 28 * scale;
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x - width / 2, top + 44 * scale);
      context.lineTo(x + width / 2, top + 44 * scale);
      context.closePath();
      context.fill();
    }
    context.fillStyle = '#6b4a2f';
    context.fillRect(x - 5 * scale, y, 10 * scale, 16 * scale);
    context.fillStyle = '#eaf2fb';
    context.beginPath();
    context.moveTo(x, y - 84 * scale);
    context.lineTo(x - 12 * scale, y - 58 * scale);
    context.lineTo(x + 12 * scale, y - 58 * scale);
    context.closePath();
    context.fill();
  }
  pine(84, 470, 1.15);
  pine(150, 500, 0.85);
  pine(470, 480, 1.0);
  // Difference 5: a small extra pine on the right, only in the left picture.
  if (variant === 0) pine(540, 520, 0.6);

  // The cabin.
  context.fillStyle = '#7a5230';
  context.fillRect(220, 330, 170, 110);
  context.fillStyle = '#5d3f24';
  context.beginPath();
  context.moveTo(205, 336);
  context.lineTo(305, 272);
  context.lineTo(405, 336);
  context.closePath();
  context.fill();
  context.fillStyle = '#eaf2fb';
  context.beginPath();
  context.moveTo(205, 336);
  context.lineTo(305, 272);
  context.lineTo(405, 336);
  context.lineTo(388, 336);
  context.lineTo(305, 288);
  context.lineTo(222, 336);
  context.closePath();
  context.fill();
  // Chimney and smoke: smoke rises only in the left picture.
  context.fillStyle = '#6b4a2f';
  context.fillRect(348, 268, 24, 44);
  if (variant === 0) {
    context.fillStyle = 'rgba(230, 236, 245, 0.85)';
    circle(context, 360, 252, 12, 'rgba(230, 236, 245, 0.85)');
    circle(context, 372, 232, 15, 'rgba(230, 236, 245, 0.8)');
    circle(context, 386, 210, 18, 'rgba(230, 236, 245, 0.7)');
  }
  // Door and window: the window glows warm in the left picture, cold and dark in the right.
  context.fillStyle = '#4a3220';
  context.fillRect(286, 372, 38, 68);
  circle(context, 316, 406, 3, '#ffd93b');
  context.fillStyle = variant === 0 ? '#ffd93b' : '#33497e';
  context.fillRect(238, 356, 30, 30);
  context.strokeStyle = '#4a3220';
  context.lineWidth = 2;
  context.strokeRect(238, 356, 30, 30);
  context.beginPath();
  context.moveTo(253, 356);
  context.lineTo(253, 386);
  context.moveTo(238, 371);
  context.lineTo(268, 371);
  context.stroke();
  if (variant === 0) {
    context.fillStyle = 'rgba(255, 217, 59, 0.25)';
    context.fillRect(228, 346, 50, 50);
  }

  // A lantern on a post: lit in the left picture, dark in the right.
  context.fillStyle = '#3a2e2a';
  context.fillRect(446, 380, 6, 70);
  context.fillStyle = variant === 0 ? '#ffd93b' : '#5a5a6e';
  context.fillRect(436, 356, 26, 26);
  context.strokeStyle = '#3a2e2a';
  context.lineWidth = 2;
  context.strokeRect(436, 356, 26, 26);
  if (variant === 0) {
    const glow = context.createRadialGradient(449, 369, 4, 449, 369, 44);
    glow.addColorStop(0, 'rgba(255, 217, 59, 0.5)');
    glow.addColorStop(1, 'rgba(255, 217, 59, 0)');
    context.fillStyle = glow;
    circle(context, 449, 369, 44, 'rgba(255, 217, 59, 0)');
    context.fillStyle = glow;
    context.fillRect(405, 325, 88, 88);
  }

  // The owl on a branch: only in the left picture.
  if (variant === 0) {
    context.strokeStyle = '#5d3f24';
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(96, 260);
    context.lineTo(160, 246);
    context.stroke();
    ellipse(context, 128, 232, 16, 20, '#8a6b4a');
    circle(context, 122, 224, 4, '#ffd93b');
    circle(context, 134, 224, 4, '#ffd93b');
    context.fillStyle = '#3a2e2a';
    circle(context, 122, 224, 2, '#3a2e2a');
    circle(context, 134, 224, 2, '#3a2e2a');
    context.fillStyle = '#e07a2f';
    context.beginPath();
    context.moveTo(128, 230);
    context.lineTo(124, 236);
    context.lineTo(132, 236);
    context.closePath();
    context.fill();
  }

  // A path of footprints in the snow: only in the left picture.
  if (variant === 0) {
    context.fillStyle = '#aebfe0';
    const prints = [[300, 500], [312, 520], [298, 540], [312, 560], [300, 580]];
    for (const [x, y] of prints) ellipse(context, x, y, 7, 10, '#aebfe0');
  }
}

/** Every scene: its draw function and its seven differences (scene-box coordinates). */
export const SCENES = [
  {
    id: 'meadow',
    draw: drawMeadow,
    differences: [
      { x: 150, y: 205, r: 30, label: 'butterfly' },
      { x: 300, y: 478, r: 28, label: 'tulip colour' },
      { x: 505, y: 176, r: 26, label: 'apple' },
      { x: 205, y: 448, r: 32, label: 'duck' },
      { x: 430, y: 78, r: 30, label: 'cloud' },
      { x: 82, y: 484, r: 26, label: 'fence post' },
      { x: 372, y: 238, r: 26, label: 'bee' },
    ],
  },
  {
    id: 'harbour',
    draw: drawHarbour,
    differences: [
      { x: 160, y: 160, r: 28, label: 'lighthouse beam' },
      { x: 300, y: 272, r: 28, label: 'sail colour' },
      { x: 250, y: 200, r: 24, label: 'gull' },
      { x: 438, y: 462, r: 26, label: 'buoy' },
      { x: 540, y: 331, r: 26, label: 'window light' },
      { x: 66, y: 363, r: 24, label: 'flag' },
      { x: 211, y: 386, r: 26, label: 'crate' },
    ],
  },
  {
    id: 'cabin',
    draw: drawCabin,
    differences: [
      { x: 372, y: 232, r: 28, label: 'chimney smoke' },
      { x: 180, y: 101, r: 26, label: 'shooting star' },
      { x: 449, y: 369, r: 26, label: 'lantern' },
      { x: 253, y: 371, r: 26, label: 'window light' },
      { x: 540, y: 500, r: 24, label: 'small pine' },
      { x: 128, y: 232, r: 26, label: 'owl' },
      { x: 305, y: 540, r: 28, label: 'footprints' },
    ],
  },
];

/** Draw one scene variant into a panel rectangle on the main canvas. */
export function drawSceneInto(context, sceneIndex, variant, x, y, width, height) {
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.translate(x, y);
  context.scale(width / SCENE_WIDTH, height / SCENE_HEIGHT);
  SCENES[sceneIndex].draw(context, variant);
  context.restore();
}
