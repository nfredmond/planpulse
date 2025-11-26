'use client';

import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { toast } from 'sonner';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';

const SECTIONS = [
  'Needs statement',
  'Project description',
  'Schedule',
  'Benefits',
  'Budget narrative',
  'Equity analysis',
  'Community engagement',
  'Sustainability',
];

const GRANT_TYPES = [
  'ATP (Active Transportation Program)',
  'HSIP (Highway Safety Improvement Program)',
  'CMAQ (Congestion Mitigation)',
  'SS4A (Safe Streets for All)',
  'CRP (Carbon Reduction Program)',
  'TDA Article 3',
  'Federal RAISE',
  'State/Local',
  'Other',
];

interface Project {
  id: string;
  name: string;
  description?: string;
  budget?: number;
}

interface GrantAIComposerProps {
  projects?: Project[];
}

export function GrantAIComposer({ projects = [] }: GrantAIComposerProps) {
  const [section, setSection] = useState(SECTIONS[0]);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const [grantType, setGrantType] = useState(GRANT_TYPES[0]);
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedProject = projects.find(p => p.id === projectId);

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate/grant-narrative',
    onError: (error) => toast.error(error.message || 'Failed to generate narrative'),
  });

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      await complete('', {
        body: { 
          projectName: selectedProject?.name || 'Transportation Project',
          projectDescription: selectedProject?.description || '',
          budget: selectedProject?.budget,
          grantType, 
          section, 
          context 
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(completion);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Grant Narrative Assistant</h2>
            <p className="text-sm text-slate-400">AI-powered grant writing powered by GPT-4</p>
          </div>
        </div>
      </div>

      <form className="p-6 space-y-4" onSubmit={generate}>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Project Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option value="">No projects available</option>
              )}
            </select>
          </div>

          {/* Grant Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Grant Type</label>
            <select
              value={grantType}
              onChange={(e) => setGrantType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {GRANT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Context */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Additional Context
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Key facts, goals, community benefits, specific requirements..."
            rows={4}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Narrative
            </>
          )}
        </button>
      </form>

      {/* Generated Content */}
      {completion && (
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Generated Content</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <p className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
              {completion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

