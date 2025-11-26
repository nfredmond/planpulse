import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const { data: task, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        name: body.name,
        description: body.description,
        status: body.status || 'todo',
        due_date: body.due_date,
        assignee_id: body.assignee_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

