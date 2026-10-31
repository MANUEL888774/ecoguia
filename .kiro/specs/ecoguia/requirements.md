# Requirements Document

## Introduction

EcoGuía es una aplicación web de página única (SPA) educativa en español, orientada al sistema de manejo de residuos de Colombia (bolsas blanca, negra y verde). Permite a los ciudadanos consultar guías de reciclaje por categoría de material y obtener respuestas mediante un chatbot flotante basado en búsqueda difusa. La aplicación incluye aviso visible de que las reglas varían según el municipio. No requiere backend: todos los datos residen en archivos JSON dentro del proyecto.

## Glossary

- **EcoGuía**: La aplicación web SPA descrita en este documento.
- **SPA**: Single Page Application; aplicación web que carga una sola página HTML y actualiza el contenido dinámicamente.
- **Categoría**: Una de las siete clases de residuos gestionadas por EcoGuía (orgánicos, plástico, papel-cartón, vidrio, metales, peligrosos, electrónicos).
- **FAQ**: Pregunta frecuente almacenada en `faqs.json`, con pregunta, respuesta, palabras clave y referencia opcional a categoría.
- **Bot / Chatbot**: El componente flotante de EcoGuía que responde preguntas del usuario mediante búsqueda difusa sobre las FAQs.
- **BotResponse**: Estructura de datos que devuelve el motor de búsqueda; contiene tipo (`answer` o `fallback`), respuesta, FAQ coincidente y sugerencias.
- **Engine**: El módulo `engine.ts` que implementa la lógica de búsqueda del Bot, sin dependencias de React.
- **Normalize**: El módulo `normalize.ts` que convierte texto a minúsculas, elimina tildes y elimina signos de puntuación.
- **HashRouter**: Estrategia de enrutamiento de React Router basada en el fragmento hash de la URL, compatible con servidores estáticos.
- **Fuse.js**: Biblioteca de búsqueda difusa utilizada por el Engine.
- **WCAG 2.1 AA**: Pautas de Accesibilidad para el Contenido Web, nivel AA, versión 2.1.
- **prefers-reduced-motion**: Media query CSS que indica que el usuario prefiere reducir animaciones.

## Requirements

### Requirement 1: Stack tecnológico y configuración del proyecto

**User Story:** Como desarrollador, quiero que EcoGuía use React 18 + Vite + TypeScript estricto con Tailwind CSS v3, de modo que el proyecto sea mantenible y tipado de extremo a extremo.

#### Acceptance Criteria

1. THE EcoGuía SHALL use React 18, Vite, TypeScript with `strict: true` in `tsconfig.json`, Tailwind CSS v3 configured via `tailwind.config.ts`, React Router with HashRouter, Fuse.js, Vitest, and React Testing Library as its technology stack.
2. THE EcoGuía SHALL store all application data in `src/data/categories.json` and `src/data/faqs.json` without requiring a backend service.
3. THE EcoGuía SHALL configure ESLint and Prettier for code quality enforcement.
4. THE EcoGuía SHALL pass `build`, `lint`, `typecheck`, and `test` scripts without errors.

---

### Requirement 2: Modelo de datos

**User Story:** Como desarrollador, quiero que los tipos `Category`, `Faq`, `BotResponse` y `Message` estén definidos en `src/types/index.ts`, de modo que el compilador detecte inconsistencias en tiempo de desarrollo.

#### Acceptance Criteria

1. THE EcoGuía SHALL define a `Category` type with fields: `id` (string), `name` (string), `color` (string), `icon` (string), `description` (string), `binColor` (string), `accepts` (string[]), `rejects` (string[]), and `tips` (string[]).
2. THE EcoGuía SHALL define a `Faq` type with fields: `id` (string), `question` (string), `answer` (string), `keywords` (string[]), `categoryId` (optional string), and `related` (optional string[]).
3. THE EcoGuía SHALL define a `BotResponse` type with fields: `type` (`'answer' | 'fallback'`), `answer` (string), `matchedFaq` (optional Faq), and `suggestions` (Faq[]).
4. THE EcoGuía SHALL define a `Message` type with fields: `id` (string), `role` (`'user' | 'bot'`), `text` (string), `timestamp` (number), `faqId` (optional string), and `categoryId` (optional string).

---

### Requirement 3: Contenido de datos en español para Colombia

**User Story:** Como ciudadano colombiano, quiero que las categorías y FAQs tengan contenido real en español, de modo que pueda obtener información práctica sobre el manejo de residuos.

#### Acceptance Criteria

