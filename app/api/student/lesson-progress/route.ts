export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { assignmentId, currentStep, progress, totalSteps, completed } = await request.json()
    const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id } })
    const assignment = await prisma.lessonAssignment.findUnique({ where: { id: assignmentId }, include: { lesson: true } })
    if (!profile || !assignment || assignment.studentProfileId !== profile.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.lessonAssignment.update({
      where: { id: assignmentId },
      data: {
        currentStep: Math.max(0, Number(currentStep) || 0),
        progress: Math.max(0, Number(progress) || 0),
        totalSteps: Math.max(1, Number(totalSteps) || 1),
        status: completed ? 'completed' : 'in_progress',
        startedAt: assignment.startedAt ?? new Date(),
        completedAt: completed ? new Date() : null,
      },
    })
    await prisma.studentProfile.update({ where: { id: profile.id }, data: { status: 'ACTIVE', lastActivity: new Date() } })
    if (completed) {
      await prisma.activityLog.create({ data: { studentProfileId: profile.id, action: 'lesson_completed', details: assignment.lesson.title } })
      const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER', email: 'teacher@neurolearn.com' } }) ?? await prisma.user.findFirst({ where: { role: 'TEACHER' } })
      if (teacher) {
        await prisma.notification.create({
          data: { type: 'LESSON_COMPLETE', message: `${profile.childName} finished "${assignment.lesson.title}" ⭐`, userId: teacher.id, studentProfileId: profile.id },
        })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Lesson progress error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
