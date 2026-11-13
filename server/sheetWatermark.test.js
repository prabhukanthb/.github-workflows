import assert from 'node:assert/strict';
import test from 'node:test';
import { sheetMarkPoints } from '../client/src/sheetWatermark.js';

const textWidth = 240;

function separated(points, min) {
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (dx * dx + dy * dy < min * min) return false;
    }
  }
  return true;
}

test('a downloaded profile keeps the sheet watermark between 8 and 10', () => {
  const withPhoto = sheetMarkPoints(1840, 2400, { x: 930, y: 180, w: 860, h: 980 }, textWidth);
  const withoutPhoto = sheetMarkPoints(1840, 2400, null, textWidth);
  assert.equal(withPhoto.length, 8);
  assert.equal(withoutPhoto.length, 9);
  assert.ok(separated(withPhoto, 100));
  assert.ok(separated(withoutPhoto, 100));
  for (const point of withPhoto) {
    const onFace = point.x >= 930 && point.x <= 1790 && point.y >= 180 && point.y <= 1160;
    assert.equal(onFace, false);
  }
});

test('sheet watermarks never exceed 10', () => {
  const samples = [
    [1840, 3200, { x: 900, y: 80, w: 900, h: 1400 }],
    [1840, 1800, { x: 920, y: 160, w: 880, h: 700 }],
    [1200, 900, { x: 600, y: 80, w: 560, h: 700 }],
    [800, 600, null],
    [400, 300, null],
    [1840, 2400, { x: 40, y: 40, w: 1760, h: 2300 }]
  ];
  for (const [width, height, photo] of samples) {
    const points = sheetMarkPoints(width, height, photo, textWidth);
    assert.ok(points.length <= 10, `${width}x${height} drew ${points.length}`);
    assert.ok(points.length <= (photo ? 8 : 9));
    for (const point of points) {
      assert.ok(point.x > 0 && point.x < width);
      assert.ok(point.y > 0 && point.y < height);
      if (!photo) continue;
      const inside = point.x >= photo.x && point.x <= photo.x + photo.w
        && point.y >= photo.y && point.y <= photo.y + photo.h;
      assert.equal(inside, false);
    }
  }
});
