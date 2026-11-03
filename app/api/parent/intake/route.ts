export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const intake = await prisma.parentIntake.create({
      data: {
        childName: body.childName || 'Unknown',
        formType: 'questionnaire',
        formData: JSON.stringify(body),
        status: 'PENDING',
      },
    })
    // Also create notification for teacher
    const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' }, take: 1 })
    if (teachers?.[0]) {
      await prisma.notification.create({
        data: {
          type: 'INTAKE',
          message: `New parent intake form submitted for ${body.childName || 'a child'}`,
          userId: teachers[0].id,
        },
      })
    }
    return NextResponse.json({ id: intake.id, status: 'submitted' })
  } catch (error: any) {
    console.error('Parent intake error:', error)
    return NextResponse.json({ error: 'Failed to submit intake form' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const intakes = await prisma.parentIntake.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(intakes)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch intakes' }, { status: 500 })
  }
}
