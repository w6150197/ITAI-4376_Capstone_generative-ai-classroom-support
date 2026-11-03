'use client'

import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { Brain, Sparkles, HelpCircle, Timer, BookOpen, Star, LogOut, Coffee, Volume2, Palette, Clock, Play, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { BuddyAvatar, SpeechBubble, speak } from '@/components/buddy-avatar'
import { BuddyCreator, BuddyDesign } from './buddy-creator'
import { LessonPlayer, PlayerAssignment } from './lesson-player'

interface BuddyData {
  id: string; buddyName: string; avatarType: string; voiceStyle: string; approvalStatus: string
  color: string; accessory: string; teacherNotes: string | null
}

interface ProfileData {
  id: string; childName: string; age: number; learningStyle: string; interests: string
  communicationStyle: string; calmingStrategies: string | null; breakInterval: number
  avatarColor: string; colorsToAvoid: string | null; sensoryNotes: string | null; stressors: string | null
  learningBuddy: BuddyData | null
  lessonAssignments: PlayerAssignment[]
}

type Completed = PlayerAssignment & { completedAt?: string | null }

export function StudentDashboard({ profile, completed: initialCompleted, pendingDesign: initialPending, userName }: {
  profile: ProfileData; completed: Completed[]; pendingDesign: BuddyDesign | null; userName: string
}) {
  const [onBreak, setOnBreak] = useState(false)
  const [breakTime, setBreakTime] = useState(0)
  const [workSeconds, setWorkSeconds] = useState(0)
  const [reminderDismissed, setReminderDismissed] = useState(false)
  const [needsHelp, setNeedsHelp] = useState(false)
  const [lessons, setLessons] = useState<PlayerAssignment[]>(profile?.lessonAssignments ?? [])
  const [completed, setCompleted] = useState<Completed[]>(initialCompleted ?? [])
  const [activeLesson, setActiveLesson] = useState<PlayerAssignment | null>(null)
  const [pendingDesign, setPendingDesign] = useState<BuddyDesign | null>(initialPending)

  const buddy = profile?.learningBuddy
  const approved = buddy?.approvalStatus === 'APPROVED' ? buddy : null
  const needsBuddy = !approved && !pendingDesign
  const [showCreator, setShowCreator] = useState(needsBuddy)

  const breakEvery = Math.max(5, profile?.breakInterval ?? 15) * 60
  const showReminder = !onBreak && !reminderDismissed && workSeconds >= breakEvery

  useEffect(() => {
    const interval = setInterval(() => {
      if (onBreak) setBreakTime(t => t + 1)
      else setWorkSeconds(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [onBreak])

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

  const startBreak = () => { setOnBreak(true); setBreakTime(0); setActiveLesson(null); if (approved) speak("Let's take a calm break together.", approved.voiceStyle) }
  const endBreak = () => { setOnBreak(false); setBreakTime(0); setWorkSeconds(0); setReminderDismissed(false) }

  const onLessonDone = (id: string) => {
    const la = lessons.find(l => l.id === id)
    if (!la) return
    setLessons(ls => ls.filter(l => l.id !== id))
    setCompleted(cs => [{ ...la, status: 'completed', progress: la.totalSteps }, ...cs])
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const greeting = approved
    ? `Hi ${profile.childName}! I'm ${approved.buddyName}. Pick a lesson and we'll learn together.`
    : ''
  const breathingIn = Math.floor(breakTime / 4) % 2 === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-teal-50 to-green-50 student-portal">
      <header className="bg-white/90 backdrop-blur-md border-b border-teal-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-teal-700" />
            <span className="font-display font-bold text-teal-900 text-lg">NeuroLearn AI</span>
          </div>
          <button onClick={() => signOut({ redirectTo: '/' })} className="flex items-center gap-1 px-3 py-2 text-base font-semibold text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Greeting + buddy */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="bg-white rounded-3xl shadow-md p-6 border-2 border-teal-100 mb-6">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">Hello, {profile?.childName}! 🌟</h1>
          {approved ? (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <BuddyAvatar avatarType={approved.avatarType} color={approved.color} accessory={approved.accessory} size="lg" />
              <div className="flex-1 w-full space-y-3">
                <SpeechBubble>{greeting}</SpeechBubble>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => speak(greeting, approved.voiceStyle)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 border-2 border-teal-200 text-teal-800 font-semibold hover:bg-teal-100">
                    <Volume2 className="w-5 h-5" /> Hear {approved.buddyName}
                  </button>
                  {!pendingDesign && !showCreator && (
                    <button onClick={() => setShowCreator(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border-2 border-purple-200 text-purple-800 font-semibold hover:bg-purple-100">
                      <Palette className="w-5 h-5" /> Change my buddy
                    </button>
                  )}
                </div>
                {pendingDesign && (
                  <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
                    <BuddyAvatar {...pendingDesign} size="sm" />
                    <p className="text-base text-amber-800 flex items-center gap-1"><Clock className="w-4 h-4" /> Your new buddy look is waiting for your teacher to say yes.</p>
                  </div>
                )}
              </div>
            </div>
          ) : pendingDesign ? (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="opacity-80"><BuddyAvatar {...pendingDesign} size="lg" /></div>
              <div className="flex-1 w-full space-y-2">
                <p className="text-xl font-bold text-gray-900">{pendingDesign.buddyName} is almost ready!</p>
                <SpeechBubble>Your teacher is saying hello to me first. Then we can learn together! ⏳</SpeechBubble>
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-600">Welcome to your learning space! Let's make your very own Learning Buddy.</p>
          )}
        </motion.div>

        {/* Buddy creator (first visit, after teacher asks for changes, or "Change my buddy") */}
        {showCreator && !pendingDesign && (
          <>
            {buddy?.approvalStatus === 'REJECTED' && buddy.teacherNotes && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-3 text-lg text-blue-900">
                💬 Your teacher says: {buddy.teacherNotes}
              </div>
            )}
            <BuddyCreator
              profile={profile}
              initial={buddy ? { avatarType: buddy.avatarType, color: buddy.color, accessory: buddy.accessory, buddyName: buddy.buddyName, voiceStyle: buddy.voiceStyle } : undefined}
              onSubmitted={d => { setPendingDesign(d); setShowCreator(false) }}
              onCancel={() => setShowCreator(false)}
            />
          </>
        )}
        {!showCreator && needsBuddy && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 mb-6 text-center">
            <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <h2 className="text-xl font-display font-bold text-purple-800">Make your Learning Buddy</h2>
            <button onClick={() => setShowCreator(true)} className="mt-3 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition">
              Let's make a buddy! ✨
            </button>
          </div>
        )}

        {/* Gentle break reminder */}
        {showReminder && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
            <p className="text-lg text-green-900 flex-1">🌿 You've been working hard! Would you like a break?</p>
            <div className="flex gap-2">
              <button onClick={startBreak} className="px-5 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">Yes, break</button>
              <button onClick={() => setReminderDismissed(true)} className="px-5 py-3 bg-white border-2 border-green-200 text-green-800 rounded-xl font-bold">Not yet</button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => (onBreak ? endBreak() : startBreak())}
            className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-lg transition border-2 ${onBreak ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-teal-100 text-teal-700 hover:bg-teal-50'}`}>
            {onBreak ? <><Timer className="w-6 h-6" /> Break: {formatTime(breakTime)}</> : <><Coffee className="w-6 h-6" /> I need a break</>}
          </button>
          <button onClick={requestHelp} disabled={needsHelp}
            className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-lg transition border-2 ${needsHelp ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-teal-100 text-blue-700 hover:bg-blue-50'}`}>
            <HelpCircle className="w-6 h-6" /> {needsHelp ? 'Help is on the way!' : 'I need help'}
          </button>
        </div>

        {/* Calm break with breathing circle */}
        {onBreak && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 mb-6 text-center">
            <h2 className="text-2xl font-display font-bold text-green-800 mb-6">Break Time</h2>
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-40 h-40 rounded-full bg-green-200/70 flex items-center justify-center"
              >
                {approved ? <BuddyAvatar avatarType={approved.avatarType} color={approved.color} accessory={approved.accessory} size="md" /> : <span className="text-5xl">🌿</span>}
              </motion.div>
            </div>
            <p className="text-2xl font-bold text-green-800 mb-2">{breathingIn ? 'Breathe in...' : 'Breathe out...'}</p>
            <p className="text-green-700 text-lg">{profile?.calmingStrategies || "Take a deep breath. You're doing great!"}</p>
            <p className="text-3xl font-mono font-bold text-green-700 mt-4">{formatTime(breakTime)}</p>
            <button onClick={endBreak} className="mt-4 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition">
              I'm ready to continue!
            </button>
          </motion.div>
        )}

        {/* Active lesson */}
        {activeLesson && !onBreak && (
          <LessonPlayer
            key={activeLesson.id}
            assignment={activeLesson}
            buddy={approved}
            profile={profile}
            onClose={() => setActiveLesson(null)}
            onDone={onLessonDone}
          />
        )}

        {/* Lessons */}
        {!activeLesson && (
          <>
            <h2 className="text-xl font-display font-bold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" /> My Lessons
            </h2>
            {lessons.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center mb-6">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-lg text-gray-500">No lessons right now. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {lessons.map(la => (
                  <button key={la.id} onClick={() => setActiveLesson(la)}
                    className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-300 p-4 transition flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{la.lesson?.title}</h3>
                      <p className="text-base text-gray-500">{la.lesson?.subject}{la.status === 'in_progress' ? ' · keep going!' : ''}</p>
                    </div>
                    <span className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl font-bold shrink-0">
                      <Play className="w-5 h-5" /> {la.status === 'in_progress' ? 'Continue' : 'Start'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <>
                <h2 className="text-xl font-display font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" /> Lessons I finished
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {completed.map(la => (
                    <button key={la.id} onClick={() => setActiveLesson(la)} className="text-left bg-white rounded-2xl border-2 border-green-100 p-4 hover:border-green-300 transition">
                      <p className="font-bold text-gray-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> {la.lesson?.title}</p>
                      <p className="text-base text-gray-500">Tap to do it again</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
