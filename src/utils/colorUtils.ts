import ColorThief from 'colorthief';

export type RGB = [number, number, number];

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const getLuminance = (r: number, g: number, b: number): number => {
  // Relative luminance formula
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 */
export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s;
    const l = (max + min) / 2

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

export const getColorDistance = (rgb1: RGB, rgb2: RGB): number => {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
};

export const isColorGood = (rgb: RGB): boolean => {
  const [r, g, b] = rgb;
  const luminance = getLuminance(r, g, b);
  const [, s] = rgbToHsl(r, g, b);
  
  // Filter out too dark (luminance < 0.1) or too bright (luminance > 0.9)
  if (luminance < 0.1 || luminance > 0.9) return false;

  // Filter out low saturation (grayish colors) using HSL
  // Threshold 0.15 ensures we get actual colors, not just gray
  if (s < 0.15) return false;

  return true;
};

export const extractColors = async (imageElement: HTMLImageElement, count: number = 5): Promise<string[]> => {
  const colorThief = new ColorThief();
  // Get a much larger palette to choose from
  const palette = await colorThief.getPalette(imageElement, 50);
  
  // 1. Filter valid colors and calculate their attributes
  const candidates = palette
    .map(rgb => {
        const [r, g, b] = rgb;
        const [h, s, l] = rgbToHsl(r, g, b);
        return { rgb: rgb as RGB, h, s, l, hex: rgbToHex(r, g, b) };
    })
    .filter(c => isColorGood(c.rgb));

  // 2. Sort by saturation (prefer more colorful ones)
  candidates.sort((a, b) => b.s - a.s);

  if (candidates.length === 0) return [];

  // 3. Select distinct colors
  const selected: typeof candidates = [];
  
  // Always pick the most saturated valid color first
  selected.push(candidates[0]);

  // Iteratively pick the next color that is most different from the already selected ones
  while (selected.length < count && selected.length < candidates.length) {
      let maxMinDist = -1;
      let bestCandidate = null;

      for (const candidate of candidates) {
          if (selected.includes(candidate)) continue;

          // Find the minimum distance from this candidate to any already selected color
          let minDist = Number.MAX_VALUE;
          for (const picked of selected) {
              const dist = getColorDistance(candidate.rgb, picked.rgb);
              if (dist < minDist) minDist = dist;
          }

          // We want the candidate that maximizes this minimum distance (is furthest from the set)
          if (minDist > maxMinDist) {
              maxMinDist = minDist;
              bestCandidate = candidate;
          }
      }

      // If we found a good candidate, add it
      // We can enforce a minimum distance threshold here if we want strictly distinct colors
      // For now, just picking the furthest one ensures best spread
      if (bestCandidate) {
          // Optional: If the "furthest" color is actually still very close (e.g. < 30), 
          // we might be running out of distinct colors. 
          // But let's just fill the slots for now.
          selected.push(bestCandidate);
      } else {
          break; 
      }
  }

  // If we still don't have enough, fill with whatever is left from the original palette (even if grayish)
  // to ensure we return 'count' items if possible.
  if (selected.length < count) {
      const selectedHexes = new Set(selected.map(c => c.hex));
      for (const rgb of palette) {
          const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
          if (!selectedHexes.has(hex)) {
              selected.push({ rgb: rgb as RGB, h:0, s:0, l:0, hex }); // Dummy HSL
              selectedHexes.add(hex);
          }
          if (selected.length >= count) break;
      }
  }

  return selected.map(c => c.hex).slice(0, count);
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
export const hslToRgb = (h: number, s: number, l: number): RGB => {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const adjustColorForBackground = (hex: string): string => {
    // 1. Parse Hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // 2. Convert to HSL
    // eslint-disable-next-line prefer-const
    let [h, s, l] = rgbToHsl(r, g, b);

    // 3. Clamp Saturation (10% - 30%)
    s = Math.max(0.1, Math.min(0.3, s));

    // 4. Clamp Lightness (60% - 85%)
    l = Math.max(0.6, Math.min(0.85, l));

    // 5. Convert back to Hex
    const [newR, newG, newB] = hslToRgb(h, s, l);
    return rgbToHex(newR, newG, newB);
};