1. THE EcoGuía SHALL include exactly 7 categories in `categories.json`: orgánicos, plástico, papel-cartón, vidrio, metales, peligrosos, electrónicos; each with a unique `id`.
2. THE EcoGuía SHALL provide at least 6 items in the `accepts` array, at least 4 items in the `rejects` array, and at least 3 items in the `tips` array for each category, written in Spanish.
3. THE EcoGuía SHALL include at least 30 FAQs in `faqs.json`, each with at least 4 keywords, written in Spanish and relevant to the Colombian waste management context.
4. THE EcoGuía SHALL include at least 5 FAQs without a `categoryId` (general FAQs).
5. IF a FAQ's `categoryId` field is present, THEN THE EcoGuía SHALL reference only an `id` that exists in `categories.json`.
6. IF a FAQ's `related` array is present, THEN THE EcoGuía SHALL reference only `id` values that exist in `faqs.json`.

---

### Requirement 4: Página de inicio

**User Story:** Como visitante, quiero ver una página de inicio con sección hero, acceso rápido a las 7 categorías y datos curiosos, de modo que pueda orientarme rápidamente.

#### Acceptance Criteria

1. THE EcoGuía SHALL render a hero section with a heading (`h1`) that describes the application on the home page at route `/`.
2. THE EcoGuía SHALL render a quick-access card for each of the 7 categories on the home page, linking to `/guia/:categoryId`.
3. THE EcoGuía SHALL display a visible notice on the home page stating that recycling rules vary by municipality in Colombia.
4. THE EcoGuía SHALL render exactly 3 curiosity data items on the home page.
5. THE EcoGuía SHALL render a button on the home page that opens the Bot chat panel when clicked.

---

### Requirement 5: Guía de reciclaje

**User Story:** Como usuario, quiero explorar la guía de reciclaje por categoría para saber qué materiales van en cada bolsa.

#### Acceptance Criteria

1. THE EcoGuía SHALL render a list of all 7 category cards at route `/guia`.
2. WHEN a user navigates to `/guia/:categoryId` with a valid `categoryId`, THE EcoGuía SHALL render the category detail page showing the category name, description, accepted items (styled in green), rejected items (styled in red), tips, and related FAQs.
3. WHEN a user navigates to `/guia/:categoryId` with an invalid `categoryId`, THE EcoGuía SHALL render the NotFoundPage component.
4. THE EcoGuía SHALL render a "Preguntar al bot" button for each related FAQ on the category detail page, which opens the Bot chat panel and pre-fills the FAQ question when clicked.

---

### Requirement 6: Motor de búsqueda del chatbot

**User Story:** Como usuario, quiero que el chatbot entienda mis preguntas aunque tenga errores de escritura o use sinónimos, de modo que obtenga respuestas útiles.

#### Acceptance Criteria

1. THE Engine SHALL expose a `search(query: string, faqs: Faq[]): BotResponse` function with no React dependencies.
2. WHEN `search` is called, THE Engine SHALL normalize the query using the Normalize module before searching.
3. THE Engine SHALL use Fuse.js with `threshold: 0.4`, `includeScore: true`, and a combined weight of `0.5` for the `question` and `keywords` fields to find matching FAQs.
4. WHEN Fuse.js finds a match meeting the threshold, THE Engine SHALL return a `BotResponse` with `type: 'answer'`, the matched FAQ's answer, the matched FAQ object, and up to 3 related FAQs as suggestions without duplicates.
5. WHEN Fuse.js finds no match meeting the threshold, THE Engine SHALL return a `BotResponse` with `type: 'fallback'`, a friendly message in Spanish, and exactly 3 unique FAQ suggestions.
6. WHEN `search` is called with an empty string, THE Engine SHALL return a `BotResponse` with `type: 'fallback'`.

---

### Requirement 7: Módulo de normalización

**User Story:** Como desarrollador, quiero un módulo de normalización de texto puro para preprocesar consultas, de modo que las búsquedas sean tolerantes a variaciones ortográficas.

#### Acceptance Criteria

1. THE Normalize module SHALL export a `normalize(text: string): string` function.
2. WHEN `normalize` is called with text containing uppercase letters, THE Normalize module SHALL return the text converted to lowercase.
3. WHEN `normalize` is called with text containing accented characters (tildes), THE Normalize module SHALL return the text with accents removed.
4. WHEN `normalize` is called with text containing punctuation signs, THE Normalize module SHALL return the text with those signs removed.
5. WHEN `normalize` is called with text containing multiple consecutive spaces, THE Normalize module SHALL return the text with consecutive spaces collapsed to a single space.

---

### Requirement 8: Hook useChatbot

**User Story:** Como desarrollador, quiero un hook que encapsule el estado del chatbot, de modo que los componentes no gestionen la lógica de conversación directamente.

#### Acceptance Criteria

1. THE `useChatbot` hook SHALL manage the conversation history as an array of `Message` objects in React state.
2. THE `useChatbot` hook SHALL expose a `sendMessage(text: string): void` function that appends the user message, triggers the Engine's `search`, and appends the bot response.
3. THE `useChatbot` hook SHALL expose a `clearHistory(): void` function that resets the conversation history to an empty array.
4. WHILE the bot is preparing a response, THE `useChatbot` hook SHALL expose an `isTyping` boolean set to `true` for a duration between 300 ms and 500 ms before appending the bot message.

