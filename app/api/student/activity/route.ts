export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { profileId, action } = body
    if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })

    const statusMap: Record<string, string> = {
      active: 'ACTIVE', on_break: 'ON_BREAK', needs_help: 'NEEDS_HELP', inactive: 'INACTIVE',
    }

    await prisma.studentProfile.update({
      where: { id: profileId },
      data: {
        status: (statusMap[action] ?? 'ACTIVE') as any,
        lastActivity: new Date(),
      },
    })

    await prisma.activityLog.create({
      data: { studentProfileId: profileId, action: action ?? 'active' },
    })

    // If needs help, create teacher notification
    if (action === 'needs_help') {
      const prof = await prisma.studentProfile.findUnique({ where: { id: profileId } })
      const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' }, take: 1 })
      if (teachers?.[0] && prof) {
        await prisma.notification.create({
          data: {
            type: 'HELP_REQUEST',
            message: `${prof.childName} is requesting help!`,
            userId: teachers[0].id,
            studentProfileId: profileId,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Activity error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
