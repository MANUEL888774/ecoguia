# Design Document

## Overview

EcoGuía es una SPA educativa de reciclaje para ciudadanos colombianos. La aplicación se construye completamente en el cliente: sin backend, sin llamadas a APIs externas. Todos los datos residen en archivos JSON versionados dentro del repositorio. El núcleo interactivo es un chatbot flotante que usa búsqueda difusa (Fuse.js) sobre un banco de FAQs en español.

El stack es React 18 + Vite + TypeScript (strict) + Tailwind CSS v3 + React Router (HashRouter) + Fuse.js + Vitest + React Testing Library.

---

## Architecture

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  Browser (static SPA)                                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  React App (main.tsx)                                   │  │
│  │                                                         │  │
│  │  HashRouter                                             │  │
│  │    └── Layout (Header + Footer + Outlet + ChatWidget)   │  │
│  │          ├── /            → HomePage                    │  │
│  │          ├── /guia        → GuidePage                   │  │
│  │          ├── /guia/:id    → CategoryPage                │  │
│  │          └── *            → NotFoundPage                │  │
│  │                                                         │  │
│  │  ┌───────────────┐   ┌────────────────────────────────┐ │  │
│  │  │  Data Layer   │   │  Chatbot Subsystem             │ │  │
│  │  │  (JSON files) │   │  useChatbot hook               │ │  │
│  │  │  categories   │◄──│    └── engine.ts (pure TS)     │ │  │
│  │  │  faqs         │   │         └── normalize.ts        │ │  │
│  │  └───────────────┘   └────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Sin backend**: toda la lógica reside en el cliente; el despliegue es un directorio estático.
2. **Separación de capas**: `engine.ts` y `normalize.ts` son módulos TypeScript puros (sin React), probables al 100% en Vitest sin JSDOM.
3. **Composición sobre herencia**: hooks para estado, componentes funcionales, contexto React solo cuando sea estrictamente necesario.
4. **Mobile-first**: Tailwind utilities desde la clase base hasta `md:` y `lg:` breakpoints.
5. **Accesibilidad first-class**: semántica HTML, ARIA roles, foco gestionado por código, no por CSS.

---

## Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx            # Outlet + ChatWidget
│   ├── guide/
│   │   ├── CategoryCard.tsx
│   │   └── CategoryDetail.tsx
│   └── chatbot/
│       ├── ChatWidget.tsx         # Botón flotante + panel contenedor
│       ├── ChatWindow.tsx         # Panel con cabecera + mensajes + input
│       ├── MessageList.tsx        # Lista de mensajes con aria-live
│       ├── MessageBubble.tsx      # Burbuja individual + feedback ¿Útil?
│       ├── ChatInput.tsx          # Textarea + botón enviar
│       └── SuggestedQuestions.tsx # Botones de sugerencias iniciales
├── pages/
│   ├── HomePage.tsx
│   ├── GuidePage.tsx
│   ├── CategoryPage.tsx
│   └── NotFoundPage.tsx
├── data/
│   ├── categories.json
│   └── faqs.json
├── lib/
│   └── chatbot/
│       ├── engine.ts
│       ├── normalize.ts
│       └── engine.test.ts
├── hooks/
│   └── useChatbot.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Data Models

All types are defined in `src/types/index.ts`.

### Category

```typescript
export interface Category {
  id: string;           // e.g. "organicos"
  name: string;         // e.g. "Orgánicos"
  color: string;        // Tailwind color token or hex, e.g. "#4ade80"
  icon: string;         // Emoji or icon identifier, e.g. "🍃"
  description: string;  // One-paragraph description
  binColor: string;     // "blanca" | "negra" | "verde"
  accepts: string[];    // ≥6 items
  rejects: string[];    // ≥4 items
  tips: string[];       // ≥3 items
}
```

### Faq

```typescript
export interface Faq {
  id: string;
  question: string;
  answer: string;
  keywords: string[];       // ≥4 items
  categoryId?: string;      // References Category.id
  related?: string[];       // References other Faq.id values
}
```

### BotResponse

```typescript
export type BotResponseType = 'answer' | 'fallback';

export interface BotResponse {
  type: BotResponseType;
  answer: string;
  matchedFaq?: Faq;
  suggestions: Faq[];       // max 3 items, no duplicates
}
```

### Message

```typescript
export interface Message {
  id: string;               // crypto.randomUUID() or nanoid
  role: 'user' | 'bot';
  text: string;
  timestamp: number;        // Date.now()
  faqId?: string;           // Set when bot message matches a FAQ
  categoryId?: string;      // Set when message is category-related
}
```

