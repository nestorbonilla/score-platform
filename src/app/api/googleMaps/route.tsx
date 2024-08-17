import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param') || '';
    const paramType = searchParams.get('paramType') || 'autocomplete';
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    let url: URL;
    let fields: string | undefined = undefined;

    if (paramType === 'autocomplete') {
      url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      url.searchParams.append('input', param);
    } else if (paramType === 'details') {
      url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.append('place_id', param);
      fields = 'business_status,rating,user_ratings_total';
    } else {
      return NextResponse.json({ error: 'Invalid paramType' }, { status: 400 });
    }

    url.searchParams.append('key', apiKey);
    if (fields) {
      url.searchParams.append('fields', fields);
    }

    console.log('Fetching Google Places data:', url.href);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok'); 
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching Google Places data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}