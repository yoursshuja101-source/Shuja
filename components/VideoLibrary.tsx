
import React from 'react';
import { VideoAsset } from '../types';

interface VideoLibraryProps {
  assets: VideoAsset[];
  activeId: string | null;
  onSelect: (asset: VideoAsset) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ assets, activeId, onSelect }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Project Assets</h3>
        <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-500">{assets.length} items</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {assets.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-gray-600 text-sm">
            <i className="fa-regular fa-folder-open text-3xl mb-2 opacity-20"></i>
            <p>No videos generated yet</p>
          </div>
        ) : (
          assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onSelect(asset)}
              className={`w-full group text-left rounded-xl overflow-hidden border transition-all ${
                activeId === asset.id 
                ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-500/5' 
                : 'border-transparent bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="relative aspect-video bg-black/40">
                <video src={asset.url} className="w-full h-full object-cover" muted />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-gray-300">
                  {asset.resolution}
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-gray-200 truncate">{asset.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{asset.prompt}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
