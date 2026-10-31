import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatWidget from './ChatWidget'

// Wrap with MemoryRouter because ChatWidget uses useChatbot which doesn't need router,
// but our pages do — ChatWidget itself doesn't, so a simple wrapper is fine.
function renderWidget() {
  return render(
    <MemoryRouter>
      <ChatWidget />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.runAllTimers()
  vi.useRealTimers()
})

describe('ChatWidget', () => {
  it('renderiza el botón FAB cerrado por defecto', () => {
    renderWidget()
    const fab = screen.getByRole('button', { name: /abrir asistente/i })
    expect(fab).toBeInTheDocument()
    expect(fab).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre el panel al hacer clic en el FAB', async () => {
    renderWidget()
    const fab = screen.getByRole('button', { name: /abrir asistente/i })
    fireEvent.click(fab)
    expect(screen.getByRole('dialog', { name: /asistente de ecoguía/i })).toBeInTheDocument()
  })

  it('cierra el panel al hacer clic en el botón cerrar', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    fireEvent.click(screen.getByRole('button', { name: /cerrar chat/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cierra el panel al presionar Escape', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('envía mensaje de usuario y aparece en el chat', async () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))

    const input = screen.getByRole('textbox', { name: /mensaje para ecoguía/i })
    fireEvent.change(input, { target: { value: '¿Qué va en la bolsa blanca?' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))

    expect(screen.getByText('¿Qué va en la bolsa blanca?')).toBeInTheDocument()
  })

  it('aparece respuesta del bot tras el indicador de escritura', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))

    const input = screen.getByRole('textbox', { name: /mensaje para ecoguía/i })
    fireEvent.change(input, { target: { value: 'bolsa blanca' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))

    // Typing indicator should appear
    expect(screen.getByLabelText(/está escribiendo/i)).toBeInTheDocument()

    // Advance timers to trigger bot response (max 500ms delay)
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Typing indicator should be gone and bot message arrived
    expect(screen.queryByLabelText(/está escribiendo/i)).not.toBeInTheDocument()

    // Feedback buttons confirm a bot message exists
    expect(screen.getAllByRole('button', { name: /fue útil/i }).length).toBeGreaterThan(0)
  })

  it('se renderizan botones de preguntas sugeridas al inicio (sin mensajes)', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))

    // Suggested questions should appear when no messages
    const suggested = screen.getAllByRole('button')
    // At least FAB-related buttons + suggested questions
    expect(suggested.length).toBeGreaterThan(3)
  })

  it('"Limpiar conversación" borra los mensajes', async () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))

    // Send a message first
    const input = screen.getByRole('textbox', { name: /mensaje para ecoguía/i })
    fireEvent.change(input, { target: { value: 'Hola' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))
    expect(screen.getByText('Hola')).toBeInTheDocument()

    // Clear
    fireEvent.click(screen.getByRole('button', { name: /limpiar conversación/i }))
    expect(screen.queryByText('Hola')).not.toBeInTheDocument()
  })
})
