import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const input = searchParams.get('input');
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

  if (!apiKey) {
    return NextResponse.json({error: 'API key is missing'}, {status: 500});
  }

  if (!input) {
    return NextResponse.json({error: 'Input query is required'}, {status: 400});
  }

  // Add types=(cities) to filter for settlements
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&types=(cities)&key=${apiKey}`;

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
