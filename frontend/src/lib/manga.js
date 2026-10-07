import { request } from './api.js'

export const listManga = () => request('/api/manga')
export const getManga = (id) => request(`/api/manga/${encodeURIComponent(id)}`)
export const createManga = (input) => request('/api/manga', { method: 'POST', body: input })
