import {PrismaClient} from '@prisma/client'
import logger from '@/utils/logger'

const prisma = new PrismaClient()

export const createMessage = async (
  name: string,
  company: string,
  message: string,
  contact: string,
  content: string
) => {
  try {
      return await prisma.message.create({
        data: {name, company, message, contact, content},
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

export const updateMessage = async (id: string, data: Partial<{
  name: string
  company: string
  message: string
  contact: string
}>) => {
  return prisma.message.update({
    where: { MID: Number(id) },
    data,
  })
}

export const deleteMessage = async (id: string) => {
  return prisma.message.delete({
    where: { MID: Number(id) },
  })
}