import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';

export const maxDuration = 60;

const PLANNING_SYSTEM_PROMPT = `You are an AI planning assistant for PlanPulse, a transportation and urban planning platform by Nat Ford Planning (natfordplanning.com). You help transportation planners (both consultants and public agency staff) with:

- Active Transportation Plans (ATP)
- Complete Streets Programs
- Transit Planning & Analysis
- Safe Routes to School (SRTS)
- Trail & Bicycle Network Plans
- Local Road Safety Plans (LRSP)
- Community Engagement & Public Input
- Grant Application Management (ATP, HSIP, CMAQ, SS4A, etc.)
- Environmental Review & CEQA/NEPA
- Equity Analysis & Title VI Compliance

You should:
- Provide actionable insights and recommendations
- Reference best practices from FHWA, Caltrans, NACTO, and other agencies
- Help write grant narratives with specific language about safety, equity, climate, and deliverability
- Summarize community feedback and identify key themes
- Suggest project prioritization based on safety data and community input
- Be concise but thorough
- Use professional transportation planning terminology
- Cite relevant policies, guidelines, and funding programs when appropriate

When helping with grants, emphasize:
- Safety benefits and crash reduction potential
- Equity and environmental justice considerations
- Climate/sustainability benefits
- Community support and engagement
- Deliverability and project readiness
- Cost-effectiveness and return on investment`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: openai('gpt-4o-mini'),
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
    
    return new Response(
      JSON.stringify({ error: 'Failed to process chat message', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

