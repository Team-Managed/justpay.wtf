import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 60s window
    return false;
  }
  if (entry.count > 100) return true; // 100 requests per IP per minute
  entry.count++;
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.text();
    const alchemyKey = process.env.ALCHEMY_BASE_RPC; // Note: removed NEXT_PUBLIC_

    if (!alchemyKey) {
      return NextResponse.json({ error: 'RPC config missing' }, { status: 500 });
    }

    const response = await fetch(alchemyKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'RPC request failed' }, { status: 500 });
  }
}
