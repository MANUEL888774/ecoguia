# Implementation Plan: EcoGuía

## Overview

Construcción incremental de la SPA EcoGuía de reciclaje para Colombia. Se comienza con la infraestructura del proyecto y los módulos puros de TypeScript (normalización y motor de búsqueda), se continúa con los tipos, datos JSON y el hook, y se finaliza con los componentes UI, páginas, enrutamiento y pruebas. Cada tarea integra su código con los pasos anteriores para que no queden módulos huérfanos.

## Tasks

- [ ] 1. Configurar el proyecto con Vite + React 18 + TypeScript estricto + Tailwind v3
  - [-] 1.1 Inicializar proyecto Vite con plantilla `react-ts` y configurar `tsconfig.json` con `strict: true` y `paths`
    - Crear el proyecto en la raíz del workspace (`c:\MANUEL\ecoguia`)
    - Agregar `"strict": true`, `"noUncheckedIndexedAccess": true` en `compilerOptions`
    - _Requirements: 1.1_
  - [~] 1.2 Instalar y configurar Tailwind CSS v3 con `tailwind.config.ts` y `postcss.config.cjs`
    - Añadir directivas `@tailwind` en `src/index.css`
    - Configurar `content` para barrer `src/**/*.{ts,tsx}`
    - _Requirements: 1.1_
  - [~] 1.3 Instalar dependencias de runtime: `react-router-dom`, `fuse.js`
    - _Requirements: 1.1_
  - [~] 1.4 Instalar y configurar herramientas de desarrollo: Vitest, `@vitest/coverage-v8`, React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), ESLint con plugin React + TypeScript, Prettier
    - Crear `vitest.config.ts` con entorno `jsdom`, setup file y umbrales de cobertura `>90%` para `src/lib/chatbot/**`
    - Crear `.eslintrc.cjs` y `.prettierrc`
    - _Requirements: 1.1, 1.3, 12.5_
  - [~] 1.5 Agregar scripts en `package.json`: `dev`, `build`, `preview`, `test`, `test:coverage`, `lint`, `typecheck`
    - `"test": "vitest --run"`, `"test:coverage": "vitest run --coverage"`, `"typecheck": "tsc --noEmit"`
    - _Requirements: 1.4_

- [ ] 2. Definir tipos TypeScript en `src/types/index.ts`
  - [~] 2.1 Crear `src/types/index.ts` con las interfaces `Category`, `Faq`, `BotResponse` y `Message`
    - `BotResponseType = 'answer' | 'fallback'`
    - Campos opcionales `matchedFaq?`, `categoryId?`, `related?`, `faqId?`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Implementar módulo de normalización
  - [~] 3.1 Crear `src/lib/chatbot/normalize.ts` con la función `normalize(text: string): string`
    - Pasos: `toLowerCase` → `normalize('NFD')` → eliminar `\u0300-\u036f` → eliminar puntuación (`[^\w\s]|_`) → colapsar espacios → `trim()`
    - Sin importaciones de React
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 3.2 Escribir pruebas de propiedad para `normalize` en `src/lib/chatbot/engine.test.ts`
    - **Property 5: Normalización sin mayúsculas** — `normalize(s) === normalize(s).toLowerCase()`
    - **Validates: Requirements 7.2**
    - **Property 6: Normalización sin tildes** — sin caracteres `[\u0300-\u036f]`
    - **Validates: Requirements 7.3**
    - **Property 7: Normalización sin puntuación** — sin caracteres `/[^\w\s]/`
    - **Validates: Requirements 7.4**
    - **Property 8: Sin espacios múltiples** — `!/\s{2,}/.test(normalize(s))`
    - **Validates: Requirements 7.5**
    - **Property 9: Idempotencia** — `normalize(normalize(s)) === normalize(s)`
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
    - Incluir también ejemplos unitarios: `'HOLA'→'hola'`, `'reciclación'→'reciclacion'`, `'¿Qué hago?'→'que hago'`, `'hola   mundo'→'hola mundo'`
    - _Requirements: 12.1_

