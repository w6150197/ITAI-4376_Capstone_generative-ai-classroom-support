import { characterEmoji, accessoryEmoji } from '@/lib/buddy'

const SIZES = {
  sm: { box: 'w-12 h-12', emoji: 'text-2xl', acc: 'text-base -top-2' },
  md: { box: 'w-20 h-20', emoji: 'text-4xl', acc: 'text-2xl -top-3' },
  lg: { box: 'w-36 h-36', emoji: 'text-7xl', acc: 'text-4xl -top-5' },
}

export function BuddyAvatar({ avatarType, color, accessory, size = 'md' }: { avatarType?: string; color?: string; accessory?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size]
  const c = color || '#14b8a6'
  const acc = accessoryEmoji(accessory)
  return (
    <div className={`relative ${s.box} rounded-full flex items-center justify-center shrink-0`} style={{ backgroundColor: c + '33', boxShadow: `0 0 0 4px ${c}` }} aria-hidden="true">
      <span className={s.emoji}>{characterEmoji(avatarType)}</span>
      {acc && <span className={`absolute left-1/2 -translate-x-1/2 ${s.acc}`}>{acc}</span>}
    </div>
  )
}

export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-white border-2 border-teal-200 rounded-2xl px-4 py-3 text-lg text-gray-800 shadow-sm">
      <span className="absolute -left-2 top-5 w-4 h-4 bg-white border-l-2 border-b-2 border-teal-200 rotate-45" />
      {children}
    </div>
  )
}

export function speak(text: string, voiceStyle?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''))
  u.rate = voiceStyle === 'cheerful' ? 1.05 : voiceStyle === 'soft' ? 0.85 : 0.8
  u.pitch = voiceStyle === 'cheerful' ? 1.2 : voiceStyle === 'soft' ? 0.9 : 1
  u.volume = 0.8
  window.speechSynthesis.speak(u)
}
