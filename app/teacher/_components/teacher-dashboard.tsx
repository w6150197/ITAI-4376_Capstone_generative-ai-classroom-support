'use client'

import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { Brain, Users, CheckCircle2, Bell, BookOpen, Plus, Eye, Check, X, LogOut, AlertTriangle, Clock, Heart, Sparkles, FileText, RefreshCw, Settings, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SafeDate } from '@/components/safe-format'
import { BuddyAvatar } from '@/components/buddy-avatar'
import { LessonStep } from '@/lib/buddy'

const parseData = (raw?: string | null): any => { try { return raw ? JSON.parse(raw) : null } catch { return null } }

type Tab = 'overview' | 'students' | 'approvals' | 'lessons' | 'notifications' | 'intakes'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_BREAK: 'bg-amber-100 text-amber-800',
  NEEDS_HELP: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
  OFFLINE: 'bg-gray-100 text-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active', ON_BREAK: 'On Break', NEEDS_HELP: 'Needs Help',
  INACTIVE: 'Inactive', OFFLINE: 'Offline',
}

export function TeacherDashboard({ userName }: { userName: string }) {
  const [tab, setTab] = useState<Tab>('overview')
  const [students, setStudents] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [intakes, setIntakes] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateLesson, setShowCreateLesson] = useState(false)
  const [newLesson, setNewLesson] = useState({ title: '', subject: '', content: '', difficulty: 'medium' })
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [assignModal, setAssignModal] = useState<{ lessonId: string } | null>(null)
  const [noteFor, setNoteFor] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [draftSteps, setDraftSteps] = useState<LessonStep[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, aRes, nRes, iRes, lRes] = await Promise.all([
        fetch('/api/teacher/students'), fetch('/api/teacher/approvals'),
        fetch('/api/teacher/notifications'), fetch('/api/parent/intake'),
        fetch('/api/teacher/lessons'),
      ])
      const [sData, aData, nData, iData, lData] = await Promise.all([
        sRes.json(), aRes.json(), nRes.json(), iRes.json(), lRes.json(),
      ])
      setStudents(Array.isArray(sData) ? sData : [])
      setApprovals(Array.isArray(aData) ? aData : [])
      setNotifications(Array.isArray(nData) ? nData : [])
      setIntakes(Array.isArray(iData) ? iData : [])
      setLessons(Array.isArray(lData) ? lData : [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 15000); return () => clearInterval(i) }, [fetchAll])

  const handleApproval = async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    await fetch('/api/teacher/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes }),
    })
    setNoteFor(null); setNoteText('')
    fetchAll()
  }

  const generateSteps = async () => {
    setGenerating(true); setGenError('')
    try {
      const res = await fetch('/api/teacher/lessons/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not generate steps')
      setDraftSteps(data.steps ?? [])
    } catch (e: any) {
      setGenError(e.message ?? 'Could not generate steps')
    } finally { setGenerating(false) }
  }

  const handleCreateLesson = async () => {
    await fetch('/api/teacher/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newLesson, steps: draftSteps }),
    })
    setNewLesson({ title: '', subject: '', content: '', difficulty: 'medium' })
    setDraftSteps([])
    setShowCreateLesson(false)
    fetchAll()
  }

  const handleAssign = async (lessonId: string, studentProfileId: string) => {
    await fetch('/api/teacher/lessons/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, studentProfileId }),
    })
    setAssignModal(null)
    fetchAll()
  }

  const handleIntakeApproval = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch('/api/teacher/intakes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchAll()
  }

  const pendingApprovals = approvals?.filter((a: any) => a?.status === 'PENDING') ?? []
  const pendingIntakes = intakes?.filter((i: any) => i?.status === 'PENDING') ?? []
  const unreadNotifs = notifications?.filter((n: any) => !n?.read) ?? []

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: pendingApprovals.length },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'intakes', label: 'Parent Intakes', icon: Heart, badge: pendingIntakes.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-teal-700" />
            <span className="font-display font-bold text-teal-900">NeuroLearn AI</span>
            <span className="text-xs font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">TEACHER</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><RefreshCw className="w-4 h-4" /></button>
            <span className="text-sm text-gray-500">Welcome, {userName}</span>
            <button onClick={() => signOut({ redirectTo: '/' })} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Tab nav */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${tab === t.id ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <t.icon className="w-4 h-4" />{t.label}
              {(t.badge ?? 0) > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{t.badge}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading dashboard...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="text-2xl font-bold text-gray-900">{students?.length ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm text-gray-500">Pending Approvals</p>
                      <p className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm text-gray-500">Active Lessons</p>
                      <p className="text-2xl font-bold text-teal-600">{lessons?.length ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm text-gray-500">Unread Alerts</p>
                      <p className="text-2xl font-bold text-red-600">{unreadNotifs.length}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-teal-600" /> Live Student Activity</h3></div>
                    <div className="divide-y divide-gray-50">
                      {(students ?? []).map((s: any) => (
                        <div key={s?.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: s?.avatarColor ?? '#0f766e' }}>
                              {s?.childName?.[0] ?? '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{s?.childName ?? 'Unknown'}</p>
                              <p className="text-xs text-gray-400">Grade {s?.grade} · {s?.learningStyle}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[s?.status ?? 'OFFLINE'] ?? STATUS_COLORS.OFFLINE}`}>
                            {STATUS_LABELS[s?.status ?? 'OFFLINE'] ?? 'Offline'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENTS */}
              {tab === 'students' && (
                <div className="space-y-4">
                  {selectedStudent ? (
                    <div>
                      <button onClick={() => setSelectedStudent(null)} className="text-sm text-teal-600 hover:text-teal-800 mb-4">← Back to all students</button>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: selectedStudent?.avatarColor ?? '#0f766e' }}>
                            {selectedStudent?.childName?.[0] ?? '?'}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedStudent?.childName}</h2>
                            <p className="text-gray-500">Age {selectedStudent?.age} · Grade {selectedStudent?.grade} · {selectedStudent?.pronouns}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            ['Communication', selectedStudent?.communicationStyle],
                            ['Learning Style', selectedStudent?.learningStyle],
                            ['Interests', selectedStudent?.interests],
                            ['Sensory Notes', selectedStudent?.sensoryNotes],
                            ['Calming Strategies', selectedStudent?.calmingStrategies],
                            ['Stressors', selectedStudent?.stressors],
                            ['Colors to Avoid', selectedStudent?.colorsToAvoid],
                            ['Additional Notes', selectedStudent?.additionalNotes],
                          ].filter(([, v]) => v).map(([label, val]) => (
                            <div key={label as string} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                              <p className="text-gray-800 text-sm">{val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-3">
                          <div className="bg-blue-50 rounded-lg p-3 flex-1">
                            <p className="text-xs font-semibold text-blue-600">Break Interval</p>
                            <p className="font-bold text-blue-800">{selectedStudent?.breakInterval ?? 20} min</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-3 flex-1">
                            <p className="text-xs font-semibold text-amber-600">Inactivity Alert</p>
                            <p className="font-bold text-amber-800">{selectedStudent?.inactivityThreshold ?? 5} min</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {(students ?? []).map((s: any) => (
                        <button key={s?.id} onClick={() => setSelectedStudent(s)} className="text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: s?.avatarColor ?? '#0f766e' }}>
                              {s?.childName?.[0] ?? '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{s?.childName}</p>
                              <p className="text-xs text-gray-500">Age {s?.age} · Grade {s?.grade} · {s?.learningStyle}</p>
                            </div>
                            <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[s?.status ?? 'OFFLINE']}`}>
                              {STATUS_LABELS[s?.status ?? 'OFFLINE']}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* APPROVALS */}
              {tab === 'approvals' && (
                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                      <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-500">No pending approvals. Everything is up to date!</p>
                    </div>
                  ) : pendingApprovals.map((a: any) => {
                    const design = a?.type === 'BUDDY' ? parseData(a?.data) : null
                    return (
                    <div key={a?.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {design?.avatarType && <BuddyAvatar avatarType={design.avatarType} color={design.color} accessory={design.accessory} size="md" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{a?.type}</span>
                            <h3 className="font-semibold text-gray-800">{a?.title}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{a?.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Student: {a?.studentProfile?.childName ?? 'N/A'}</p>
                          {Array.isArray(design?.personality) && design.personality.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-600">Personality (from parent intake):</p>
                              <ul className="text-xs text-gray-600 list-disc ml-4">
                                {design.personality.map((t: string) => <li key={t}>{t}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproval(a?.id, 'APPROVED')} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"><Check className="w-4 h-4" /> Approve</button>
                          <button onClick={() => { setNoteFor(noteFor === a?.id ? null : a?.id); setNoteText('') }} className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold hover:bg-amber-200"><X className="w-4 h-4" /> {a?.type === 'BUDDY' ? 'Request changes' : 'Reject'}</button>
                        </div>
                      </div>
                      {noteFor === a?.id && (
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder={a?.type === 'BUDDY' ? 'Kind note for the student, e.g. "Let\'s pick a calmer color!"' : 'Reason (optional)'} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                          <button onClick={() => handleApproval(a?.id, 'REJECTED', noteText.trim())} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700">Send</button>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}

              {/* LESSONS */}
              {tab === 'lessons' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Lesson Library</h2>
                    <button onClick={() => setShowCreateLesson(!showCreateLesson)} className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">
                      <Plus className="w-4 h-4" /> Create Lesson
                    </button>
                  </div>
                  {showCreateLesson && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                      <input value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} placeholder="Lesson title" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                      <input value={newLesson.subject} onChange={e => setNewLesson(p => ({ ...p, subject: e.target.value }))} placeholder="Subject (e.g. Math, Reading)" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                      <textarea value={newLesson.content} onChange={e => setNewLesson(p => ({ ...p, content: e.target.value }))} rows={4} placeholder="Lesson content..." className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                      <button onClick={generateSteps} disabled={!newLesson.title || !newLesson.content || generating} className="flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold hover:bg-purple-200 disabled:opacity-50">
                        <Sparkles className="w-4 h-4" /> {generating ? 'Drafting steps...' : draftSteps.length ? 'Redo interactive steps with AI' : 'Make it interactive with AI'}
                      </button>
                      {genError && <p className="text-sm text-red-600">{genError}</p>}
                      {draftSteps.length > 0 && (
                        <div className="border border-purple-100 rounded-lg p-3 bg-purple-50/40 space-y-2">
                          <p className="text-xs font-semibold text-purple-800">AI draft — review before saving. Remove any step you don't want.</p>
                          {draftSteps.map((s, i) => (
                            <div key={i} className="bg-white rounded-lg p-2 text-sm flex gap-2 items-start">
                              <span>{s.emoji}</span>
                              <div className="flex-1">
                                <p className="text-gray-800">{s.text}</p>
                                {s.type === 'choice' && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {s.choices?.map((c, ci) => <span key={ci} className={ci === s.answer ? 'font-bold text-green-700' : ''}>{ci > 0 ? ' · ' : ''}{c}</span>)}
                                  </p>
                                )}
                              </div>
                              <button onClick={() => setDraftSteps(ds => ds.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600" aria-label="Remove step"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={handleCreateLesson} disabled={!newLesson.title || !newLesson.content} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">{draftSteps.length ? 'Approve & Save Lesson' : 'Save Lesson'}</button>
                    </div>
                  )}
                  {(lessons ?? []).map((l: any) => (
                    <div key={l?.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{l?.title}</h3>
                          <p className="text-xs text-gray-500">{l?.subject} · {l?.difficulty}{Array.isArray(l?.steps) && l.steps.length > 0 ? ` · Interactive (${l.steps.length} steps)` : ''}</p>
                        </div>
                        <button onClick={() => setAssignModal({ lessonId: l?.id })} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200">Assign to Student</button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{l?.content}</p>
                    </div>
                  ))}
                  {assignModal && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setAssignModal(null)}>
                      <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="font-semibold text-gray-800 mb-3">Assign to Student</h3>
                        <div className="space-y-2">
                          {(students ?? []).map((s: any) => (
                            <button key={s?.id} onClick={() => handleAssign(assignModal.lessonId, s?.id)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: s?.avatarColor ?? '#0f766e' }}>
                                {s?.childName?.[0] ?? '?'}
                              </div>
                              {s?.childName}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INTAKES */}
              {tab === 'intakes' && (
                <div className="space-y-4">
                  {(intakes ?? []).length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                      <Heart className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                      <p className="text-gray-500">No parent intake forms yet.</p>
                    </div>
                  ) : (intakes ?? []).map((intake: any) => {
                    let data: any = {}
                    try { data = JSON.parse(intake?.formData ?? '{}') } catch {}
                    return (
                      <div key={intake?.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">{data?.childName || intake?.childName || 'Unknown Child'}</h3>
                            <p className="text-xs text-gray-400"><SafeDate date={intake?.createdAt} options={{ dateStyle: 'medium' }} /></p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${intake?.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : intake?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {intake?.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(data ?? {}).filter(([k]) => k !== 'childName').map(([k, v]) => (
                            <div key={k} className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                              <p className="text-gray-700">{String(v ?? '')}</p>
                            </div>
                          ))}
                        </div>
                        {intake?.status === 'PENDING' && (
                          <div className="flex gap-2 mt-3">
                            <button onClick={() => handleIntakeApproval(intake?.id, 'APPROVED')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Approve</button>
                            <button onClick={() => handleIntakeApproval(intake?.id, 'REJECTED')} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200">Reject</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* NOTIFICATIONS */}
              {tab === 'notifications' && (
                <div className="space-y-3">
                  {(notifications ?? []).length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                      <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications yet.</p>
                    </div>
                  ) : (notifications ?? []).map((n: any) => (
                    <div key={n?.id} className={`bg-white rounded-xl border p-4 ${!n?.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        {n?.type === 'HELP_REQUEST' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {n?.type === 'BUDDY_REQUEST' && <Sparkles className="w-4 h-4 text-purple-500" />}
                        {n?.type === 'INTAKE' && <FileText className="w-4 h-4 text-teal-500" />}
                        {n?.type === 'LESSON_COMPLETE' && <Star className="w-4 h-4 text-yellow-500" />}
                        {!['HELP_REQUEST', 'BUDDY_REQUEST', 'INTAKE', 'LESSON_COMPLETE'].includes(n?.type ?? '') && <Bell className="w-4 h-4 text-gray-400" />}
                        <p className="text-sm font-medium text-gray-800">{n?.message}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1"><SafeDate date={n?.createdAt} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
