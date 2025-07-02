import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const placeId = searchParams.get('placeid');
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

  if (!apiKey) {
    return NextResponse.json({error: 'API key is missing'}, {status: 500});
  }

  if (!placeId) {
    return NextResponse.json(
      {error: 'Place ID is required'},
      {status: 400}
    );
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Google Place Details API:', error);
    return NextResponse.json(
      {error: 'Failed to fetch place details'},
      {status: 500}
    );
  }
}
