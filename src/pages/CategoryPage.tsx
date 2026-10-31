import { useParams } from 'react-router-dom'
import categoriesData from '../data/categories.json'
import faqsData from '../data/faqs.json'
import type { Category, Faq } from '../types'
import CategoryDetail from '../components/guide/CategoryDetail'
import NotFoundPage from './NotFoundPage'
import { useChatbot } from '../hooks/useChatbot'

const categories = categoriesData as Category[]
const faqs = faqsData as Faq[]

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { openChat } = useChatbot()

  const category = categories.find((c) => c.id === categoryId)

  if (!category) {
    return <NotFoundPage />
  }

  const relatedFaqs = faqs.filter((f) => f.categoryId === category.id)

  const handleAskBot = (question: string) => {
    openChat(question)
  }

  return (
    <CategoryDetail
      category={category}
      relatedFaqs={relatedFaqs}
      onAskBot={handleAskBot}
    />
  )
}