---

## Components and Interfaces

### Layout

`src/components/layout/Layout.tsx`

Wraps all routes. Renders `<Header>`, the route `<Outlet>`, `<Footer>`, and `<ChatWidget>` (always mounted to preserve chat history across route changes).

```
Layout
├── skip link: <a href="#main-content" className="sr-only focus:not-sr-only ...">
│             Saltar al contenido
├── Header
├── <main id="main-content">
│     <Outlet />
├── Footer
└── ChatWidget
```

### Header

`src/components/layout/Header.tsx`

- Logo/wordmark "EcoGuía" linking to `/`
- Navigation links: Inicio (`/`), Guía (`/guia`)
- Hamburger menu on mobile (aria-expanded, aria-controls)
- `role="banner"` implicit on `<header>`

### Footer

`src/components/layout/Footer.tsx`

- Aviso municipal: "⚠️ Las reglas de reciclaje varían según el municipio en Colombia."
- Copyright/credits
- `role="contentinfo"` implicit on `<footer>`

### CategoryCard

`src/components/guide/CategoryCard.tsx`

```typescript
interface CategoryCardProps {
  category: Category;
}
```

- Renders a card with icon, name, color accent, brief description
- Links to `/guia/:id`
- `<article>` element; icon has `aria-hidden="true"`
- Minimum touch target 44×44px

### CategoryDetail

`src/components/guide/CategoryDetail.tsx`

```typescript
interface CategoryDetailProps {
  category: Category;
  relatedFaqs: Faq[];
  onAskBot: (question: string) => void;
}
```

- Category name as `<h1>` (unique per page)
- `binColor` badge
- Accepted items in green (`✅`)
- Rejected items in red (`❌`)
- Tips section
- Related FAQs list with "Preguntar al bot" button per FAQ

### ChatWidget

`src/components/chatbot/ChatWidget.tsx`

State managed entirely by `useChatbot` hook. The widget itself only manages `isOpen` via the hook's `openChat` / close API.

```
ChatWidget
├── FAB button (bottom-right, z-50)
│     aria-label="Abrir asistente de EcoGuía"
│     aria-expanded={isOpen}
│     aria-controls="chat-panel"
└── ChatWindow (rendered when isOpen)
      role="dialog"
      aria-label="Asistente de EcoGuía"
      aria-modal="true"
      id="chat-panel"
```

**Sizing:**
- Mobile (`< md`): `fixed inset-x-2 bottom-2 top-16` (near-fullscreen)
- Desktop (`≥ md`): `fixed bottom-20 right-4 w-[380px] h-[520px]`

**Focus management:**
- On open: `chatInputRef.current?.focus()`
- On Escape keydown: close + return focus to FAB button (`fabRef.current?.focus()`)

### ChatWindow

`src/components/chatbot/ChatWindow.tsx`

```typescript
interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}
```

Structure:
```
ChatWindow
├── header
│     ├── "EcoGuía Bot"
│     ├── "Limpiar conversación" button
│     └── Close (×) button
├── MessageList (aria-live="polite")
│     ├── SuggestedQuestions (when no messages)
│     ├── MessageBubble × n
│     └── Typing indicator (when isTyping)
└── ChatInput
```

### MessageList

`src/components/chatbot/MessageList.tsx`

```typescript
interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onSuggestedClick: (question: string) => void;
  onFeedback: (messageId: string, helpful: boolean) => void;
}
```

- `<ul aria-live="polite" aria-label="Mensajes del chat">`
- Each `<li>` contains a `<MessageBubble>`
- Auto-scroll: `useEffect` with `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })` — uses `prefers-reduced-motion` to switch to `{ behavior: 'instant' }`
- Shows `<SuggestedQuestions>` when `messages.length === 0`
- Typing indicator: animated dots, hidden via `prefers-reduced-motion`

### MessageBubble

`src/components/chatbot/MessageBubble.tsx`

```typescript
interface MessageBubbleProps {
  message: Message;
  onFeedback?: (helpful: boolean) => void;
}
```

- User messages: right-aligned, primary color background
- Bot messages: left-aligned, gray background
- Bot messages include "¿Te fue útil? Sí / No" buttons (`aria-label` per button)
- On "No": triggers `onFeedback(false)` → parent shows related FAQs

### ChatInput

