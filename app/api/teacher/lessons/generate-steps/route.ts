export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cleanSteps } from '@/lib/buddy'

// Drafts interactive steps for a lesson. Nothing is saved here — the teacher reviews and saves.
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, subject, content } = await request.json()
    if (!title || !content) return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })

    const prompt = `Turn this lesson for young autistic learners into 4-7 short interactive steps.
Lesson title: ${title}
Subject: ${subject || 'General'}
Lesson content:
${content}

Rules:
- Mix "read" steps (one short idea, 1-2 simple sentences) and "choice" steps (a question with exactly 3 short answer choices).
- At least 2 choice steps. Start with a read step.
- Literal, concrete, calm language. No idioms, no sarcasm, no time pressure.
- Each step gets one relevant emoji.
- For choice steps, "answer" is the 0-based index of the correct choice, and "buddyTip" is a gentle hint that does NOT give the answer away.
- Use ONLY facts in the lesson content.

Respond with raw JSON only: {"steps":[{"type":"read","text":"...","emoji":"..."},{"type":"choice","text":"...","emoji":"...","choices":["a","b","c"],"answer":0,"buddyTip":"..."}]}`

    const res = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
        temperature: 0.3,
      }),
    })
    if (!res.ok) {
      console.error('Step generation LLM error:', await res.text().catch(() => ''))
      return NextResponse.json({ error: 'Could not generate steps' }, { status: 502 })
    }
    const data = await res.json()
    let parsed: any = {}
    try { parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}') } catch { parsed = {} }
    const steps = cleanSteps(parsed.steps)
    if (steps.length === 0) return NextResponse.json({ error: 'Could not generate steps' }, { status: 502 })
    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Generate steps error:', error)
    return NextResponse.json({ error: 'Could not generate steps' }, { status: 500 })
  }
}
