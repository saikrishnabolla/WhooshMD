import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://npiregistry.cms.hhs.gov/api/';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Ensure version is set to 2.1
    searchParams.set('version', '2.1');
    
    // Forward the request to the NPI Registry API
    const response = await fetch(`${API_BASE_URL}?${searchParams.toString()}`, {
      headers: {
        'User-Agent': 'Whoosh-MD/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`NPI Registry API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching NPI data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch provider data' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}