`src/components/chatbot/ChatInput.tsx`

```typescript
interface ChatInputProps {
  onSend: (text: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}
```

- `<input type="text">` (single-line, Enter to send)
- Send button with `aria-label="Enviar mensaje"`
- Disabled while `isTyping`
- `minLength` validation: no empty sends

### SuggestedQuestions

`src/components/chatbot/SuggestedQuestions.tsx`

```typescript
interface SuggestedQuestionsProps {
  questions: Faq[];
  onSelect: (question: string) => void;
}
```

- Renders 4–5 pill buttons from initial FAQs
- Each button: `aria-label={question}`, min 44px height

---

## Pages

### HomePage (`/`)

```
HomePage
├── <h1> hero heading
├── Municipal disclaimer (aviso)
├── Category grid (7 × CategoryCard)
├── Curiosity section (3 data items)
└── "Abrir chatbot" button → openChat()
```

### GuidePage (`/guia`)

```
GuidePage
├── <h1> "Guía de reciclaje"
└── Category grid (7 × CategoryCard)
```

### CategoryPage (`/guia/:categoryId`)

Fetches category from `categories.json` by `categoryId` param.
- If not found → renders `<NotFoundPage />`
- If found → renders `<CategoryDetail>`

```typescript
// src/pages/CategoryPage.tsx
const { categoryId } = useParams<{ categoryId: string }>();
const category = categories.find(c => c.id === categoryId);
if (!category) return <NotFoundPage />;
const relatedFaqs = faqs.filter(f => f.categoryId === category.id);
```

### NotFoundPage (`*`)

- `<h1>` "Página no encontrada"
- Link back to home

---

## Routing

`src/App.tsx` uses `HashRouter` from `react-router-dom`.

```typescript
// src/App.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="guia" element={<GuidePage />} />
          <Route path="guia/:categoryId" element={<CategoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
```

---

## Search Engine (`engine.ts`)

`src/lib/chatbot/engine.ts` — pure TypeScript, no React imports.

### Interface

```typescript
import type { Faq, BotResponse } from '../../types';
export function search(query: string, faqs: Faq[]): BotResponse;
```

### Algorithm

```
search(query, faqs):
  1. normalized = normalize(query)
  2. IF normalized === '' → return fallback(faqs)
  3. fuse = new Fuse(faqs, {
       keys: [
         { name: 'question', weight: 0.5 },
         { name: 'keywords', weight: 0.5 },
       ],
       threshold: 0.4,
       includeScore: true,
     })
  4. results = fuse.search(normalized)
  5. IF results.length > 0 AND results[0].score <= 0.4:
       matchedFaq = results[0].item
       suggestions = buildSuggestions(matchedFaq, faqs, [matchedFaq.id])
       return { type: 'answer', answer: matchedFaq.answer,
                matchedFaq, suggestions }
  6. ELSE:
       return fallback(faqs, results)
```

> **Note on Fuse.js scoring**: Fuse returns scores where `0` is a perfect match and `1` is no match. A score ≤ threshold (0.4) means the match satisfies the threshold. `includeScore: true` adds the `score` field to each result.

### Helper: buildSuggestions

```typescript
function buildSuggestions(
  matched: Faq,
  allFaqs: Faq[],
  exclude: string[],
): Faq[] {
  // 1. Use matched.related[] to find FAQs by id (max 3, no duplicates)
  const related = (matched.related ?? [])
    .filter(id => !exclude.includes(id))
    .map(id => allFaqs.find(f => f.id === id))
    .filter((f): f is Faq => f !== undefined)
    .slice(0, 3);
  return related;
}
```

### Helper: fallback

```typescript
function fallback(allFaqs: Faq[], partialResults?: FuseResult<Faq>[]): BotResponse {
  // Pick 3 unique suggestions: from partial results if available,
  // else from the first 3 FAQs (representing most common/general)
  const candidates = partialResults?.length
    ? partialResults.map(r => r.item)
    : allFaqs;
  const suggestions = uniqueById(candidates).slice(0, 3);
  return {
    type: 'fallback',
    answer: 'Lo siento, no encontré una respuesta exacta. ¿Puedes reformular tu pregunta? Aquí tienes algunas sugerencias:',
    suggestions,
  };
}
```

---

## Normalize Module (`normalize.ts`)

`src/lib/chatbot/normalize.ts`

```typescript
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                          // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')           // remove diacritic marks
    .replace(/[^\w\s]|_/g, '')                 // remove punctuation
    .replace(/\s+/g, ' ')                      // collapse whitespace
    .trim();
}
```

