'use client'

import Link from 'next/link'
import { GraduationCap, Users, Heart, Brain, Shield, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function LandingClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-green-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-teal-700" />
            <h1 className="text-xl font-display font-bold text-teal-900 tracking-tight">NeuroLearn AI</h1>
            <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">CAPSTONE</span>
          </div>
          <div className="flex gap-2">
            <Link href="/student/login" className="px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition">
              Student Sign In
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition">
              Teacher Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-teal-900 tracking-tight leading-tight">
            Personalized learning for <span className="text-teal-600">every</span> mind
          </h2>
          <p className="mt-4 text-lg text-teal-700/80 max-w-2xl mx-auto">
            An AI-powered classroom support system designed for children on the autism spectrum.
            Teacher-vetted, parent-informed, and built with care.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/parent" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition shadow-md">
              <Heart className="w-5 h-5" /> Parent Portal
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 border-2 border-teal-200 rounded-xl font-semibold hover:bg-teal-50 transition">
              <GraduationCap className="w-5 h-5" /> Teacher Login
            </Link>
            <Link href="/student/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 border-2 border-purple-200 rounded-xl font-semibold hover:bg-purple-50 transition">
              <Sparkles className="w-5 h-5" /> Student Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Three Portals */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-md border border-teal-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Parent Portal</h3>
            <p className="mt-2 text-sm text-gray-600">Share your child's unique profile — communication style, sensory needs, interests, and calming strategies. No account needed.</p>
            <Link href="/parent" className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800">Start intake form →</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-md border border-teal-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Student Portal</h3>
            <p className="mt-2 text-sm text-gray-600">A calm, clear learning space with an AI Learning Buddy that adapts to each student's needs. Simple name + PIN login.</p>
            <Link href="/student/login" className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800">Student sign in →</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-md border border-teal-100 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Teacher Dashboard</h3>
            <p className="mt-2 text-sm text-gray-600">Monitor students in real time, approve AI content, manage lessons, and configure each student's learning environment.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800">Teacher sign in →</Link>
          </motion.div>
        </div>
      </section>

      {/* Human in the Loop */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-teal-100">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-teal-600" />
            <h3 className="font-display font-bold text-xl text-gray-900">Human-in-the-Loop: Nothing reaches a student without teacher approval</h3>
          </div>
          <p className="text-gray-600">
            Every AI-generated hint, lesson adaptation, and Learning Buddy configuration is reviewed and approved by the teacher before it reaches any student. NeuroLearn AI is a support layer — not a replacement for educators.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-teal-100">
        <p className="text-sm text-teal-600/70">NeuroLearn AI — ITAI 4376 capstone prototype by Annette Bazan & Natalia Solorzano (Group 3). Fictional students only; no real student data.</p>
      </footer>
    </div>
  )
}
