
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, Resolution } from "../types";

export class GeminiVideoService {
  /**
   * Generates a new video using the Veo model.
   */
  static async generateVideo(params: {
    prompt: string;
    aspectRatio: AspectRatio;
    resolution: Resolution;
    imageBytes?: string;
    mimeType?: string;
  }) {
    // Create a new instance right before the call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const config = {
      numberOfVideos: 1,
      resolution: params.resolution,
      aspectRatio: params.aspectRatio,
    };

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: params.prompt,
      ...(params.imageBytes ? {
        image: {
          imageBytes: params.imageBytes,
          mimeType: params.mimeType || 'image/png'
        }
      } : {}),
      config
    });

    while (!operation.done) {
      // Reassuring interval for video generation
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const apiVideo = operation.response?.generatedVideos?.[0]?.video;
    const downloadLink = apiVideo?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No URI returned");

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return {
      url: URL.createObjectURL(blob),
      apiVideo
    };
  }

  /**
   * Extends an existing video sequence.
   */
  static async extendVideo(params: {
    prompt: string;
    video: any;
    aspectRatio: AspectRatio;
  }) {
    // Create a new instance right before the call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: params.prompt,
      video: params.video,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: params.aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const apiVideo = operation.response?.generatedVideos?.[0]?.video;
    const downloadLink = apiVideo?.uri;
    if (!downloadLink) throw new Error("Video extension failed");

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return {
      url: URL.createObjectURL(blob),
      apiVideo
    };
  }
}
