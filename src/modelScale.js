import { modelInfo } from './modelData';

// Multiplier color scale: green (cheap) -> yellow -> red (expensive), log-scaled
// over the snapshot range (0.001 ... 12).
const MIN_M = 0.001;
const MAX_M = 12;

export function multiplierHue(multiplier) {
  if (multiplier == null) return null;
  const m = Math.min(Math.max(multiplier, MIN_M), MAX_M);
  const t = (Math.log(m) - Math.log(MIN_M)) / (Math.log(MAX_M) - Math.log(MIN_M));
  return Math.round(125 * (1 - t)); // 125 = green, 0 = red
}

/** Inline style for a multiplier badge: colored text + tinted background. */
export function multiplierStyle(multiplier) {
  const hue = multiplierHue(multiplier);
  if (hue == null) return null;
  return {
    '--mult-color': `hsl(${hue} 78% 62%)`,
    '--mult-bg': `hsla(${hue}, 72%, 55%, 0.13)`,
    '--mult-border': `hsla(${hue}, 70%, 60%, 0.4)`,
  };
}

/** Uptime tier for color coding: ok >= 99%, warn >= 95%, bad below. */
export function uptimeTier(uptime) {
  if (uptime == null) return 'unknown';
  if (uptime >= 0.99) return 'ok';
  if (uptime >= 0.95) return 'warn';
  return 'bad';
}

export { modelInfo };
