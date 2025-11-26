import Link from 'next/link';
import { Map, ArrowRight, FolderKanban, DollarSign, Users, BarChart3, Sparkles, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Plan<span className="text-emerald-400">Pulse</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Planning Platform
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
              Plan smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Move communities forward.
              </span>
            </h1>
            <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
              The all-in-one platform for transportation planners. Manage projects, track grants, 
              engage communities, and analyze data — all powered by AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/demo" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700"
              >
                Try Demo
              </Link>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl">
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="h-8 bg-slate-800 flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
                  <p className="text-slate-500">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything you need to plan better
            </h2>
            <p className="mt-4 text-xl text-slate-400">
              Purpose-built tools for transportation and urban planners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FolderKanban}
              title="Project Management"
              description="Track ATP plans, Complete Streets, transit studies, and more with map-based project areas."
              color="emerald"
            />
            <FeatureCard
              icon={DollarSign}
              title="Grant Tracker"
              description="Never miss a deadline. Track ATP, HSIP, CMAQ, SS4A applications with AI-assisted writing."
              color="amber"
            />
            <FeatureCard
              icon={Users}
              title="Community Engagement"
              description="Embeddable maps for public input. Collect pins, comments, and drawings from residents."
              color="blue"
            />
            <FeatureCard
              icon={BarChart3}
              title="Data Analytics"
              description="Transit metrics, crash data, demographics, and equity analysis in one dashboard."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Built for the work you do
              </h2>
              <p className="mt-4 text-xl text-slate-400">
                Whether you&apos;re a consultant managing multiple agency clients or a public staff planner, 
                PlanPulse adapts to your workflow.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Active Transportation Plans (ATP)',
                  'Complete Streets Programs',
                  'Transit Planning & Analysis',
                  'Safe Routes to School',
                  'Trail & Bike Network Plans',
                  'Safety Action Plans (LRSP)',
                  'Community Engagement Mapping',
                  'Grant Application Management',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                <Map className="w-32 h-32 text-emerald-400/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to transform your planning workflow?
          </h2>
          <p className="mt-4 text-xl text-slate-400">
            Join transportation planners who are already using PlanPulse to deliver better projects.
          </p>
          <div className="mt-8">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Plan<span className="text-emerald-400">Pulse</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:support@planpulse.io" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} PlanPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  color: 'emerald' | 'amber' | 'blue' | 'purple';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30',
  };

  return (
    <div className="group p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4 transition-colors`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
