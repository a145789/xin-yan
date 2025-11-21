export const generatePostcard = (
  image: HTMLImageElement,
  backgroundColor: string,
  paddingPercent: number = 10,
  borderRadius: number = 20,
  blurAmount: number = 40
): string => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 1. Draw blurred background image
  ctx.filter = `blur(${blurAmount}px)`;
  // Scale up slightly to avoid edges showing white/transparent
  ctx.drawImage(image, -50, -50, width + 100, height + 100);
  ctx.filter = 'none';

  // 2. Draw color overlay (tint)
  // Convert hex to rgba with opacity to allow texture to show through
  ctx.fillStyle = hexToRgba(backgroundColor, 0.6); // 60% opacity color
  ctx.fillRect(0, 0, width, height);

  // Calculate inner image size based on padding
  const padding = Math.min(width, height) * (paddingPercent / 100);
  
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  
  const x = padding;
  const y = padding;

  // Draw shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = Math.min(width, height) * 0.05; // Responsive shadow
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.min(width, height) * 0.02;
  
  // Draw rounded image
  roundedRect(ctx, x, y, innerWidth, innerHeight, borderRadius);
  ctx.clip();

  ctx.drawImage(image, x, y, innerWidth, innerHeight);
  ctx.restore();

  return canvas.toDataURL('image/png');
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateBlurredPostcard = (
  image: HTMLImageElement,
  paddingPercent: number = 10,
  borderRadius: number = 20,
  blurAmount: number = 40
): string => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Draw blurred background
  ctx.filter = `blur(${blurAmount}px)`;
  // Draw image to cover, scale up slightly to avoid edges
  ctx.drawImage(image, -50, -50, width + 100, height + 100);
  ctx.filter = 'none';

  // Draw overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // Calculate inner image size
  const padding = Math.min(width, height) * (paddingPercent / 100);
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  const x = padding;
  const y = padding;

  // Draw shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = Math.min(width, height) * 0.05;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.min(width, height) * 0.02;

  // Draw rounded image
  roundedRect(ctx, x, y, innerWidth, innerHeight, borderRadius);
  ctx.clip();

  ctx.drawImage(image, x, y, innerWidth, innerHeight);
  ctx.restore();

  return canvas.toDataURL('image/png');
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
