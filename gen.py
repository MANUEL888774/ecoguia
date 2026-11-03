import base64, pathlib
src = pathlib.Path('c:/MANUEL/ecoguia/src')
mb = '''import type { Message, Faq } from '../../types'

interface MessageBubbleProps {
  message: Message
  onFeedback?: (helpful: boolean) => void
  onSuggestionClick?: (question: string) => void
}
