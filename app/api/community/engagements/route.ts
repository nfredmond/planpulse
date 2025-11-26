import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ engagements: [] });
    }

    // Fetch engagements with input counts
    const { data: engagements, error } = await supabase
      .from('engagement_projects')
      .select(`
        *,
        community_inputs (count)
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to include input_count
    const transformedEngagements = engagements?.map(e => ({
      ...e,
      input_count: e.community_inputs?.[0]?.count || 0,
    })) || [];

    return NextResponse.json({ engagements: transformedEngagements });
  } catch (error) {
    console.error('Error fetching engagements:', error);
    return NextResponse.json({ error: 'Failed to fetch engagements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const body = await request.json();
    
    const { data: engagement, error } = await supabase
      .from('engagement_projects')
      .insert({
        organization_id: profile.organization_id,
        name: body.name,
        description: body.description,
        start_date: body.start_date,
        end_date: body.end_date,
        center_lat: body.center_lat,
        center_lng: body.center_lng,
        zoom_level: body.zoom_level,
        base_map_style: body.base_map_style,
        allowed_input_types: body.allowed_input_types,
        categories: body.categories,
        require_email: body.require_email,
        moderation_enabled: body.moderation_enabled,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(engagement);
  } catch (error) {
    console.error('Error creating engagement:', error);
    return NextResponse.json({ error: 'Failed to create engagement' }, { status: 500 });
  }
}

