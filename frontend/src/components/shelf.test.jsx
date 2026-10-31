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

  it('puts a flash sale price on the matching card only', () => {
    render(<MemoryRouter><Shelf items={sampleManga} salePrices={new Map([['m1', { discountedPrice: 15000, flashSaleId: 1 }]])} /></MemoryRouter>)
    expect(screen.getByText('15.000 ₫')).toBeTruthy()
    expect(screen.getByText(/25\.000/).tagName).toBe('S')
    expect(screen.getAllByText('Printed volume')).toHaveLength(2)
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
