import ColorThief from 'colorthief';

export type RGB = [number, number, number];

export interface ImageStyle {
  isVibrant: boolean;
  isMonochrome: boolean;
  avgSaturation: number;
  avgLightness: number;
  maxHighSatArea: number; // 新增:高饱和色最大面积占比
}

export interface ColorExtractionResult {
  colors: string[];
  style: ImageStyle;
}

// 基础工具函数
export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

export const getLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
};

export const hslToRgb = (h: number, s: number, l: number): RGB => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
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

const getColorDistance = (rgb1: RGB, rgb2: RGB): number => {
  return Math.sqrt(Math.pow(rgb1[0] - rgb2[0], 2) + Math.pow(rgb1[1] - rgb2[1], 2) + Math.pow(rgb1[2] - rgb2[2], 2));
};

// 计算色相差异 (0-180度)
const getHueDifference = (h1: number, h2: number): number => {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 1 - diff) * 180;
};

// 统计颜色面积占比
interface ColorWithArea {
  rgb: RGB;
  count: number;
  areaRatio: number;
}

const analyzeColorAreas = (imageElement: HTMLImageElement, palette: number[][]): Map<string, ColorWithArea> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = canvas.width * canvas.height;

  const colorMap = new Map<string, ColorWithArea>();

  // 初始化颜色映射
  palette.forEach((rgb) => {
    const key = `${rgb[0]},${rgb[1]},${rgb[2]}`;
    colorMap.set(key, { rgb: rgb as RGB, count: 0, areaRatio: 0 });
  });

  // 统计每个像素最接近的调色板颜色
  for (let i = 0; i < data.length; i += 4) {
    const pixelRgb: RGB = [data[i], data[i + 1], data[i + 2]];

    let minDist = Infinity;
    let closestKey = '';

    palette.forEach((rgb) => {
      const dist = getColorDistance(pixelRgb, rgb as RGB);
      if (dist < minDist) {
        minDist = dist;
        closestKey = `${rgb[0]},${rgb[1]},${rgb[2]}`;
      }
    });

    if (closestKey && colorMap.has(closestKey)) {
      colorMap.get(closestKey)!.count++;
    }
  }

  // 计算面积占比
  colorMap.forEach((color) => {
    color.areaRatio = color.count / totalPixels;
  });

  return colorMap;
};

// 分析图片风格
const analyzeImageStyle = (palette: number[][], colorAreas: Map<string, ColorWithArea>): ImageStyle => {
  const hslColors = palette.map((rgb) => rgbToHsl(rgb[0], rgb[1], rgb[2]));

  const avgSaturation = hslColors.reduce((sum, [, s]) => sum + s, 0) / hslColors.length;
  const avgLightness = hslColors.reduce((sum, [, , l]) => sum + l, 0) / hslColors.length;

  const lowSatCount = hslColors.filter(([, s]) => s < 0.15).length;
  const lowSatRatio = lowSatCount / hslColors.length;

  // 计算高饱和色的最大面积占比
  let maxHighSatArea = 0;
  colorAreas.forEach((colorInfo) => {
    const rgb = colorInfo.rgb;
    const [, s] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    if (s > 0.4) {
      maxHighSatArea = Math.max(maxHighSatArea, colorInfo.areaRatio);
    }
  });

  // 黑白风判断:满足以下任一条件
  // 1. 低饱和色占比 > 80% 且 高饱和面积 < 5%
  // 2. 平均饱和度 < 0.25 且 高饱和面积 < 5% (更宽松,适合实际黑白照片)
  const isMonochrome = (lowSatRatio > 0.8 && maxHighSatArea < 0.05) || (avgSaturation < 0.25 && maxHighSatArea < 0.05);

  // 鲜艳风判断:降低阈值,让更多现实照片被识别为鲜艳风
  const isVibrant = avgSaturation > 0.3; // 从 0.4 降低到 0.3

  return {
    isVibrant,
    isMonochrome,
    avgSaturation,
    avgLightness,
    maxHighSatArea,
  };
};

