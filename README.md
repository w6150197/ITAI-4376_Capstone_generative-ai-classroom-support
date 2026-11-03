# ITAI-4376_Capstone_generative-ai-classroom-support

# Short Summary
A generative AI–powered classroom support system designed to personalize learning for students on the autism spectrum. The system uses individualized student profiles, parent input, adaptive learning materials, AI-guided assistance, sensory accommodations, and teacher alerts to support a more accessible classroom.

# Synopsis
# Generative AI–Powered Personalized Learning and Classroom Support System

This project is a planned capstone application designed to explore how generative AI can support personalized learning for students on the autism spectrum and assist educators in managing diverse classroom needs.

The system will create individualized student profiles using information provided by parents, caregivers, and educators. These profiles may include learning preferences, communication methods, sensory sensitivities, potential triggers, preferred activities, and strategies that may help the student remain engaged and comfortable during learning activities.

The application will use these profiles to help adapt educational content to individual students. Depending on a student's documented preferences, the system may modify instructional language, visual presentation, colors, interaction methods, or incorporate music and other learning approaches.

The application will also provide students with AI-assisted help when they encounter difficulty. Instead of immediately providing an answer, the system can provide guided hints intended to encourage problem-solving and independent learning. Scheduled breaks and other predefined accommodations can also be incorporated into the student's learning experience.

A teacher-facing interface will allow educators to receive notifications when predefined indicators suggest that a student may need assistance, such as extended inactivity or an unanswered request for help. An optional external LED notification device may also be explored as a way to provide teachers with a quick visual indication that a student requires attention.

The goal of this project is not to replace teachers, parents, aides, or other professionals. Instead, the system is intended to serve as an assistive technology that helps educators personalize instruction and identify when additional human support may be needed.

This project will investigate the responsible use of generative AI in education, with an emphasis on personalization, accessibility, human oversight, privacy, and student-centered design.

---

# NeuroLearn AI – Generative AI-Powered Personalized Learning and Classroom Support System

**Authors:** Annette Bazan and Natalia
**Course:** ITAI-4376 Capstone

## About the App
NeuroLearn AI is an AI-powered app designed to support teachers and improve the learning experience of students on the autism spectrum. Personalized learning profiles are built from parent intake forms (learning preferences, communication methods, sensory sensitivities, triggers, and calming strategies), and the AI Learning Buddy gives guided hints instead of direct answers. A **human-in-the-loop** workflow keeps teachers in control: student work and AI-assisted outputs go to a teacher approval queue, and teachers are alerted when a student requests help or a break.

> All student data in this demo is fictional (5 seeded demo students).

## Live App
https://neurolearnai.abacusai.app

## Tech Stack
Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL · NextAuth · Abacus.AI LLM API

## Run Locally
1. Copy `.env.example` to `.env` and fill in your values (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ABACUSAI_API_KEY`).
2. Install and start:
   ```bash
   npm install
   npm run dev
   ```
3. (First run) Set up the database and demo data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
4. Open http://localhost:3000

## Portal Logins (demo accounts)
| Portal  | Name / Email           | Password / PIN |
|---------|------------------------|----------------|
| Teacher | teacher@neurolearn.com | teacher123     |
| Student | Maya                   | 1234           |
| Student | Amara                  | 2345           |
| Student | Liam                   | 3456           |
| Student | Zoe                    | 4567           |
| Student | Alex                   | 5678           |

## Project Structure
- `app/` – pages and API routes (teacher portal, student portal, parent intake, AI hint streaming)
- `components/` – UI components
- `lib/` – shared utilities (auth, database client)
- `prisma/` – database schema
- `scripts/` – database seed scripts
- `docs/` – project planning documents
