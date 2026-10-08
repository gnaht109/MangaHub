import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { sampleManga, signInAs, customer } from '../test/fixtures.js'
import { ApiError } from '../lib/api.js'
import { getManga } from '../lib/manga.js'

vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))

describe('MangaDetail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows title, author, price and description', async () => {
    getManga.mockResolvedValue(sampleManga[0])
    renderApp('/manga/m1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Đảo Hải Tặc' })).toBeTruthy()
    expect(getManga).toHaveBeenCalledWith('m1')
    expect(screen.getByText('Eiichiro Oda')).toBeTruthy()
    expect(screen.getAllByText('25.000 ₫')).toHaveLength(1)
    expect(screen.getByText('Pirates.')).toBeTruthy()
  })

  it('says so when there is no description', async () => {
    getManga.mockResolvedValue(sampleManga[1])
    renderApp('/manga/m2')
    expect(await screen.findByText('No description yet.')).toBeTruthy()
  })

  it('shows a not-found notice for MANGA_NOT_FOUND', async () => {
    getManga.mockRejectedValue(new ApiError(404, 'Manga not found', 404))
    renderApp('/manga/missing')
    expect(await screen.findByText("This volume isn't in the catalog.")).toBeTruthy()
  })

  it('sends guests to sign in from Add to cart', async () => {
    getManga.mockResolvedValue(sampleManga[0])
    renderApp('/manga/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add to cart' }))
    expect(screen.getByTestId('location').textContent).toBe('/login?next=%2Fmanga%2Fm1')
  })

  it('tells signed-in users the cart is coming', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    renderApp('/manga/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add to cart' }))
    expect(screen.getByText("Cart opens soon. This volume isn't saved yet.")).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View cart' }).getAttribute('href')).toBe('/cart')
  })
})
