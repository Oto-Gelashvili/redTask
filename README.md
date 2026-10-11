# KINO XII

A cinema web app where users browse films, check sessions, buy tickets and subscribe to upcoming releases.

**Live demo:** [kino-pied.vercel.app](https://kino-pied.vercel.app/)

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Features](#features)
- [Architecture](#architecture)
- [API](#api)
- [Authentication](#authentication)
- [Loading, empty and error states](#loading-empty-and-error-states)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)

---

## Overview

KINO XII is a cinema booking front-end. Visitors can browse what is playing and what is coming soon, open a film's details, pick a session and seats, and sign in to buy tickets or get notified about upcoming titles

## Tech stack

| Area        | Technology                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Framework   | Angular `22.2` (standalone components, signals, new control flow `@if` / `@for` / `@switch`)      |
| Language    | TypeScript                                                                                        |
| Styling     | Plain CSS, component-scoped, design tokens as CSS variables (`--bg`, `--bg-card`, `--error`, ...) |
| Routing     | Angular Router                                                                                    |
| HTTP        | `fetch` wrapped in a custom `ApiService`                                                          |
| State       | Angular signals (no external state library)                                                       |
| Persistence | `localStorage` (auth token, recently viewed)                                                      |
| Hosting     | Vercel                                                                                            |
| API         | https://api.kinoxii.redberryinternship.ge/docs                                                    |

---

## Getting started

### Prerequisites

- Node.js `v24.18.0`
- npm `11.16.0`
- Angular CLI: `npm install -g @angular/cli`

### Installation

```bash
git clone [https://github.com/Oto-Gelashvili/redTask]
cd [redTask]
npm install
```

### Configuration

The API base URL lives in `src/app/core/config.ts`:

```typescript
export const BASE_URL = '[https://api.kinoxii.redberryinternship.ge/api]';
```

### Run locally

```bash
npm start        # or: ng serve
```

Open `http://localhost:4200`.

### Other scripts

| Command         | What it does                  |
| --------------- | ----------------------------- |
| `npm start`     | Dev server with live reload   |
| `npm run build` | Production build into `dist/` |

---
