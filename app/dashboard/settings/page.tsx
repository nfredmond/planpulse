'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_USER, DEMO_ORGANIZATION } from '@/lib/demo-data';
import { toast } from 'sonner';
import { User, Building2, Bell, Palette, Save, Loader2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  role: string;
  title: string;
  phone: string;
  custom_ai_instructions: string;
}

interface OrganizationData {
  name: string;
  type: string;
  website: string;
}

interface NotificationSettings {
  grantReminders: boolean;
  projectUpdates: boolean;
  communityAlerts: boolean;
}

export default function SettingsPage() {
  const { isDemo, mounted } = useDemo();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    role: '',
    title: '',
    phone: '',
    custom_ai_instructions: '',
  });
  
  const [organization, setOrganization] = useState<OrganizationData>({
    name: '',
    type: '',
    website: '',
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    grantReminders: true,
    projectUpdates: true,
    communityAlerts: false,
  });

  useEffect(() => {
    if (!mounted) return;

    if (isDemo) {
      setProfile({
        full_name: DEMO_USER.full_name,
        email: DEMO_USER.email,
        role: DEMO_USER.role,
        title: 'Senior Planner',
        phone: '(916) 555-0123',
        custom_ai_instructions: '',
      });
      setOrganization({
        name: DEMO_ORGANIZATION.name,
        type: DEMO_ORGANIZATION.type,
        website: 'https://cityofsacramento.org',
      });
      setLoading(false);
      return;
    }

    loadSettings();
  }, [mounted, isDemo]);

  const loadSettings = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || user.email || '',
          role: profileData.role || '',
          title: profileData.title || '',
          phone: profileData.phone || '',
          custom_ai_instructions: profileData.custom_ai_instructions || '',
        });

        if (profileData.organizations) {
          setOrganization({
            name: profileData.organizations.name || '',
            type: profileData.organizations.type || '',
            website: profileData.organizations.website || '',
          });
        }

        // Load notification settings from profile settings
        if (profileData.settings?.notifications) {
          setNotifications(profileData.settings.notifications);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (isDemo) {
      toast.info('Demo mode: Changes are not saved');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            full_name: profile.full_name,
            title: profile.title,
            phone: profile.phone,
            custom_ai_instructions: profile.custom_ai_instructions,
            settings: { notifications },
          },
          organization: {
            name: organization.name,
            type: organization.type,
            website: organization.website,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

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

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={profile.email}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400"
              disabled
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="e.g., Senior Planner"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="(555) 555-5555"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <input
              type="text"
              value={profile.role}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 capitalize"
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

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization Name</label>
            <input
              type="text"
              value={organization.name}
              onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo || profile.role !== 'admin'}
            />
            {profile.role !== 'admin' && !isDemo && (
              <p className="text-xs text-slate-500 mt-1">Only admins can edit organization settings</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization Type</label>
            <select
              value={organization.type}
              onChange={(e) => setOrganization({ ...organization, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo || profile.role !== 'admin'}
            >
              <option value="">Select type...</option>
              <option value="city">City</option>
              <option value="county">County</option>
              <option value="agency">Agency</option>
              <option value="consultant">Consultant</option>
              <option value="mpo">MPO</option>
              <option value="rtpa">RTPA</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Website</label>
            <input
              type="url"
              value={organization.website}
              onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
              placeholder="https://example.org"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              disabled={isDemo || profile.role !== 'admin'}
            />
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
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Grant Deadline Reminders</p>
              <p className="text-sm text-slate-400">Get notified before grant deadlines</p>
            </div>
            <input 
              type="checkbox" 
              checked={notifications.grantReminders}
              onChange={(e) => setNotifications({ ...notifications, grantReminders: e.target.checked })}
              className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
              disabled={isDemo}
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Project Updates</p>
              <p className="text-sm text-slate-400">Notifications when team members update projects</p>
            </div>
            <input 
              type="checkbox"
              checked={notifications.projectUpdates}
              onChange={(e) => setNotifications({ ...notifications, projectUpdates: e.target.checked })}
              className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
              disabled={isDemo}
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-white font-medium">Community Input Alerts</p>
              <p className="text-sm text-slate-400">Get notified when new community input is submitted</p>
            </div>
            <input 
              type="checkbox"
              checked={notifications.communityAlerts}
              onChange={(e) => setNotifications({ ...notifications, communityAlerts: e.target.checked })}
              className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
              disabled={isDemo}
            />
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
            value={profile.custom_ai_instructions}
            onChange={(e) => setProfile({ ...profile, custom_ai_instructions: e.target.value })}
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
          onClick={handleSave}
          disabled={isDemo || saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isDemo ? 'Demo Mode - Changes Not Saved' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
