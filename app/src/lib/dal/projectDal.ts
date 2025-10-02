import prisma from '@/lib/prisma'
import logger from '@/utils/logger'

export const createProject = async (
  technologies: string,
  description: string,
  link?: string
) => {
  try {
      return await prisma.project.create({
        data: {technologies, description, ...(link !== undefined ? {link} : {})},
    })
  } catch (e) {
    logger.error('Error in createProject:', e)
    return null
  }
}

export const getAllProjects = async () => {
  return prisma.project.findMany({
    select: {
      PID: true,
      technologies: true,
      description: true,
      link: true,
    },
  })
}

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { PID: Number(id) },
  })
}

export const updateProject = async (id: string, data: Partial<{
  technologies: string
  description: string
  link?: string | null
}>) => {
  return prisma.project.update({
    where: { PID: Number(id) },
    data,
  })
}

export const deleteProject = async (id: string) => {
  return prisma.project.delete({
    where: { PID: Number(id) },
  })
}