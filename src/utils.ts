// 计算颜色的亮度，用于决定文字颜色
function getLuminance(rgb: string): number {
  const match = rgb.match(/\d+/g)
  if (!match) {
    return 0
  }
  const [r, g, b] = match.map(Number)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

// 根据背景色的亮度决定文字颜色
export function getTextColor(rgb: string, lightClass: string, darkClass: string): string {
  return getLuminance(rgb) > 0.5 ? lightClass : darkClass
}
