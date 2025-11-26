// lib/models.ts
// AI Model Registry for PlanPulse - matches ads chatbot exactly

export interface ModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  description: string;
}

// 16 models across 3 providers
export const AVAILABLE_MODELS: ModelOption[] = [
  // ============================================
  // OpenAI GPT-5 Base Series (400k context, 128k output)
  // ============================================
  { 
    id: 'openai/gpt-5', 
    name: 'GPT-5', 
    provider: 'openai', 
    description: 'Flagship reasoning • $1.25 in / $10 out per 1M' 
  },
  { 
    id: 'openai/gpt-5-mini', 
    name: 'GPT-5 Mini', 
    provider: 'openai', 
    description: 'Strong & affordable • $0.25 in / $2 out per 1M' 
  },
  { 
    id: 'openai/gpt-5-nano', 
    name: 'GPT-5 Nano', 
    provider: 'openai', 
    description: 'Fastest & cheapest • $0.05 in / $0.40 out per 1M' 
  },
  { 
    id: 'openai/gpt-5-pro', 
    name: 'GPT-5 Pro', 
    provider: 'openai', 
    description: 'Max reasoning • $15 in / $120 out per 1M' 
  },
  { 
    id: 'openai/gpt-5-codex', 
    name: 'GPT-5 Codex', 
    provider: 'openai', 
    description: 'Agentic coding • $1.25 in / $10 out per 1M' 
  },

  // ============================================
  // OpenAI GPT-5.1 Series (400k context, adaptive thinking)
  // ============================================
  { 
    id: 'openai/gpt-5.1', 
    name: 'GPT-5.1 Thinking', 
    provider: 'openai', 
    description: 'Adaptive reasoning • $1.25 in / $10 out per 1M' 
  },
  { 
    id: 'openai/gpt-5.1-chat-latest', 
    name: 'GPT-5.1 Instant', 
    provider: 'openai', 
    description: 'Fast conversational • $1.25 in / $10 out per 1M' 
  },
  { 
    id: 'openai/gpt-5.1-codex', 
    name: 'GPT-5.1 Codex', 
    provider: 'openai', 
    description: 'Agentic coding • $1.25 in / $10 out per 1M' 
  },
  { 
    id: 'openai/gpt-5.1-codex-mini', 
    name: 'GPT-5.1 Codex Mini', 
    provider: 'openai', 
    description: 'Smaller coding • $0.25 in / $2 out per 1M' 
  },
  { 
    id: 'openai/gpt-5.1-codex-max', 
    name: 'GPT-5.1 Codex Max', 
    provider: 'openai', 
    description: 'Frontier long-horizon coding' 
  },

  // ============================================
  // Anthropic Claude 4.5 Family (200k context, 64k output)
  // ============================================
  { 
    id: 'anthropic/claude-sonnet-4-5', 
    name: 'Claude Sonnet 4.5', 
    provider: 'anthropic', 
    description: 'Smart default • $3 in / $15 out per 1M' 
  },
  { 
    id: 'anthropic/claude-opus-4-5', 
    name: 'Claude Opus 4.5', 
    provider: 'anthropic', 
    description: 'Max intelligence • $5 in / $25 out per 1M' 
  },
  { 
    id: 'anthropic/claude-haiku-4-5', 
    name: 'Claude Haiku 4.5', 
    provider: 'anthropic', 
    description: 'Fast & efficient • $1 in / $5 out per 1M' 
  },

  // ============================================
  // Google Gemini 3 Family
  // ============================================
  { 
    id: 'google/gemini-3', 
    name: 'Gemini 3', 
    provider: 'google', 
    description: 'Google flagship • multimodal' 
  },
  { 
    id: 'google/gemini-3-pro', 
    name: 'Gemini 3 Pro', 
    provider: 'google', 
    description: 'Advanced reasoning' 
  },
  { 
    id: 'google/gemini-3-flash', 
    name: 'Gemini 3 Flash', 
    provider: 'google', 
    description: 'Fast & efficient' 
  },
];

// Provider colors for UI
export const PROVIDER_COLORS = {
  openai: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    dot: 'bg-green-400',
    hover: 'hover:bg-green-500/30',
  },
  anthropic: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
    hover: 'hover:bg-orange-500/30',
  },
  google: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
    hover: 'hover:bg-blue-500/30',
  },
} as const;

// Default model
export const DEFAULT_MODEL = 'anthropic/claude-sonnet-4-5';

// Get model by ID
export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}

// Get models by provider
export function getModelsByProvider(provider: 'openai' | 'anthropic' | 'google'): ModelOption[] {
  return AVAILABLE_MODELS.filter(m => m.provider === provider);
}

