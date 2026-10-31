# 🌿 EcoGuía

Aplicación web educativa sobre reciclaje para ciudadanos colombianos. Permite consultar qué materiales van en cada tipo de bolsa de residuos, explorar las 7 categorías de reciclaje y hacer preguntas al chatbot integrado con búsqueda difusa.

> ⚠️ **Las reglas de reciclaje varían según el municipio en Colombia.** Consulta siempre las indicaciones de tu empresa de aseo local.

---

## Características

- 7 categorías de reciclaje con materiales aceptados, rechazados y consejos
- Chatbot flotante con búsqueda difusa (Fuse.js) sobre +30 preguntas frecuentes en español
- Navegación por rutas con React Router (HashRouter)
- 100% sin backend — SPA estática desplegable en cualquier CDN
- Accesible: skip link, ARIA roles, foco gestionado, soporte `prefers-reduced-motion`
- Diseño mobile-first con Tailwind CSS v3

---

## Requisitos previos

- Node.js ≥ 18
- npm ≥ 9

---

## Instalación

```bash
npm install
```

---

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Previsualización del build de producción |
| `npm test` | Ejecuta la suite de pruebas una vez |
| `npm run test:coverage` | Tests con reporte de cobertura (objetivo >90% en `src/lib/chatbot/`) |
| `npm run typecheck` | Verificación de tipos TypeScript sin emitir archivos |
| `npm run lint` | Análisis estático con ESLint |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   ├── guide/           # CategoryCard, CategoryDetail
│   └── chatbot/         # ChatWidget, ChatWindow, MessageList,
│                        # MessageBubble, ChatInput, SuggestedQuestions
├── pages/               # HomePage, GuidePage, CategoryPage, NotFoundPage
├── data/
│   ├── categories.json  # 7 categorías de reciclaje
│   └── faqs.json        # ≥30 preguntas frecuentes
├── lib/
│   └── chatbot/
│       ├── engine.ts    # Motor de búsqueda difusa (TypeScript puro)
│       ├── normalize.ts # Normalización de texto (sin tildes, minúsculas)
│       └── engine.test.ts
├── hooks/
│   └── useChatbot.ts    # Estado y lógica del chatbot
├── types/
│   └── index.ts         # Interfaces: Category, Faq, BotResponse, Message
├── test/
│   └── setup.ts         # Configuración de @testing-library/jest-dom
├── App.tsx              # HashRouter + rutas
└── main.tsx             # Punto de entrada
```

---

## Categorías de reciclaje

| ID | Nombre | Bolsa |
|---|---|---|
| `organicos` | Orgánicos | 🟢 Verde |
| `plastico` | Plástico | ⚪ Blanca |
| `papel-carton` | Papel y Cartón | ⚪ Blanca |
| `vidrio` | Vidrio | ⚪ Blanca |
| `metales` | Metales | ⚪ Blanca |
| `peligrosos` | Peligrosos | ⚫ Negra |
| `electronicos` | Electrónicos (RAEE) | ⚫ Negra |

---

## Licencia

MIT
