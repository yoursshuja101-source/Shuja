
import React, { useState, useEffect } from 'react';
import { ApiKeyGuard } from './components/ApiKeyGuard';
import { GenerationPanel } from './components/GenerationPanel';
import { VideoLibrary } from './components/VideoLibrary';
import { VideoAsset } from './types';
import { GeminiVideoService } from './services/gemini';

const App: React.FC = () => {
  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoAsset | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [extensionPrompt, setExtensionPrompt] = useState('');

  const handleVideoCreated = (video: VideoAsset) => {
    setAssets(prev => [video, ...prev]);
    setActiveVideo(video);
  };

  const handleExtend = async () => {
    // We must use the original apiVideo object for extension, not the local blob URL.
    if (!activeVideo || !extensionPrompt || !activeVideo.apiVideo) return;
    
    setIsExtending(true);
    try {
      const { url, apiVideo } = await GeminiVideoService.extendVideo({
        prompt: extensionPrompt,
        video: activeVideo.apiVideo,
        aspectRatio: activeVideo.aspectRatio as any,
      });

      const extendedVideo: VideoAsset = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${activeVideo.name} (Ext)`,
        url: url,
        apiVideo: apiVideo,
        prompt: extensionPrompt,
        timestamp: Date.now(),
        type: 'generated',
        resolution: activeVideo.resolution,
        aspectRatio: activeVideo.aspectRatio,
      };

      setAssets(prev => [extendedVideo, ...prev]);
      setActiveVideo(extendedVideo);
      setExtensionPrompt('');
    } catch (error) {
      console.error(error);
      alert("Extension failed. Please try again.");
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <ApiKeyGuard>
      <div className="flex h-screen w-screen bg-[#050505] text-gray-100 overflow-hidden">
        
        {/* Sidebar - Assets */}
        <aside className="w-72 glass border-r border-white/5 flex flex-col z-20">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-play text-white text-xs"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight">LUMINA</h1>
          </div>
          <div className="flex-1 min-h-0">
            <VideoLibrary 
              assets={assets} 
              activeId={activeVideo?.id || null} 
              onSelect={setActiveVideo} 
            />
          </div>
          <div className="p-4 bg-white/5 border-t border-white/5">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest">Engine Online</span>
            </div>
          </div>
        </aside>

        {/* Main Editor View */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
          {/* Header */}
          <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between glass z-10">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-mono tracking-tighter">PROJECT_01 // VEO_STUDIO</span>
              <div className="h-4 w-px bg-white/10"></div>
              <h2 className="text-sm font-medium text-gray-300">{activeVideo ? activeVideo.name : 'Ready for generation'}</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-all">
                <i className="fa-solid fa-download mr-2"></i> Export
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
            </div>
          </header>

          {/* Player & Extension area */}
          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center rounded-3xl overflow-hidden glass relative group">
              {activeVideo ? (
                <>
                  <video 
                    key={activeVideo.url}
                    src={activeVideo.url} 
                    className="max-w-full max-h-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-xs font-mono border border-white/10">
                    {activeVideo.resolution} // {activeVideo.aspectRatio}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                    <i className="fa-solid fa-clapperboard text-4xl text-gray-600"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-400">Preview Canvas</h3>
                    <p className="text-sm text-gray-600 mt-1">Generate a video on the right to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Extension Tools */}
            {activeVideo && (
              <div className="glass rounded-3xl p-6 border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <i className="fa-solid fa-timeline"></i>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Infinite Extension</h3>
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={extensionPrompt}
                    onChange={(e) => setExtensionPrompt(e.target.value)}
                    placeholder="Describe what happens next (e.g. The character walks into the sunset...)"
                    className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button 
                    disabled={isExtending || !extensionPrompt}
                    onClick={handleExtend}
                    className={`px-8 rounded-2xl font-bold flex items-center gap-3 transition-all ${
                      isExtending || !extensionPrompt
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20 active:scale-95'
                    }`}
                  >
                    {isExtending ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <i className="fa-solid fa-plus"></i>
                    )}
                    <span>Extend +7s</span>
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-gray-500">AI will intelligently continue the sequence maintaining visual identity and environment.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Panel - Generation Tools */}
        <aside className="w-[400px] glass border-l border-white/5 z-20">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-indigo-400"></i>
            <h3 className="font-semibold text-sm uppercase tracking-wider">Creation Engine</h3>
          </div>
          <GenerationPanel onVideoCreated={handleVideoCreated} />
        </aside>

      </div>
    </ApiKeyGuard>
  );
};

export default App;
