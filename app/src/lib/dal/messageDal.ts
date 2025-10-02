import prisma from '@/lib/prisma'
import logger from '@/utils/logger'

export const createMessage = async (
  name: string,
  company: string,
  message: string,
  contact: string,
) => {
  try {
      return await prisma.message.create({
        data: {name, company, message, contact},
    })
  } catch (e) {
    logger.error('Error in createMessage:', e)
    return null
  }
}

export const getAllMessages = async () => {
  return prisma.message.findMany({
    select: {
      MID: true,
      name: true,
      company: true,
      message: true,
      contact: true,
    },
  })
}

export const getMessageById = async (id: string) => {
  return prisma.message.findUnique({
    where: { MID: Number(id) },
  })
}

export const deleteMessage = async (id: string) => {
  return prisma.message.delete({
    where: { MID: Number(id) },
  })
}