export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { lessonId, studentProfileId } = await request.json()
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    const assignment = await prisma.lessonAssignment.create({
      data: {
        lessonId,
        studentProfileId,
        status: 'assigned',
        totalSteps: 3,
      },
    })
    return NextResponse.json(assignment)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
