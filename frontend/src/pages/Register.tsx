import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/client'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  const [msg, setMsg] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await register({ firstName, lastName, email, password, role })
      setMsg(data.message)
      nav('/verify')
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err.message)
    }
  }

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="PATIENT">Patient</option>
          <option value="THERAPIST">Therapist</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  )
}
