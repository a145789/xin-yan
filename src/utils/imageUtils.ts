export const generatePostcard = (
  image: HTMLImageElement,
  primaryColor: string,
  secondaryColor: string,
  layoutMode: 'standard' | 'polaroid' = 'standard'
): string => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 1. Draw Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, secondaryColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Noise Texture
  drawNoise(ctx, width, height);

  // 3. Smart Defaults & Layout
  let paddingLeft, paddingRight, paddingTop, paddingBottom;
  
  if (layoutMode === 'polaroid') {
      // Polaroid: Larger bottom padding
      const sidePadding = Math.min(width, height) * 0.05;
      paddingLeft = paddingRight = paddingTop = sidePadding;
      paddingBottom = Math.min(width, height) * 0.18;
  } else {
      // Standard: Even padding
      const padding = Math.min(width, height) * 0.07;
      paddingLeft = paddingRight = paddingTop = paddingBottom = padding;
  }

  const innerWidth = width - (paddingLeft + paddingRight);
  const innerHeight = height - (paddingTop + paddingBottom);
  const x = paddingLeft;
  const y = paddingTop;

  // Smart Radius: Small, sharp corners (2px - 4px scaled by resolution)
  // We'll use a small percentage of min dimension to keep it proportional but sharp
  const radius = Math.max(2, Math.min(width, height) * 0.003); 

  // 4. Draw Diffused Shadow
  ctx.save();
  // Shadow color: Primary color with low opacity
  ctx.shadowColor = hexToRgba(primaryColor, 0.4);
  // Large blur radius for diffusion
  ctx.shadowBlur = Math.min(width, height) * 0.08; 
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.min(width, height) * 0.04;
  
  // Draw rounded rect for shadow casting
  ctx.fillStyle = 'white'; // Placeholder for shadow casting
  roundedRect(ctx, x, y, innerWidth, innerHeight, radius);
  ctx.fill();
  ctx.restore();

  // 5. Draw Image
  ctx.save();
  roundedRect(ctx, x, y, innerWidth, innerHeight, radius);
  ctx.clip();
  ctx.drawImage(image, x, y, innerWidth, innerHeight);
  ctx.restore();

  return canvas.toDataURL('image/png');
};

// Helper to draw noise
const drawNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iData = ctx.createImageData(w, h);
    const buffer32 = new Uint32Array(iData.data.buffer);
    const len = buffer32.length;

    for (let i = 0; i < len; i++) {
        if (Math.random() < 0.1) { // 10% density
            // White noise with very low alpha
            // Little endian: AABBGGRR
            // Alpha = 15 (approx 6%), RGB = 255
            buffer32[i] = 0x0f000000; 
        }
    }
    
    // Draw noise on a temp canvas to handle scaling if needed, 
    // but here we are drawing directly to the main canvas context? 
    // Wait, putImageData ignores current transform and clips.
    // Better to draw to a temp canvas and drawImage it back if we had transforms.
    // Since we are at 0,0 with no transform, putImageData is fine but it overwrites.
    // We want OVERLAY.
    
    // Better approach for overlay:
    // Create a small noise pattern and repeat it? Or just fill a temp canvas and draw it with globalAlpha.
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        const imgData = tempCtx.createImageData(width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;     // r
            data[i + 1] = val; // g
            data[i + 2] = val; // b
            data[i + 3] = 20;  // alpha (low opacity)
        }
        tempCtx.putImageData(imgData, 0, 0);
        
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }
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
  layoutMode: 'standard' | 'polaroid' = 'standard'
): string => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 1. Draw blurred background
  const blurAmount = 40; // Fixed blur
  ctx.filter = `blur(${blurAmount}px)`;
  // Draw image to cover, scale up slightly to avoid edges
  ctx.drawImage(image, -50, -50, width + 100, height + 100);
  ctx.filter = 'none';

  // 2. Draw overlay (darken slightly for contrast)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Noise Texture
  drawNoise(ctx, width, height);

  // 4. Smart Defaults & Layout
  let paddingLeft, paddingRight, paddingTop, paddingBottom;
  
  if (layoutMode === 'polaroid') {
      const sidePadding = Math.min(width, height) * 0.05;
      paddingLeft = paddingRight = paddingTop = sidePadding;
      paddingBottom = Math.min(width, height) * 0.18;
  } else {
      const padding = Math.min(width, height) * 0.07;
      paddingLeft = paddingRight = paddingTop = paddingBottom = padding;
  }

  const innerWidth = width - (paddingLeft + paddingRight);
  const innerHeight = height - (paddingTop + paddingBottom);
  const x = paddingLeft;
  const y = paddingTop;

  // Smart Radius
  const radius = Math.max(2, Math.min(width, height) * 0.003);

  // 5. Draw Diffused Shadow
  // For blurred background, we can pick a dark shadow or a color from the image if we had it.
  // Since we don't pass color here, we'll use a standard soft black shadow.
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = Math.min(width, height) * 0.08;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.min(width, height) * 0.04;

  // Draw rounded rect for shadow casting
  ctx.fillStyle = 'white';
  roundedRect(ctx, x, y, innerWidth, innerHeight, radius);
  ctx.fill();
  ctx.restore();

  // 6. Draw Image
  ctx.save();
  roundedRect(ctx, x, y, innerWidth, innerHeight, radius);
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