- [ ] 4. Crear archivos de datos JSON en español para Colombia
  - [~] 4.1 Crear `src/data/categories.json` con las 7 categorías: `organicos`, `plastico`, `papel-carton`, `vidrio`, `metales`, `peligrosos`, `electronicos`
    - Cada categoría con `id`, `name`, `color`, `icon`, `description`, `binColor`, `accepts` (≥6), `rejects` (≥4), `tips` (≥3), en español
    - _Requirements: 3.1, 3.2_
  - [~] 4.2 Crear `src/data/faqs.json` con ≥30 FAQs en español, contexto colombiano (bolsas blanca/negra/verde)
    - Cada FAQ con `id` único, `question`, `answer`, `keywords` (≥4), `categoryId` opcional, `related` opcional
    - Al menos 5 FAQs sin `categoryId`; referencias cruzadas coherentes
    - _Requirements: 3.3, 3.4, 3.5, 3.6_
  - [ ]* 4.3 Escribir pruebas de propiedad de integridad de datos en `src/lib/chatbot/engine.test.ts`
    - **Property 1: Integridad de arrays por categoría** — `accepts.length >= 6`, `rejects.length >= 4`, `tips.length >= 3`
    - **Validates: Requirements 3.2**
    - **Property 2: Cobertura de keywords por FAQ** — `keywords.length >= 4`
    - **Validates: Requirements 3.3**
    - **Property 3: Integridad referencial categoryId** — todo `categoryId` existe en `categories.json`
    - **Validates: Requirements 3.5**
    - **Property 4: Integridad referencial related** — todo `id` en `related` existe en `faqs.json`
    - **Validates: Requirements 3.6**
    - Añadir también: `faqs.length >= 30`, ids únicos por colección
    - _Requirements: 12.3_

- [ ] 5. Implementar motor de búsqueda del chatbot
  - [~] 5.1 Crear `src/lib/chatbot/engine.ts` con la función `search(query: string, faqs: Faq[]): BotResponse`
    - Importar `normalize` de `./normalize`; sin importaciones de React
    - Configurar Fuse.js: `keys: [{name:'question',weight:0.5},{name:'keywords',weight:0.5}]`, `threshold:0.4`, `includeScore:true`
    - Implementar `buildSuggestions` y `fallback` helpers según el diseño
    - Retornar `type:'fallback'` cuando `normalized === ''` o sin coincidencias
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ]* 5.2 Escribir pruebas de propiedad del motor en `src/lib/chatbot/engine.test.ts`
    - **Property 10: Sugerencias sin duplicados en answer** — `suggestions` sin `id` repetido cuando `type:'answer'`
    - **Validates: Requirements 6.4**
    - **Property 11: Sugerencias sin duplicados en fallback** — exactamente 3 FAQs con `id` distintos cuando `type:'fallback'`
    - **Validates: Requirements 6.5**
    - **Property 12: Tolerancia tipográfica** — variante con ≤2 sustituciones devuelve `type:'answer'`
    - **Validates: Requirements 6.3, 6.4**
    - Añadir ejemplos: coincidencia exacta, `'botela de bidrio'`→vidrio, `'icopor'`→poliestireno, fallback con 3 sugerencias, query vacía
    - _Requirements: 12.2_

- [~] 6. Checkpoint — Módulos puros verificados
  - Asegurar que `npm run test` y `npm run typecheck` pasen sin errores antes de continuar con los componentes React.

- [ ] 7. Implementar hook `useChatbot`
  - [~] 7.1 Crear `src/hooks/useChatbot.ts` con el estado de conversación, `sendMessage`, `clearHistory`, `openChat`, `closeChat`, `isTyping`, `prefillText`
    - Delay simulado de 300–500 ms con `setTimeout` antes de agregar la respuesta del bot
    - Importar `search` de `../lib/chatbot/engine` y `faqs` de `../data/faqs.json`
    - Fallback de `crypto.randomUUID` cuando no esté disponible
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8. Implementar componentes de layout
  - [~] 8.1 Crear `src/components/layout/Header.tsx` con logo "EcoGuía", nav links (Inicio `/`, Guía `/guia`) y menú hamburguesa en mobile con `aria-expanded`/`aria-controls`
    - _Requirements: 10.1, 10.2, 11.1_
  - [~] 8.2 Crear `src/components/layout/Footer.tsx` con aviso municipal: "⚠️ Las reglas de reciclaje varían según el municipio en Colombia."
    - _Requirements: 4.3_
  - [~] 8.3 Crear `src/components/layout/Layout.tsx` con skip link "Saltar al contenido", `<Header>`, `<main id="main-content">` con `<Outlet>`, `<Footer>` y `<ChatWidget>` siempre montado
    - Skip link: `sr-only focus:not-sr-only` con Tailwind
    - _Requirements: 10.6, 9.1, 9.4_

