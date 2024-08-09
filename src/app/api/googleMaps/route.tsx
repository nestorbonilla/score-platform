import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  console.log('Address:', address);

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    // Geocoding request
    const geocodingResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      { method: 'GET' }
    );

    if (!geocodingResponse.ok) {
      throw new Error('Geocoding API request failed');
    }

    const geocodingData = await geocodingResponse.json();
    console.log('Geocoding data results:', geocodingData.results);
    const coordinates = geocodingData.results[0]?.geometry?.location;

    if (!coordinates) {
      return NextResponse.json({ error: 'No coordinates found for the given address' }, { status: 404 });
    }

    // Places request
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?location=${coordinates.lat},${coordinates.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      { method: 'GET' }
    );

    if (!placesResponse.ok) {
      throw new Error('Places API request failed');
    }

    const placesData = await placesResponse.json();
    const placeData = placesData.result;
    console.log('placeData results:', placeData);

    return NextResponse.json({ coordinates, placeData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}