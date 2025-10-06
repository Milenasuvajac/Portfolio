'use client'

import React, { useState } from 'react'
import {login} from "@/actions/login";
import logger from "@/utils/logger";
import { useRouter } from 'next/navigation';
import '../../styles.css'

const Login = () => {
    const router = useRouter()
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
            <button 
                className="back-button" 
                onClick={() => router.back()}
                aria-label="Go back"
            >
                ←
            </button>
            <div className='login-container'>
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="username"
                            id="username"
                            value={username}
                            onChange={e => setusername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
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

                    <button className={"login-button"} type="submit">Login</button>
                </form>
            </div>
        </main>
    )
}

export default Login
