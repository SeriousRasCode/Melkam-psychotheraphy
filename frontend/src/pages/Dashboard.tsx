import React, { useEffect, useState } from 'react'
import { getAdmin, refresh, setAccessToken } from '../api/client'

export default function Dashboard() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const tryAdmin = async () => {
      try {
        const { data } = await getAdmin()
        setMessage(data.message)
      } catch (err: any) {
        try {
          const r = await refresh()
          setAccessToken(r.data.accessToken)
          localStorage.setItem('accessToken', r.data.accessToken)
          const { data } = await getAdmin()
          setMessage(data.message)
        } catch (e: any) {
          setMessage('Not authorized')
        }
      }
    }
    tryAdmin()
  }, [])

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  )
}
