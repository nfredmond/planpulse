import { streamText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

// Initialize Vercel AI Gateway
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

// Model ID mapping - convert UI display IDs to actual Vercel AI Gateway model IDs
// See: https://vercel.com/docs/ai-gateway/models-and-providers
const MODEL_MAP: Record<string, string> = {
  // Anthropic models - use actual Claude 4 models
  'anthropic/claude-sonnet-4-5': 'anthropic/claude-sonnet-4',
  'anthropic/claude-opus-4-5': 'anthropic/claude-opus-4',
  'anthropic/claude-haiku-4-5': 'anthropic/claude-haiku-4',
  
  // OpenAI models - use actual available models
  'openai/gpt-5': 'openai/gpt-4.1',
  'openai/gpt-5-mini': 'openai/gpt-4.1-mini',
  'openai/gpt-5-nano': 'openai/gpt-4.1-nano',
  'openai/gpt-5-pro': 'openai/o3',
  'openai/gpt-5-codex': 'openai/gpt-4.1',
  'openai/gpt-5-chat-latest': 'openai/gpt-4.1',
  'openai/gpt-5.1': 'openai/o4-mini',
  'openai/gpt-5.1-chat-latest': 'openai/o4-mini',
  'openai/gpt-5.1-codex': 'openai/o3',
  'openai/gpt-5.1-codex-mini': 'openai/o3-mini',
  'openai/gpt-5.1-codex-max': 'openai/o3',
  
  // Google models
  'google/gemini-3': 'google/gemini-2.0-flash',
  'google/gemini-3-pro': 'google/gemini-2.5-pro',
  'google/gemini-3-flash': 'google/gemini-2.5-flash',
};

const PLANNING_SYSTEM_PROMPT = `You are an AI planning assistant for PlanPulse, a transportation and urban planning platform by Nat Ford Planning (natfordplanning.com). You help transportation planners (both consultants and public agency staff) with:

## Planning Disciplines
- **Transportation Planning**: Active Transportation Plans (ATP), Complete Streets Programs, Transit Planning & Analysis, Safe Routes to School (SRTS), Trail & Bicycle Network Plans, Local Road Safety Plans (LRSP)
- **Urban Planning**: General Plans, Specific Plans, Housing Elements, Zoning Updates, EIRs
- **Regional Planning**: RTPs, SCS, Corridor Studies, MPO/RTPA Coordination, Federal Compliance
- **Rural & Small Town Planning**: Main Street Programs, Rural Transit, Trail Systems, Small Area Plans

## Core Capabilities
- Community Engagement & Public Input Analysis
- Grant Application Management (ATP, HSIP, CMAQ, SS4A, TIRCP, TDA Article 3, REAP, etc.)
- Environmental Review & CEQA/NEPA
- Equity Analysis & Title VI Compliance
- VMT/GHG Analysis using CARB methodology
- Caltrans LAPM compliance (E-76, project phases, PED tracking)

## How You Help
- Provide actionable insights and recommendations
- Reference best practices from FHWA, Caltrans, NACTO, and other agencies
- Help write grant narratives with specific language about safety, equity, climate, and deliverability
- Summarize community feedback and identify key themes
- Suggest project prioritization based on safety data and community input
- Be concise but thorough
- Use professional planning terminology
- Cite relevant policies, guidelines, and funding programs when appropriate

## Grant Writing Focus
When helping with grants, emphasize:
- Safety benefits and crash reduction potential
- Equity and environmental justice considerations
- Climate/sustainability benefits (VMT reduction, GHG reduction)
- Community support and engagement
- Deliverability and project readiness
- Cost-effectiveness and return on investment
- TDM (Transportation Demand Management) program impacts`;

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'anthropic/claude-sonnet-4-5' } = await request.json();

    // Check for API key
    if (!process.env.AI_GATEWAY_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'AI Gateway API key not configured. Please add AI_GATEWAY_API_KEY to environment variables.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map UI model ID to gateway model ID
    const gatewayModelId = MODEL_MAP[model] || 'anthropic/claude-sonnet-4';

    console.log(`Chat request: UI model="${model}" -> Gateway model="${gatewayModelId}"`);

    const result = streamText({
      model: gateway(gatewayModelId),
      system: PLANNING_SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide helpful error messages
    let userMessage = 'Failed to process chat message';
    if (errorMessage.includes('model')) {
      userMessage = 'Model error: The selected model may not be available. Try a different model.';
    } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      userMessage = 'API key error: Please check your AI_GATEWAY_API_KEY configuration.';
    } else if (errorMessage.includes('rate limit')) {
      userMessage = 'Rate limit exceeded. Please try again later.';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage, details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
