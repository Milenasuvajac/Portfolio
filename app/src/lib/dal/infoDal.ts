import {PrismaClient} from '@prisma/client'
import logger from '@/utils/logger'

const prisma = new PrismaClient()

export const createInfo = async (
  text: string,
  visibility: boolean,
  contact: string,
  cv: string,
  photo?: string
) => {
  try {
      return await prisma.info.create({
        data: {
            text,
            visibility,
            contact,
            cv,
            ...(photo !== undefined ? {photo} : {}),
        },
    })
  } catch (e) {
    logger.error('Error in createInfo:', e)
    return null
  }
}

export const getAllInfos = async () => {
  return prisma.info.findMany({
    select: {
      IID: true,
      photo: true,
      text: true,
      visibility: true,
      contact: true,
      cv: true,
    },
  })
}

export const getPublicInfos = async () => {
    return prisma.info.findMany({
        where: {
            visibility: true,
        },
        select: {
            IID: true,
            photo: true,
            text: true,
            visibility: true,
            contact: true,
            cv: true,
        },
    })
}

export const getPrivateInfos = async () => {
    return prisma.info.findMany({
        where: {
            visibility: false,
        },
        select: {
            IID: true,
            photo: true,
            text: true,
            visibility: true,
            contact: true,
            cv: true,
        },
    })
}


export const getInfoById = async (id: string) => {
  return prisma.info.findUnique({
    where: { IID: Number(id) },
  })
}

export const updateInfo = async (id: string, data: Partial<{
  photo?: string | null
  text: string
  visibility: boolean
  contact: string
  cv: string
}>) => {
  return prisma.info.update({
    where: { IID: Number(id) },
    data,
  })
}

export const deleteInfo = async (id: string) => {
  return prisma.info.delete({
    where: { IID: Number(id) },
  })
}