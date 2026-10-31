import { useRef } from 'react'
import { useChatbot } from '../../hooks/useChatbot'
import ChatWindow from './ChatWindow'
import faqsData from '../../data/faqs.json'
import type { Faq } from '../../types'

const SUGGESTED_FAQ_IDS = ['faq-001', 'faq-002', 'faq-003', 'faq-004', 'faq-013']
const allFaqs = faqsData as Faq[]
const suggestedFaqs = SUGGESTED_FAQ_IDS
  .map((id) => allFaqs.find((f) => f.id === id))
  .filter((f): f is Faq => f !== undefined)

export default function ChatWidget() {
  const {
    messages,
    isTyping,
    isOpen,
    sendMessage,
    clearHistory,
    openChat,
    closeChat,
    prefillText,
    setPrefillText,
  } = useChatbot()

  const fabRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => {
    openChat()
  }

  const handleClose = () => {
    closeChat()
    // Return focus to FAB after closing
    setTimeout(() => fabRef.current?.focus(), 0)
  }

  const handleSuggestedClick = (question: string) => {
    sendMessage(question)
  }

  const handleFeedback = (_messageId: string, _helpful: boolean) => {
    // Feedback recorded; could be extended to show related FAQs
  }

  // Handle prefill: if text was set via openChat(text), send it once
  if (prefillText && isOpen) {
    setPrefillText('')
    sendMessage(prefillText)
  }

  return (
    <>
      {/* FAB button */}
      <button
        ref={fabRef}
        aria-label="Abrir asistente de EcoGuía"
        aria-expanded={isOpen}
        aria-controls="chat-panel"
        onClick={handleOpen}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all flex items-center justify-center text-2xl ${
          isOpen ? 'hidden' : ''
        }`}
      >
        <span aria-hidden="true">💬</span>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed z-50
            inset-x-2 bottom-2 top-16
            md:inset-auto md:bottom-20 md:right-4 md:w-[380px] md:h-[520px]"
        >
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            suggestedFaqs={suggestedFaqs}
            onSend={sendMessage}
            onClose={handleClose}
            onClear={clearHistory}
            onSuggestedClick={handleSuggestedClick}
            onFeedback={handleFeedback}
            inputRef={inputRef}
          />
        </div>
      )}
    </>
  )
}
