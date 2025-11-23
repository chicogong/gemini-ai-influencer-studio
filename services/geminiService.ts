import { GoogleGenAI } from "@google/genai";

export const generateDanceVideo = async (
  imageBase64: string,
  prompt: string,
  apiKey: string
): Promise<string> => {
  // Always create a new instance with the latest key
  const ai = new GoogleGenAI({ apiKey });

  // Clean the base64 string if it contains the prefix
  const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  
  try {
    console.log("Starting video generation with Veo...");
    
    // Using Veo Fast for quicker results, suitable for app demos
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt, 
      image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png', // Veo generally handles re-encoding, but ensuring standard mime is good
      },
      config: {
        numberOfVideos: 1,
        resolution: '1080p', // Enhanced for Digital Human quality
        aspectRatio: '9:16' // TikTok style
      }
    });

    console.log("Operation created, polling for completion...");

    // Poll until done
    while (!operation.done) {
      // Wait 5 seconds between polls
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Polling status:", operation.metadata);
    }

    if (operation.error) {
      throw new Error(`Generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("No video URI returned in response");
    }

    console.log("Video generated, fetching content...");

    // The response.body contains the MP4 bytes. Must append API key.
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!response.ok) {
       throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error: any) {
    console.error("Gemini Video Gen Error:", error);
    // Handle specific error for re-selecting key
    if (error.message && error.message.includes("Requested entity was not found")) {
       throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};