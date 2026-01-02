import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Page from '../app/page'

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
}))

// Mock fetch
global.fetch = vi.fn()

test('Page renders correctly', async () => {
    // Mock fetch response for auth check (unauthorized -> show login)
    (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({}),
    })

    render(<Page />)

    await waitFor(() => {
        expect(screen.getByText('ePesantren')).toBeDefined()
    })
})
