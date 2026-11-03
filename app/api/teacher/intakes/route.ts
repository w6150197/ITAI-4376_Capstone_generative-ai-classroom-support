export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, status } = await request.json()
    const intake = await prisma.parentIntake.update({
      where: { id },
      data: { status, reviewedAt: new Date() },
    })
    return NextResponse.json(intake)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
