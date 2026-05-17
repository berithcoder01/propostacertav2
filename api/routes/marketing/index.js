import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { AppError } from '../../lib/AppError.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CHALLENGES_DIR = path.join(__dirname, '../../data/challenges')

function loadChallengeContent(profileType) {
  const filePath = path.join(CHALLENGES_DIR, `${profileType}.json`)
  if (!fs.existsSync(filePath)) {
    throw new AppError(`Challenge content not found for profile: ${profileType}`, 500)
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

function getTaskContent(profileType, taskSlug) {
  const content = loadChallengeContent(profileType)
  const task = content.find(t => t.slug === taskSlug)
  if (!task) {
    throw new AppError(`Task not found: ${taskSlug}`, 404)
  }
  return task
}

function calculateStreak(tasks) {
  let streak = 0
  const sorted = [...tasks].sort((a, b) => a.day - b.day)
  for (const task of sorted) {
    if (task.status === 'DONE') {
      streak++
    } else {
      break
    }
  }
  return streak
}

function checkChallengeCompletion(challenge) {
  const allTasks = challenge.tasks
  const doneOrSkipped = allTasks.filter(t => t.status === 'DONE' || t.status === 'SKIPPED')
  if (doneOrSkipped.length === 30) {
    return true
  }
  return false
}

export default async function (fastify, opts) {
  fastify.get('/profile', async (request, reply) => {
    try {
      const { companyId } = request.user
      const profile = await fastify.prisma.marketingProfile.findUnique({
        where: { companyId }
      })
      return { success: true, data: profile, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.post('/profile', async (request, reply) => {
    try {
      const { companyId } = request.user
      const { hasInstagram, hasWhatsappBiz, hasPaidAds, hasWebsite, hasGoogleBusiness, dailyTimeMinutes, monthlyGoalLeads } = request.body

      const company = await fastify.prisma.company.findUnique({
        where: { id: companyId },
        select: { segment: true }
      })
      if (!company) {
        throw new AppError('Company not found', 404)
      }

      const technicalSegments = ['ELETRICA', 'HIDRAULICA', 'PINTURA', 'AR_CONDICIONADO', 'CONSTRUCAO_CIVIL']
      const profileType = technicalSegments.includes(company.segment) ? 'technical' : 'services'

      const profile = await fastify.prisma.marketingProfile.upsert({
        where: { companyId },
        create: {
          companyId,
          hasInstagram: hasInstagram ?? false,
          hasWhatsappBiz: hasWhatsappBiz ?? false,
          hasPaidAds: hasPaidAds ?? false,
          hasWebsite: hasWebsite ?? false,
          hasGoogleBusiness: hasGoogleBusiness ?? false,
          dailyTimeMinutes: dailyTimeMinutes ?? 30,
          monthlyGoalLeads: monthlyGoalLeads ?? 5,
          profileType
        },
        update: {
          hasInstagram: hasInstagram ?? undefined,
          hasWhatsappBiz: hasWhatsappBiz ?? undefined,
          hasPaidAds: hasPaidAds ?? undefined,
          hasWebsite: hasWebsite ?? undefined,
          hasGoogleBusiness: hasGoogleBusiness ?? undefined,
          dailyTimeMinutes: dailyTimeMinutes ?? undefined,
          monthlyGoalLeads: monthlyGoalLeads ?? undefined,
          profileType
        }
      })

      return { success: true, data: profile, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.get('/challenge/active', async (request, reply) => {
    try {
      const { companyId } = request.user

      const profile = await fastify.prisma.marketingProfile.findUnique({
        where: { companyId }
      })
      if (!profile) {
        return { success: true, data: { hasProfile: false }, error: null }
      }

      const challenge = await fastify.prisma.marketingChallenge.findFirst({
        where: { companyId, status: 'ACTIVE' },
        include: { tasks: { orderBy: { day: 'asc' } } }
      })

      if (!challenge) {
        return { success: true, data: { hasProfile: true }, error: null }
      }

      const startDate = new Date(challenge.startDate)
      const now = new Date()
      const dayNumber = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1

      if (dayNumber > 30) {
        await fastify.prisma.marketingChallenge.update({
          where: { id: challenge.id },
          data: { status: 'COMPLETED' }
        })
        return { success: true, data: null, error: null }
      }

      const todayTask = challenge.tasks.find(t => t.day === dayNumber)

      const tasksWithContent = challenge.tasks.map(task => {
        const content = getTaskContent(profile.profileType, task.taskSlug)
        return { ...task, content }
      })

      return {
        success: true,
        data: {
          challenge: {
            ...challenge,
            tasks: tasksWithContent
          },
          todayTask: todayTask ? {
            ...todayTask,
            content: getTaskContent(profile.profileType, todayTask.taskSlug)
          } : null,
          dayNumber,
          hasProfile: true
        },
        error: null
      }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.post('/challenge/start', async (request, reply) => {
    try {
      const { companyId } = request.user

      const profile = await fastify.prisma.marketingProfile.findUnique({
        where: { companyId }
      })
      if (!profile) {
        throw new AppError('Marketing profile not found. Please complete onboarding.', 400)
      }

      const existingChallenge = await fastify.prisma.marketingChallenge.findFirst({
        where: { companyId, status: 'ACTIVE' }
      })
      if (existingChallenge) {
        throw new AppError('An active challenge already exists.', 409)
      }

      const content = loadChallengeContent(profile.profileType)
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 29)

      const challenge = await fastify.prisma.marketingChallenge.create({
        data: {
          companyId,
          marketingProfileId: profile.id,
          startDate,
          endDate,
          status: 'ACTIVE',
          tasks: {
            create: content.map(task => ({
              day: task.day,
              taskSlug: task.slug,
              status: 'PENDING'
            }))
          }
        },
        include: { tasks: { orderBy: { day: 'asc' } } }
      })

      return { success: true, data: challenge, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.post('/challenge/:id/complete', async (request, reply) => {
    try {
      const { companyId } = request.user
      const { id } = request.params

      const challenge = await fastify.prisma.marketingChallenge.findFirst({
        where: { id, companyId },
        include: { tasks: true }
      })
      if (!challenge) {
        throw new AppError('Challenge not found or unauthorized.', 404)
      }

      const totalDone = challenge.tasks.filter(t => t.status === 'DONE').length
      const totalSkipped = challenge.tasks.filter(t => t.status === 'SKIPPED').length
      const completionPct = (totalDone / 30) * 100

      const updated = await fastify.prisma.marketingChallenge.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          totalDone,
          totalSkipped,
          completionPct
        }
      })

      return { success: true, data: updated, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.get('/challenge/:id/task/:day', async (request, reply) => {
    try {
      const { companyId } = request.user
      const { id, day } = request.params
      const dayNum = parseInt(day, 10)

      const challenge = await fastify.prisma.marketingChallenge.findFirst({
        where: { id, companyId }
      })
      if (!challenge) {
        throw new AppError('Challenge not found or unauthorized.', 404)
      }

      const profile = await fastify.prisma.marketingProfile.findUnique({
        where: { companyId }
      })
      if (!profile) {
        throw new AppError('Marketing profile not found.', 404)
      }

      const task = await fastify.prisma.marketingTask.findFirst({
        where: { challengeId: id, day: dayNum }
      })
      if (!task) {
        throw new AppError('Task not found.', 404)
      }

      const taskContent = getTaskContent(profile.profileType, task.taskSlug)

      return {
        success: true,
        data: { ...task, content: taskContent },
        error: null
      }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.patch('/task/:id/done', async (request, reply) => {
    try {
      const { companyId } = request.user
      const { id } = request.params

      const task = await fastify.prisma.marketingTask.findUnique({
        where: { id },
        include: { challenge: true }
      })
      if (!task) {
        throw new AppError('Task not found or unauthorized.', 404)
      }

      if (task.challenge.companyId !== companyId) {
        throw new AppError('Task not found or unauthorized.', 404)
      }

      const updated = await fastify.prisma.marketingTask.update({
        where: { id },
        data: {
          status: 'DONE',
          completedAt: new Date()
        }
      })

      const allTasks = await fastify.prisma.marketingTask.findMany({
        where: { challengeId: task.challengeId }
      })

      const streak = calculateStreak(allTasks)

      if (checkChallengeCompletion({ ...task.challenge, tasks: allTasks })) {
        const totalDone = allTasks.filter(t => t.status === 'DONE').length
        const totalSkipped = allTasks.filter(t => t.status === 'SKIPPED').length
        const completionPct = (totalDone / 30) * 100

        await fastify.prisma.marketingChallenge.update({
          where: { id: task.challengeId },
          data: {
            status: 'COMPLETED',
            totalDone,
            totalSkipped,
            completionPct
          }
        })
      }

      return { success: true, data: { task: updated, streak }, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.patch('/task/:id/skip', async (request, reply) => {
    try {
      const { companyId } = request.user
      const { id } = request.params

      const task = await fastify.prisma.marketingTask.findUnique({
        where: { id },
        include: { challenge: true }
      })
      if (!task) {
        throw new AppError('Task not found or unauthorized.', 404)
      }

      if (task.challenge.companyId !== companyId) {
        throw new AppError('Task not found or unauthorized.', 404)
      }

      const updated = await fastify.prisma.marketingTask.update({
        where: { id },
        data: {
          status: 'SKIPPED',
          skippedAt: new Date()
        }
      })

      const allTasks = await fastify.prisma.marketingTask.findMany({
        where: { challengeId: task.challengeId }
      })

      if (checkChallengeCompletion({ ...task.challenge, tasks: allTasks })) {
        const totalDone = allTasks.filter(t => t.status === 'DONE').length
        const totalSkipped = allTasks.filter(t => t.status === 'SKIPPED').length
        const completionPct = (totalDone / 30) * 100

        await fastify.prisma.marketingChallenge.update({
          where: { id: task.challengeId },
          data: {
            status: 'COMPLETED',
            totalDone,
            totalSkipped,
            completionPct
          }
        })
      }

      return { success: true, data: updated, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })

  fastify.get('/challenge/history', async (request, reply) => {
    try {
      const { companyId } = request.user

      const challenges = await fastify.prisma.marketingChallenge.findMany({
        where: {
          companyId,
          status: { not: 'ACTIVE' }
        },
        orderBy: { startDate: 'desc' },
        include: { tasks: { orderBy: { day: 'asc' } } }
      })

      return { success: true, data: challenges, error: null }
    } catch (err) {
      if (err instanceof AppError) {
        return reply.code(err.statusCode).send({ success: false, data: null, error: err.message })
      }
      return reply.code(500).send({ success: false, data: null, error: 'Internal server error' })
    }
  })
}
