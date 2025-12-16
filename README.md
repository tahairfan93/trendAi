# trendAi

Checks the trend from various social sites.

## Dashboard
A minimalist web dashboard surfaces fresh Reddit and newsletter items, lets you trigger scrapes, save items, and generate hooks.

### Run locally
1. Copy `config.example.js` to `config.js` and add your N8N + Supabase details. If your N8N flow exposes a different path than `/scrape`, update `N8N_SCRAPE_PATH` to match and avoid "not found" responses.
2. Start a simple server (for example: `python -m http.server 8000`).
3. Visit `http://localhost:8000` to explore the dashboard.

### Dashboard Prompt Guide
See [DASHBOARD_PROMPT_GUIDE.md](DASHBOARD_PROMPT_GUIDE.md) for detailed UI, UX, data, and integration requirements for building
the minimalist dashboard experience.
