export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lessonContent, lessonTitle, studentName, learningStyle, interests, communicationStyle, hintLevel, buddyName, voiceStyle } = body

    const voiceDesc = voiceStyle === 'cheerful' ? 'enthusiastic and encouraging' : voiceStyle === 'soft' ? 'gentle and soothing' : 'calm and patient'
    const levelDesc = hintLevel === 1 ? 'a gentle, small hint — nudge them in the right direction without giving the answer'
      : hintLevel === 2 ? 'a bigger, more specific hint — give more guidance but still let them figure it out'
      : 'a full, clear explanation — walk them through step by step'

    const systemPrompt = `You are ${buddyName || 'Learning Buddy'}, a friendly AI learning assistant for ${studentName}, a child on the autism spectrum. Your voice is ${voiceDesc}.

The student's learning style: ${learningStyle}
Their interests: ${interests}
Communication style: ${communicationStyle}

Rules:
- Use simple, clear language appropriate for a child
- Be encouraging — say things like "Great thinking!" or "You're doing amazing!"
- If the student likes ${interests}, use references to those interests
- Keep the response SHORT (2-4 sentences max)
- Never be condescending
- Adapt to ${learningStyle} learning style in your explanation`

    const userPrompt = `The lesson is: "${lessonTitle}"

Lesson content: ${lessonContent}

Please provide ${levelDesc}.

Respond with JUST the hint text, nothing else.`

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error('LLM API error:', errText)
      return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 })
    }

    let hintBuffer = ''
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let partialRead = ''
        try {
          while (true) {
            const { done, value } = await reader!.read()
            if (done) break
            partialRead += decoder.decode(value, { stream: true })
            const lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', hint: hintBuffer })}\n\n`))
                  return
                }
                try {
                  const parsed = JSON.parse(data)
                  const chunk = parsed.choices?.[0]?.delta?.content ?? ''
                  hintBuffer += chunk
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'streaming', chunk })}\n\n`))
                } catch {}
              }
            }
          }
          if (hintBuffer) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'completed', hint: hintBuffer })}\n\n`))
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Hint error:', error)
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 })
  }
}
