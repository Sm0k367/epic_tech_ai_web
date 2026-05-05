import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, type = 'image' } = await req.json();

    // For now, return a beautiful placeholder. 
    // To enable real generation, add REPLICATE_API_TOKEN to Vercel env and use Replicate SDK.
    const placeholderUrl = `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/1024/768`;

    return NextResponse.json({
      url: placeholderUrl,
      prompt,
      type,
      time: Math.floor(Math.random() * 8) + 4,
      model: type === 'image' ? 'Flux Schnell' : 'Coming Soon'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Media generation failed' }, { status: 500 });
  }
}