- [ ] 9. Implementar componentes de la guía
  - [~] 9.1 Crear `src/components/guide/CategoryCard.tsx` con `article`, icon (`aria-hidden="true"`), name, color accent, descripción breve, link a `/guia/:id`, touch target mínimo 44×44 px
    - _Requirements: 5.1, 5.2, 10.1, 10.8_
  - [~] 9.2 Crear `src/components/guide/CategoryDetail.tsx` con `<h1>` nombre categoría, badge `binColor`, items aceptados (verde ✅), rechazados (rojo ❌), tips, lista de FAQs relacionadas con botón "Preguntar al bot" por FAQ que llama `onAskBot(question)`
    - _Requirements: 5.2, 5.4, 10.2_

- [ ] 10. Implementar componentes del chatbot
  - [~] 10.1 Crear `src/components/chatbot/SuggestedQuestions.tsx` con pills de 4–5 FAQs iniciales, `aria-label` por botón, min 44 px de alto
    - _Requirements: 10.8_
  - [~] 10.2 Crear `src/components/chatbot/MessageBubble.tsx` con alineación por role, fondo diferenciado, botones "¿Te fue útil? Sí / No" en mensajes bot con `aria-label`, callback `onFeedback`
    - _Requirements: 9.8, 9.9, 10.1_
  - [~] 10.3 Crear `src/components/chatbot/MessageList.tsx` con `<ul aria-live="polite" aria-label="Mensajes del chat">`, auto-scroll respetando `prefers-reduced-motion`, indicador de escritura (dots) suprimido cuando `prefers-reduced-motion`, `<SuggestedQuestions>` cuando `messages.length === 0`
    - _Requirements: 9.7, 10.4, 10.9_
  - [~] 10.4 Crear `src/components/chatbot/ChatInput.tsx` con `<input type="text">`, Enter para enviar, botón con `aria-label="Enviar mensaje"`, deshabilitado mientras `isTyping`, validación sin envíos vacíos
    - _Requirements: 10.1, 10.8_
  - [~] 10.5 Crear `src/components/chatbot/ChatWindow.tsx` con `role="dialog"`, `aria-label`, `aria-modal="true"`, `id="chat-panel"`, cabecera con "Limpiar conversación" y botón cerrar, focus trap (Tab / Shift+Tab / Escape), foco inicial en `chatInputRef`
    - _Requirements: 9.2, 9.3, 9.5, 10.3, 10.5_
  - [~] 10.6 Crear `src/components/chatbot/ChatWidget.tsx` con FAB `aria-expanded`, `aria-controls="chat-panel"`, sizing responsive (near-fullscreen en mobile, 380×520 px en desktop ≥md), monta `<ChatWindow>` cuando `isOpen`, gestiona foco en FAB al cerrar, usa el hook `useChatbot`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 10.3, 11.3, 11.4_

