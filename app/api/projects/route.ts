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
      return NextResponse.json({ projects: [] });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        organization_id: profile.organization_id,
        name: body.name,
        type: body.type,
        discipline: body.discipline,
        status: body.status || 'planning',
        description: body.description,
        client_name: body.client_name,
        budget: body.budget,
        start_date: body.start_date,
        end_date: body.end_date,
        caltrans_project_number: body.caltrans_project_number,
        federal_aid_number: body.federal_aid_number,
        funding_source: body.funding_source,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

