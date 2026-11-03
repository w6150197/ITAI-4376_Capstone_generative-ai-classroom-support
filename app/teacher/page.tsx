import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { TeacherDashboard } from './_components/teacher-dashboard'

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return <TeacherDashboard userName={session.user.name ?? 'Teacher'} />
}
