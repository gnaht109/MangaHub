import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Button from './Button.jsx'
import Field from './Field.jsx'
import Notice from './Notice.jsx'
import PageTitle from './PageTitle.jsx'

describe('primitives', () => {
  it('Button renders a link when given `to`, else a button', () => {
    render(<MemoryRouter><Button to="/cart">Cart</Button><Button>Go</Button></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Cart' }).getAttribute('href')).toBe('/cart')
    expect(screen.getByRole('button', { name: 'Go' }).getAttribute('type')).toBe('button')
  })

  it('Field labels its control and links the error', () => {
    render(<Field label="Email" error="Email is required" />)
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const describedBy = input.getAttribute('aria-describedby')
    expect(document.getElementById(describedBy).textContent).toBe('Email is required')
  })

  it('Field renders a textarea when multiline', () => {
    render(<Field label="Description" multiline />)
    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA')
  })

  it('Notice uses alert for errors and status otherwise', () => {
    render(<><Notice tone="error" title="Broken" /><Notice title="Empty" /></>)
    expect(screen.getByRole('alert').textContent).toContain('Broken')
    expect(screen.getByRole('status').textContent).toContain('Empty')
  })

  it('PageTitle renders a level-1 heading', () => {
    render(<PageTitle>Sign in</PageTitle>)
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy()
  })
})
