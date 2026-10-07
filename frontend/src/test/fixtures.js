import { setSession } from '../lib/session.js'

export function makeToken(secondsFromNow = 3600) {
  const exp = Math.floor(Date.now() / 1000) + secondsFromNow
  const payload = btoa(JSON.stringify({ sub: 'minh@example.com', exp })).replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`
}

export const customer = { userId: 'u1', fullName: 'Minh Nguyen', email: 'minh@example.com', role: 'CUSTOMER' }
export const admin = { userId: 'u2', fullName: 'Admin Tester', email: 'admin@example.com', role: 'ADMIN' }

export function signInAs(user, seconds = 3600) {
  return setSession({ token: makeToken(seconds), tokenType: 'Bearer', ...user })
}

export const sampleManga = [
  { id: 'm1', title: 'Đảo Hải Tặc', author: 'Eiichiro Oda', description: 'Pirates.', basePrice: 25000 },
  { id: 'm2', title: 'Naruto', author: 'Masashi Kishimoto', description: null, basePrice: 22000 },
  { id: 'm3', title: 'Monster', author: 'Naoki Urasawa', description: 'A doctor.', basePrice: 45000 },
]
