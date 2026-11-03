export const BUDDY_CHARACTERS: { key: string; emoji: string; label: string }[] = [
  { key: 'friendly-robot', emoji: '🤖', label: 'Robot' },
  { key: 'gentle-bear', emoji: '🐻', label: 'Bear' },
  { key: 'wise-owl', emoji: '🦉', label: 'Owl' },
  { key: 'happy-dolphin', emoji: '🐬', label: 'Dolphin' },
  { key: 'kind-cat', emoji: '🐱', label: 'Cat' },
  { key: 'brave-lion', emoji: '🦁', label: 'Lion' },
  { key: 'calm-turtle', emoji: '🐢', label: 'Turtle' },
  { key: 'happy-dog', emoji: '🐶', label: 'Puppy' },
  { key: 'space-alien', emoji: '👽', label: 'Space Friend' },
]

// Calm palette. `names` lets us hide colors a parent asked to avoid.
export const BUDDY_COLORS: { hex: string; label: string; names: string[] }[] = [
  { hex: '#14b8a6', label: 'Teal', names: ['teal', 'green'] },
  { hex: '#22c55e', label: 'Green', names: ['green'] },
  { hex: '#3b82f6', label: 'Blue', names: ['blue'] },
  { hex: '#8b5cf6', label: 'Purple', names: ['purple'] },
  { hex: '#ec4899', label: 'Pink', names: ['pink'] },
  { hex: '#eab308', label: 'Yellow', names: ['yellow'] },
  { hex: '#f97316', label: 'Orange', names: ['orange'] },
  { hex: '#ef4444', label: 'Red', names: ['red'] },
  { hex: '#64748b', label: 'Gray', names: ['gray', 'grey'] },
]

export const BUDDY_ACCESSORIES: { key: string; emoji: string; label: string }[] = [
  { key: 'none', emoji: '', label: 'Nothing' },
  { key: 'cap', emoji: '🧢', label: 'Cap' },
  { key: 'crown', emoji: '👑', label: 'Crown' },
  { key: 'bow', emoji: '🎀', label: 'Bow' },
  { key: 'headphones', emoji: '🎧', label: 'Headphones' },
  { key: 'glasses', emoji: '👓', label: 'Glasses' },
  { key: 'tophat', emoji: '🎩', label: 'Top Hat' },
  { key: 'flower', emoji: '🌼', label: 'Flower' },
  { key: 'star', emoji: '⭐', label: 'Star' },
]

export const VOICE_STYLES: { key: string; label: string; desc: string; rate: number; pitch: number; sample: string }[] = [
  { key: 'calm', label: '🌿 Calm & Slow', desc: 'Gentle and relaxed', rate: 0.8, pitch: 1, sample: 'Hi friend. We can take our time together.' },
  { key: 'cheerful', label: '☀️ Cheerful', desc: 'Happy and upbeat', rate: 1.05, pitch: 1.2, sample: 'Hi friend! I am so happy to learn with you!' },
  { key: 'soft', label: '🌙 Soft & Gentle', desc: 'Quiet and soothing', rate: 0.85, pitch: 0.9, sample: 'Hello. I am here with you. You are doing great.' },
]

export const characterEmoji = (key?: string) => BUDDY_CHARACTERS.find(c => c.key === key)?.emoji ?? '🤖'
export const accessoryEmoji = (key?: string) => BUDDY_ACCESSORIES.find(a => a.key === key)?.emoji ?? ''

export function allowedColors(colorsToAvoid?: string | null) {
  const avoid = (colorsToAvoid ?? '').toLowerCase()
  return BUDDY_COLORS.filter(c => !c.names.some(n => avoid.includes(n)))
}

export interface ProfileLike {
  learningStyle?: string | null
  interests?: string | null
  communicationStyle?: string | null
  calmingStrategies?: string | null
  stressors?: string | null
}

/** Personality traits derived from the parent intake profile — shown to the student, teacher, and used in AI prompts. */
export function buddyPersonality(p: ProfileLike): string[] {
  const traits: string[] = []
  const ls = (p.learningStyle ?? '').toLowerCase()
  const comm = (p.communicationStyle ?? '').toLowerCase()
  if (ls.includes('visual')) traits.push('Shows pictures and emoji to explain ideas')
  if (ls.includes('music')) traits.push('Uses rhythm, counting beats, and little songs')
  if (ls.includes('kinesthetic')) traits.push('Suggests hands-on and movement activities')
  if (ls.includes('reading') || ls.includes('text')) traits.push('Gives clear written steps, one at a time')
  if (comm.includes('non') || comm.includes('aac') || comm.includes('picture')) traits.push('Asks questions you can answer by tapping, not talking')
  if (comm.includes('typing') || comm.includes('writing')) traits.push('Lets you type your answers')
  if (p.interests) traits.push(`Talks about things you love: ${p.interests.split(',').slice(0, 2).join(' and ').trim()}`)
  if ((p.stressors ?? '').toLowerCase().includes('transition') || (p.stressors ?? '').toLowerCase().includes('change')) traits.push('Always tells you what comes next before it happens')
  if ((p.stressors ?? '').toLowerCase().includes('stuck')) traits.push('Breaks hard problems into tiny steps')
  if (p.calmingStrategies) traits.push('Reminds you of your calm-down ideas when you need a break')
  return traits.slice(0, 5)
}

export interface LessonStep {
  type: 'read' | 'choice'
  text: string
  emoji?: string
  choices?: string[]
  answer?: number
  buddyTip?: string
}

/** Validates step data coming from the AI or a client before it is saved. */
export function cleanSteps(raw: unknown): LessonStep[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 12).flatMap((s: any): LessonStep[] => {
    const text = typeof s?.text === 'string' ? s.text.trim().slice(0, 400) : ''
    if (!text) return []
    const emoji = typeof s?.emoji === 'string' ? s.emoji.slice(0, 8) : undefined
    if (s?.type === 'choice' && Array.isArray(s.choices)) {
      const choices = s.choices.map((c: unknown) => String(c).trim().slice(0, 80)).filter(Boolean).slice(0, 3)
      const answer = Number(s.answer)
      if (choices.length >= 2 && Number.isInteger(answer) && answer >= 0 && answer < choices.length) {
        return [{ type: 'choice', text, emoji, choices, answer, buddyTip: typeof s.buddyTip === 'string' ? s.buddyTip.slice(0, 300) : undefined }]
      }
    }
    return [{ type: 'read', text, emoji }]
  })
}

/** Uses teacher-approved steps when available; otherwise turns plain lesson text into read-along steps. */
export function lessonSteps(lesson: { content: string; steps?: unknown }): LessonStep[] {
  if (Array.isArray(lesson.steps) && lesson.steps.length > 0) return lesson.steps as LessonStep[]
  return lesson.content.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean).map(text => ({ type: 'read' as const, text }))
}
