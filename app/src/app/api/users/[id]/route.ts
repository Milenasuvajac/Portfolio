// This route handles the deletion, retrieval, and update of a specific user from the database.
// It requires the user's ID as a parameter in the URL.

import { NextRequest, NextResponse } from 'next/server'
import {Params} from "@/dto/RequestDTO";
import {deleteUser, getUserById, updateUser} from "@/lib/dal/userDal";
import {UpdateUserBody} from "@/dto/UserDTO";
import {UserSchema} from "@/lib/definitions";
import logger from "@/utils/logger";
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

export const GET = async (
    _request: NextRequest, {
        params,
    }: {
        params: Params;
    },
): Promise<NextResponse> => {

    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    const { id } = params

    if (!/^-?\d+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid user ID, must be a number' }, { status: 400 })
    }

    try {
        const user = await getUserById(id)
        if (!user) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 })
        }
        return NextResponse.json(user)
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const PUT = async (
    request: NextRequest,
    { params }: {params: Params},
): Promise<NextResponse> => {

    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    const { id } = params

    if (!/^-?\d+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid user ID, must be a number' }, { status: 400 })
    }

    const { username, companyName, password } = (await request.json()) as UpdateUserBody

    const userToUpdate = { username, companyName, id, password }
    const validation = UserSchema.safeParse(userToUpdate)
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
    }

    try {
        const updatedUser = await updateUser(username, password,  companyName ? companyName : '', id)

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(updatedUser)
    } catch (error) {
        logger.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const DELETE = async (_request: NextRequest, {
    params,
}: {
    params: Params;
}): Promise<NextResponse> => {

    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    const { id } = params

    if (!/^-?\d+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid user ID, must be a number' }, { status: 400 })
    }

    try {
        const deletedUser = await deleteUser(id)
        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        return NextResponse.json(deletedUser)
    } catch (error) {
        logger.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
