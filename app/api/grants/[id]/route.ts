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

    const { data: application } = await supabase
      .from('grant_applications')
      .select('*, grant_programs(*)')
      .eq('id', id)
      .single();

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching grant:', error);
    return NextResponse.json({ error: 'Failed to fetch grant' }, { status: 500 });
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
    
    // Handle status transitions
    const updateData: Record<string, any> = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    if (body.status === 'submitted' && !body.submitted_at) {
      updateData.submitted_at = new Date().toISOString();
    }

    const { data: application, error } = await supabase
      .from('grant_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating grant:', error);
    return NextResponse.json({ error: 'Failed to update grant' }, { status: 500 });
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

    const { error } = await supabase
      .from('grant_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grant:', error);
    return NextResponse.json({ error: 'Failed to delete grant' }, { status: 500 });
  }
}

