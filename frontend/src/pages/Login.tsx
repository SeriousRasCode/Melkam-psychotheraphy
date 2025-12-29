import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, setAccessToken } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await login({ email, password })
      const token = data.accessToken
      setAccessToken(token)
      localStorage.setItem('accessToken', token)
      nav('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        <Link to="/forgot">Forgot password?</Link>
      </p>
      <p>
        <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
