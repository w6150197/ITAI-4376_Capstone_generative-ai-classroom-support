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

  // Update status to active
  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { status: 'ACTIVE', lastActivity: new Date() },
  })

  return <StudentDashboard profile={JSON.parse(JSON.stringify(profile))} userName={session.user.name ?? 'Student'} />
}
