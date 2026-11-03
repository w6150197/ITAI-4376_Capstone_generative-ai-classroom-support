import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hidden test account
  const testHash = await bcrypt.hash('CW6vyBlxS#', 12)
  await prisma.user.upsert({
    where: { email: 'abacus-3716d0f9@example.com' },
    update: {},
    create: { email: 'abacus-3716d0f9@example.com', password: testHash, name: 'Test Admin', role: 'TEACHER' },
  })

  // Teacher account
  const teacherHash = await bcrypt.hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@neurolearn.com' },
    update: {},
    create: { email: 'teacher@neurolearn.com', password: teacherHash, name: 'Ms. Rivera', role: 'TEACHER' },
  })

  // Student profiles
  const students = [
    {
      name: 'Maya', pin: '1234', childName: 'Maya', age: 8, grade: '3rd', pronouns: 'she/her',
      communicationStyle: 'Non-verbal, uses picture cards',
      sensoryNotes: 'Sensitive to loud sounds. Avoid red and orange colors.',
      learningStyle: 'Visual (pictures & images)',
      interests: 'Animals, nature, drawing, picture books',
      stressors: 'Sudden loud noises, unexpected changes',
      calmingStrategies: 'Visual schedules and nature images. Drawing at the calm table.',
      additionalNotes: 'Loves being the line leader. Works best with a picture schedule.',
      colorsToAvoid: 'Red, Orange',
      avatarColor: '#0f766e',
      buddyName: 'Sunny', buddyAvatar: 'gentle-bear', buddyVoice: 'soft',
    },
    {
      name: 'Amara', pin: '2345', childName: 'Amara', age: 10, grade: '3rd', pronouns: 'she/her',
      communicationStyle: 'Mostly nonverbal — uses AAC device',
      sensoryNotes: 'Mild sensitivity to bright lights. Avoid loud clapping and sudden loud sounds.',
      learningStyle: 'Musical (rhythm & songs)',
      interests: 'Songs, drumming, rhythm games, math and science puzzles',
      stressors: 'Loud group cheers, sudden loud sounds',
      calmingStrategies: 'Headphones with a favourite song. Counting exercises and soft music.',
      additionalNotes: 'Answers by tapping her AAC board or pointing. Count along to a beat.',
      colorsToAvoid: '',
      avatarColor: '#b45309',
      buddyName: 'Rhythm', buddyAvatar: 'happy-dolphin', buddyVoice: 'cheerful',
    },
    {
      name: 'Liam', pin: '3456', childName: 'Liam', age: 7, grade: '3rd', pronouns: 'he/him',
      communicationStyle: 'Limited verbal, uses AAC device',
      sensoryNotes: 'Sensitive to strong smells. Prefers blue tones.',
      learningStyle: 'Kinesthetic (hands-on & movement)',
      interests: 'Trains, vehicles, blocks, trucks, building',
      stressors: 'Long sitting without movement breaks',
      calmingStrategies: 'Movement activities — wall push-ups or a short walk. Familiar objects.',
      additionalNotes: 'Learns by touching and moving objects. Keep instructions to one step at a time.',
      colorsToAvoid: '',
      avatarColor: '#1d6fb8',
      buddyName: 'Choo-Choo', buddyAvatar: 'friendly-robot', buddyVoice: 'cheerful',
    },
    {
      name: 'Zoe', pin: '4567', childName: 'Zoe', age: 9, grade: '3rd', pronouns: 'she/her',
      communicationStyle: 'Speaking in sentences, strong verbal skills',
      sensoryNotes: 'Sensitive to sudden visual changes.',
      learningStyle: 'Reading/Writing (text-based)',
      interests: 'Storytelling, reading, puzzles, sorting, patterns',
      stressors: 'Unannounced changes to routine, transitions',
      calmingStrategies: 'Advance warnings of transitions and verbal reassurance. Quiet puzzle in reading corner.',
      additionalNotes: 'Thrives on predictable steps. Warn her before any change: \'First this, then that.\'',
      colorsToAvoid: '',
      avatarColor: '#be185d',
      buddyName: 'Story', buddyAvatar: 'wise-owl', buddyVoice: 'calm',
    },
    {
      name: 'Alex', pin: '5678', childName: 'Alex', age: 11, grade: '3rd', pronouns: 'they/them',
      communicationStyle: 'Writing and typing',
      sensoryNotes: 'Sensitive to bright flashing lights. Prefers minimal visual clutter.',
      learningStyle: 'Reading/Writing (text-based)',
      interests: 'Space, science fiction, facts, word games',
      stressors: 'Getting stuck without clear steps, frustration leads to shutdown',
      calmingStrategies: 'Quiet time and clear step-by-step instructions. Reading a fact book.',
      additionalNotes: 'Prefers to type answers rather than say them out loud. Loves a space fact as a reward.',
      colorsToAvoid: '',
      avatarColor: '#4d7c0f',
      buddyName: 'Nova', buddyAvatar: 'friendly-robot', buddyVoice: 'calm',
    },
  ]

  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: `${s.name.toLowerCase()}@student.local` },
      update: {},
      create: {
        email: `${s.name.toLowerCase()}@student.local`,
        name: s.name,
        role: 'STUDENT',
        pin: s.pin,
      },
    })

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        childName: s.childName,
        age: s.age,
        grade: s.grade,
        pronouns: s.pronouns,
        communicationStyle: s.communicationStyle,
        sensoryNotes: s.sensoryNotes,
        learningStyle: s.learningStyle,
        interests: s.interests,
        stressors: s.stressors,
        calmingStrategies: s.calmingStrategies,
        additionalNotes: s.additionalNotes,
        colorsToAvoid: s.colorsToAvoid,
        avatarColor: s.avatarColor,
        breakInterval: 20,
        inactivityThreshold: 5,
        status: 'OFFLINE',
      },
    })

    // Create approved Learning Buddy
    await prisma.learningBuddy.upsert({
      where: { studentProfileId: profile.id },
      update: {},
      create: {
        studentProfileId: profile.id,
        avatarType: s.buddyAvatar,
        buddyName: s.buddyName,
        voiceStyle: s.buddyVoice,
        approvalStatus: 'APPROVED',
      },
    })
  }

  // Sample lessons
  const sampleLessons = [
    { title: 'Counting to 10', subject: 'Math', content: 'Let\'s practice counting! Look at the objects and count how many there are.\n\nStep 1: Count the apples: 🍎 🍎 🍎 🍎 🍎\nHow many apples do you see?\n\nStep 2: Count the stars: ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐\nHow many stars do you see?\n\nStep 3: Count the hearts: ❤️ ❤️ ❤️\nHow many hearts do you see?', difficulty: 'easy' },
    { title: 'Addition within 10', subject: 'Math', content: 'Let\'s learn to add small numbers together!\n\nStep 1: 2 + 3 = ?\nImagine you have 2 apples and you get 3 more. How many apples do you have now?\n\nStep 2: 4 + 1 = ?\nYou have 4 stars. One more star joins. How many stars are there now?\n\nStep 3: 5 + 5 = ?\nYou have 5 blue blocks and 5 red blocks. How many blocks altogether?', difficulty: 'easy' },
    { title: 'Shapes Around Us', subject: 'Math', content: 'Look at the shapes we see every day!\n\nA circle is round like a ball ⚽\nA square has 4 equal sides like a window 🔲\nA triangle has 3 sides like a slice of pizza 🍕\n\nCan you name a shape you see in your room?', difficulty: 'easy' },
    { title: 'Animal Habitats', subject: 'Science', content: 'Where do animals live?\n\n🐟 Fish live in water — rivers, lakes, and oceans\n🐦 Birds build nests in trees\n🐻 Bears live in forests and sometimes caves\n🐫 Camels live in hot deserts\n🐧 Penguins live where it\'s very cold\n\nWhat is YOUR favourite animal? Where does it live?', difficulty: 'easy' },
  ]

  for (const l of sampleLessons) {
    await prisma.lesson.upsert({
      where: { id: l.title.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: l.title.toLowerCase().replace(/\s+/g, '-'),
        title: l.title,
        subject: l.subject,
        content: l.content,
        difficulty: l.difficulty,
        createdById: teacher.id,
      },
    })
  }

  // Assign first lesson to all students
  const allProfiles = await prisma.studentProfile.findMany()
  const countingLesson = await prisma.lesson.findFirst({ where: { title: 'Counting to 10' } })
  if (countingLesson) {
    for (const p of allProfiles) {
      const exists = await prisma.lessonAssignment.findFirst({
        where: { lessonId: countingLesson.id, studentProfileId: p.id },
      })
      if (!exists) {
        await prisma.lessonAssignment.create({
          data: {
            lessonId: countingLesson.id,
            studentProfileId: p.id,
            status: 'assigned',
            totalSteps: 3,
          },
        })
      }
    }
  }

  console.log('Seed completed successfully!')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
