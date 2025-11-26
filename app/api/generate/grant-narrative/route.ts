import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { projectName, projectDescription, grantType, section, context, budget } = await request.json();

  const sectionPrompts: Record<string, string> = {
    'Needs statement': 'Write a compelling needs statement that identifies the transportation challenges, safety issues, or gaps in the current infrastructure that this project addresses. Include relevant statistics and community impact.',
    'Project description': 'Write a detailed project description that explains the scope, components, and implementation approach. Be specific about deliverables and outcomes.',
    'Schedule': 'Write a realistic project schedule section that outlines key milestones, phases, and timeline. Include contingency planning.',
    'Benefits': 'Write about the project benefits including safety improvements, mobility enhancements, economic impact, environmental benefits, and equity considerations.',
    'Budget narrative': 'Write a budget narrative that justifies the costs, explains the cost-effectiveness, and demonstrates fiscal responsibility.',
    'Equity analysis': 'Write an equity analysis section that addresses environmental justice, Title VI compliance, and benefits to disadvantaged communities.',
    'Community engagement': 'Write about the community engagement plan and how public input has shaped the project.',
    'Sustainability': 'Write about climate and sustainability benefits, including mode shift, emissions reduction, and climate resilience.',
  };

  const sectionGuidance = sectionPrompts[section] || 'Write a professional grant narrative section.';

  const prompt = `You are an expert grant writer for transportation and urban planning projects. You are writing the "${section}" section of a ${grantType} grant application.

Project Information:
- Project Name: ${projectName || 'Transportation Project'}
- Description: ${projectDescription || 'Not provided'}
- Budget: ${budget ? `$${budget.toLocaleString()}` : 'Not specified'}

Additional Context from Planner:
${context || 'None provided'}

Instructions:
${sectionGuidance}

Write 2-4 concise, professional paragraphs. Reference:
- Safety benefits and crash reduction potential
- Equity and environmental justice considerations (Title VI, disadvantaged communities)
- Climate/sustainability benefits (GHG reduction, mode shift)
- Community support and engagement
- Deliverability and project readiness
- Cost-effectiveness and value

Use professional grant writing language suitable for federal (FHWA, FTA) and state (Caltrans ATP, HSIP) funding programs.`;

  const result = streamText({
    model: openai('gpt-4o-mini'),
    prompt,
    temperature: 0.4,
  });

  return result.toDataStreamResponse();
}

