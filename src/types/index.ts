export interface Category {
  id: string
  name: string
  color: string
  icon: string
  description: string
  binColor: string
  accepts: string[]
  rejects: string[]
  tips: string[]
}

export interface Faq {
  id: string
  question: string
  answer: string
  keywords: string[]
  categoryId?: string
  related?: string[]
}

export type BotResponseType = 'answer' | 'fallback'

export interface BotResponse {
  type: BotResponseType
  answer: string
  matchedFaq?: Faq
  suggestions: Faq[]
}

export interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: number
  faqId?: string
  categoryId?: string
  suggestions?: Faq[]
}

