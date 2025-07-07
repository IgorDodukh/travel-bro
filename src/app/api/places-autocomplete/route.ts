import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const input = searchParams.get('input');
  const destination = searchParams.get('destination'); // Get destination
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

  if (!apiKey) {
    return NextResponse.json({error: 'API key is missing'}, {status: 500});
  }

  if (!input) {
    return NextResponse.json({error: 'Input query is required'}, {status: 400});
  }

  // Prepend destination to the input query to bias results
  const searchQuery = destination ? `${input}, ${destination}` : input;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    searchQuery
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return NextResponse.json(
      {error: 'Failed to fetch suggestions'},
      {status: 500}
    );
  }
}
