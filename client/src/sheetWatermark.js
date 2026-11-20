const MAX_SHEET_MARKS = 10;
const MARKS_WITH_PHOTO = 8;
const MARKS_WITHOUT_PHOTO = 9;

export function markPadding(textWidth) {
  const width = Math.max(Number(textWidth) || 0, 160);
  const angle = (18 * Math.PI) / 180;
  return {
    x: width / 2 * Math.cos(angle) + 12,
    y: width / 2 * Math.sin(angle) + 20
  };
}

function evenSample(points, count) {
  if (count <= 0 || points.length === 0) return [];
  if (points.length <= count) return points.slice();
  const chosen = [];
  const used = new Set();
  const last = points.length - 1;
  for (let i = 0; i < count; i += 1) {
    let index = Math.round((i * last) / (count - 1));
    while (used.has(index) && index < last) index += 1;
    while (used.has(index) && index > 0) index -= 1;
    used.add(index);
    chosen.push(points[index]);
  }
  return chosen;
}

function blockedByPhoto(x, y, photo, pad) {
  if (!photo) return false;
  return x >= photo.x - pad.x
    && x <= photo.x + photo.w + pad.x
    && y >= photo.y - pad.y
    && y <= photo.y + photo.h + pad.y;
}

export function sheetMarkPoints(width, height, photo, textWidth) {
  const target = Math.min(MAX_SHEET_MARKS, photo ? MARKS_WITH_PHOTO : MARKS_WITHOUT_PHOTO);
  const pad = markPadding(textWidth);
  const x0 = pad.x;
  const y0 = pad.y;
  const x1 = width - pad.x;
  const y1 = height - pad.y;
  if (!(x1 - x0 > 16) || !(y1 - y0 > 16)) return [];
  const minX = pad.x * 2.15;
  const minY = pad.y * 2.15;
  const maxCols = photo ? 2 : 3;
  const cols = Math.max(1, Math.min(maxCols, Math.floor((x1 - x0) / minX) || 1));
  const rows = Math.max(1, Math.floor((y1 - y0) / minY) || 1);
  const open = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const point = {
        x: x0 + ((col + 0.5) / cols) * (x1 - x0),
        y: y0 + ((row + 0.5) / rows) * (y1 - y0)
      };
      if (!blockedByPhoto(point.x, point.y, photo, pad)) open.push(point);
    }
  }
  return evenSample(open, Math.min(target, open.length, MAX_SHEET_MARKS));
}
