'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_USER, DEMO_ORGANIZATION } from '@/lib/demo-data';
import { User, Building2, Bell, Palette, Key, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { isDemo } = useDemo();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              defaultValue={isDemo ? DEMO_USER.full_name : ''}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue={isDemo ? DEMO_USER.email : ''}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <input
              type="text"
              defaultValue={isDemo ? DEMO_USER.role : ''}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Organization section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Organization</h2>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization Name</label>
            <input
              type="text"
              defaultValue={isDemo ? DEMO_ORGANIZATION.name : ''}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization Type</label>
            <select
              defaultValue={isDemo ? DEMO_ORGANIZATION.type : ''}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            >
              <option value="city">City</option>
              <option value="county">County</option>
              <option value="agency">Agency</option>
              <option value="consultant">Consultant</option>
              <option value="mpo">MPO</option>
              <option value="rtpa">RTPA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification settings */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Grant Deadline Reminders</p>
              <p className="text-sm text-slate-400">Get notified before grant deadlines</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Project Updates</p>
              <p className="text-sm text-slate-400">Notifications when team members update projects</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Community Input Alerts</p>
              <p className="text-sm text-slate-400">Get notified when new community input is submitted</p>
            </div>
            <input type="checkbox" className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50" />
          </label>
        </div>
      </div>

      {/* AI settings */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Custom Instructions
            <span className="text-slate-500 font-normal"> (optional)</span>
          </label>
          <textarea
            rows={4}
            placeholder="Add any specific context about your organization, preferred writing style, or focus areas..."
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
            disabled={isDemo}
          />
          <p className="text-sm text-slate-500 mt-1.5">
            These instructions will be included in all AI conversations
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          disabled={isDemo}
        >
          {isDemo ? 'Demo Mode - Changes Not Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

