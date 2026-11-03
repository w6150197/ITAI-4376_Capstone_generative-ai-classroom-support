export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items = await prisma.approvalItem.findMany({
      include: { studentProfile: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, status, notes } = await request.json()
    const item = await prisma.approvalItem.update({
      where: { id },
      data: { status, teacherNotes: notes || null, reviewedAt: new Date() },
    })
    if (item.type === 'BUDDY' && item.referenceId) {
      const buddy = await prisma.learningBuddy.findUnique({ where: { id: item.referenceId } })
      if (buddy) {
        let design: Record<string, string> = {}
        try { design = JSON.parse(item.data ?? '{}') } catch {}
        const { buddyName, avatarType, voiceStyle, color, accessory } = design
        if (status === 'APPROVED') {
          await prisma.learningBuddy.update({
            where: { id: buddy.id },
            data: { ...(buddyName ? { buddyName, avatarType, voiceStyle, color, accessory } : {}), approvalStatus: 'APPROVED', teacherNotes: null },
          })
        } else if (status === 'REJECTED') {
          // A brand-new buddy goes back to the student; an approved buddy keeps working while the student tries again.
          await prisma.learningBuddy.update({
            where: { id: buddy.id },
            data: buddy.approvalStatus === 'APPROVED' ? { teacherNotes: notes || null } : { approvalStatus: 'REJECTED', teacherNotes: notes || null },
          })
        }
      }
    }
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
