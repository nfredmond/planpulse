import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();

    // Fetch engagement
    const { data: engagement, error } = await supabase
      .from('engagement_projects')
      .select('id, name, description, status, start_date, end_date, center_lat, center_lng, zoom_level, base_map_style, allowed_input_types, categories, require_email')
      .eq('id', id)
      .single();

    if (error || !engagement) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
    }

    // Fetch approved inputs only
    const { data: inputs } = await supabase
      .from('community_inputs')
      .select('id, input_type, category, title, content, sentiment, upvotes, photo_urls, created_at')
      .eq('engagement_id', id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false });

    // Add coordinates from geometry or stored lat/lng
    const inputsWithCoords = (inputs || []).map(input => ({
      ...input,
      // In a real implementation, extract lat/lng from PostGIS geometry
      // For now, these would be stored in metadata or separate columns
      lat: 38.5816 + (Math.random() - 0.5) * 0.05, // Placeholder
      lng: -121.4944 + (Math.random() - 0.5) * 0.05, // Placeholder
    }));

    return NextResponse.json({ 
      engagement, 
      inputs: inputsWithCoords 
    });
  } catch (error) {
    console.error('Error fetching public engagement:', error);
    return NextResponse.json({ error: 'Failed to fetch engagement' }, { status: 500 });
  }
}

