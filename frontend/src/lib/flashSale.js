import { request } from './api.js'

export const listFlashSales = () => request('/api/flash-sales')
