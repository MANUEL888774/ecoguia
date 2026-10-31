import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatWidget from './ChatWidget'

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
  // Drain any pending timers (bot setTimeout) so React state updates
  // are flushed inside act before the next test begins.
  act(() => {
    vi.runAllTimers()
  })
  vi.useRealTimers()
})

describe('ChatWidget', () => {
  it('renderiza el botón FAB cerrado por defecto', () => {
    renderWidget()
    const fab = screen.getByRole('button', { name: /abrir asistente/i })
    expect(fab).toBeInTheDocument()
    expect(fab).toHaveAttribute('aria-expanded', 'false')
  })

  it('abre el panel al hacer clic en el FAB', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    expect(screen.getByRole('dialog', { name: /asistente de ecoguía/i })).toBeInTheDocument()
  })

  it('cierra el panel al hacer clic en el botón cerrar', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /cerrar chat/i }))
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cierra el panel al presionar Escape', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    const dialog = screen.getByRole('dialog')
    act(() => {
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('envía mensaje de usuario y aparece en el chat', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    act(() => {
      fireEvent.change(
        screen.getByRole('textbox', { name: /mensaje para ecoguía/i }),
        { target: { value: '¿Qué va en la bolsa blanca?' } },
      )
      fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))
    })
    expect(screen.getByText('¿Qué va en la bolsa blanca?')).toBeInTheDocument()
    // drain bot timer to avoid leaking state update
    act(() => { vi.runAllTimers() })
  })

  it('aparece respuesta del bot tras el indicador de escritura', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    act(() => {
      fireEvent.change(
        screen.getByRole('textbox', { name: /mensaje para ecoguía/i }),
        { target: { value: 'bolsa blanca' } },
      )
      fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))
    })

    // Typing indicator should be visible before timer fires
    expect(screen.getByLabelText(/está escribiendo/i)).toBeInTheDocument()

    // Advance timers inside act so the state update is properly flushed
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.queryByLabelText(/está escribiendo/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /fue útil/i }).length).toBeGreaterThan(0)
  })

  it('se renderizan botones de preguntas sugeridas al inicio (sin mensajes)', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    // Suggested question pills + header buttons should be present
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3)
  })

  it('"Limpiar conversación" borra los mensajes', () => {
    renderWidget()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /abrir asistente/i }))
    })
    act(() => {
      fireEvent.change(
        screen.getByRole('textbox', { name: /mensaje para ecoguía/i }),
        { target: { value: 'Hola' } },
      )
      fireEvent.click(screen.getByRole('button', { name: /enviar mensaje/i }))
    })
    expect(screen.getByText('Hola')).toBeInTheDocument()

    // drain bot timer before clearing
    act(() => { vi.runAllTimers() })

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /limpiar conversación/i }))
    })
    expect(screen.queryByText('Hola')).not.toBeInTheDocument()
  })
})
