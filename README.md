# Food Production — Module 2: Advanced Interactive Skill Lab

A **standalone** web app (React + TypeScript + Vite + Tailwind). It has its own code, content, simulations,
assets, routes and saved state — it does **not** need Module 1 (or any other project) to build or run.

## Run it

```bash
npm install
npm run dev        # http://localhost:5174
```

Production build:

```bash
npm run build      # outputs dist/
npm run preview    # serves dist/ on http://localhost:4174
```

Requires Node 18+ (Node 20 recommended). Fonts load from Google Fonts when online and fall back to system fonts offline.

## What's inside

- **10 advanced units**, each with the same **seven learning stages**: Watch · Read · Practice · Simulate · Quiz · Apply · Review
- **10 interactive simulations** (drag-and-drop, sliders, timed cooking, scoring, hints, replay), including a real
  **WebGL/Three.js laminated-pastry** scene (falls back to a 2D drawing when WebGL isn't available)
- **English / हिन्दी** (top-bar toggle), light / dark mode
- Progress (XP, completed stages/units, simulation scores) saved in the browser under the key `foodproduction-module2-storage`

## Structure

```
src/
  main.tsx, App.tsx      entry point + routes (/ and /unit/:id)
  pages/                 Home, UnitPage (7-stage page), stage definitions
  components/            kit (scoring, drag & drop, toasts), tasks (match/order/choice), FoodShell, layout/
  simulations/           the 10 simulations + registry (lazy-loaded)
  data/                  bilingual unit content, types, themes
  translations/          English + Hindi UI strings
  store/                 zustand store (persisted)
  styles/, assets/       Tailwind layers, logo
public/                  favicon
```
