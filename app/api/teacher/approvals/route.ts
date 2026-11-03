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
      data: { status, teacherNotes: notes ?? null, reviewedAt: new Date() },
    })
    // If it's a buddy approval, update the buddy status too
    if (item.type === 'BUDDY' && item.referenceId) {
      await prisma.learningBuddy.update({
        where: { id: item.referenceId },
        data: { approvalStatus: status },
      }).catch(() => {})
    }
    return NextResponse.json(item)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
