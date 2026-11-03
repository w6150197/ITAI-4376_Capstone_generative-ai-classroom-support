'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Sparkles, ArrowLeft } from 'lucide-react'

export default function StudentLoginPage() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        name: name.trim(),
        pin,
        loginType: 'student',
        redirect: false,
      })
      if (result?.error) {
        setError('Name or PIN not recognized. Please try again.')
      } else {
        router.replace('/student')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-teal-50 to-green-50 flex items-center justify-center p-4 student-portal">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-base text-teal-600 hover:text-teal-800 mb-4">
            <ArrowLeft className="w-5 h-5" /> Back to home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-10 h-10 text-teal-700" />
            <h1 className="text-3xl font-display font-bold text-teal-900">NeuroLearn AI</h1>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-teal-100">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-center text-gray-800 mb-6">Hello! What's your name?</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-base rounded-xl p-3">{error}</div>}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Your First Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required autoComplete="off" className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition" placeholder="Type your name here" />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Your Secret PIN</label>
              <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required maxLength={4} inputMode="numeric" autoComplete="off" className="w-full px-4 py-4 text-lg text-center tracking-[0.5em] border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition" placeholder="• • • •" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-teal-600 text-white text-lg rounded-2xl font-bold hover:bg-teal-700 transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Let\'s Go! 🚀'}
            </button>
          </form>
          <div className="mt-6 bg-teal-50 rounded-2xl p-4 text-base text-gray-700">
            <p className="font-semibold text-teal-800 mb-2">Demo students (tap to fill in):</p>
            <div className="grid grid-cols-2 gap-2">
              {[['Maya', '1234'], ['Amara', '2345'], ['Liam', '3456'], ['Zoe', '4567'], ['Alex', '5678']].map(([n, p]) => (
                <button key={n} type="button" onClick={() => { setName(n); setPin(p); setError('') }} className="text-left px-3 py-2 bg-white rounded-xl border border-teal-100 hover:bg-teal-100 transition">
                  {n} · PIN {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
