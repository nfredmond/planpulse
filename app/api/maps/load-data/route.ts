import { NextRequest, NextResponse } from 'next/server';
import { loadDataSource, DATA_SOURCES } from '@/lib/api/data-sources';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, params = {} } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    // Check if source exists
    const source = DATA_SOURCES.find(s => s.id === sourceId || sourceId.startsWith(s.id));
    if (!source) {
      return NextResponse.json(
        { error: `Unknown data source: ${sourceId}` },
        { status: 400 }
      );
    }

    // Load the data
    const data = await loadDataSource(sourceId, params);

    return NextResponse.json({
      success: true,
      source: source.name,
      featureCount: data.features.length,
      data
    });
  } catch (error) {
    console.error('Error loading data source:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return list of available data sources
  return NextResponse.json({
    sources: DATA_SOURCES
  });
}

