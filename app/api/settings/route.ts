import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      profile: {
        id: profile?.id,
        email: profile?.email,
        full_name: profile?.full_name,
        role: profile?.role,
        title: profile?.title,
        phone: profile?.phone,
        settings: profile?.settings,
        custom_ai_instructions: profile?.custom_ai_instructions,
      },
      organization: profile?.organizations,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update profile
    if (body.profile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: body.profile.full_name,
          title: body.profile.title,
          phone: body.profile.phone,
          settings: body.profile.settings,
          custom_ai_instructions: body.profile.custom_ai_instructions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
    }

    // Update organization (admin only)
    if (body.organization) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin' && profile?.organization_id) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({
            name: body.organization.name,
            type: body.organization.type,
            website: body.organization.website,
            settings: body.organization.settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.organization_id);

        if (orgError) throw orgError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

