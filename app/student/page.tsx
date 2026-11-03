import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { StudentDashboard } from './_components/student-dashboard'

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const session = await auth()
  if (!session?.user) redirect('/student/login')
  if ((session.user as any)?.role !== 'STUDENT') redirect('/')
  
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      learningBuddy: true,
      lessonAssignments: {
        where: { status: { in: ['assigned', 'in_progress'] } },
        include: { lesson: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!profile) redirect('/')

  const [completed, pendingItem] = await Promise.all([
    prisma.lessonAssignment.findMany({
      where: { studentProfileId: profile.id, status: 'completed' },
      include: { lesson: true },
      orderBy: { completedAt: 'desc' },
      take: 6,
    }),
    prisma.approvalItem.findFirst({
      where: { type: 'BUDDY', studentProfileId: profile.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  let pendingDesign = null
  try { pendingDesign = pendingItem?.data ? JSON.parse(pendingItem.data) : null } catch { pendingDesign = null }

  // Update status to active
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { status: 'ACTIVE', lastActivity: new Date() },
  })

  return (
    <StudentDashboard
      profile={JSON.parse(JSON.stringify(profile))}
      completed={JSON.parse(JSON.stringify(completed))}
      pendingDesign={pendingDesign}
      userName={session.user.name ?? 'Student'}
    />
  )
}
