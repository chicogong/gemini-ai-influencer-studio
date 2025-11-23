import React, { useState, useEffect, useCallback } from 'react';
import { Video, Music, Sparkles, Download, Share2, AlertCircle, RefreshCw, Key, Heart, MessageCircle, Plus, Users, User } from 'lucide-react';
import { Button } from './components/Button';
import { UploadZone } from './components/UploadZone';
import { generateDanceVideo } from './services/geminiService';
import { DANCE_STYLES, LOADING_MESSAGES } from './constants';
import { AppState, DanceStyle } from './types';

function App() {
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DanceStyle>(DANCE_STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>(LOADING_MESSAGES[0]);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setApiKeySet(hasKey);
        }
      } catch (e) {
        console.error("Error checking API key status", e);
      }
    };
    checkKey();
  }, []);

  const handleKeySelection = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // Assume success if no error thrown, proceed
        setApiKeySet(true);
        setErrorMsg(null);
      }
    } catch (e) {
      console.error("Error selecting key", e);
      setErrorMsg("Failed to select API key. Please try again.");
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    // Use custom prompt if provided, otherwise build one from the style
    const finalPrompt = customPrompt.trim() 
      ? `${customPrompt}, 9:16 vertical video` 
      : selectedStyle.prompt;

    setAppState(AppState.GENERATING);
    setErrorMsg(null);

    // Rotate loading messages
    const msgInterval = setInterval(() => {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 4000);

    try {
      // API Key is injected by the environment after selection
      const key = process.env.API_KEY || ''; 
      
      const url = await generateDanceVideo(selectedImage, finalPrompt, key);
      setVideoUrl(url);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'API_KEY_INVALID') {
        setApiKeySet(false);
        setErrorMsg("API Key expired or invalid. Please select a paid project key.");
      } else {
        setErrorMsg(err.message || "Something went wrong generating the video.");
      }
      setAppState(AppState.ERROR);
    } finally {
      clearInterval(msgInterval);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setErrorMsg(null);
    // Keep image for easy retry
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `ai-influencer-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // --- Render: API Key Wall ---
  if (!apiKeySet) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700 shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-tiktok-cyan to-tiktok-magenta rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
            <Key size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Access Required
          </h1>
          <p className="text-slate-300 mb-8 leading-relaxed">
            To generate high-quality AI Influencer videos with Veo, you need to connect a paid Google Cloud Project API key.
          </p>
          <Button onClick={handleKeySelection} variant="tiktok" className="w-full justify-center">
            Connect Billing Account
          </Button>
          <p className="mt-6 text-xs text-slate-500">
            Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Gemini API billing</a>.
          </p>
        </div>
      </div>
    );
  }

  // --- Render: Main App ---
  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-tiktok-magenta selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-tiktok-cyan to-tiktok-magenta flex items-center justify-center">
              <Users size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Influencer Studio</span>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Powered by Google Veo
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">1</span>
                  Upload Model Photo
                </h2>
                {selectedImage && (
                   <button onClick={() => setSelectedImage(null)} className="text-xs text-red-400 hover:text-red-300">
                     Remove
                   </button>
                )}
              </div>
              <UploadZone 
                selectedImage={selectedImage}
                onImageSelected={setSelectedImage}
                onClear={() => setSelectedImage(null)}
              />
            </div>

            {/* 2. Style Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">2</span>
                Choose Persona
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {DANCE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`
                      p-4 rounded-xl border text-left transition-all duration-200
                      flex flex-col gap-2 hover:bg-slate-800
                      ${selectedStyle.id === style.id 
                        ? 'border-tiktok-cyan bg-slate-800 shadow-[0_0_15px_rgba(0,242,234,0.2)]' 
                        : 'border-slate-700 bg-slate-900 text-slate-400'}
                    `}
                  >
                    <span className="text-2xl">{style.icon}</span>
                    <span className="font-medium text-sm">{style.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Prompt Toggle */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                  Or Describe Custom Scenario
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g. A digital avatar doing a robot dance in a neon city, glitch effects..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tiktok-magenta transition-colors h-24 resize-none"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 sticky bottom-4 z-10">
              <Button 
                variant="tiktok" 
                className="w-full text-lg h-14"
                onClick={handleGenerate}
                disabled={!selectedImage || appState === AppState.GENERATING}
                isLoading={appState === AppState.GENERATING}
              >
                {appState === AppState.GENERATING ? 'Creating Influencer...' : 'Generate Video'}
                {!appState && <Sparkles size={20} />}
              </Button>
            </div>
            
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex gap-3 items-start">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Right Column: Preview / Result */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-2 shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative max-w-[400px] mx-auto lg:max-w-none lg:mx-0 lg:aspect-[9/16]">
                
                {/* Header of Phone Mockup */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none flex justify-center pt-6 gap-6 text-white font-semibold text-shadow">
                    <span className="opacity-60 text-sm">Following</span>
                    <span className="text-sm border-b-2 border-white pb-1">For You</span>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 rounded-2xl bg-black overflow-hidden relative flex items-center justify-center">
                  
                  {appState === AppState.IDLE && (
                    <div className="text-center p-8">
                      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={40} className="text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-300 mb-2">Preview Stage</h3>
                      <p className="text-slate-500">Your digital human will appear here.</p>
                    </div>
                  )}

                  {appState === AppState.GENERATING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/90 z-30">
                      <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-t-4 border-tiktok-cyan rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-r-4 border-tiktok-magenta rounded-full animate-spin animation-delay-150"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tiktok-cyan to-tiktok-magenta animate-pulse mb-4 text-center">
                        Processing
                      </h3>
                      <p className="text-slate-400 text-center max-w-xs animate-pulse-fast">
                        {loadingMsg}
                      </p>
                      <p className="text-slate-600 text-xs mt-8">This may take 1-2 minutes</p>
                    </div>
                  )}

                  {appState === AppState.COMPLETE && videoUrl && (
                    <div className="relative w-full h-full group bg-black">
                      <video 
                        src={videoUrl} 
                        className="w-full h-full object-contain"
                        autoPlay
                        loop
                        playsInline
                        controls={false}
                      />

                       {/* TikTok Interface Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
                           <div /> {/* Spacer */}

                           {/* Right Sidebar - Icons */}
                           <div className="self-end flex flex-col items-center gap-6 mb-16 pointer-events-auto">
                              <div className="relative mb-2">
                                 <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-slate-800">
                                   {selectedImage ? (
                                      <img src={selectedImage} className="w-full h-full object-cover" alt="User" />
                                   ) : (
                                      <User className="p-2 text-white" />
                                   )}
                                 </div>
                                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-tiktok-magenta rounded-full p-0.5 cursor-pointer">
                                   <Plus size={12} className="text-white" />
                                 </div>
                              </div>
                              
                              <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                                <Heart size={32} className="text-white drop-shadow-lg" fill="white" />
                                <span className="text-xs font-semibold drop-shadow-md text-white">8.2M</span>
                              </div>
                              
                               <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                                <MessageCircle size={32} className="text-white drop-shadow-lg" fill="rgba(255,255,255,0.9)" />
                                <span className="text-xs font-semibold drop-shadow-md text-white">24.5K</span>
                              </div>

                               <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                                <Share2 size={32} className="text-white drop-shadow-lg" fill="rgba(255,255,255,0.9)" />
                                <span className="text-xs font-semibold drop-shadow-md text-white">Share</span>
                              </div>
                           </div>

                           {/* Bottom Info */}
                           <div className="mb-2">
                              <div className="font-semibold text-white drop-shadow-md mb-2 text-lg">@ai_influencer_star</div>
                              <div className="text-sm text-white/90 drop-shadow-md mb-4 leading-snug max-w-[80%]">
                                Check out my new AI moves! 🤖💃 Created with #AIStudio #DigitalHuman #{selectedStyle.id}
                              </div>
                              <div className="flex items-center gap-3 text-white/90">
                                 <Music size={14} className="animate-spin-slow" />
                                 <div className="text-xs overflow-hidden w-40 relative h-4">
                                   <div className="absolute animate-marquee whitespace-nowrap">
                                      Original Sound - AI Beats • Original Sound - AI Beats • Original Sound - AI Beats
                                   </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      
                      {/* Overlay Controls for Saving */}
                      <div className="absolute top-16 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                          <Button onClick={handleDownload} variant="secondary" className="px-3 py-2 text-xs bg-black/50 backdrop-blur border-none hover:bg-black/70 mb-2">
                            <Download size={14} className="mr-1" /> Save Video
                          </Button>
                          <Button onClick={handleReset} variant="secondary" className="px-3 py-2 text-xs bg-black/50 backdrop-blur border-none hover:bg-black/70">
                            <RefreshCw size={14} className="mr-1" /> New Gen
                          </Button>
                      </div>
                    </div>
                  )}
                  
                  {appState === AppState.ERROR && (
                    <div className="text-center p-8">
                       <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertCircle size={40} />
                      </div>
                      <h3 className="text-white font-bold mb-2">Generation Failed</h3>
                      <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                        We couldn't generate the video. Please check your image and try again.
                      </p>
                      <Button onClick={handleReset} variant="secondary">Try Again</Button>
                    </div>
                  )}

                </div>

                {/* Spinning Disc (Bottom Right) - visual detail commonly found in music apps */}
                {appState === AppState.COMPLETE && (
                   <div className="absolute bottom-6 right-4 w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center overflow-hidden animate-spin pointer-events-none z-20">
                      <div className="w-full h-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center">
                         <div className="w-3 h-3 bg-black rounded-full" />
                      </div>
                   </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;