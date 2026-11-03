export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { profileId, avatarType, buddyName, voiceStyle } = body
    if (!profileId || !buddyName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const buddy = await prisma.learningBuddy.upsert({
      where: { studentProfileId: profileId },
      create: {
        studentProfileId: profileId,
        avatarType: avatarType ?? 'friendly-robot',
        buddyName,
        voiceStyle: voiceStyle ?? 'calm',
        approvalStatus: 'PENDING',
      },
      update: {
        avatarType: avatarType ?? 'friendly-robot',
        buddyName,
        voiceStyle: voiceStyle ?? 'calm',
        approvalStatus: 'PENDING',
      },
    })

    // Create approval item
    await prisma.approvalItem.create({
      data: {
        type: 'BUDDY',
        referenceId: buddy.id,
        studentProfileId: profileId,
        title: `Learning Buddy: ${buddyName}`,
        description: `Avatar: ${avatarType}, Voice: ${voiceStyle}`,
        status: 'PENDING',
      },
    })

    // Notification for teacher
    const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' }, take: 1 })
    const prof = await prisma.studentProfile.findUnique({ where: { id: profileId } })
    if (teachers?.[0]) {
      await prisma.notification.create({
        data: {
          type: 'BUDDY_REQUEST',
          message: `${prof?.childName ?? 'A student'} created a Learning Buddy "${buddyName}" — needs approval`,
          userId: teachers[0].id,
          studentProfileId: profileId,
        },
      })
    }

    return NextResponse.json({ id: buddy.id, status: 'pending' })
  } catch (error: any) {
    console.error('Buddy creation error:', error)
    return NextResponse.json({ error: 'Failed to create buddy' }, { status: 500 })
  }
}
