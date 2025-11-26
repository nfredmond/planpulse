import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service-role';

// Public endpoint - submit community input
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: engagementId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    // Verify engagement exists and is active
    const { data: engagement, error: engError } = await supabase
      .from('engagement_projects')
      .select('id, status, moderation_enabled')
      .eq('id', engagementId)
      .single();

    if (engError || !engagement) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
    }

    if (engagement.status !== 'active') {
      return NextResponse.json({ error: 'Engagement is not accepting input' }, { status: 400 });
    }

    // Create geometry point if lat/lng provided
    let geometry = null;
    if (body.lat && body.lng) {
      geometry = `POINT(${body.lng} ${body.lat})`;
    }

    // Insert input
    const { data: input, error } = await supabase
      .from('community_inputs')
      .insert({
        engagement_id: engagementId,
        input_type: body.input_type || 'comment',
        category: body.category,
        title: body.title,
        content: body.content || '',
        sentiment: body.sentiment || 'neutral',
        photo_urls: body.photo_urls || [],
        submitter_email: body.email,
        session_id: body.session_id,
        moderation_status: engagement.moderation_enabled ? 'pending' : 'approved',
        metadata: {
          lat: body.lat,
          lng: body.lng,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting input:', error);
      throw error;
    }

    // Return with coordinates
    return NextResponse.json({
      ...input,
      lat: body.lat,
      lng: body.lng,
    });
  } catch (error) {
    console.error('Error submitting input:', error);
    return NextResponse.json({ error: 'Failed to submit input' }, { status: 500 });
  }
}

