import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { sampleManga, signInAs, customer, admin } from '../test/fixtures.js'
import { ApiError } from '../lib/api.js'
import { listManga, createManga } from '../lib/manga.js'

vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))

describe('Account', () => {
  it('shows the stored profile and signs out', async () => {
    listManga.mockResolvedValue([])
    signInAs(customer)
    renderApp('/account')
    expect(screen.getByText('minh@example.com')).toBeTruthy()
    expect(screen.getByText('CUSTOMER')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/'))
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
  })

  it('requires sign in', () => {
    renderApp('/account')
    expect(screen.getByTestId('location').textContent).toBe('/login?next=%2Faccount')
  })
})

describe('Admin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks customers', () => {
    signInAs(customer)
    renderApp('/admin')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
  })

  it('lists titles in a table', async () => {
    listManga.mockResolvedValue(sampleManga)
    signInAs(admin)
    renderApp('/admin')
    expect(screen.getByRole('heading', { level: 1, name: 'Admin · Titles' })).toBeTruthy()
    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(within(table).getByText('45.000 ₫')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Add title' }).getAttribute('href')).toBe('/admin/titles/new')
  })

  it('validates, submits once and confirms a new title', async () => {
    let resolve
    createManga.mockReturnValue(new Promise((r) => { resolve = r }))
    signInAs(admin)
    renderApp('/admin/titles/new')
    expect(screen.getByRole('heading', { level: 1, name: 'Admin · New title' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Add title' }))
    expect(screen.getByText('Title is required')).toBeTruthy()
    expect(createManga).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText('Title'), 'Monster')
    await userEvent.type(screen.getByLabelText('Author'), 'Naoki Urasawa')
    await userEvent.type(screen.getByLabelText('Base price (VND)'), '45000')
    await userEvent.click(screen.getByRole('button', { name: 'Add title' }))
    expect(screen.getByRole('button', { name: 'Adding…' }).disabled).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Adding…' }))
    expect(createManga).toHaveBeenCalledTimes(1)
    expect(createManga).toHaveBeenCalledWith({ title: 'Monster', author: 'Naoki Urasawa', description: null, basePrice: 45000 })

    resolve({ id: 'm9', title: 'Monster' })
    expect(await screen.findByText('Title added')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View on store' }).getAttribute('href')).toBe('/manga/m9')
    expect(screen.getByLabelText('Title').value).toBe('')
  })

  it('shows a server error', async () => {
    createManga.mockRejectedValue(new ApiError(403, 'Forbidden Access', 403))
    signInAs(admin)
    renderApp('/admin/titles/new')
    await userEvent.type(screen.getByLabelText('Title'), 'Monster')
    await userEvent.type(screen.getByLabelText('Author'), 'Naoki Urasawa')
    await userEvent.type(screen.getByLabelText('Base price (VND)'), '45000')
    await userEvent.click(screen.getByRole('button', { name: 'Add title' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Forbidden Access')
  })
})
