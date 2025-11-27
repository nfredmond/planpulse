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
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ applications: [], programs: [] });
    }

    const [{ data: applications }, { data: programs }] = await Promise.all([
      supabase
        .from('grant_applications')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('deadline', { ascending: true }),
      supabase
        .from('grant_programs')
        .select('*')
        .eq('is_active', true)
        .order('name'),
    ]);

    return NextResponse.json({ 
      applications: applications || [], 
      programs: programs || [] 
    });
  } catch (error) {
    console.error('Error fetching grants:', error);
    return NextResponse.json({ error: 'Failed to fetch grants' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const body = await request.json();
    
    const { data: application, error } = await supabase
      .from('grant_applications')
      .insert({
        organization_id: profile.organization_id,
        name: body.name,
        grant_program_id: body.grant_program_id,
        project_id: body.project_id,
        description: body.description,
        amount_requested: body.amount_requested,
        match_amount: body.match_amount,
        match_source: body.match_source,
        deadline: body.deadline,
        status: body.status || 'drafting',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error creating grant:', error);
    return NextResponse.json({ error: 'Failed to create grant application' }, { status: 500 });
  }
}

