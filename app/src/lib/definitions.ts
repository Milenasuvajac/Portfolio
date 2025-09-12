/**
 * This file contains centralized type definitions
 * and Zod schemas for the application.
 * It defines the structure of key data objects,
 * ensuring consistency across the project
 * and providing both compile-time type checking and
 * runtime data validation.
 */
import { z } from 'zod'

// Schema for validating user login input
export const LoginSchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").trim(),
    password: z.string().trim(),
})


// Schema for validating user, with all fields optional
export const UserSchema = z.object({
    username: z.optional(z.string().regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")),
    companyName: z.optional(z.string().regex(/^[a-zA-Z0-9_]+$/, "Company name can only contain letters, numbers, and underscores")),
    password: z.optional(z.string().min(8)
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),),
    UID: z.optional(
        z.union([
            z.number(),
            z.string().regex(/^\d+$/, 'UID must be a string containing only digits'),
        ]),
    ),
})
