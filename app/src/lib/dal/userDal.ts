import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import logger from "@/utils/logger";
import {LoginUserDTO, UpdateUserBody, UserDTO} from "@/dto/UserDTO";

// Use shared Prisma client for database interaction

export const userExistsByUsername = async (username: string): Promise<boolean> => {
    const existingUser = await prisma.user.findFirst({
        where: {
            username,
        },
    })

    return !!existingUser
}

export const createUser = async (
    username: string,
    companyName: string,
    hashedPassword: string,
): Promise<Promise<UserDTO> | Promise<null>> => {

    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                companyName,
                password: hashedPassword, // Store hashed password in the database
            },
            select: {
                username: true,
                companyName: true,
                UID: true,
            },
        })

        return newUser
    } catch (e) {
        logger.error('Error in CreateUser: ', e)
        return null
    }
}

export const getAllUsers = async (): Promise<Array<UserDTO>> => {
    return prisma.user.findMany({
        select: {
            username: true,
            companyName: true,
            UID: true,
        },
    })
}

export const getUserById = async (userId: string): Promise<UserDTO | null> => {
    const user = await prisma.user.findUnique({
        where: {
            UID: Number(userId),
        },
        select: {
            username: true,
            companyName: true,
            UID: true,
        },
    })

    if (!user) {
        return null
    }
    return user
}

export const getUserByUsername = async (
    username: string,
): Promise<LoginUserDTO | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        })
        if (!user) {
            return null
        }
        return user
    } catch (error) {
        logger.error(error)
        return null
    }
}

export const updateUser = async (
    username: string | undefined,
    password: string | undefined,
    companyName: string | undefined,
    UID: string,
): Promise<UpdateUserBody> => {
    let hashedPassword: string | undefined
    if (password) {
        // Hash the new password if provided
        const saltRounds = 10
        hashedPassword = await bcrypt.hash(password, saltRounds)
    }

    return prisma.user.update({
        data: {
            ...(username && {username}),
            ...(companyName && {companyName}),
            ...(hashedPassword && {password: hashedPassword}),
        },
        where: {UID: Number(UID)},
    });
}

export const deleteUser = async (userId: string): Promise<object | null> => {
    const deletedUser = await prisma.user.delete({
        where: { UID: Number(userId) },
        select: {
            username: true,
            companyName: true,
            UID: true,
        },
    })

    if (!deletedUser) {
        return null
    }

    return deletedUser
}
