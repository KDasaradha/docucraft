import { getFirstDocPath } from '@/lib/docs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const path = await getFirstDocPath();
    return NextResponse.json({ path });
  } catch (error) {
    console.error("Error fetching first doc path:", error);
    return NextResponse.json({ error: "Failed to fetch first doc path" }, { status: 500 });
  }
}
