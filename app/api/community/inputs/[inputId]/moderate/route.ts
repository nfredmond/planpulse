import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Moderate an input (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inputId: string }> }
) {
  try {
    const { inputId } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['approved', 'hidden', 'flagged', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: input, error } = await supabase
      .from('community_inputs')
      .update({
        moderation_status: status,
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', inputId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(input);
  } catch (error) {
    console.error('Error moderating input:', error);
    return NextResponse.json({ error: 'Failed to moderate input' }, { status: 500 });
  }
}

