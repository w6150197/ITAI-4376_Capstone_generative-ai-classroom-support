'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Volume2, Send } from 'lucide-react'
import { BuddyAvatar, SpeechBubble, speak } from '@/components/buddy-avatar'
import { BUDDY_CHARACTERS, BUDDY_ACCESSORIES, VOICE_STYLES, allowedColors, buddyPersonality, ProfileLike } from '@/lib/buddy'

export interface BuddyDesign { avatarType: string; color: string; accessory: string; buddyName: string; voiceStyle: string }

const NAME_IDEAS = ['Sunny', 'Pip', 'Star', 'Bubbles', 'Nova', 'Ziggy', 'Maple', 'Echo']

export function BuddyCreator({ profile, initial, onSubmitted, onCancel }: {
  profile: ProfileLike & { childName: string; colorsToAvoid?: string | null }
  initial?: Partial<BuddyDesign>
  onSubmitted: (d: BuddyDesign) => void
  onCancel?: () => void
}) {
  const colors = allowedColors(profile.colorsToAvoid)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [d, setD] = useState<BuddyDesign>({
    avatarType: initial?.avatarType ?? 'friendly-robot',
    color: initial?.color && colors.some(c => c.hex === initial.color) ? initial.color : colors[0]?.hex ?? '#14b8a6',
    accessory: initial?.accessory ?? 'none',
    buddyName: initial?.buddyName ?? '',
    voiceStyle: initial?.voiceStyle ?? 'calm',
  })
  const set = (patch: Partial<BuddyDesign>) => setD(prev => ({ ...prev, ...patch }))
  const personality = buddyPersonality(profile)
  const nameOrMe = d.buddyName || 'your buddy'

  const STEPS = [
    { title: 'Pick your buddy', say: `Hi ${profile.childName}! Who do you want me to be?` },
    { title: 'Pick a color', say: 'What color should I be?' },
    { title: 'Add something fun', say: 'Should I wear something special?' },
    { title: 'Give me a name', say: 'What is my name?' },
    { title: 'Pick my voice', say: 'How should I sound? Tap the speaker to listen.' },
    { title: 'All done!', say: `I'm ${nameOrMe}! Your teacher will say hello to me first, then we can learn together.` },
  ]
  const last = STEPS.length - 1
  const canNext = step !== 3 || d.buddyName.trim().length > 0

  const submit = async () => {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/student/buddy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      onSubmitted(d)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.')
    } finally { setSaving(false) }
  }

  const optionClass = (selected: boolean) => `rounded-2xl border-4 transition p-3 flex flex-col items-center gap-1 ${selected ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200'}`

  return (
    <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 md:p-8 mb-6 shadow-md">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-purple-700">Step {step + 1} of {STEPS.length}: {STEPS[step].title}</p>
        {onCancel && <button onClick={onCancel} className="text-base text-gray-500 hover:text-gray-700 underline">Not now</button>}
      </div>
      <div className="flex gap-2 mb-6" aria-hidden="true">
        {STEPS.map((_, i) => <div key={i} className={`h-3 flex-1 rounded-full ${i <= step ? 'bg-purple-500' : 'bg-gray-200'}`} />)}
      </div>

      {/* Live preview */}
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
        <BuddyAvatar avatarType={d.avatarType} color={d.color} accessory={d.accessory} size="lg" />
        <div className="flex-1 w-full">
          {d.buddyName && <p className="text-2xl font-display font-bold text-gray-900 mb-2">{d.buddyName}</p>}
          <SpeechBubble>{STEPS[step].say}</SpeechBubble>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[180px]">
        {step === 0 && (
          <div className="grid grid-cols-3 gap-3">
            {BUDDY_CHARACTERS.map(c => (
              <button key={c.key} onClick={() => set({ avatarType: c.key })} className={optionClass(d.avatarType === c.key)} aria-pressed={d.avatarType === c.key}>
                <span className="text-4xl">{c.emoji}</span><span className="text-base font-semibold text-gray-700">{c.label}</span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {colors.map(c => (
              <button key={c.hex} onClick={() => set({ color: c.hex })} className={optionClass(d.color === c.hex)} aria-pressed={d.color === c.hex}>
                <span className="w-12 h-12 rounded-full" style={{ backgroundColor: c.hex }} /><span className="text-base font-semibold text-gray-700">{c.label}</span>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="grid grid-cols-3 gap-3">
            {BUDDY_ACCESSORIES.map(a => (
              <button key={a.key} onClick={() => set({ accessory: a.key })} className={optionClass(d.accessory === a.key)} aria-pressed={d.accessory === a.key}>
                <span className="text-4xl h-10">{a.emoji || '🚫'}</span><span className="text-base font-semibold text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div>
            <input autoFocus type="text" maxLength={30} value={d.buddyName} onChange={e => set({ buddyName: e.target.value })}
              className="w-full px-4 py-4 text-xl border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none" placeholder="Type a name" aria-label="Buddy name" />
            <p className="text-base text-gray-600 mt-4 mb-2">Or tap a name:</p>
            <div className="flex flex-wrap gap-2">
              {NAME_IDEAS.map(n => (
                <button key={n} onClick={() => set({ buddyName: n })} className={`px-4 py-2 rounded-full text-lg border-2 ${d.buddyName === n ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>{n}</button>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="grid sm:grid-cols-3 gap-3">
            {VOICE_STYLES.map(v => (
              <div key={v.key} className={optionClass(d.voiceStyle === v.key) + ' cursor-pointer'} onClick={() => set({ voiceStyle: v.key })} role="button" aria-pressed={d.voiceStyle === v.key}>
                <span className="text-lg font-bold">{v.label}</span>
                <span className="text-base text-gray-500">{v.desc}</span>
                <button onClick={e => { e.stopPropagation(); set({ voiceStyle: v.key }); speak(v.sample, v.key) }} className="mt-2 flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-100 text-purple-800 font-semibold">
                  <Volume2 className="w-5 h-5" /> Listen
                </button>
              </div>
            ))}
          </div>
        )}
        {step === last && (
          <div className="bg-purple-50 rounded-2xl p-5">
            <p className="text-lg font-bold text-purple-900 mb-3">How {nameOrMe} will help you:</p>
            <ul className="space-y-2">
              {personality.map(t => <li key={t} className="flex gap-2 text-lg text-gray-800"><span>✨</span>{t}</li>)}
            </ul>
            {error && <p className="mt-4 text-base text-red-700 bg-red-50 rounded-xl p-3">{error}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-3 mt-6">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="flex items-center gap-2 px-5 py-4 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-700 disabled:opacity-30">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        {step < last ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="flex items-center gap-2 px-6 py-4 rounded-2xl text-lg font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40">
            Next <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={submit} disabled={saving} className="flex items-center gap-2 px-6 py-4 rounded-2xl text-lg font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50">
            <Send className="w-5 h-5" /> {saving ? 'Sending...' : 'Send to my teacher'}
          </button>
        )}
      </div>
    </div>
  )
}
