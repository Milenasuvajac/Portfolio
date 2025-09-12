export interface CreateUserBody {
    username: string
    password: string
    companyName: string | null
}

export interface LoginUserDTO {
    UID: number
    username: string
    password: string
}

// user for getAllUsers and getUserById
export interface UserDTO {
    UID?: number
    username: string
    companyName: string | null
    password_hash?: string
}

export interface UpdateUserBody {
    username?: string
    password?: string
    companyName?: string | null
    UID?: number
}

