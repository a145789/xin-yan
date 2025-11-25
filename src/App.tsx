import { useState, useRef, useEffect } from 'react';
import { extractColors } from './utils/colorUtils';
import { generatePostcard, generateBlurredPostcard } from './utils/imageUtils';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { PostcardPreview } from './components/PostcardPreview';
import './index.css';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; color: string }[]>([]);
  const [blurredImage, setBlurredImage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [settings, setSettings] = useState({
    padding: 10,
    borderRadius: 20,
    blurAmount: 40
  });

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setGeneratedImages([]);
    setBlurredImage(null);
  };

  const processImage = async () => {
    if (!imageRef.current || !imageUrl) return;

    setLoading(true);
    try {
      if (!imageRef.current.complete) {
        await new Promise((resolve) => {
            if(imageRef.current) imageRef.current.onload = resolve;
        });
      }

      const colors = await extractColors(imageRef.current, 10);
      
      const postcards = colors.map(color => ({
        url: generatePostcard(imageRef.current!, color, settings.padding, settings.borderRadius, settings.blurAmount),
        color
      }));
      
      setGeneratedImages(postcards);

      const blurred = generateBlurredPostcard(imageRef.current!, settings.padding, settings.borderRadius, settings.blurAmount);
      setBlurredImage(blurred);

    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when image loads or settings change
  useEffect(() => {
    if (imageUrl) {
      // Debounce slightly to avoid rapid re-generation during slider drag
      const timer = setTimeout(() => {
        processImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imageUrl, settings]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <Header theme={theme} toggleTheme={toggleTheme} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            <ImageUploader onImageSelect={handleImageSelect} />
            
            {imageUrl && (
              <SettingsPanel settings={settings} setSettings={setSettings} />
            )}
            
            {/* Instruction / Tip */}
            {!imageUrl && (
               <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  <p>✨ <b>小贴士：</b> 上传一张图片，我们将自动为您提取主题色并生成一系列精美的明信片。</p>
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