---

### Requirement 9: Componente ChatWidget (bot flotante)

**User Story:** Como usuario, quiero acceder al chatbot desde cualquier página sin perder el historial de conversación, de modo que pueda hacer varias preguntas durante mi visita.

#### Acceptance Criteria

1. THE ChatWidget SHALL render as a floating element visible on all routes of EcoGuía.
2. WHEN the user clicks the open button on the ChatWidget, THE ChatWidget SHALL display the chat panel.
3. WHEN the user clicks the close button or presses the Escape key while the chat panel is open, THE ChatWidget SHALL hide the chat panel.
4. THE ChatWidget SHALL preserve the conversation history across route changes within the same browser session.
5. THE ChatWidget SHALL render a "Limpiar conversación" button that clears the conversation history when clicked.
6. WHILE the bot is typing (`isTyping` is true), THE ChatWidget SHALL display a typing indicator for between 300 ms and 500 ms.
7. WHEN a new message is added to the chat panel, THE ChatWidget SHALL automatically scroll to the latest message.
8. WHEN the bot returns a response, THE ChatWidget SHALL render "¿Te fue útil?" buttons with "Sí" and "No" options.
9. WHEN the user clicks "No" on the "¿Te fue útil?" interaction, THE ChatWidget SHALL display related FAQ suggestion buttons.

---

### Requirement 10: Accesibilidad (WCAG 2.1 AA)

**User Story:** Como usuario con discapacidad, quiero que EcoGuía sea completamente accesible con teclado y tecnologías de asistencia, de modo que pueda usar la aplicación sin barreras.

#### Acceptance Criteria

1. THE EcoGuía SHALL use semantic HTML elements throughout all pages and components.
2. THE EcoGuía SHALL render exactly one `h1` element per page.
3. THE ChatWidget SHALL apply `role="dialog"` to the chat panel element.
4. THE ChatWidget SHALL include an `aria-live="polite"` region for new bot messages.
5. WHEN the chat panel opens, THE ChatWidget SHALL move keyboard focus to the chat input field.
6. THE EcoGuía SHALL include a visible "Saltar al contenido" skip link as the first focusable element on every page.
7. THE EcoGuía SHALL maintain a minimum color contrast ratio of 4.5:1 for all text and interactive elements, in compliance with WCAG 2.1 AA.
8. THE EcoGuía SHALL render all interactive elements with a minimum touch target size of 44×44 CSS pixels.
9. WHERE `prefers-reduced-motion` is active, THE EcoGuía SHALL disable or reduce CSS animations and transitions.

---

### Requirement 11: Diseño responsive

**User Story:** Como usuario de móvil, quiero que EcoGuía funcione correctamente desde 360 px de ancho, de modo que pueda usarla desde cualquier dispositivo.

#### Acceptance Criteria

1. THE EcoGuía SHALL apply a mobile-first CSS approach using Tailwind CSS utility classes.
2. THE EcoGuía SHALL render all layouts correctly at a minimum viewport width of 360 px.
3. WHILE the viewport width is less than the tablet breakpoint, THE ChatWidget SHALL display the chat panel in a near-full-screen layout.
4. WHILE the viewport width is equal to or greater than the tablet breakpoint, THE ChatWidget SHALL display the chat panel as a panel of approximately 380 px width.

---

### Requirement 12: Pruebas automatizadas

**User Story:** Como desarrollador, quiero una suite de pruebas automatizadas con cobertura superior al 90 % en `lib/chatbot`, de modo que los cambios futuros no rompan silenciosamente el comportamiento del motor.

#### Acceptance Criteria

1. THE EcoGuía SHALL include unit tests for `normalize.ts` covering: accent removal, uppercase conversion, space normalization, and punctuation removal.
2. THE EcoGuía SHALL include unit tests for `engine.ts` covering: exact match, typo tolerance (e.g., "botela de bidrio"), synonym recognition (e.g., "icopor"), fallback with exactly 3 suggestions, empty query, and no duplicate suggestions.
3. THE EcoGuía SHALL include data integrity tests verifying: unique FAQ ids, unique category ids, all `categoryId` references in FAQs point to existing category ids, all `related` references in FAQs point to existing FAQ ids, at least 30 FAQs, and at least 4 keywords per FAQ.
4. THE EcoGuía SHALL include component tests for `ChatWidget` covering: opens chat panel on button click, closes chat panel on close button click, sends a user message, receives a bot response, and renders suggested question buttons.
5. THE EcoGuía SHALL achieve greater than 90% code coverage for all files within `src/lib/chatbot/`.
