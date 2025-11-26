import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch engagement
    const { data: engagement, error } = await supabase
      .from('engagement_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch inputs
    const { data: inputs } = await supabase
      .from('community_inputs')
      .select('*')
      .eq('engagement_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ 
      engagement, 
      inputs: inputs || [] 
    });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    return NextResponse.json({ error: 'Failed to fetch engagement' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { data: engagement, error } = await supabase
      .from('engagement_projects')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(engagement);
  } catch (error) {
    console.error('Error updating engagement:', error);
    return NextResponse.json({ error: 'Failed to update engagement' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all inputs first
    await supabase
      .from('community_inputs')
      .delete()
      .eq('engagement_id', id);

    // Delete engagement
    const { error } = await supabase
      .from('engagement_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting engagement:', error);
    return NextResponse.json({ error: 'Failed to delete engagement' }, { status: 500 });
  }
}

