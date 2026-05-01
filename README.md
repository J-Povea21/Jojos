# JoJoVerse

So, I decided to create my own API for JoJo's Bizarre Adventure. I'm getting the information from the JoJo Wiki! 

The API allows you to browse anime parts, manga volumes, and Stands. You can search, filter by part, and save favorites that persist across sessions in the browser. In order to avoid constantly scrape the wiki, the backend caches the data in memory

The project is split into two pieces: a Bun + Elysia backend that handles all the scraping and caching, and a React + Vite frontend that consumes it.

> Why Elysia and not a more widely-used framework? Honestly, I just wanted to try it out!

## Running with Docker

This is the easiest way to get everything running at once. You just need Docker installed

```bash
docker-compose up --build
```

That's it. The app will be at `http://localhost:5173` and the API at `http://localhost:3001`. The first time you open the Explore page it'll take a few seconds — that's the backend scraping the wiki live. After that it's cached for an hour.

To stop it, `Ctrl+C` then `docker-compose down`.

## Running locally

You'll need [Bun](https://bun.sh) installed for both the backend and the frontend.

**Backend** — open a terminal in the `backend/` folder:

```bash
bun install
bun run dev
```

The server starts at `http://localhost:3001`. You can check the auto-generated API docs at `http://localhost:3001/swagger`.

**Frontend** — open another terminal in the `frontend/` folder:

```bash
bun install
bun run dev
```

The app will be at `http://localhost:5173`.

Both need to be running at the same time. The frontend talks to the backend at `localhost:3001` by default, so if you need to change that (for example when deploying), set the `VITE_API_BASE` environment variable before building.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, react-router-dom v7
- **Backend:** Bun, Elysia, Cheerio (scraping)
- **Data source:** [JoJo Wiki](https://jojowiki.com) — scraped on demand, cached in memory for 1 hour
