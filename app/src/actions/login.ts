'use server'


import {LoginSchema} from "@/lib/definitions";
import logger from "@/utils/logger";
import {cleanupOldRequests, getIP, ipRequests, maxRequests} from "@/lib/rateLimiting";
import {signIn} from "@/auth";
import {AuthError} from "@auth/core/errors";

type LoginCredentials = {
    username: string
    password: string
}

const login = async (
    data: LoginCredentials,
): Promise<{message?: string; error?: string}> => {
    const validation = LoginSchema.safeParse(data)
    if (!validation.success) {
        logger.log(validation.error)
        return { error: 'Invalid Credentials' }
    }

    const { username, password } = data

    const ip = await getIP()
    if (!ipRequests[ip]) {
        ipRequests[ip] = []
    }
    ipRequests[ip] = cleanupOldRequests(ipRequests[ip])
    if (ipRequests[ip].length >= maxRequests) {
        return { error: 'Rate limit exceeded!' }
    }
    ipRequests[ip].push(Date.now())

    try {
        await signIn('credentials', {
            username,
            password,
            redirect: false,
        })

        return { message: 'Login successful' }
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: 'Invalid Credentials' }
        }
        logger.error('Unexpected error during login:', error)

        throw error
    }
}

export { login }
