import { getRGBString } from './useOctreeColorExtractor'

// 判断颜色是否合适（保持不变）
function isValidColor(r: number, g: number, b: number): boolean {
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 100 && brightness < 240
}

// 修改：直接接受 RGB 元组作为参数
function getColorDifference(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  const rDiff = rgb1[0] - rgb2[0]
  const gDiff = rgb1[1] - rgb2[1]
  const bDiff = rgb1[2] - rgb2[2]
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

// 修改：参数类型和返回类型改为 RGB 元组数组
function filterDiverseColors(
  colors: [number, number, number][],
  count: number,
): [number, number, number][] {
  if (colors.length <= count) {
    return colors
  }

  const result: [number, number, number][] = [colors[0]]
  const minDifference = 100

  for (const color of colors) {
    if (result.length >= count) {
      break
    }

    const isDiverse = result.every(
      selectedColor => getColorDifference(color, selectedColor) >= minDifference,
    )

    if (isDiverse) {
      result.push(color)
    }
  }

  return result
}

// 修改：返回类型改为 RGB 元组数组
function extractColors(
  imageData: Uint8ClampedArray<ArrayBufferLike>,
): [number, number, number][] {
  const colorMap = new Map<string, number>() // 使用字符串作为颜色唯一标识

  for (let i = 0; i < imageData.length; i += 16) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]

    if (isValidColor(r, g, b)) {
      const colorKey = `${r},${g},${b}`
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
    }
  }

  // 将颜色字符串转换为 RGB 元组
  const allColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([colorKey]) => {
      const parts = colorKey.split(',').map(Number)
      return [parts[0], parts[1], parts[2]] as [number, number, number]
    })

  return filterDiverseColors(allColors, 3)
}

export function useQuickColorExtractor(imageData: MaybeRef<Uint8ClampedArray<ArrayBufferLike> | undefined>) {
  const quickColors = ref<[number, number, number][]>([])
  watchEffect(() => {
    const _imageData = toValue(imageData)
    if (!_imageData || !_imageData.byteLength) {
      quickColors.value = []
      return
    }
    quickColors.value = extractColors(_imageData)
  })

  return {
    sourceQuickColors: quickColors,
    quickColors: computed(() => quickColors.value.map(getRGBString)),
  }
}
