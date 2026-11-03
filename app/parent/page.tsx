'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft, Heart, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 'name', label: "Child's Name & Age", icon: '👶' },
  { id: 'communication', label: 'Communication Style', icon: '💬' },
  { id: 'sensory', label: 'Sensory Sensitivities', icon: '👂' },
  { id: 'learning', label: 'Learning Style', icon: '📚' },
  { id: 'interests', label: 'Interests & Activities', icon: '⭐' },
  { id: 'stressors', label: 'Stressors & Triggers', icon: '⚠️' },
  { id: 'calming', label: 'Calming Strategies', icon: '🌿' },
  { id: 'notes', label: 'Additional Notes', icon: '📝' },
]

export default function ParentPortal() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    childName: '', age: '', grade: '',
    communicationStyle: 'Speaking in sentences',
    sensoryNotes: '',
    learningStyle: 'Visual',
    interests: '',
    stressors: '',
    calmingStrategies: '',
    additionalNotes: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/parent/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSubmitted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-lg p-10 max-w-md text-center border border-teal-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Thank you!</h2>
          <p className="text-gray-600 mb-6">Your child's profile has been submitted for teacher review. The teacher will review everything before it becomes an active student profile.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Child's First Name</label>
              <input type="text" value={form.childName} onChange={e => update('childName', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none" placeholder="First name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input type="number" value={form.age} onChange={e => update('age', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none" min="3" max="18" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Grade</label>
                <input type="text" value={form.grade} onChange={e => update('grade', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none" placeholder="e.g., 3rd" /></div>
            </div>
          </div>
        )
      case 1:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">How does your child communicate best?</label>
            <select value={form.communicationStyle} onChange={e => update('communicationStyle', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none">
              <option>Speaking in sentences</option><option>Short phrases</option><option>Mostly nonverbal — uses AAC device</option><option>Gestures and pointing</option><option>Writing or typing</option><option>Picture cards</option>
            </select></div>
        )
      case 2:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Are there any colors, sounds, textures, or lighting that bother your child?</label>
            <textarea value={form.sensoryNotes} onChange={e => update('sensoryNotes', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none resize-y" placeholder="e.g., loud clapping, bright flashing lights, the color red..." /></div>
        )
      case 3:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">How does your child learn best?</label>
            <div className="grid grid-cols-2 gap-3">
              {['Visual (pictures & images)', 'Auditory (listening & sounds)', 'Kinesthetic (hands-on & movement)', 'Musical (rhythm & songs)', 'Reading/Writing (text-based)'].map(opt => (
                <button key={opt} type="button" onClick={() => update('learningStyle', opt)} className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition ${form.learningStyle === opt ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-gray-200 hover:border-teal-300'}`}>{opt}</button>
              ))}
            </div></div>
        )
      case 4:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">What activities does your child enjoy? What are they interested in?</label>
            <textarea value={form.interests} onChange={e => update('interests', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none resize-y" placeholder="e.g., dinosaurs, drawing, songs, trains, space..." /></div>
        )
      case 5:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">What situations or things tend to stress or upset your child?</label>
            <textarea value={form.stressors} onChange={e => update('stressors', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none resize-y" placeholder="e.g., unexpected changes, loud noises, crowded spaces..." /></div>
        )
      case 6:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">What helps your child calm down when upset?</label>
            <textarea value={form.calmingStrategies} onChange={e => update('calmingStrategies', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none resize-y" placeholder="e.g., quiet corner, headphones with music, deep breathing..." /></div>
        )
      case 7:
        return (
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Anything else you'd like the teacher to know?</label>
            <textarea value={form.additionalNotes} onChange={e => update('additionalNotes', e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none resize-y" placeholder="Write as much or as little as you'd like..." /></div>
        )
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-teal-50 to-green-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-teal-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-teal-700" />
            <span className="font-display font-bold text-teal-900">NeuroLearn AI</span>
          </div>
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Home</Link>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-rose-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Tell Us About Your Child</h1>
          <p className="text-gray-600 mt-1">A teacher reviews and approves everything before it becomes a student profile.</p>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-2 flex-1 rounded-full transition ${i <= step ? 'bg-teal-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="text-sm text-gray-500 mb-4">{STEPS[step]?.icon} Step {step + 1} of {STEPS.length}: {STEPS[step]?.label}</div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-teal-100">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-30 transition">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !form.childName} className="flex items-center gap-1 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
