import { useState, useRef, useEffect, useEffectEvent } from 'react';
import { extractColors } from './utils/colorUtils';
import { generatePostcard, generateBlurredPostcard } from './utils/imageUtils';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PostcardPreview } from './components/PostcardPreview';
import './index.css';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; color: string }[]>([]);
  const [blurredImage, setBlurredImage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setGeneratedImages([]);
    setBlurredImage(null);
  };

  const processImage = useEffectEvent(async () => {
    if (!imageRef.current || !imageUrl) return;

    setLoading(true);
    setGeneratedImages([]);
    setBlurredImage(null);

    try {
      if (!imageRef.current.complete) {
        await new Promise((resolve) => {
          if (imageRef.current) imageRef.current.onload = resolve;
        });
      }

      // 步骤1: 优先生成高斯模糊版本
      const blurred = generateBlurredPostcard(imageRef.current!);
      setBlurredImage(blurred);

      // 步骤2: 提取2个主色用于渐变
      const result = await extractColors(imageRef.current, 2);
      const { colors } = result;

      // 步骤3: 生成1张渐变背景明信片
      if (colors.length >= 2) {
        const primaryColor = colors[0];
        const secondaryColor = colors[1];

        const postcardUrl = generatePostcard(
          imageRef.current!,
          primaryColor,
          secondaryColor, // 第一个颜色渐变到第二个颜色
        );

        setGeneratedImages([
          {
            url: postcardUrl,
            color: primaryColor,
          },
        ]);
      } else if (colors.length === 1) {
        // 如果只有1个颜色,使用相同颜色
        const primaryColor = colors[0];
        const postcardUrl = generatePostcard(imageRef.current!, primaryColor, primaryColor);

        setGeneratedImages([
          {
            url: postcardUrl,
            color: primaryColor,
          },
        ]);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setLoading(false);
    }
  });

  // Auto-generate when image loads
  useEffect(() => {
    if (imageUrl) {
      const timer = setTimeout(() => {
        processImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <Header theme={theme} toggleTheme={toggleTheme} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            <ImageUploader onImageSelect={handleImageSelect} />

            {/* Instruction / Tip */}
            {!imageUrl && (
              <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                <p>
                  ✨ <b>小贴士:</b> 上传一张图片,我们将自动为您提取主题色并生成精美的明信片。
                </p>
              </div>
            )}
          </div>

          {/* Right Content: Preview & Results */}
          <div className="lg:col-span-8">
            <PostcardPreview
              originalUrl={imageUrl}
              imageRef={imageRef}
              generatedImages={generatedImages}
              blurredImage={blurredImage}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
