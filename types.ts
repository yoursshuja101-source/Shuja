
export interface VideoAsset {
  id: string;
  name: string;
  url: string;
  // Store the API video object to allow sequence extension in subsequent calls
  apiVideo?: any;
  prompt: string;
  timestamp: number;
  type: 'generated' | 'uploaded';
  resolution: string;
  aspectRatio: string;
}

export interface GenerationState {
  isGenerating: boolean;
  progressMessage: string;
  error: string | null;
}

export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

declare global {
  /**
   * AIStudio interface for Gemini API key selection.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    /**
     * Augment Window interface with aistudio property.
     * Use readonly to match common environment declarations and fix modifier errors.
     */
    readonly aistudio: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
