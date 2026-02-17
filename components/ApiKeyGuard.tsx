
import React, { useState, useEffect } from 'react';

interface ApiKeyGuardProps {
  children: React.ReactNode;
}

export const ApiKeyGuard: React.FC<ApiKeyGuardProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  const checkKey = async () => {
    try {
      const result = await window.aistudio.hasSelectedApiKey();
      setHasKey(result);
    } catch (e) {
      setHasKey(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleOpenSelector = async () => {
    await window.aistudio.openSelectKey();
    // Assume success as per instructions to avoid race conditions
    setHasKey(true);
  };

  if (hasKey === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center">
        <div className="max-w-md w-full glass rounded-3xl p-10 border border-white/10 shadow-2xl">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-key text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4">API Key Required</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            To use the Lumina Video Studio, you must select a valid Gemini API key from a paid Google Cloud project.
          </p>
          <button
            onClick={handleOpenSelector}
            className="w-full py-4 gradient-primary hover:opacity-90 text-white rounded-xl font-semibold transition-all shadow-lg active:scale-95"
          >
            Connect API Key
          </button>
          <p className="mt-6 text-xs text-gray-500">
            Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 hover:underline">billing documentation</a> for more information.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
