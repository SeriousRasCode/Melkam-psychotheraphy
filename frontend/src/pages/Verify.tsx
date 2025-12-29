import React, { useState } from 'react'
import { verify } from '../api/client'

export default function Verify() {
  const [token, setToken] = useState('')
  const [otp, setOtp] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await verify({ token, otp })
      setMsg(data.message)
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="card">
      <h2>Verify Email</h2>
      <form onSubmit={submit}>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Verification token" />
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" />
        <button type="submit">Verify</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
