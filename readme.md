# 🌐 PLASTIVIZE

<div align="center">

![PLASTIVIZE Banner](https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80)

**AI-Powered Circular Economy & Plastic Intelligence Platform**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-CDN-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Transforming consumer plastic waste into actionable circular value through multimodal machine vision, geospatial intelligence, and gamified sustainability.*

</div>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
  - [Architectural Blueprint](#1-architectural-blueprint)
  - [Core Architectural Layers](#2-core-architectural-layers)
  - [Data Flow & Lifecycle Sequences](#3-data-flow--lifecycle-sequences)
- [Key Feature Modules](#-key-feature-modules)
- [Polymer & Material Identification Engine](#-polymer--material-identification-engine)
- [Agentic Voice & Conversational Assistant](#-agentic-voice--conversational-assistant)
- [3D Geospatial Environmental Globe](#-3d-geospatial-environmental-globe)
- [State Management & Data Architecture](#-state-management--data-architecture)
- [Directory Structure](#-directory-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Build, Lint & Deployment](#-build-lint--deployment)
- [Engineering Roadmap](#-engineering-roadmap)
- [Team & Acknowledgments](#-team--acknowledgments)

---

## 🌍 Executive Summary

Over **380 million tons** of plastic are produced annually, with more than 50% designed for single-use consumption. Less than 9% of global plastic waste is successfully recycled, driven largely by:
1. **Polymer identification barriers**: Consumer confusion surrounding SPI Resin Identification Codes (#1 to #7).
2. **Local regulatory fragmentation**: Discrepancies between municipal recycling facility capabilities and package labeling.
3. **Absence of immediate upcycling pathways**: Lack of guidance on creative, accessible, and durable domestic reuse.

**PLASTIVIZE** bridges this information asymmetry by deploying a client-first, cloud-augmented Progressive Web Architecture powered by **Google Gemini 3.8 Flash**. Users can capture an image of any discarded item to immediately receive resin identification, local regulatory compliance instructions, decomposition lifecycle analytics, carbon emission offsets, and tailored DIY upcycling blueprints.

---

## 🏛️ System Architecture

PLASTIVIZE is built on a high-performance **modular single-page application (SPA)** architecture, emphasizing low-latency multimodal processing, offline-tolerant state caching, and responsive spatial data rendering.

### 1. Architectural Blueprint

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                             CLIENT LAYER (BROWSER)                          │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │                                                                             │
 │  ┌───────────────────────────────────────────────────────────────────────┐  │
 │  │                         Presentation Layer                            │  │
 │  │  App Entry  │  Navigation Router  │  Tailwind Styling & Animations     │  │
 │  └───────┬──────────────────────┬────────────────────────┬───────────────┘  │
 │          │                      │                        │                  │
 │  ┌───────▼──────────────────────▼────────────────────────▼───────────────┐  │
 │  │                      Contextual State Pipeline                        │  │
 │  │  UserDataContext │ NavigationContext │ LanguageContext │ ToastContext │  │
 │  └───────┬──────────────────────┬────────────────────────┬───────────────┘  │
 │          │                      │                        │                  │
 │  ┌───────▼──────────────────────▼────────────────────────▼───────────────┐  │
 │  │                         Feature Controllers                           │  │
 │  │   Scanner   │ Dashboard │ Calculator │ Marketplace │ Database │ Globe │  │
 │  │      │           │            │             │           │        │    │  │
 │  └──────┼───────────┼────────────┼─────────────┼───────────┼────────┼────┘  │
 │         │           │            │             │           │        │       │
 │  ┌──────▼───────────▼────────────▼─────────────▼───────────▼────────▼────┐  │
 │  │                        Services & Subsystems                          │  │
 │  │  ┌───────────────────────┐  ┌──────────────────────┐  ┌────────────┐  │  │
 │  │  │   geminiService.ts    │  │   youtubeService.ts  │  │ Web Speech │  │  │
 │  │  │ (Structured JSON Gen) │  │  (DIY Tutorials API) │  │  TTS/STT   │  │  │
 │  │  └───────────┬───────────┘  └──────────────────────┘  └─────┬──────┘  │  │
 │  └──────────────┼──────────────────────────────────────────────┼─────────┘  │
 └─────────────────┼──────────────────────────────────────────────┼────────────┘
                   │ HTTPS / JSON                                 │ OS Speech Audio
                   ▼                                              ▼
 ┌──────────────────────────────────────┐             ┌────────────────────────┐
 │        GOOGLE GEMINI API             │             │   HARDWARE INTERFACES  │
 │      (gemini-3.8-flash)              │             │  • Camera (MediaStream)│
 │  • Multimodal Vision Tokenizer       │             │  • Microphone (STT)    │
 │  • Schema-Enforced JSON Output       │             │  • Speakers (TTS)      │
 │  • Agentic Function Calling          │             │  • WebGL GPU Pipeline  │
 └──────────────────────────────────────┘             └────────────────────────┘
```

---

### 2. Core Architectural Layers

#### A. Presentation & View Orchestration (`/App.tsx`, `/components/*`)
- **Dynamic View Controller**: Pure client-side state machine (`activeView`: `home` | `scanner` | `dashboard` | `calculator` | `chatbot` | `community` | `globe` | `profile` | `guide` | `marketplace` | `database`).
- **Responsive Layout Shell**: Dual-mode rendering accommodating public discovery landing screens and authenticated private workspaces with collapsible side navigation.
- **Micro-Interaction System**: Hardware-accelerated CSS keyframe animations for the splash sequence, scanning HUD, glassmorphism overlays, and real-time audio pulsation.

#### B. Contextual State Pipeline (`/contexts/*`)
- **`UserDataContext`**: Manages authenticated session persistence, historical scans, reward points, badges unlocked, items diverted from landfills, and estimated kilograms of CO₂ offset.
- **`LanguageContext`**: Manages multi-dialect localization state supporting 12 Indian and international languages with seamless real-time translation bindings.
- **`NavigationContext`**: Decouples in-app route dispatching, permitting conversational AI function declarations to dynamically navigate the user across application modules.
- **`ToastContext`**: Non-blocking asynchronous notification queue for system alerts, network disconnections, and gamification milestones.

#### C. AI Multimodal & Reasoning Layer (`/services/geminiService.ts`)
- **Model Engine**: Grounded on Google’s `gemini-3.8-flash` model utilizing the modern `@google/genai` TypeScript SDK.
- **Strict Schema Enforcement**: All multimodal generation passes JSON schemas (`Type.OBJECT`, `Type.ARRAY`) guaranteeing structured output parsing without hallucinated formatting tokens.
- **Safe Lazy Client Initialization**: Isolates SDK instantiation to prevent runtime script initialization failures when environment variables are dynamically loaded or restored.
- **Resilient Fallback Hierarchy**: Implements automated graceful degradation with curated data caches if network connectivity or upstream APIs experience latency.

#### D. Geospatial 3D WebGL Pipeline (`/components/Globe.tsx`)
- Built upon `react-globe.gl` and `three.js`.
- Renders an interactive 3D coordinate sphere displaying global plastic waste density heatmaps, coastal debris accumulation vectors, and country-level recycling infrastructure stats.
- Features raycasted coordinate selection: tapping any latitude/longitude coordinates triggers an AI-powered geocoding and environmental analysis prompt.

#### E. Speech & Natural Interaction Engine (`/hooks/useChat.ts`)
- **Speech Recognition (STT)**: Hooks into `window.SpeechRecognition` / `webkitSpeechRecognition` with locale-mapped BCP-47 language codes.
- **Speech Synthesis (TTS)**: Advanced speech queue with automated natural-voice scoring:
  - Filters out legacy mechanical synthesizers (`eSpeak`, robotic desktop voices).
  - Prioritizes cloud neural engines (`Natural`, `Google`, `Neural`, `Enhanced`).
  - Sets tuned human cadence (`rate: 0.96`, `pitch: 1.02`) and pre-cleans markdown syntax prior to utterance creation.
  - Implements intelligent interaction gating: never triggers unprompted audio during initial application load.

---

### 3. Data Flow & Lifecycle Sequences

#### Image Classification Lifecycle
```
[User Camera / File Upload]
       │
       ▼
1. FileReader encodes binary buffer to Base64 (inlineData)
       │
       ▼
2. Gemini Multimodal Call (gemini-3.8-flash)
   Headers: Application-JSON Schema (plasticType, recyclability, decomposition, CO2)
       │
       ▼
3. JSON Parsed & Validated against TypeScript contract
       │
       ├────────────────────────────────────────┬────────────────────────────────────────┐
       ▼                                        ▼                                        ▼
[Update User Activity]                  [Query Upcycling Ideas]                 [Query Recycling Rules]
• +1 Item Diverted                      • getReuseIdeas(plasticType)            • getRecyclingRules(type, loc)
• +Points Added to Profile              • Generates 3 DIY Ideas                 • Regional municipal instructions
• Recalculate Dashboard Metric          • Binds to YouTube DIY Tutorials
```

#### Conversational Agent with Function Calling Loop
```
[User Voice / Text Prompt] ──▶ [Chat Session (gemini-3.8-flash)]
                                      │
                                      ▼
                        Did Model Request Tool Call?
                       ┌──────────────┴──────────────┐
                    [YES]                          [NO]
                      │                              │
         ┌────────────┼────────────┐                 ▼
         ▼            ▼            ▼          Emit bot response text
    navigateTo   getRules   searchYouTube            │
         │            │            │                 ▼
     Execute      Execute      Execute        Run Natural TTS Engine
    In-App Route   Rules DB    YouTube API    (if audio not muted)
         │            │            │
         └────────────┬────────────┘
                      ▼
        Return FunctionResponse Part
        Back to Model for Final Output
```

---

## 💎 Key Feature Modules

| Module | Location | Description | Technology |
| :--- | :--- | :--- | :--- |
| **Multimodal Scanner** | `/components/Scanner.tsx` | Instant camera snapshot or image upload; analyzes polymer type, confidence score, decomposition lifespan, and carbon footprint. | `@google/genai`, HTML5 MediaDevices |
| **Sustainability Dashboard** | `/components/Dashboard.tsx` | Visualizes lifetime plastic diverted, carbon emissions prevented, recycling streaks, and categorized breakdown. | `recharts`, Context Store |
| **Plastic Footprint Calculator** | `/components/Calculator.tsx` | Quantitative consumption audit assessing weekly bottles, bags, and containers against national benchmark data. | Gemini Reasoning Engine |
| **3D Global Waste Globe** | `/components/Globe.tsx` | Interactive 3D planetary globe showing localized plastic pollution vectors and macro-waste trends. | `react-globe.gl`, `three.js` |
| **Upcycling Marketplace** | `/components/Marketplace.tsx` | Community catalog of recycled merchandise and upcycled artisan creations with category filtering. | React Functional Components |
| **Polymer Material Database** | `/components/MaterialDatabase.tsx` | Comprehensive encyclopedia of plastics (#1 to #7) and biodegradable bio-polymer alternatives (PLA, PHA). | Gemini Material Science Prompts |
| **Conversational Assistant** | `/components/ChatbotWidget.tsx` | Context-aware AI assistant capable of in-app navigation, YouTube tutorial lookup, and voice conversation. | Tool Calling, Web Speech API |
| **Community Challenges** | `/components/Community.tsx` | Gamified leaderboards, milestone badges, and regional environmental cleanup drives. | Gamification Engine |

---

## 🔬 Polymer & Material Identification Engine

PLASTIVIZE recognizes and delivers contextual disposal intelligence across the entire SPI Resin Identification spectrum:

```
  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
  │  #1    │  │  #2    │  │  #3    │  │  #4    │  │  #5    │  │  #6    │  │  #7    │
  │  PET   │  │  HDPE  │  │  PVC   │  │  LDPE  │  │   PP   │  │   PS   │  │ OTHER  │
  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘
   Bottles,    Detergent   Piping,     Grocery     Yogurt      Styrofoam,  Multi-layer
   Packaging   Jug, Caps   Fittings    Film, Bags  Tubs, Caps  Cutlery     Polymers
```

For every classification, the system determines:
1. **Polymer Taxonomy**: Primary chemical identification code, density characteristics, and industrial resin classification.
2. **Decomposition Trajectory**: Estimated degradation timeframe in marine vs. terrestrial soil environments (e.g., 450 years for PET).
3. **Emissions Impact**: Equivalent kilograms of greenhouse gases saved when diverted to high-grade mechanical recycling.
4. **Bio-Synthesized Alternatives**: Suggested sustainable replacements (e.g., Polylactic Acid / PLA, Polyhydroxyalkanoates / PHA, mycelium packaging).

---

## 🗣️ Agentic Voice & Conversational Assistant

The conversational agent integrates bidirectional multimodal voice communication:

- **Natural Speech Pipeline**:
  - Automatically identifies available high-quality voices matching the user's active language code.
  - Prioritizes modern neural voices (`Natural`, `Neural`, `Google`, `Enhanced`) over legacy robotic system synthesizers.
  - Normalizes markdown syntax into natural spoken prose.
  - Interactive audio toggle in the chat interface permits instant muting/unmuting with individual bubble replay buttons.
- **Function Calling Catalog**:
  1. `navigateTo(view)`: Navigates the user to specific workspace pages (`calculator`, `marketplace`, `scanner`, `globe`).
  2. `getRecyclingRules(plasticType, location)`: Retrieves regional municipal recycling mandates.
  3. `searchYouTube(query)`: Finds DIY upcycling and craft tutorials for specific plastic items.

---

## 🗄️ Directory Structure

```
├── assets/                       # Static binary assets and demo imagery
│   └── bottle-image.ts           # Pre-loaded vector and reference assets
├── components/                   # React presentation and feature components
│   ├── auth/                     # Authentication modal and session interfaces
│   ├── common/                   # Reusable UI primitives (Buttons, Cards, Toasts, Loaders)
│   ├── data/                     # Seed coordinates, cities, and marketplace items
│   ├── icons/                    # Scalable Vector Graphics (SVG) icon library
│   ├── About.tsx                 # Project mission and methodology view
│   ├── Calculator.tsx            # Personal consumption footprint calculator
│   ├── Chatbot.tsx               # Full-page conversational assistant
│   ├── ChatbotWidget.tsx         # Persistent floating chatbot overlay
│   ├── Community.tsx             # Gamified leaderboards and environmental challenges
│   ├── Contact.tsx               # Feedback and support interface
│   ├── Dashboard.tsx             # Sustainability metrics and badge awards
│   ├── Footer.tsx                # Application footer
│   ├── Globe.tsx                 # Interactive 3D WebGL global waste visualizer
│   ├── Header.tsx                # Top navigation header
│   ├── Home.tsx                  # Authenticated user dashboard landing
│   ├── Landing.tsx               # Public landing screen with curated insights
│   ├── LeftPanel.tsx             # Collapsible primary sidebar navigation
│   ├── Marketplace.tsx           # Upcycled goods and circular marketplace
│   ├── MaterialDatabase.tsx      # Comprehensive polymer and alternative database
│   ├── Profile.tsx               # User account settings, milestones, and credentials
│   ├── RecentActivity.tsx        # Audit log of recent scans and recycling actions
│   ├── RecyclingGuide.tsx        # Step-by-step sorting and decontamination guide
│   ├── Scanner.tsx               # Real-time computer vision camera scanner
│   └── SplashScreen.tsx          # Initial brand introduction animation
├── contexts/                     # React Context providers for global state
│   ├── LanguageContext.tsx       # Localization state (12 languages)
│   ├── NavigationContext.tsx     # Application router state machine
│   ├── ToastContext.tsx          # Toast notification dispatching
│   └── UserDataContext.tsx      # User profile, statistics, and scan history
├── hooks/                        # Custom React hooks
│   ├── useChat.ts                # Gemini chat session, STT, and natural voice TTS
│   └── useTranslation.ts         # Localization key-lookup bindings
├── lib/                          # Localization dictionaries and utility helpers
│   └── translations.ts           # Multi-language translation maps
├── services/                     # External API client integrations
│   ├── geminiService.ts          # Google Gemini 3.8 Flash SDK operations
│   └── youtubeService.ts         # Video search and DIY tutorial integration
├── App.tsx                       # Root view switcher and routing shell
├── index.html                    # HTML entry point, fonts, and meta tags
├── index.tsx                     # React DOM root mounting and providers
├── metadata.json                 # AI Studio permissions and system capability tags
├── package.json                  # NPM dependencies, scripts, and engine specs
├── tsconfig.json                 # TypeScript compiler configuration
├── types.ts                      # Global TypeScript interface contracts
└── vite.config.ts                # Vite dev server and environment bundler config
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **Modern Web Browser**: Chrome, Edge, Safari, or Firefox with WebGL and Web Speech API support

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/plastivize.git
   cd plastivize
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Get an API key from [Google AI Studio](https://aistudio.google.com/))*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

---

## ⚙️ Environment Configuration

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for multimodal vision, reasoning, and chat. | **Yes** | `""` |

> **Note on Security**: In production deployments, client-side requests are proxied via secure server endpoints to keep API keys protected.

---

## 🧪 Build, Lint & Deployment

### TypeScript Type-Checking & Linting
Validate the codebase for type safety and syntax errors:
```bash
npm run lint
```

### Production Build
Compile and bundle the production assets with tree-shaking and minification:
```bash
npm run build
```
Built assets will be emitted to the `/dist` directory.

### Preview Production Build
Serve the optimized build locally:
```bash
npm run preview
```

---

## 🗺️ Engineering Roadmap

- [x] Multimodal image plastic classification (`gemini-3.8-flash`)
- [x] Agentic function calling for in-app navigation and YouTube tutorials
- [x] Interactive 3D WebGL Globe with real-time geospatial coordinate analysis
- [x] Multi-dialect Indian and international language localization (12 languages)
- [x] High-fidelity natural voice synthesis with user interaction gating
- [ ] **Phase 2**: Barcode and packaging OCR parsing for direct brand sustainability ratings
- [ ] **Phase 3**: GPS-driven municipal drop-off center locator with operating hours and accepted material filters
- [ ] **Phase 4**: PWA offline caching with on-device lightweight TensorFlow.js edge model classification
- [ ] **Phase 5**: Web3-backed verified carbon credits for verified community recycling drop-offs

---

## 👥 Team & Acknowledgments

### Project Leads
- **Namburi Rishika** — Founder & Product Lead
- **Nooka Nikshith** — Lead AI Engineer & System Architect

### Built With & Supported By
- [Google AI Studio](https://aistudio.google.com/) — Gemini 3.8 Flash SDK
- [United Nations Environment Programme (UNEP)](https://www.unep.org/) — Global Plastic Pollution Benchmarks
- [Three.js](https://threejs.org/) & [react-globe.gl](https://github.com/vasturiano/react-globe.gl) — WebGL 3D Visualization

---

<div align="center">
  <p>Made with 💚 for a cleaner, circular planet.</p>
  <p>© 2025-2026 PLASTIVIZE. All rights reserved.</p>
</div>
