import {PrismaClient} from '@prisma/client'
import logger from '@/utils/logger'
import {DocumentDTO} from "@/dto/DocumentDTO";

const prisma = new PrismaClient()

export const createDocument = async (
  name: string,
  year: number,
  document: string,
  issuer: string,
  language: string,
  comment?: string
) => {
  try {
      return await prisma.document.create({
        data: {
            name,
            year,
            document,
            issuer,
            language,
            ...(comment !== undefined ? {comment} : {}),
        },
    })
  } catch (e) {
    logger.error('Error in createDocument:', e)
    return null
  }
}

export const getAllDocuments = async () : Promise<Array<DocumentDTO>> => {
  return prisma.document.findMany({
    select: {
      DID: true,
      name: true,
      year: true,
      document: true,
      comment: true,
      issuer: true,
      language: true,
    },
  })
}

export const getDocumentById = async (id: string) => {
  return prisma.document.findUnique({
    where: { DID: Number(id) },
  })
}

export const updateDocument = async (id: string, data: Partial<{
  name: string
  year: number
  document: string
  issuer: string
  language: string
  comment?: string | null
}>) => {
  return prisma.document.update({
    where: { DID: Number(id) },
    data,
  })
}

export const deleteDocument = async (id: string) => {
  return prisma.document.delete({
    where: { DID: Number(id) },
  })
}