import { request } from './api.js'

export const login = (credentials) => request('/api/auth/login', { method: 'POST', body: credentials })
export const signup = (details) => request('/api/auth/signup', { method: 'POST', body: details })
