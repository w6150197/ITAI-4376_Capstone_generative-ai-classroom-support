'use client'

import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { Brain, Sparkles, Heart, HelpCircle, Timer, BookOpen, Star, LogOut, Coffee } from 'lucide-react'
import { motion } from 'framer-motion'

interface BuddyData {
  id: string; buddyName: string; avatarType: string; voiceStyle: string; approvalStatus: string;
}

interface LessonData {
  id: string; lesson: { id: string; title: string; subject: string; content: string; };
  status: string; progress: number; currentStep: number; totalSteps: number;
}

interface ProfileData {
  id: string; childName: string; age: number; learningStyle: string; interests: string;
  communicationStyle: string; calmingStrategies: string | null; breakInterval: number;
  avatarColor: string; colorsToAvoid: string | null; sensoryNotes: string | null;
  learningBuddy: BuddyData | null;
  lessonAssignments: LessonData[];
}

const BUDDY_AVATARS: Record<string, string> = {
  'friendly-robot': '🤖', 'gentle-bear': '🐻', 'wise-owl': '🦉', 'happy-dolphin': '🐬',
  'kind-cat': '🐱', 'brave-lion': '🦁',
}

export function StudentDashboard({ profile, userName }: { profile: ProfileData; userName: string }) {
  const [onBreak, setOnBreak] = useState(false)
  const [breakTime, setBreakTime] = useState(0)
  const [needsHelp, setNeedsHelp] = useState(false)
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null)
  const [hints, setHints] = useState<string[]>([])
  const [loadingHint, setLoadingHint] = useState(false)
  const [showBuddyCreator, setShowBuddyCreator] = useState(false)
  const [buddyForm, setBuddyForm] = useState({ avatarType: 'friendly-robot', buddyName: '', voiceStyle: 'calm' })
  const [buddySubmitted, setBuddySubmitted] = useState(false)

  const buddy = profile?.learningBuddy
  const lessons = profile?.lessonAssignments ?? []

  // Break timer
  useEffect(() => {
    if (!onBreak) return
    const interval = setInterval(() => setBreakTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [onBreak])

  // Activity ping
  useEffect(() => {
    const ping = () => fetch('/api/student/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile?.id, action: onBreak ? 'on_break' : 'active' }),
    }).catch(() => {})
    ping()
    const interval = setInterval(ping, 30000)
    return () => clearInterval(interval)
  }, [profile?.id, onBreak])

  const requestHelp = useCallback(async () => {
    setNeedsHelp(true)
    await fetch('/api/student/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId: profile?.id, action: 'needs_help' }),
    }).catch(() => {})
  }, [profile?.id])

  const askBuddyHint = async () => {
    if (!activeLesson || !buddy || buddy.approvalStatus !== 'APPROVED') return
    setLoadingHint(true)
    try {
      const hintLevel = hints.length + 1
      const res = await fetch('/api/buddy/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonContent: activeLesson.lesson.content,
          lessonTitle: activeLesson.lesson.title,
          studentName: profile?.childName,
          learningStyle: profile?.learningStyle,
          interests: profile?.interests,
          communicationStyle: profile?.communicationStyle,
          hintLevel,
          buddyName: buddy.buddyName,
          voiceStyle: buddy.voiceStyle,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullHint = ''
      if (reader) {
        let partialRead = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          partialRead += decoder.decode(value, { stream: true })
          const lines = partialRead.split('\n')
          partialRead = lines.pop() ?? ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.status === 'completed') {
                  fullHint = parsed.hint ?? fullHint
                } else if (parsed.chunk) {
                  fullHint += parsed.chunk
                }
              } catch {}
            }
          }
        }
      }
      if (fullHint) setHints(prev => [...prev, fullHint])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHint(false)
    }
  }

  const submitBuddy = async () => {
    try {
      await fetch('/api/student/buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile?.id, ...buddyForm }),
      })
      setBuddySubmitted(true)
    } catch {}
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-teal-50 to-green-50 student-portal">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-teal-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-teal-700" />
            <span className="font-display font-bold text-teal-900 text-lg">NeuroLearn AI</span>
          </div>
          <button onClick={() => signOut({ redirectTo: '/' })} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-md p-6 border-2 border-teal-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: profile?.avatarColor + '20' }}>
              {buddy?.approvalStatus === 'APPROVED' ? (BUDDY_AVATARS[buddy?.avatarType] ?? '🤖') : '🌟'}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Hello, {profile?.childName}! 🌟</h1>
              {buddy?.approvalStatus === 'APPROVED' && (
                <p className="text-teal-600 font-semibold">{buddy.buddyName} is here to help you learn!</p>
              )}
              {!buddy && <p className="text-gray-500">Welcome to your learning space!</p>}
              {buddy?.approvalStatus === 'PENDING' && <p className="text-amber-600 text-sm">Your Learning Buddy is waiting for teacher approval ✨</p>}
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => { setOnBreak(!onBreak); if (onBreak) setBreakTime(0) }}
            className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-lg transition border-2 ${onBreak ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-teal-100 text-teal-700 hover:bg-teal-50'}`}>
            {onBreak ? <><Timer className="w-6 h-6" /> Break: {formatTime(breakTime)}</> : <><Coffee className="w-6 h-6" /> I need a break</>}
          </button>
          <button onClick={requestHelp} disabled={needsHelp}
            className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-lg transition border-2 ${needsHelp ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-teal-100 text-blue-700 hover:bg-blue-50'}`}>
            <HelpCircle className="w-6 h-6" /> {needsHelp ? 'Help is on the way!' : 'I need help'}
          </button>
        </div>

        {/* On break overlay */}
        {onBreak && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 mb-6 text-center">
            <p className="text-5xl mb-4">🌿</p>
            <h2 className="text-2xl font-display font-bold text-green-800 mb-2">Break Time</h2>
            <p className="text-green-600 text-lg">{profile?.calmingStrategies || 'Take a deep breath. You\'re doing great!'}</p>
            <p className="text-3xl font-mono font-bold text-green-700 mt-4">{formatTime(breakTime)}</p>
            <button onClick={() => { setOnBreak(false); setBreakTime(0) }} className="mt-4 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition">
              I'm ready to continue!
            </button>
          </motion.div>
        )}

        {/* Learning Buddy Creator */}
        {!buddy && !showBuddyCreator && !buddySubmitted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 mb-6 text-center">
            <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-3" />
            <h2 className="text-xl font-display font-bold text-purple-800">Create Your Learning Buddy!</h2>
            <p className="text-purple-600 mt-1">Design a buddy to help you learn</p>
            <button onClick={() => setShowBuddyCreator(true)} className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition">
              Let's make a buddy! ✨
            </button>
          </motion.div>
        )}

        {showBuddyCreator && !buddySubmitted && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border-2 border-purple-200 rounded-3xl p-6 mb-6">
            <h2 className="text-xl font-display font-bold text-purple-800 mb-4">✨ Build Your Learning Buddy</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Step 1: Choose an avatar</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(BUDDY_AVATARS).map(([key, emoji]) => (
                    <button key={key} onClick={() => setBuddyForm(f => ({ ...f, avatarType: key }))}
                      className={`p-4 rounded-2xl text-3xl border-2 transition ${buddyForm.avatarType === key ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      {emoji}
                      <p className="text-xs mt-1 text-gray-600">{key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Step 2: Name your buddy</label>
                <input type="text" value={buddyForm.buddyName} onChange={e => setBuddyForm(f => ({ ...f, buddyName: e.target.value }))}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none" placeholder="What should your buddy be called?" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Step 3: Pick a voice style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ v: 'calm', l: '🌿 Calm & Slow', d: 'Gentle and relaxed' }, { v: 'cheerful', l: '☀️ Cheerful', d: 'Happy and upbeat' }, { v: 'soft', l: '🌙 Soft & Gentle', d: 'Quiet and soothing' }].map(opt => (
                    <button key={opt.v} onClick={() => setBuddyForm(f => ({ ...f, voiceStyle: opt.v }))}
                      className={`p-3 rounded-2xl border-2 text-sm font-semibold transition ${buddyForm.voiceStyle === opt.v ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                      <p className="text-base">{opt.l}</p><p className="text-xs text-gray-500">{opt.d}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={submitBuddy} disabled={!buddyForm.buddyName}
                className="w-full py-4 bg-purple-600 text-white text-lg rounded-2xl font-bold hover:bg-purple-700 transition disabled:opacity-50">
                Send to teacher for approval! 🌟
              </button>
            </div>
          </motion.div>
        )}

        {buddySubmitted && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 mb-6 text-center">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-lg font-bold text-purple-800">Your buddy request was sent to the teacher!</p>
            <p className="text-purple-600">You'll see your buddy soon.</p>
          </div>
        )}

        {/* Today's Lessons */}
        <h2 className="text-xl font-display font-bold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" /> Today's Lessons
        </h2>
        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-lg text-gray-500">No lessons right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {lessons.map((la: LessonData) => (
              <button key={la.id} onClick={() => { setActiveLesson(la); setHints([]) }}
                className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition ${activeLesson?.id === la.id ? 'border-teal-500 shadow-md' : 'border-gray-100 hover:border-teal-300'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{la.lesson?.title}</h3>
                    <p className="text-sm text-gray-500">{la.lesson?.subject}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: la.totalSteps }).map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < la.progress ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Active Lesson View */}
        {activeLesson && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border-2 border-teal-200 p-6 mb-6">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{activeLesson.lesson?.title}</h3>
            <div className="prose prose-lg max-w-none text-gray-700 mb-4 whitespace-pre-wrap">
              {activeLesson.lesson?.content}
            </div>
            {/* Hints */}
            {hints.length > 0 && (
              <div className="space-y-3 mb-4">
                {hints.map((hint, i) => (
                  <div key={i} className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{BUDDY_AVATARS[buddy?.avatarType ?? ''] ?? '🤖'}</span>
                      <span className="font-bold text-teal-800 text-sm">{buddy?.buddyName ?? 'Learning Buddy'} — Hint {i + 1}</span>
                    </div>
                    <p className="text-teal-700">{hint}</p>
                  </div>
                ))}
              </div>
            )}
            {buddy?.approvalStatus === 'APPROVED' && hints.length < 3 && (
              <button onClick={askBuddyHint} disabled={loadingHint}
                className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition disabled:opacity-50">
                <Sparkles className="w-5 h-5" /> {loadingHint ? 'Thinking...' : `Ask ${buddy.buddyName} for a hint`}
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
