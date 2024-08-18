'use server';
export async function fetchGooglePlacesData(param: string, paramType: string) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return { error: 'API key is missing', status: 500 };
    }

    let apiUrl: string;
    let queryParams: string = `key=${apiKey}`;

    if (paramType === 'autocomplete') {
      apiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
      queryParams += `&input=${param}`;
    } else if (paramType === 'details') {
      apiUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      queryParams += `&place_id=${param}&fields=business_status,rating,user_ratings_total`;
    } else {
      return { error: 'Invalid paramType', status: 400 };
    }

    const fullUrl = `${apiUrl}?${queryParams}`;
    console.log('Fetching Google Places data:', fullUrl);

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching Google Places data:', error);
    return { error: 'Failed to fetch data', status: 500 };
  }
}