Step-by-step breakdown:
1. `toLowerCase()` — converts all uppercase letters.
2. `normalize('NFD')` — decomposes e.g. `á` into `a` + combining accent.
3. Remove combining characters (`\u0300–\u036f`) — strips the accent.
4. Remove punctuation and underscores.
5. Collapse multiple spaces to single.
6. Trim leading/trailing whitespace.

---

## Hook: useChatbot

`src/hooks/useChatbot.ts`

```typescript
import { useState, useCallback, useRef } from 'react';
import { search } from '../lib/chatbot/engine';
import faqs from '../data/faqs.json';
import type { Message, Faq } from '../types';

interface UseChatbotReturn {
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
  sendMessage: (text: string) => void;
  clearHistory: () => void;
  openChat: (prefillText?: string) => void;
  closeChat: () => void;
  prefillText: string;
  setPrefillText: (text: string) => void;
}

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [prefillText, setPrefillText] = useState('');

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const delay = 300 + Math.random() * 200; // 300–500ms
    setTimeout(() => {
      const response = search(trimmed, faqs as Faq[]);
      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: response.answer,
        timestamp: Date.now(),
        faqId: response.matchedFaq?.id,
        categoryId: response.matchedFaq?.categoryId,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, delay);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  const openChat = useCallback((text?: string) => {
    setIsOpen(true);
    if (text) setPrefillText(text);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    messages, isTyping, isOpen,
    sendMessage, clearHistory, openChat, closeChat,
    prefillText, setPrefillText,
  };
}
```

---

## Accessibility Implementation

### Skip Link

First child of `<Layout>`:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2
             focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-green-800
             focus:rounded focus:shadow-lg focus:outline-none focus:ring-2
             focus:ring-green-500"
>
  Saltar al contenido
</a>
```

### Chat Panel ARIA

```tsx
<div
  role="dialog"
  aria-label="Asistente de EcoGuía"
  aria-modal="true"
  id="chat-panel"
>
  <ul aria-live="polite" aria-label="Mensajes del chat">
    {/* messages */}
  </ul>
</div>
```

### Focus Trap

`ChatWindow` implements a lightweight focus trap:

```typescript
useEffect(() => {
  if (!isOpen) return;
  const panel = panelRef.current;
  if (!panel) return;

  const focusable = panel.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  panel.addEventListener('keydown', handleKeyDown);
  inputRef.current?.focus();
  return () => panel.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose, inputRef]);
