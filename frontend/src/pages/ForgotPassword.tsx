import React, { useState } from 'react'
import { forgotPassword } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await forgotPassword({ email })
      setMsg(data.message)
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="card">
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button type="submit">Send Reset OTP</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
