export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const profiles = await prisma.studentProfile.findMany({
      include: { learningBuddy: true, user: { select: { name: true } } },
      orderBy: { childName: 'asc' },
    })
    return NextResponse.json(profiles)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
