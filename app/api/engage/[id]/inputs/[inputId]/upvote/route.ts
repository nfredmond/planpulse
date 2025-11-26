import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service-role';

// Public endpoint - upvote input
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inputId: string }> }
) {
  try {
    const { inputId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();
    const sessionId = body.session_id;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Check if already upvoted
    const { data: existingUpvote } = await supabase
      .from('input_upvotes')
      .select('id')
      .eq('input_id', inputId)
      .eq('session_id', sessionId)
      .single();

    if (existingUpvote) {
      return NextResponse.json({ error: 'Already upvoted' }, { status: 400 });
    }

    // Create upvote record
    const { error: upvoteError } = await supabase
      .from('input_upvotes')
      .insert({
        input_id: inputId,
        session_id: sessionId,
      });

    if (upvoteError) throw upvoteError;

    // Increment upvote count
    const { data: input, error: updateError } = await supabase
      .rpc('increment_upvotes', { input_id: inputId });

    // If RPC doesn't exist, do it manually
    if (updateError) {
      await supabase
        .from('community_inputs')
        .update({ upvotes: supabase.raw('upvotes + 1') })
        .eq('id', inputId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error upvoting:', error);
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 });
  }
}

