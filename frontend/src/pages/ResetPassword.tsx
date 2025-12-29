import React, { useState } from 'react'
import { resetPassword } from '../api/client'

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await resetPassword({ token, otp, password })
      setMsg(data.message)
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="card">
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Verification token" />
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" type="password" />
        <button type="submit">Reset</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
