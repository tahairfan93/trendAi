# Beautiful Minimalist Dashboard Prompt Guide

Use this guide to craft a high-quality prompt for building a gorgeous, minimalist dashboard web app that connects to automation (N8N MCP) and persistence (Supabase).

## Product Vision
- **Purpose:** Provide a sleek dashboard that ingests Reddit articles and newsletter highlights, surfaces them in a visually engaging layout, and lets users save and transform the content into hooks or other outputs.
- **Feel:** Modern, minimal, and elegant. Prioritize generous whitespace, crisp typography, soft gradients, subtle glassmorphism, and micro-interactions.
- **Flow:** Landing view shows the latest content and a primary "Scrape Now" action. A secondary tab reveals saved items and hook-generation tools.

## Core Requirements
- **Integrations:**
  - Connect to **N8N MCP** for scraping/orchestration; expose a clear endpoint/handler for triggering runs.
  - Connect to **Supabase** for storing scraped items, saved selections, generated hooks, and user metadata (future sign-in).
- **Primary Actions:**
  - A **"Scrape Now"** button to trigger a scrape job (calling N8N MCP) and refresh the feed.
  - A **Save** interaction for items, persisting to Supabase.
  - A **Hooks/Transform** area where saved items can be turned into hooks, summaries, or social snippets.
- **Content Sources:**
  - Reddit articles (titles, subreddit, score, link, thumbnail if available).
  - Newsletter highlights (headline, source, summary, link).
- **Navigation:**
  - Left-side vertical nav with two tabs: **Discover** (ingested content) and **Saved/Hooks** (saved items + hook generator).
- **Auth Roadmap:**
  - Stub for future sign-in (UI placeholder only; no auth logic required initially).

## UX & UI Guidelines
- **Layout:**
  - Split main area into a content grid with cards. Keep cards airy with soft shadows and rounded corners.
  - Use a hero/top bar with the "Scrape Now" button and status (last run, in-progress indicator).
  - Provide filters/sorting (source, recency, popularity) with compact chips or toggles.
- **Visual Language:**
  - Typography: clean sans-serif (e.g., Inter/Neue Haas). Large headlines, medium weight body text.
  - Palette: muted dark-on-light or light-on-dark with an accent gradient. Avoid clutter; lean on translucency and frosted glass panels.
  - Interactions: gentle hover elevation, smooth transitions (150–250ms), skeleton loaders during fetches.
- **Cards:**
  - Show source badge (Reddit/newsletter), title, short description/summary, metadata (subreddit/source, score, time), and action buttons (Save, Open, Generate Hook).
  - Include visual accent (thumbnail/gradient) but keep minimal.
- **Empty/Loading States:**
  - Skeleton cards while scraping; empty state art with a quick CTA to "Scrape Now" when no data exists.
- **Responsiveness:**
  - Collapse left nav into an icon rail on small screens; ensure cards stack gracefully.

## Data & State
- **Entities:**
  - `ContentItem`: id, source (reddit/newsletter), title, summary, link, metadata (subreddit, score, timestamp, thumbnail), status (new/saved/transformed).
  - `Hook`: id, related contentId, text, format (tweet, hook, headline), createdAt.
  - `ScrapeJob`: id, status, startedAt, finishedAt, error.
- **Flows:**
  1. User hits **Scrape Now** → POST to N8N MCP → poll job status → refresh feed.
  2. User saves an item → write to Supabase → update UI badge/state.
  3. User selects a saved item in the second tab → generate hooks (local or N8N function) → store hooks to Supabase.

## API & Backend Prompts
When prompting for backend wiring, specify:
- Env vars for N8N MCP base URL, Supabase URL, and service key.
- Secure fetch wrappers with error handling and optimistic UI updates.
- Rate-limit/backoff on repeated scrape calls; avoid duplicate jobs.
- Webhook/cron guidance: allow scheduled N8N scrapes alongside manual button.

_Reference screenshot provided for visual inspiration._
