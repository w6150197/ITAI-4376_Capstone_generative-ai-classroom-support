export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const lessons = await prisma.lesson.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(lessons)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const lesson = await prisma.lesson.create({
      data: {
        title: body.title,
        subject: body.subject ?? 'General',
        content: body.content,
        difficulty: body.difficulty ?? 'medium',
        createdById: session.user.id,
      },
    })
    return NextResponse.json(lesson)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
