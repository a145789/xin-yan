import { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Loader2, Image as ImageIcon, Sliders, Moon, Sun } from 'lucide-react';
import { extractColors } from './utils/colorUtils';
import { generatePostcard, generateBlurredPostcard, downloadImage } from './utils/imageUtils';
import './index.css'

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; color: string }[]>([]);
  const [blurredImage, setBlurredImage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [settings, setSettings] = useState({
    padding: 10,
    borderRadius: 20,
    blurAmount: 40
  });

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      resetState();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      setImageUrl(urlInput);
      resetState();
    }
  };

  const resetState = () => {
    setGeneratedImages([]);
    setBlurredImage(null);
    setExtractedColors([]);
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
      setExtractedColors(colors);
      
      const postcards = colors.map(color => ({
        url: generatePostcard(imageRef.current!, color, settings.padding, settings.borderRadius, settings.blurAmount),
        color
      }));
      
      setGeneratedImages(postcards);

      const blurred = generateBlurredPostcard(imageRef.current!, settings.padding, settings.borderRadius, settings.blurAmount);
      setBlurredImage(blurred);

    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setLoading(false);
    }
  };

  // Re-generate when settings change if we already have results
  useEffect(() => {
    if (generatedImages.length > 0 && !loading) {
        const timer = setTimeout(() => {
            processImage();
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [settings]);

  return (
    <div className="container compact">
      <header className="header-compact">
        <h1>明信片生成器</h1>
        <button onClick={toggleTheme} className="btn icon-btn theme-toggle" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="main-layout">
        {/* Left Panel: Upload & Preview */}
        <div className="left-panel">
          <div className="card compact-card">
            <div className="upload-row">
              <label className="btn icon-btn">
                <Upload size={18} />
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              </label>
              
              <form onSubmit={handleUrlSubmit} className="url-form">
                <div className="input-wrapper">
                  <LinkIcon size={16} className="input-icon" />
                  <input 
                    type="text" 
                    className="input compact-input" 
                    placeholder="图片链接..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn compact-btn">确定</button>
              </form>
            </div>
          </div>

          {imageUrl && (
            <div className="card compact-card">
              <div className="preview-header">
                 <div className="preview-title">
                    <ImageIcon size={18} /> 
                    <span>预览</span>
                 </div>
              </div>

              <div className="image-preview-container">
                <img 
                  ref={imageRef} 
                  src={imageUrl} 
                  alt="Original" 
                  crossOrigin="anonymous"
                  className="main-preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Settings & Results */}
        <div className="right-panel">
          {imageUrl && (
            <div className="card compact-card">
               <div className="preview-header">
                  <div className="preview-title">
                     <Sliders size={18} />
                     <span>参数设置</span>
                  </div>
               </div>

               <div className="settings-panel">
                   <div className="setting-item">
                       <label>边距 ({settings.padding}%)</label>
                       <input 
                         type="range" min="0" max="40" 
                         value={settings.padding} 
                         onChange={e => setSettings({...settings, padding: Number(e.target.value)})} 
                       />
                   </div>
                   <div className="setting-item">
                       <label>圆角 ({settings.borderRadius}px)</label>
                       <input 
                         type="range" min="0" max="100" 
                         value={settings.borderRadius} 
                         onChange={e => setSettings({...settings, borderRadius: Number(e.target.value)})} 
                       />
                   </div>
                   <div className="setting-item">
                       <label>模糊 ({settings.blurAmount}px)</label>
                       <input 
                         type="range" min="0" max="100" 
                         value={settings.blurAmount} 
                         onChange={e => setSettings({...settings, blurAmount: Number(e.target.value)})} 
                       />
                   </div>
               </div>
               
               <button 
                 className="btn primary-btn full-width" 
                 onClick={processImage} 
                 disabled={loading}
               >
                 {loading ? (
                     <span className="loading-text"><Loader2 className="spin" size={18} /> 生成中...</span>
                 ) : '生成明信片'}
               </button>
            </div>
          )}

          {extractedColors.length > 0 && (
              <div className="card compact-card">
                  <h4 className="section-title">提取色板</h4>
                  <div className="color-palette">
                      {extractedColors.map((color, idx) => (
                          <div key={idx} className="color-chip" style={{ backgroundColor: color }} title={color}>
                              <span className="color-hex">{color}</span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {(generatedImages.length > 0 || blurredImage) && (
            <div className="card compact-card">
               <h4 className="section-title">生成结果 <span className="subtitle">(点击下载)</span></h4>
               
               <div className="grid compact-grid">
                  {blurredImage && (
                      <div className="result-item" onClick={() => downloadImage(blurredImage, 'postcard-blur.png')}>
                          <img src={blurredImage} className="postcard-preview" alt="Blurred" />
                          <div className="result-label">高斯模糊</div>
                      </div>
                  )}
                  
                  {generatedImages.map((img, idx) => (
                      <div key={idx} className="result-item" onClick={() => downloadImage(img.url, `postcard-${img.color}.png`)}>
                          <img src={img.url} className="postcard-preview" alt={img.color} />
                          <div className="result-label" style={{ color: img.color }}>{img.color}</div>
                      </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
