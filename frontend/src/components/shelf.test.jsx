import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Shelf, { ShelfSkeleton } from './Shelf.jsx'
import { sampleManga } from '../test/fixtures.js'

describe('Shelf', () => {
  it('renders one linked card per volume with price', () => {
    render(<MemoryRouter><Shelf items={sampleManga} /></MemoryRouter>)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0].getAttribute('href')).toBe('/manga/m1')
    expect(screen.getByRole('heading', { name: 'Đảo Hải Tặc' })).toBeTruthy()
    expect(screen.getByText('Eiichiro Oda')).toBeTruthy()
    expect(screen.getByText('25.000 ₫')).toBeTruthy()
  })

  it('keeps the placeholder title out of the accessibility tree', () => {
    render(<MemoryRouter><Shelf items={[sampleManga[1]]} /></MemoryRouter>)
    expect(screen.getAllByText('Naruto').filter((el) => el.getAttribute('aria-hidden') === 'true')).toHaveLength(1)
  })

  it('renders a skeleton with the requested count', () => {
    render(<ShelfSkeleton count={5} />)
    expect(screen.getByRole('status', { name: 'Loading volumes' }).querySelectorAll('li')).toHaveLength(5)
  })
})
