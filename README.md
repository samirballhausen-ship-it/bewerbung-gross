# bewerbung-gross

Initiativbewerbung an GROSS Messe & Event (Hofheim a. Ts.) als interaktive
Single-Page-Erfahrung. Next.js 16 Static Export, deployed via GitHub Pages.

**Live:** https://samirballhausen-ship-it.github.io/bewerbung-gross/

## Stack

- Next.js 16 (App Router, Turbopack, `output: 'export'`)
- React 19
- Tailwind CSS v4
- Lenis (Smooth Scroll)
- GSAP + Framer Motion (für spätere Erweiterungen)

## Lokal entwickeln

```bash
pnpm install
pnpm dev          # http://localhost:3210
pnpm typecheck
pnpm build        # → out/
```

## Deploy

Auto-Deploy bei jedem Push auf `main` via GitHub Action
(`.github/workflows/deploy.yml`).

`NEXT_PUBLIC_BASE_PATH` wird in der Action auf `/bewerbung-gross` gesetzt
(GitHub Pages Project-Pages laufen unter Subpath). Bei Custom-Domain-Wechsel:
ENV-Var leeren und `public/CNAME` mit der Domain anlegen.

## Status

Skelett-Phase. Inhalte sind Stubs aus
`core/business/bewerbungen/gross/02-samir-positioning/*` und werden
session-weise verfeinert.
