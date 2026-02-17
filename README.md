# SINCOTECS — Official Website

> Society of Information & Communications Technology Students • Davao Central College

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗 Architecture

```
sincotecs_profile/
├── index.html                  # Entry HTML (semantic, SEO-ready)
├── vite.config.js              # Vite build config with code-splitting
├── package.json
├── src/
│   ├── main.js                 # App entry (initializes all modules)
│   ├── styles/
│   │   ├── design-tokens.css   # Colors, typography, spacing, motion tokens
│   │   ├── global.css          # Reset, utilities, components, nav, preloader
│   │   └── sections.css        # Section-specific styles
│   ├── three/
│   │   └── hero-scene.js       # WebGL 3D emblem + starfield + SVG fallback
│   ├── gsap/
│   │   └── motion-system.js    # ScrollTrigger reveals, preloader timeline
│   ├── sections/
│   │   ├── officers.js         # Officers grid, batch selector, modal, 3D tilt
│   │   ├── timeline.js         # Horizontal event timeline
│   │   ├── contact.js          # Contact form handler
│   │   └── nav.js              # Navigation controller
│   └── data/
│       └── officers.json       # Officer seed data (Batch 2023-24 & 2025-26)
├── api/
│   └── contact.js              # Serverless contact form endpoint
└── public/
    └── assets/
        ├── originals/          # Source assets (group photo, CBL PDFs)
        └── officers/           # Officer headshot photos
```

## 🎨 Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Build       | Vite 6                              |
| Language    | Vanilla JavaScript (ES Modules)     |
| 3D / WebGL  | Three.js (hero emblem + starfield)  |
| Animation   | GSAP + ScrollTrigger                |
| Styling     | Vanilla CSS (design tokens)         |
| Backend     | Serverless (Vercel/Netlify-ready)   |
| Data        | JSON (CMS-ready schema)             |

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

The `api/contact.js` function will be auto-detected as a serverless function.

### Netlify

```bash
npm run build
# Deploy the `dist/` folder
# Move api/contact.js → netlify/functions/contact.js
```

### Static Hosting

```bash
npm run build
# Deploy the `dist/` folder to any static host
# Contact form will fall back to localStorage (no backend)
```

## 📋 Content Management

Officer data lives in `src/data/officers.json`. To update:

1. Edit the JSON file directly
2. Add officer photos to `public/assets/officers/`
3. Rebuild with `npm run build`

The JSON schema mirrors a Webflow CMS structure for future migration.

## 🎯 Features

- **3D WebGL Hero** — Hexagonal embodiment of the SINCOTECS seal with 6 glowing nodes
- **SVG Fallback** — Graceful degradation for devices without WebGL
- **Officers Directory** — Batch selector, officer cards with 3D tilt, detail modal
- **Event Timeline** — Horizontal scrollable timeline with GSAP transitions
- **Contact Form** — Client + server validation, honeypot spam protection
- **Accessibility** — Focus states, ARIA labels, `prefers-reduced-motion` support
- **Performance** — Code-split Three.js/GSAP bundles, lazy loaded images
- **Responsive** — Mobile-first with hamburger nav and adaptive layouts

## 📝 Data Sources

- Officer roles & duties: **CBL-SINCOTECS-2024-FINAL.pdf**
- Organizational structure: **DCC-CSSG-REVISED-CBL-2023.pdf**
- Officer positions (Batch 2025-2026): **Group photo analysis**

## 📄 License

© 2025 SINCOTECS — Davao Central College. All rights reserved.
