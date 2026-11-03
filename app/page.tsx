import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LandingClient } from './_components/landing-client'

export default async function HomePage() {
  const session = await auth()
  if (session?.user) {
    const role = (session.user as any)?.role
    if (role === 'TEACHER') redirect('/teacher')
    if (role === 'STUDENT') redirect('/student')
    redirect('/teacher')
  }
  return <LandingClient />
}
