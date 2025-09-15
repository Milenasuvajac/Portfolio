// This route handles the creation of new users and retrieval of all users from the database.

import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import {CreateUserBody} from "@/dto/UserDTO";
import {UserSchema} from "@/lib/definitions";
import {createUser, getAllUsers, userExistsByUsername} from "@/lib/dal/userDal";
import logger from "@/utils/logger";


export const POST = async (request: NextRequest): Promise<NextResponse> => {
    // Check if the current user has admin privileges
/*    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }*/

    const { username, companyName, password } = (await request.json()) as CreateUserBody

    if (!username || !password) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 },
        )
    }

    const userToCreate = { username, companyName, password}
    const validation = UserSchema.safeParse(userToCreate)
    console.log("Validation:", validation)
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
    }
    console.log("Validation:", validation)
    if (await userExistsByUsername(username)) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    try {
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const user = await createUser(username, companyName ? companyName : '', hashedPassword)

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        logger.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const GET = async (): Promise<NextResponse> => {
/*
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }
*/
    try {
        const users = await getAllUsers()
        return NextResponse.json(users)
    } catch (error) {
        logger.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
