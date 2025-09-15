import {PrismaClient} from '@prisma/client'
import logger from '@/utils/logger'

const prisma = new PrismaClient()

export const createTechnology = async (
  name: string,
  description: string,
  icon?: string
) => {
  try {
      return await prisma.technology.create({
        data: {name, description, ...(icon !== undefined ? {icon} : {})},
    })
  } catch (e) {
    logger.error('Error in createTechnology:', e)
    return null
  }
}

export const getAllTechnologies = async () => {
  return prisma.technology.findMany({
    select: {
      TID: true,
      icon: true,
      name: true,
      description: true,
    },
  })
}

export const getTechnologyById = async (id: string) => {
  return prisma.technology.findUnique({
    where: { TID: Number(id) },
  })
}

export const updateTechnology = async (id: string, data: Partial<{
  icon?: string | null
  name: string
  description: string
}>) => {
  return prisma.technology.update({
    where: { TID: Number(id) },
    data,
  })
}

export const deleteTechnology = async (id: string) => {
  return prisma.technology.delete({
    where: { TID: Number(id) },
  })
}