- [ ] 11. Implementar páginas y enrutamiento
  - [~] 11.1 Crear `src/pages/NotFoundPage.tsx` con `<h1>` "Página no encontrada" y link a inicio
    - _Requirements: 5.3, 10.2_
  - [~] 11.2 Crear `src/pages/GuidePage.tsx` con `<h1>` "Guía de reciclaje" y grid de las 7 `<CategoryCard>`
    - _Requirements: 5.1, 10.2_
  - [~] 11.3 Crear `src/pages/CategoryPage.tsx` usando `useParams` para obtener `categoryId`; si no existe → `<NotFoundPage>`; si existe → `<CategoryDetail>` con `relatedFaqs` filtradas; exponer `onAskBot` que llama `openChat` del contexto/hook
    - _Requirements: 5.2, 5.3, 5.4_
  - [~] 11.4 Crear `src/pages/HomePage.tsx` con `<h1>` hero, aviso municipal, grid de 7 `<CategoryCard>`, sección de 3 datos curiosos y botón "Abrir chatbot" que llama `openChat()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [~] 11.5 Crear `src/App.tsx` con `<HashRouter>`, `<Routes>` anidadas bajo `<Layout>`: index→`HomePage`, `guia`→`GuidePage`, `guia/:categoryId`→`CategoryPage`, `*`→`NotFoundPage`; actualizar `src/main.tsx` para montar `<App>`
    - _Requirements: 1.1_

- [~] 12. Checkpoint — Aplicación completa integrada
  - Ejecutar `npm run build`, `npm run typecheck` y `npm run lint`; corregir errores antes de las pruebas de componente.

- [ ] 13. Pruebas del componente ChatWidget
  - [~] 13.1 Crear `src/components/chatbot/ChatWidget.test.tsx` con pruebas RTL: abre panel al hacer clic en FAB, cierra con botón cerrar, cierra con Escape, envía mensaje de usuario y aparece en el chat, aparece respuesta del bot tras el indicador de escritura, se renderizan botones de preguntas sugeridas al inicio, "Limpiar conversación" borra mensajes
    - _Requirements: 12.4_
  - [ ]* 13.2 Verificar cobertura de `src/lib/chatbot/` ejecutando `npm run test:coverage` y confirmar >90% en branches, statements, functions y lines
    - _Requirements: 12.5_

- [ ] 14. Agregar `index.css` con soporte `prefers-reduced-motion`
  - [~] 14.1 Añadir en `src/index.css` el bloque `@media (prefers-reduced-motion: reduce)` que deshabilita animaciones y transiciones, además de `scroll-behavior: auto`
    - _Requirements: 10.9_

- [ ] 15. Crear README en español
  - [~] 15.1 Crear `README.md` en la raíz del proyecto con: descripción de EcoGuía, requisitos previos, instrucciones de instalación y scripts (`dev`, `build`, `preview`, `test`, `test:coverage`, `lint`, `typecheck`), estructura del proyecto y aviso municipal
    - _Requirements: 1.4_

- [~] 16. Checkpoint final — Suite completa verde
  - Ejecutar `npm run test`, `npm run test:coverage`, `npm run build`, `npm run lint` y `npm run typecheck`. Confirmar que todos pasan sin errores.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido, pero son recomendadas para cumplir el requisito de cobertura >90%.
- Los módulos `normalize.ts` y `engine.ts` son TypeScript puro (sin React) y pueden probarse con Vitest sin JSDOM.
- Las pruebas de propiedad en 3.2, 4.3 y 5.2 se consolidan en un único archivo `src/lib/chatbot/engine.test.ts`.
- `useChatbot` expone `openChat(text?)` para que `CategoryDetail` y `HomePage` puedan abrir el chatbot con un texto prellenado.
- Todo texto visible en la app debe estar en español.
- El `<ChatWidget>` siempre está montado en `<Layout>` para preservar el historial de conversación entre cambios de ruta.
- Los datos en `categories.json` y `faqs.json` deben ser reales y útiles para el contexto colombiano (bolsas blanca, negra y verde).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4", "1.5"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "4.1", "4.2"] },
    { "id": 3, "tasks": ["3.2", "4.3", "5.1"] },
    { "id": 4, "tasks": ["5.2", "7.1"] },
    { "id": 5, "tasks": ["8.1", "8.2", "9.1", "10.1", "10.2", "14.1"] },
    { "id": 6, "tasks": ["8.3", "9.2", "10.3", "10.4", "11.1"] },
    { "id": 7, "tasks": ["10.5", "11.2"] },
    { "id": 8, "tasks": ["10.6", "11.3", "11.4"] },
    { "id": 9, "tasks": ["11.5"] },
    { "id": 10, "tasks": ["13.1", "15.1"] },
    { "id": 11, "tasks": ["13.2"] }
  ]
}
```
