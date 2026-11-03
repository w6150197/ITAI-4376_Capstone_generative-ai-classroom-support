'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, GraduationCap, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        loginType: 'teacher',
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.replace('/teacher')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-8 h-8 text-teal-700" />
            <h1 className="text-2xl font-display font-bold text-teal-900">NeuroLearn AI</h1>
          </div>
          <p className="text-teal-600">Teacher Sign In</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-teal-100">
          <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-7 h-7 text-teal-600" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition" placeholder="teacher@neurolearn.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">Don't have an account? <Link href="/signup" className="text-teal-600 font-semibold hover:underline">Sign up</Link></p>
          <p className="mt-2 text-center text-sm text-gray-500">Are you a student? <Link href="/student/login" className="text-purple-700 font-semibold hover:underline">Student sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
