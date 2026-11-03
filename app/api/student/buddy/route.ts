export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { BUDDY_CHARACTERS, BUDDY_ACCESSORIES, VOICE_STYLES, buddyPersonality } from '@/lib/buddy'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const buddyName = String(body.buddyName ?? '').trim().slice(0, 30)
    if (!buddyName) return NextResponse.json({ error: 'Your buddy needs a name' }, { status: 400 })

    const profile = await prisma.studentProfile.findUnique({ where: { userId: session.user.id }, include: { learningBuddy: true } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const design = {
      buddyName,
      avatarType: BUDDY_CHARACTERS.some(c => c.key === body.avatarType) ? body.avatarType : 'friendly-robot',
      voiceStyle: VOICE_STYLES.some(v => v.key === body.voiceStyle) ? body.voiceStyle : 'calm',
      accessory: BUDDY_ACCESSORIES.some(a => a.key === body.accessory) ? body.accessory : 'none',
      color: /^#[0-9a-fA-F]{6}$/.test(body.color ?? '') ? body.color : '#14b8a6',
    }

    const existing = profile.learningBuddy
    const isUpdate = existing?.approvalStatus === 'APPROVED'
    // An approved buddy keeps its current look until the teacher approves the new design.
    const buddy = isUpdate
      ? existing!
      : await prisma.learningBuddy.upsert({
          where: { studentProfileId: profile.id },
          create: { studentProfileId: profile.id, ...design, approvalStatus: 'PENDING' },
          update: { ...design, approvalStatus: 'PENDING', teacherNotes: null },
        })

    const personality = buddyPersonality(profile)
    const item = {
      type: 'BUDDY',
      referenceId: buddy.id,
      studentProfileId: profile.id,
      title: `${isUpdate ? 'Learning Buddy update' : 'New Learning Buddy'}: ${buddyName}`,
      description: `${BUDDY_CHARACTERS.find(c => c.key === design.avatarType)?.label} · ${VOICE_STYLES.find(v => v.key === design.voiceStyle)?.label} voice`,
      data: JSON.stringify({ ...design, personality }),
      status: 'PENDING' as const,
    }
    const pending = await prisma.approvalItem.findFirst({ where: { type: 'BUDDY', studentProfileId: profile.id, status: 'PENDING' } })
    if (pending) await prisma.approvalItem.update({ where: { id: pending.id }, data: { ...item, createdAt: new Date() } })
    else await prisma.approvalItem.create({ data: item })

    const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER', email: 'teacher@neurolearn.com' } }) ?? await prisma.user.findFirst({ where: { role: 'TEACHER' } })
    if (teacher) {
      await prisma.notification.create({
        data: {
          type: 'BUDDY_REQUEST',
          message: `${profile.childName} ${isUpdate ? 'redesigned' : 'created'} a Learning Buddy "${buddyName}" — needs approval`,
          userId: teacher.id,
          studentProfileId: profile.id,
        },
      })
    }

    return NextResponse.json({ status: 'pending', design })
  } catch (error: any) {
    console.error('Buddy creation error:', error)
    return NextResponse.json({ error: 'Failed to save buddy' }, { status: 500 })
  }
}
