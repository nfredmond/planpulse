'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  AVAILABLE_MODELS, 
  PROVIDER_COLORS, 
  DEFAULT_MODEL,
  getModelById,
  getModelsByProvider,
  type ModelOption 
} from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModel = getModelById(selectedModel) || getModelById(DEFAULT_MODEL)!;
  const colors = PROVIDER_COLORS[currentModel.provider];

  const openaiModels = getModelsByProvider('openai');
  const anthropicModels = getModelsByProvider('anthropic');
  const googleModels = getModelsByProvider('google');

  const handleSelect = (model: ModelOption) => {
    onModelChange(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm border border-slate-700/50"
      >
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className="text-white">{currentModel.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-700/50 bg-slate-800/50">
            <p className="text-xs text-slate-400 font-medium px-2">Select AI Model</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {/* OpenAI Models */}
            <div className="p-2">
              <div className="text-xs text-green-400 font-medium px-2 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                OpenAI
              </div>
              {openaiModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModel === model.id 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <p className="text-sm font-medium">{model.name}</p>
                  <p className="text-xs text-slate-500">{model.description}</p>
                </button>
              ))}
            </div>

            {/* Anthropic Models */}
            <div className="p-2 border-t border-slate-700/50">
              <div className="text-xs text-orange-400 font-medium px-2 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Anthropic
              </div>
              {anthropicModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModel === model.id 
                      ? 'bg-orange-500/20 text-orange-300' 
                      : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <p className="text-sm font-medium">{model.name}</p>
                  <p className="text-xs text-slate-500">{model.description}</p>
                </button>
              ))}
            </div>

            {/* Google Models */}
            <div className="p-2 border-t border-slate-700/50">
              <div className="text-xs text-blue-400 font-medium px-2 py-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Google
              </div>
              {googleModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedModel === model.id 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <p className="text-sm font-medium">{model.name}</p>
                  <p className="text-xs text-slate-500">{model.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

