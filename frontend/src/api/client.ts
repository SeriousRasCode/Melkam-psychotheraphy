import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7712/api/v1/users'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export const setAccessToken = (token: string | null) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

export const register = (payload: any) => api.post('/register', payload)
export const verify = (payload: any) => api.post('/verify', payload)
export const login = (payload: any) => api.post('/login', payload)
export const refresh = () => api.post('/refresh')
export const forgotPassword = (payload: any) => api.post('/forgot-password', payload)
export const resetPassword = (payload: any) => api.post('/reset', payload)
export const getAdmin = () => api.get('/admin')

export default api
