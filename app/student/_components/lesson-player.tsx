'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Volume2, Sparkles, Check, X } from 'lucide-react'
import { BuddyAvatar, SpeechBubble, speak } from '@/components/buddy-avatar'
import { lessonSteps } from '@/lib/buddy'

export interface PlayerBuddy { buddyName: string; avatarType: string; color: string; accessory: string; voiceStyle: string }
export interface PlayerAssignment {
  id: string; currentStep: number; totalSteps: number; progress: number; status: string
  lesson: { id: string; title: string; subject: string; content: string; steps?: unknown }
}

const PRAISE = ['Great job!', 'You got it!', 'Wonderful thinking!', 'Yes, that is right!']

export function LessonPlayer({ assignment, buddy, profile, onClose, onDone }: {
  assignment: PlayerAssignment
  buddy: PlayerBuddy | null
  profile: { childName: string; learningStyle: string; interests: string; communicationStyle: string }
  onClose: () => void
  onDone: (assignmentId: string, stars: number) => void
}) {
  const steps = lessonSteps(assignment.lesson)
  const total = steps.length
  const startAt = assignment.status === 'completed' ? 0 : Math.min(assignment.currentStep ?? 0, total - 1)
  const [idx, setIdx] = useState(Math.max(0, startAt))
  const [picked, setPicked] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const [tries, setTries] = useState(0)
  const [stars, setStars] = useState(0)
  const [hints, setHints] = useState<string[]>([])
  const [loadingHint, setLoadingHint] = useState(false)
  const [finished, setFinished] = useState(false)

  const step = steps[idx]
  const voice = buddy?.voiceStyle
  const isChoice = step?.type === 'choice' && Array.isArray(step.choices)
  const canContinue = !isChoice || solved

  const save = (currentStep: number, completed: boolean) =>
    fetch('/api/student/lesson-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: assignment.id, currentStep, progress: Math.min(currentStep, total), totalSteps: total, completed }),
    }).catch(err => console.error('Progress save failed', err))

  const choose = (i: number) => {
    if (solved) return
    setPicked(i)
    if (i === step.answer) {
      setSolved(true)
      if (tries === 0) setStars(s => s + 1)
      if (buddy) speak(PRAISE[idx % PRAISE.length], voice)
    } else {
      setTries(t => t + 1)
      if (buddy) speak("Good try! Let's look again.", voice)
    }
  }

  const next = async () => {
    window.speechSynthesis?.cancel()
    if (idx + 1 >= total) {
      setFinished(true)
      await save(total, true)
      onDone(assignment.id, stars)
      if (buddy) speak(`You finished ${assignment.lesson.title}! I am so proud of you.`, voice)
      return
    }
    setIdx(idx + 1); setPicked(null); setSolved(false); setTries(0); setHints([])
    save(idx + 1, false)
  }

  const back = () => { if (idx > 0) { setIdx(idx - 1); setPicked(null); setSolved(false); setTries(0); setHints([]) } }

  const askHint = async () => {
    if (!buddy || hints.length >= 3) return
    setLoadingHint(true)
    try {
      const res = await fetch('/api/buddy/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonContent: `${assignment.lesson.content}\n\nThe student is on this part right now: ${step.text}${isChoice ? `\nChoices: ${step.choices!.join(', ')}` : ''}\nDo NOT say the answer directly.`,
          lessonTitle: assignment.lesson.title,
          studentName: profile.childName,
          learningStyle: profile.learningStyle,
          interests: profile.interests,
          communicationStyle: profile.communicationStyle,
          hintLevel: hints.length + 1,
          buddyName: buddy.buddyName,
          voiceStyle: buddy.voiceStyle,
        }),
      })
      if (!res.ok || !res.body) throw new Error('Hint request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = '', full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ') || line.slice(6) === '[DONE]') continue
          try {
            const p = JSON.parse(line.slice(6))
            if (p.status === 'completed') full = p.hint ?? full
            else if (p.chunk) full += p.chunk
          } catch {}
        }
      }
      if (full) setHints(h => [...h, full])
    } catch (e) {
      console.error(e)
      setHints(h => [...h, step.buddyTip ?? 'Take your time and look at each choice slowly.'])
    } finally {
      setLoadingHint(false)
    }
  }

  if (finished) {
    const choiceCount = steps.filter(s => s.type === 'choice').length
    return (
      <div className="bg-white rounded-3xl border-2 border-teal-200 p-8 mb-6 text-center">
        <p className="text-6xl mb-3">🎉</p>
        <h3 className="text-2xl font-display font-bold text-teal-900">You finished {assignment.lesson.title}!</h3>
        {choiceCount > 0 && (
          <p className="text-lg text-gray-600 mt-2">You earned {stars} of {choiceCount} stars ⭐</p>
        )}
        {buddy && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <BuddyAvatar {...buddy} size="md" />
            <SpeechBubble>I am so proud of you, {profile.childName}!</SpeechBubble>
          </div>
        )}
        <button onClick={onClose} className="mt-6 px-8 py-4 bg-teal-600 text-white text-lg rounded-2xl font-bold hover:bg-teal-700 transition">
          Back to my lessons
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-teal-200 p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-xl font-display font-bold text-gray-900">{assignment.lesson.title}</h3>
        <button onClick={onClose} className="flex items-center gap-1 px-3 py-2 text-base font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">
          <X className="w-5 h-5" /> Close
        </button>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-base text-gray-500 mb-1">
          <span>Part {idx + 1} of {total}</span>
          <span>{'⭐'.repeat(stars)}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: `${((idx + (canContinue ? 1 : 0)) / total) * 100}%` }} />
        </div>
      </div>

      <div className="bg-teal-50/60 rounded-2xl p-5 mb-4">
        {step.emoji && <p className="text-5xl mb-3 text-center">{step.emoji}</p>}
        <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">{step.text}</p>
        <button onClick={() => speak(step.text + (isChoice ? '. ' + step.choices!.join('. ') : ''), voice)}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-200 rounded-xl text-teal-700 font-semibold hover:bg-teal-50">
          <Volume2 className="w-5 h-5" /> Read to me
        </button>
      </div>

      {isChoice && (
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {step.choices!.map((c, i) => {
            const right = solved && i === step.answer
            const wrong = picked === i && !solved
            return (
              <button key={i} onClick={() => choose(i)} disabled={solved}
                className={`p-4 rounded-2xl border-2 text-lg font-bold transition flex items-center justify-center gap-2 ${right ? 'bg-green-100 border-green-400 text-green-800' : wrong ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-800 hover:border-teal-400'}`}>
                {right && <Check className="w-5 h-5" />} {c}
              </button>
            )
          })}
        </div>
      )}

      {isChoice && picked !== null && (
        <p className={`text-lg font-semibold mb-4 ${solved ? 'text-green-700' : 'text-blue-700'}`}>
          {solved ? `✅ ${PRAISE[idx % PRAISE.length]}` : "💙 Good try! Let's look again."}
        </p>
      )}

      {hints.length > 0 && (
        <div className="space-y-3 mb-4">
          {hints.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              {buddy && <BuddyAvatar {...buddy} size="sm" />}
              <SpeechBubble>
                <span className="block text-sm font-bold text-teal-700">{buddy?.buddyName} — Hint {i + 1}</span>
                {h}
                <button onClick={() => speak(h, voice)} className="ml-2 inline-flex items-center gap-1 text-sm text-teal-700 font-semibold">
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </SpeechBubble>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={back} disabled={idx === 0}
          className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        {buddy && hints.length < 3 && (
          <button onClick={askHint} disabled={loadingHint}
            className="flex items-center gap-2 px-5 py-3 bg-purple-100 text-purple-800 rounded-2xl font-bold hover:bg-purple-200 disabled:opacity-50">
            <Sparkles className="w-5 h-5" /> {loadingHint ? 'Thinking...' : `Ask ${buddy.buddyName} for a hint`}
          </button>
        )}
        <button onClick={next} disabled={!canContinue}
          className="ml-auto flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 disabled:opacity-40">
          {idx + 1 >= total ? 'Finish' : 'Next'} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
