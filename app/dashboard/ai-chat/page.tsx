'use client';

import { useState, useRef, useEffect } from 'react';
import { useDemo } from '@/lib/hooks/useDemo';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Map,
  FolderKanban,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: FolderKanban,
    title: 'Project Status',
    prompt: 'Give me an overview of all active projects and their current status',
  },
  {
    icon: DollarSign,
    title: 'Grant Opportunities',
    prompt: 'What grant opportunities are available for bike infrastructure projects?',
  },
  {
    icon: Map,
    title: 'Community Feedback',
    prompt: 'Summarize the main themes from community input on the Downtown Complete Streets project',
  },
  {
    icon: BarChart3,
    title: 'Transit Analysis',
    prompt: 'Which transit routes have the highest ridership and cost efficiency?',
  },
];

export default function AIChatPage() {
  const { isDemo } = useDemo();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response for demo mode
    if (isDemo) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getDemoResponse(userMessage.content),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    // Real API call would go here
    // For now, just show a placeholder response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'AI responses will be available once API keys are configured. This is a demo of the chat interface.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Planning Assistant</h1>
          <p className="text-slate-400 mt-1">
            Ask questions about your projects, grants, and data
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">Powered by AI</span>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-slate-400 text-center max-w-md mb-8">
                I can help with project management, grant writing, community feedback analysis, 
                transit planning, and more.
              </p>
              
              {/* Suggested prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt.prompt)}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <prompt.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-sm">{prompt.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{prompt.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your projects, grants, or data..."
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function getDemoResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('project') && (lowerQuery.includes('status') || lowerQuery.includes('overview'))) {
    return `## Active Projects Overview

Based on your current data, here's a summary of your active projects:

### 🚧 Active Projects (4)

1. **Downtown Complete Streets Plan** - Active
   - Budget: $2,500,000 (35% spent)
   - Timeline: Mar 2024 - Jun 2025
   - Currently in design phase with community engagement ongoing

2. **Safe Routes to School - Oak Park** - Active
   - Budget: $850,000 (49% spent)
   - Timeline: Jan 2024 - Dec 2024
   - Construction scheduled to begin Q1 2025

3. **Regional Transit Priority Corridors** - Active
   - Budget: $1,800,000 (36% spent)
   - Timeline: Apr 2024 - Mar 2025
   - Signal prioritization analysis complete

4. **American River Trail Extension** - Planning
   - Budget: $4,200,000 (3% spent)
   - Timeline: Sep 2024 - Dec 2026
   - Environmental review in progress

### 💰 Budget Summary
- Total Active Budget: $9,350,000
- Total Spent: $2,095,000 (22%)

Would you like details on any specific project?`;
  }

  if (lowerQuery.includes('grant') && (lowerQuery.includes('opportunit') || lowerQuery.includes('available') || lowerQuery.includes('bike'))) {
    return `## Grant Opportunities for Bike Infrastructure

Here are the most relevant funding sources for your bike projects:

### 🎯 Recommended Programs

**1. Active Transportation Program (ATP) - Cycle 7**
- **Deadline:** January 15, 2025
- **Typical Award:** $500K - $10M
- **Match Required:** 11.47%
- **Best For:** Protected bike lanes, trails, bike parking

**2. Highway Safety Improvement Program (HSIP)**
- **Deadline:** February 28, 2025
- **Typical Award:** $100K - $5M
- **Match Required:** 10%
- **Best For:** Bike-related safety improvements at high-crash locations

**3. Carbon Reduction Program (CRP)**
- **Typical Award:** $500K - $10M
- **Match Required:** 11.47%
- **Best For:** Bike facilities that reduce VMT

### 📝 Your Current Applications
- ATP Cycle 7 - Downtown Bike Network: **Submitted** ($5.2M requested)
- TDA Article 3 - Trail Wayfinding: **Under Review** ($125K requested)

Would you like help preparing a new application or checking eligibility for a specific project?`;
  }

  if (lowerQuery.includes('community') && (lowerQuery.includes('input') || lowerQuery.includes('feedback') || lowerQuery.includes('theme'))) {
    return `## Community Input Analysis - Downtown Complete Streets

Based on 247 community inputs collected, here are the main themes:

### 🔴 Top Concerns (Negative Sentiment - 42%)

1. **Intersection Safety** (34 mentions)
   - Red light running at K & 10th
   - Poor sight lines at J & 16th
   - Missing signals at crosswalks

2. **Lack of Protected Bike Infrastructure** (28 mentions)
   - Requests for protected lanes on J Street
   - Connection gaps in the network

3. **ADA Accessibility** (22 mentions)
   - Missing curb ramps
   - Uneven sidewalk surfaces

### 🟢 Positive Feedback (28%)
- Love for existing J Street bike lane (67 upvotes)
- Appreciation for new crossing at Capitol Mall

### 💡 Suggestions (30%)
- More bike parking downtown
- Better wayfinding signage
- Transit signal priority

### 📍 Hot Spots
The intersection of K Street & 10th Street has the highest concentration of negative feedback (12 pins).

Would you like me to generate a detailed report or map visualization?`;
  }

  if (lowerQuery.includes('transit') && (lowerQuery.includes('ridership') || lowerQuery.includes('route') || lowerQuery.includes('efficien'))) {
    return `## Transit Performance Analysis

### 🏆 Top Performing Routes by Ridership

| Route | Monthly Ridership | Cost/Passenger | OTP |
|-------|------------------|----------------|-----|
| Route 30 - J Street | 5,210 | $4.15 | 93% |
| Route 1 - Greenback | 4,520 | $4.82 | 87% |
| Route 2 - Riverside | 3,890 | $5.21 | 91% |

### 📊 Cost Efficiency Rankings

**Most Efficient:**
1. Route 30 - J Street ($4.15/passenger)
2. Route 1 - Greenback ($4.82/passenger)
3. Route 2 - Riverside ($5.21/passenger)

**Needs Attention:**
- Route 23 - El Camino ($7.12/passenger, 79% OTP)
- Route 62 - Freeport ($6.89/passenger, 82% OTP)

### 💡 Recommendations
1. Consider service optimization on Route 23 - explore express service
2. Route 30 could support increased frequency given high performance
3. Investigate OTP issues on Route 23 (signal timing?)

Would you like a detailed analysis of any specific route?`;
  }

  // Default response
  return `I'd be happy to help with that! As your AI planning assistant, I can help you with:

- **Project Management:** Track budgets, timelines, and tasks
- **Grant Applications:** Find opportunities and draft narratives
- **Community Engagement:** Analyze feedback and identify themes
- **Data Analysis:** Transit metrics, crash data, demographics
- **Report Writing:** Generate summaries and visualizations

Could you tell me more specifically what you'd like to know? For example:
- "What's the status of our active projects?"
- "Find grant opportunities for pedestrian improvements"
- "Analyze community feedback on the trail project"`;
}

