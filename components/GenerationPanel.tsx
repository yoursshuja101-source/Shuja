
import React, { useState, useRef } from 'react';
import { GeminiVideoService } from '../services/gemini';
import { AspectRatio, Resolution, VideoAsset } from '../types';

interface GenerationPanelProps {
  onVideoCreated: (video: VideoAsset) => void;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({ onVideoCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBytes, setImageBytes] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      // Extract base64
      const base64 = result.split(',')[1];
      setImageBytes(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt && !imageBytes) return;
    
    setIsGenerating(true);
    setStatus('Initializing AI engine...');
    
    const statuses = [
      'Analyzing creative prompt...',
      'Synthesizing visual frames...',
      'Rendering temporal consistency...',
      'Optimizing cinematic color space...',
      'Finalizing MP4 output...',
      'Uploading to studio...'
    ];
    
    let statusIndex = 0;
    const interval = setInterval(() => {
      setStatus(statuses[statusIndex % statuses.length]);
      statusIndex++;
    }, 6000);

    try {
      const { url, apiVideo } = await GeminiVideoService.generateVideo({
        prompt: prompt || 'An cinematic AI generated scene',
        aspectRatio,
        resolution,
        imageBytes: imageBytes || undefined,
      });

      onVideoCreated({
        id: Math.random().toString(36).substr(2, 9),
        name: `Shot_${new Date().toLocaleTimeString()}`,
        url: url,
        apiVideo: apiVideo,
        prompt: prompt || 'Image to Video Conversion',
        timestamp: Date.now(),
        type: 'generated',
        resolution,
        aspectRatio,
      });

      setPrompt('');
      setImagePreview(null);
      setImageBytes(null);
    } catch (error: any) {
      console.error(error);
      alert(`Generation failed: ${error.message}`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto custom-scrollbar">
      <section>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Creative Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your cinematic vision (e.g. A neon-lit cyberpunk city in the rain, hyper-realistic, 4k)..."
          className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
        />
      </section>

      <section>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Starting Reference (Optional)</label>
        {!imagePreview ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-white/10 rounded-2xl py-8 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-white/5 transition-all group"
          >
            <i className="fa-solid fa-image text-2xl mb-2 text-gray-500 group-hover:text-indigo-400"></i>
            <span className="text-xs text-gray-500">Upload starting image</span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden group">
            <img src={imagePreview} className="w-full aspect-video object-cover" />
            <button 
              onClick={() => { setImagePreview(null); setImageBytes(null); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
      </section>

      <div className="grid grid-cols-2 gap-4">
        <section>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Format</label>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button 
              onClick={() => setAspectRatio('16:9')}
              className={`flex-1 py-2 text-xs rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              16:9
            </button>
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 py-2 text-xs rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              9:16
            </button>
          </div>
        </section>
        <section>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quality</label>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button 
              onClick={() => setResolution('720p')}
              className={`flex-1 py-2 text-xs rounded-lg transition-all ${resolution === '720p' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              720p
            </button>
            <button 
              onClick={() => setResolution('1080p')}
              className={`flex-1 py-2 text-xs rounded-lg transition-all ${resolution === '1080p' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              1080p
            </button>
          </div>
        </section>
      </div>

      <button
        disabled={isGenerating || (!prompt && !imageBytes)}
        onClick={handleGenerate}
        className={`mt-4 w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${
          isGenerating || (!prompt && !imageBytes) 
          ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
          : 'gradient-primary text-white shadow-xl shadow-indigo-500/20 active:scale-95'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>Generate Video</span>
          </>
        )}
      </button>

      {isGenerating && (
        <div className="mt-2 text-center">
          <p className="text-xs text-indigo-400 animate-pulse-slow">{status}</p>
          <p className="text-[10px] text-gray-600 mt-2">Creation can take up to 2 minutes</p>
        </div>
      )}
    </div>
  );
};
