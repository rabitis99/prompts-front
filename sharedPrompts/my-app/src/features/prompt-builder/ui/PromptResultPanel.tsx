import React from 'react';
import type { UnifiedGeneratePromptResponse } from '../types/prompt-builder.types';

interface PromptResultPanelProps {
  generationResult: UnifiedGeneratePromptResponse | null;
  isLoading: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

export const PromptResultPanel: React.FC<PromptResultPanelProps> = ({
  generationResult,
  isLoading,
  onGenerate,
  canGenerate,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50 shadow-inner h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Preview & Output</h2>
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {isLoading ? 'Generating...' : 'Generate Prompt'}
        </button>
      </div>

      <div className="flex-1 min-h-[400px] mt-4 relative border border-gray-200 rounded-md bg-white p-4 overflow-y-auto flex flex-col gap-4 shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
            <span className="text-blue-600 font-medium animate-pulse">Crafting your prompt...</span>
          </div>
        )}
        
        {generationResult ? (
          <>
            <div className="whitespace-pre-wrap text-gray-800 font-mono text-sm p-2 bg-gray-50 rounded border">
              {generationResult.output}
            </div>
            
            {generationResult.semantic_resolution_summary && (
              <div className="mt-4 text-xs text-gray-500 bg-blue-50/50 p-3 rounded-md border border-blue-100">
                <strong>Resolution Summary:</strong><br />
                {generationResult.semantic_resolution_summary}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 flex items-center justify-center h-full text-center p-8">
            Your final generated prompt will appear here. Start typing on the left and hit 'Generate Prompt' when you're ready.
          </div>
        )}
      </div>
    </div>
  );
};
