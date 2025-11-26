import { Download, Loader2, ImageIcon } from 'lucide-react';
import { downloadImage } from '../utils/imageUtils';

interface GeneratedImage {
  url: string;
  color: string;
}

interface PostcardPreviewProps {
  originalUrl: string | null;
  imageRef: React.RefObject<HTMLImageElement | null>;
  generatedImages: GeneratedImage[];
  blurredImage: string | null;
  loading: boolean;
}

export function PostcardPreview({
  originalUrl,
  imageRef,
  generatedImages,
  blurredImage,
  loading,
}: PostcardPreviewProps) {
  if (!originalUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400">
        <ImageIcon size={48} className="mb-2 opacity-50" />
        <p className="text-sm">上传图片以开始生成</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hidden original image for processing */}
      <div className="hidden">
        <img ref={imageRef} src={originalUrl} alt="Original" crossOrigin="anonymous" />
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12 text-zinc-500 dark:text-zinc-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-3 font-medium">正在生成精美明信片...</span>
        </div>
      )}

      {!loading && (generatedImages.length > 0 || blurredImage) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blurredImage && (
            <div
              className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10"
              onClick={() => downloadImage(blurredImage, 'postcard-blur.png')}
            >
              <img src={blurredImage} className="w-full h-auto object-cover" alt="Blurred" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 dark:bg-black/80 text-zinc-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Download size={14} />
                  <span>下载高斯模糊版</span>
                </div>
              </div>
            </div>
          )}

          {generatedImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10"
              onClick={() => downloadImage(img.url, `postcard-${img.color}.png`)}
            >
              <img src={img.url} className="w-full h-auto object-cover" alt={img.color} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white/90 dark:bg-black/80 text-zinc-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Download size={14} />
                  <span>下载</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: img.color }}></div>
                  <span className="text-xs text-white font-mono">{img.color}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
