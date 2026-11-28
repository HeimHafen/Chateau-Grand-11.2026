import {HALF_D, EG, FRONT_DOORS} from './roissy-config.js?v=roissy363';

export const VESTIBULE_ENTRY = {
  x: FRONT_DOORS[0],
  z: HALF_D - .75,
  pitch: .065
};

const radians = Math.PI / 180;

function ease(start, end, value) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function walkFieldOfView(portrait, aspect, player) {
  if (!portrait) return 60;
  if (!player || player.footY !== EG) return 72;

  // Expand the portrait frame near the central threshold. Fade through the
  // doorway and between the first pair of columns, without steering the view.
  const depth = HALF_D - player.z;
  const along = ease(-.40, .58, depth) * (1 - ease(1.25, 3.6, depth));
  const across = 1 - ease(.45, 1.65, Math.abs(player.x - VESTIBULE_ENTRY.x));
  const vertical = 2 * Math.atan(Math.tan(55 * radians / 2) / aspect) / radians;
  return 72 + along * across * (Math.min(96, Math.max(72, vertical)) - 72);
}
