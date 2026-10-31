import { useState, useCallback } from 'react'
import { search } from '../lib/chatbot/engine'
import faqsData from '../data/faqs.json'
import type { Message, Faq } from '../types'

const faqs = faqsData as Faq[]

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

interface UseChatbotReturn {
  messages: Message[]
  isTyping: boolean
  isOpen: boolean
  sendMessage: (text: string) => void
  clearHistory: () => void
  openChat: (prefillText?: string) => void
  closeChat: () => void
  prefillText: string
  setPrefillText: (text: string) => void
}

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [prefillText, setPrefillText] = useState('')

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    const delay = 300 + Math.random() * 200 // 300–500 ms
    setTimeout(() => {
      const response = search(trimmed, faqs)
      const botMessage: Message = {
        id: generateId(),
        role: 'bot',
        text: response.answer,
        timestamp: Date.now(),
        faqId: response.matchedFaq?.id,
        categoryId: response.matchedFaq?.categoryId,
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, delay)
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  const openChat = useCallback((text?: string) => {
    setIsOpen(true)
    if (text) setPrefillText(text)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    messages,
    isTyping,
    isOpen,
    sendMessage,
    clearHistory,
    openChat,
    closeChat,
    prefillText,
    setPrefillText,
  }
}