// 优化后的颜色过滤逻辑
const isColorGood = (rgb: RGB, isMonochrome: boolean): boolean => {
  const [r, g, b] = rgb;
  const luminance = getLuminance(r, g, b);
  const [, s] = rgbToHsl(r, g, b);

  // 过滤过暗或过亮
  if (luminance < 0.1 || luminance > 0.9) return false;

  // 黑白图片:仅允许低饱和色,拒绝孤立高饱和色
  if (isMonochrome) {
    return s < 0.2;
  }

  // 普通图片:保持原阈值
  return s > 0.08;
};

// 自适应色彩调整
const adjustColorForBackground = (hex: string, style: ImageStyle): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const [h, sOrig, lOrig] = rgbToHsl(r, g, b);
  let s = sOrig;
  let l = lOrig;

  if (style.isMonochrome) {
    // 黑白/极简:强制转换为灰色,饱和度归零
    s = 0;
    l = Math.max(0.5, Math.min(0.8, l));
  } else if (style.isVibrant) {
    // 鲜艳图片:保留较高饱和度,更自然
    s = Math.max(0.35, Math.min(0.6, s)); // 提高饱和度范围 35%-60%
    l = Math.max(0.55, Math.min(0.75, l)); // 稍微提亮 55%-75%
  } else {
    // 柔和图片:莫兰迪色系
    s = Math.max(0.15, Math.min(0.3, s));
    l = Math.max(0.6, Math.min(0.85, l));
  }

  const [newR, newG, newB] = hslToRgb(h, s, l);
  return rgbToHex(newR, newG, newB);
};

// 选择差异最大的颜色
const selectDistinctColors = (
  candidates: Array<{
    rgb: RGB;
    h: number;
    s: number;
    l: number;
    hex: string;
    score: number;
    areaRatio: number;
  }>,
  count: number,
): string[] => {
  if (candidates.length === 0) return [];

  const selected: Array<{
    rgb: RGB;
    h: number;
    s: number;
    l: number;
    hex: string;
    score: number;
    areaRatio: number;
  }> = [];
  selected.push(candidates[0]);

  while (selected.length < count && selected.length < candidates.length) {
    let bestCandidate: (typeof candidates)[0] | null = null;
    let maxMinDistance = -1;

    for (const candidate of candidates) {
      if (selected.some((s) => s.hex === candidate.hex)) continue;

      let minDistance = Infinity;
      for (const selectedColor of selected) {
        // 优先使用色相差异
        const hueDiff = getHueDifference(candidate.h, selectedColor.h);
        const rgbDist = getColorDistance(candidate.rgb, selectedColor.rgb);

        // 色相差异权重更高
        const distance = hueDiff * 2 + rgbDist * 0.5;
        minDistance = Math.min(minDistance, distance);
      }

      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      selected.push(bestCandidate);
    } else {
      break;
    }
  }

  return selected.map((c) => c.hex);
};

