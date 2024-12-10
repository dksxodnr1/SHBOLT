import { NextResponse } from 'next/server';
import { getServerBaseUrl } from '../serverAuth';

export async function GET() {
  const baseUrl = await getServerBaseUrl();
  return NextResponse.json({ baseUrl });
}

