import { PrismaClient } from '@prisma/client'
import logger from '@/utils/logger'

const prisma = new PrismaClient()

export const createExperience = async (
  description: string,
  myResp: string,
  company: string
) => {
  try {
    const created = await prisma.experience.create({
      data: { description, myResp, company },
    })
    return created
  } catch (e) {
    logger.error('Error in createExperience:', e)
    return null
  }
}

export const getAllExperiences = async () => {
  return prisma.experience.findMany({
    select: {
      EID: true,
      description: true,
      myResp: true,
      company: true,
    },
  })
}

export const getExperienceById = async (id: string) => {
  return prisma.experience.findUnique({
    where: { EID: Number(id) },
  })
}

export const updateExperience = async (id: string, data: Partial<{
  description: string
  myResp: string
  company: string
}>) => {
  return prisma.experience.update({
    where: { EID: Number(id) },
    data,
  })
}

export const deleteExperience = async (id: string) => {
  return prisma.experience.delete({
    where: { EID: Number(id) },
  })
}