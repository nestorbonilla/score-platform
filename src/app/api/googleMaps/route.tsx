import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const query = searchParams.get('query');

  if (!address || !query) {
    return NextResponse.json({ error: 'Address and query are required' }, { status: 400 });
  }

  try {
    // Geocoding API request
    const geocodingResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      { method: 'GET' }
    );

    if (!geocodingResponse.ok) {
      throw new Error('Geocoding API request failed');
    }

    const geocodingData = await geocodingResponse.json();
    const coordinates = geocodingData.results[0]?.geometry?.location;

    if (!coordinates) {
      return NextResponse.json({ error: 'No coordinates found for the given address' }, { status: 404 });
    }

    // Places API request
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${coordinates.lat},${coordinates.lng}&radius=5000&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      { method: 'GET' }
    );

    if (!placesResponse.ok) {
      throw new Error('Places API request failed');
    }

    const placesData = await placesResponse.json();
    const placesResults = placesData.results;

    return NextResponse.json({ coordinates, placesResults }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
