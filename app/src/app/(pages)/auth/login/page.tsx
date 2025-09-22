'use client'

import React, { useState } from 'react'
import {login} from "@/actions/login";
import logger from "@/utils/logger";

const Login = () => {
    const [username, setusername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault() // Prevent default form submission

        setError('')
        setSuccess('')

        const formData = {
            username,
            password,
        }

        try {
            logger.log("Form Data: ",formData)
            const result = await login(formData)
            logger.log("Result: ", result)
            if (result.message) {
                setSuccess(result.message)
                window.location.reload()
            }
            if (result.error) {
                logger.error(result.error)
                setError(result.error)
            }
        } catch (error) {
            logger.error(error)
            setError('Login failed')
        }
    }

    return (
        <main>
            <div>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">username:</label>
                        <input
                            type="username"
                            id="username"
                            value={username}
                            onChange={e => setusername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}

                    <button type="submit">Login</button>
                </form>
            </div>
        </main>
    )
}

export default Login