// 主要颜色提取函数
export const extractColors = async (
  imageElement: HTMLImageElement,
  count: number = 2,
): Promise<ColorExtractionResult> => {
  const colorThief = new ColorThief();
  const palette = colorThief.getPalette(imageElement, 50);

  // 统计颜色面积占比
  const colorAreas = analyzeColorAreas(imageElement, palette);

  // 分析图片风格
  const style = analyzeImageStyle(palette, colorAreas);

  console.log('[ColorUtils] 图片风格分析:', {
    isMonochrome: style.isMonochrome,
    isVibrant: style.isVibrant,
    avgSaturation: style.avgSaturation.toFixed(3),
    avgLightness: style.avgLightness.toFixed(3),
    maxHighSatArea: style.maxHighSatArea.toFixed(3),
    风格: style.isMonochrome ? '黑白风' : style.isVibrant ? '鲜艳风' : '柔和风',
  });

  // 过滤有效颜色并计算综合评分
  const candidates = palette
    .map((rgb) => {
      const [r, g, b] = rgb;
      const [h, s, l] = rgbToHsl(r, g, b);
      const key = `${r},${g},${b}`;
      const areaRatio = colorAreas.get(key)?.areaRatio || 0;

      // 综合评分: 面积占比 * 0.8 + 饱和度 * 0.6 + 亮度 * 0.2
      const score = areaRatio * 0.8 + s * 0.6 + l * 0.2;

      return {
        rgb: rgb as RGB,
        h,
        s,
        l,
        hex: rgbToHex(r, g, b),
        score,
        areaRatio,
      };
    })
    .filter((c) => isColorGood(c.rgb, style.isMonochrome))
    .sort((a, b) => b.score - a.score);

  console.log(`[ColorUtils] 有效候选颜色数: ${candidates.length}/${palette.length}`);

  // 输出前5个候选颜色的详细信息
  if (candidates.length > 0) {
    console.log('[ColorUtils] 前5个候选颜色详情:');
    candidates.slice(0, 5).forEach((c, i) => {
      console.log(
        `  ${i + 1}. ${c.hex} | H:${(c.h * 360).toFixed(0)}° S:${(c.s * 100).toFixed(
          1,
        )}% L:${(c.l * 100).toFixed(1)}% | 面积:${(c.areaRatio * 100).toFixed(2)}% | 评分:${c.score.toFixed(3)}`,
      );
    });
  }

  // 选择差异最大的颜色
  let distinctColors = selectDistinctColors(candidates, count);

  console.log(`[ColorUtils] 选择的 ${distinctColors.length} 个颜色:`, distinctColors);

  // 输出选择的颜色详情
  distinctColors.forEach((hex, i) => {
    const candidate = candidates.find((c) => c.hex === hex);
    if (candidate) {
      console.log(
        `  选择 ${i + 1}: ${hex} | H:${(candidate.h * 360).toFixed(0)}° S:${(candidate.s * 100).toFixed(
          1,
        )}% L:${(candidate.l * 100).toFixed(1)}%`,
      );
    }
  });

  // 降级策略: 颜色不足时按频率补充(仍需通过过滤)
  if (distinctColors.length < count) {
    console.log(`[ColorUtils] 颜色不足,启动降级策略: ${distinctColors.length}/${count}`);

    const allCandidates = palette
      .map((rgb) => {
        const [r, g, b] = rgb;
        const [h, s, l] = rgbToHsl(r, g, b);
        const key = `${r},${g},${b}`;
        const areaRatio = colorAreas.get(key)?.areaRatio || 0;
        return {
          rgb: rgb as RGB,
          h,
          s,
          l,
          hex: rgbToHex(r, g, b),
          score: areaRatio,
          areaRatio,
        };
      })
      .filter((c) => !distinctColors.includes(c.hex))
      .filter((c) => {
        // 黑白图片降级时仍然只选低饱和色
        if (style.isMonochrome) {
          return c.s < 0.3;
        }
        // 普通图片降级时放宽到只过滤极端情况
        const luminance = getLuminance(c.rgb[0], c.rgb[1], c.rgb[2]);
        return luminance > 0.1 && luminance < 0.9;
      })
      .sort((a, b) => b.areaRatio - a.areaRatio);

    const needed = count - distinctColors.length;
    const fallback = selectDistinctColors(allCandidates, needed);
    console.log(`[ColorUtils] 降级补充颜色数: ${fallback.length}`);
    distinctColors = [...distinctColors, ...fallback];
  }

  // 应用自适应调整
  const adjustedColors = distinctColors.map((color) => adjustColorForBackground(color, style));

  console.log('[ColorUtils] 调整后的背景色:');
  adjustedColors.forEach((adjusted, i) => {
    console.log(`  ${i + 1}. ${distinctColors[i]} → ${adjusted}`);
  });

  return {
    colors: adjustedColors,
    style,
  };
};
