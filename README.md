# AI Studio Apps — Enterprise Multimodal App Gallery & Next.js TypeScript Workbench

Production-grade web application recreating the **Google AI Studio Apps (`aistudio.google.com/apps`)** experience. Built with **TypeScript**, **Tailwind CSS v4**, and modular **Next.js 15 App Router** reference templates, featuring an interactive Prompt-to-App Workbench, Next.js source code inspector, system architecture & security documentation, and an automated GitHub Actions CI/CD deployment pipeline configurator.

---

## 1. Key Capabilities

1. **Curated Starter Applications Catalog (10 Reference Apps)**:
   - *Spatial Understanding 3D* (`gemini-2.5-pro` + Three.js bounding volume projection)
   - *Prompt-to-Next.js Architect* (`gemini-2.5-pro` + Server Actions & WCAG AA audit)
   - *Multimodal Live Audio & Vision Stream* (`gemini-2.5-flash` + WebRTC/WebSocket 24kHz PCM)
   - *Video Temporal Frame Analyzer* (1M token context timeline indexing)
   - *Geospatial & Maps Grounding Explorer* (Google Search & Maps Grounding citations)
   - *Chameleon Adaptive Interface Engine* (Dynamic layout binding & WCAG AAA tokens)
   - *Document Schema & Ledger Extractor* (Zero-shot BOM/invoice JSON schema normalization)
   - *Acoustic Diarization & Speech Telemetry* (`gemini-2.5-flash-lite` multi-speaker diarization)
   - *Deterministic Code Execution Sandbox* (Monte Carlo CVaR & quantitative modeling)
   - *Enterprise Telemetry & Anomaly Matrix* (OpenTelemetry trace & SQL plan correlation)
2. **Interactive Studio Workbench & Sandbox**:
   - Execute preset or custom prompts with live token estimation, cost per 1,000 runs, and latency telemetry (`tabular-nums`).
   - Inspect and copy multi-file Next.js 15 App Router TypeScript code (`app/api/*/route.ts`, client components, and server actions).
   - Tune model parameters (`gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `imagen-3.0-generate-002`, Temperature, Top-P, Max Output Tokens, System Instructions, Strict JSON Mode, and Grounding).
3. **Workspace & App Synthesis**:
   - Fork any reference app into your personal Workspace or synthesize a new application from a natural-language specification with strict form validation.
4. **Enterprise Architecture, Security & CI/CD Pipeline**:
   - Built-in technical handover manual covering Next.js 15 server secret isolation, Content-Security-Policy (CSP) headers, Core Web Vitals budgets, and exportable GitHub Actions (`.github/workflows/deploy.yml`) pipelines for Google Cloud Run, Vercel Edge, or Kubernetes.

---

## 2. Security & Accessibility Standards

- **Zero Client-Side Secret Exposure**: All generated Next.js server routes read `process.env.GEMINI_API_KEY` exclusively on the server.
- **WCAG 2.1 AA Accessibility**: Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<dialog>`), high-contrast dual theme (Dark & Light surfaces), keyboard focus visibility, and explicit `aria-label` attributes on all icon controls.
- **Corporate Visual Discipline**: Uses crisp `Plus Jakarta Sans` + `JetBrains Mono` (`tabular-nums`) typography, refined ingredient gradients, Lucide vector icons, and zero emojis.

---

## 3. Local Development, Testing & Verification

```bash
# 1. Run deterministic unit tests (Node built-in test runner via tsx)
npx --yes tsx --test src/utils/studioLogic.test.ts

# 2. Run strict TypeScript typechecking
npm run lint

# 3. Build production bundle
npm run build

# 4. Start development server on port 3000
npm run dev
```
