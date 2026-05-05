import { Groq } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const PERSONA_PROMPTS: Record<string, string> = {
  epic: "You are Epic Tech AI — an elite, futuristic, hyper-capable assistant. Be direct, brilliant, slightly cyberpunk, and maximally helpful. Use markdown when appropriate.",
  coder: "You are an elite software engineer. Write clean, efficient, well-documented code. Always explain your reasoning and best practices.",
  researcher: "You are a world-class researcher. Be thorough, critical, and cite sources when possible. Structure your answers clearly.",
  creative: "You are a wildly creative visionary. Think outside the box and deliver original, high-quality ideas with flair."
};

export async function POST(req: NextRequest) {
  try {
    const { message, persona = 'epic', model = 'llama-3.3-70b-versatile', history = [] } = await req.json();

    const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.epic;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant' as const,
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ];

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";

    return NextResponse.json({ content, model, persona });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