```

### Reduced Motion

```css
/* In index.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Scroll behavior in `MessageList`:

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

messagesEndRef.current?.scrollIntoView({
  behavior: prefersReducedMotion ? 'instant' : 'smooth',
});
```

---

## Data Files

### `src/data/categories.json` — Schema

```json
[
  {
    "id": "organicos",
    "name": "Orgánicos",
    "color": "#4ade80",
    "icon": "🍃",
    "description": "...",
    "binColor": "verde",
    "accepts": ["Cáscaras de frutas", "Restos de verduras", "..."],
    "rejects": ["Carne", "Aceites", "..."],
    "tips": ["Drenar líquidos antes de depositar", "..."]
  }
  // ... 6 more
]
```

The seven category ids are: `organicos`, `plastico`, `papel-carton`, `vidrio`, `metales`, `peligrosos`, `electronicos`.

### `src/data/faqs.json` — Schema

```json
[
  {
    "id": "faq-001",
    "question": "¿Qué va en la bolsa blanca?",
    "answer": "La bolsa blanca es para materiales reciclables secos...",
    "keywords": ["bolsa blanca", "reciclables", "secos", "plastico", "papel"],
    "related": ["faq-002", "faq-003"]
  }
  // ... 29+ more
]
```

Minimum 30 FAQs; at least 5 without `categoryId`; each with ≥4 keywords.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `categoryId` param not in categories | `CategoryPage` renders `<NotFoundPage>` |
| Fuse.js no match | Engine returns `type: 'fallback'` with 3 suggestions |
| Empty query sent | Hook validates and ignores; engine returns fallback |
| JSON import error | TypeScript import + Vite build catches at compile time |
| `crypto.randomUUID` unavailable | Fallback: `Date.now().toString(36) + Math.random().toString(36)` |

---

## Testing Strategy

### File: `src/lib/chatbot/engine.test.ts`

Tests are pure Vitest (no JSDOM needed) since `engine.ts` and `normalize.ts` have no React dependencies.

**Normalize coverage:**
- `normalize('HOLA')` → `'hola'`
- `normalize('reciclación')` → `'reciclacion'`
- `normalize('¿Qué hago?')` → `'que hago'`
- `normalize('hola   mundo')` → `'hola mundo'`
- Round-trip: `normalize(normalize(s)) === normalize(s)` (idempotence)

**Engine coverage:**
- Exact match returns `type: 'answer'`
- Typo tolerance: `'botela de bidrio'` matches `vidrio` FAQ
- Synonym: `'icopor'` matches polystyrene FAQ
- Fallback returns exactly 3 suggestions
- Empty query returns `type: 'fallback'`
- No duplicate suggestion ids across answer and fallback

**Data integrity:**
- All FAQ ids are unique
- All category ids are unique
- All `categoryId` references resolve to existing categories
- All `related` references resolve to existing FAQs
- `faqs.length >= 30`
- Every FAQ has `keywords.length >= 4`

### File: `src/components/chatbot/ChatWidget.test.tsx`

Uses Vitest + RTL + jsdom.

- Opens chat panel on FAB click
- Closes on close button click
- Closes on Escape key
- Sends user message → message appears
- Bot response appears after typing indicator
- Suggested question buttons are rendered initially
- "Limpiar conversación" clears messages

### Coverage Target

`src/lib/chatbot/` → >90% branches, statements, functions, lines.

Vitest config (`vitest.config.ts`):

```typescript
coverage: {
  include: ['src/lib/chatbot/**'],
  thresholds: { branches: 90, statements: 90, functions: 90, lines: 90 },
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Integridad de arrays por categoría

*For any* category in `categories.json`, the `accepts` array SHALL have at least 6 items, the `rejects` array SHALL have at least 4 items, and the `tips` array SHALL have at least 3 items.

**Validates: Requirements 3.2**

---

### Property 2: Cobertura de keywords por FAQ

*For any* FAQ in `faqs.json`, the `keywords` array SHALL have at least 4 items.

**Validates: Requirements 3.3**

---

### Property 3: Integridad referencial — categoryId

*For any* FAQ that has a `categoryId` field set, that `categoryId` value SHALL exist as the `id` of some category in `categories.json`.

**Validates: Requirements 3.5**

---

### Property 4: Integridad referencial — related

*For any* FAQ that has a `related` array, each element of that array SHALL exist as the `id` of some FAQ in `faqs.json`.

**Validates: Requirements 3.6**

---

### Property 5: Normalización sin mayúsculas

*For any* string `s`, the result of `normalize(s)` SHALL contain no uppercase characters (i.e., `normalize(s) === normalize(s).toLowerCase()`).

**Validates: Requirements 7.2**

---

### Property 6: Normalización sin tildes

*For any* string `s` that contains accented characters, the result of `normalize(s)` SHALL contain none of the combining diacritic characters `[\u0300-\u036f]`.

**Validates: Requirements 7.3**

---

### Property 7: Normalización sin puntuación

*For any* string `s`, the result of `normalize(s)` SHALL contain no punctuation characters (matched by `/[^\w\s]/`).

**Validates: Requirements 7.4**

---

### Property 8: Normalización sin espacios múltiples

*For any* string `s`, the result of `normalize(s)` SHALL not contain two or more consecutive space characters (i.e., `!/\s{2,}/.test(normalize(s))`).

**Validates: Requirements 7.5**

---

### Property 9: Normalización idempotente

*For any* string `s`, applying `normalize` twice SHALL produce the same result as applying it once: `normalize(normalize(s)) === normalize(s)`.

**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

---

### Property 10: Sugerencias sin duplicados en answer

*For any* query that produces a `BotResponse` with `type: 'answer'`, the `suggestions` array SHALL contain no two FAQs with the same `id`.

**Validates: Requirements 6.4**

---

### Property 11: Sugerencias sin duplicados en fallback

*For any* query that produces a `BotResponse` with `type: 'fallback'`, the `suggestions` array SHALL contain exactly 3 FAQs, all with distinct `id` values.

**Validates: Requirements 6.5**

---

### Property 12: Tolerancia a errores tipográficos

*For any* search query that is a minor typographic variant (≤2 character substitutions) of the `question` or a `keyword` of an existing FAQ, `search` SHALL return `type: 'answer'` with the correct matched FAQ.

**Validates: Requirements 6.3, 6.4**
