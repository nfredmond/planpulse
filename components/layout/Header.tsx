'use client';

import { Bell, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_USER, DEMO_ORGANIZATION } from '@/lib/demo-data';

interface Profile {
  full_name: string | null;
  email: string | null;
  organization_id: string | null;
}

interface Organization {
  name: string;
}

export default function Header() {
  const { isDemo, mounted } = useDemo();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (!mounted) return;

    // Use demo data if in demo mode
    if (isDemo) {
      setProfile({
        full_name: DEMO_USER.full_name,
        email: DEMO_USER.email,
        organization_id: DEMO_USER.organization_id,
      });
      setOrganization({ name: DEMO_ORGANIZATION.name });
      return;
    }

    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email, organization_id')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);

        if (profileData?.organization_id) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', profileData.organization_id)
            .single();
          
          setOrganization(orgData);
        }
      }
    }

    loadProfile();
  }, [mounted, isDemo]);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, grants, data..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">
              {profile?.full_name || 'Loading...'}
            </p>
            <p className="text-xs text-slate-500">
              {organization?.name || profile?.email || ''}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

