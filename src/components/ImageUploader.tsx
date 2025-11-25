import React, { useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (url: string) => void;
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageSelect(url);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      onImageSelect(urlInput);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <label className="cursor-pointer flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 rounded-xl transition-colors gap-2 font-medium">
          <Upload size={18} />
          <span>上传图片</span>
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
        
        <div className="hidden sm:block text-zinc-300 dark:text-zinc-700">|</div>

        <form onSubmit={handleUrlSubmit} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" 
              placeholder="粘贴图片链接..." 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-medium transition-colors text-sm">
            确定
          </button>
        </form>
      </div>
    </div>
  );
}
