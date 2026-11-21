# vida

A space to share some thoughts and experiences from my life, in Portuguese.

Posts are written in MDX and live in this repository. Readers can create an account, comment (also
anonymously), and leave a heart on posts they like. The site keeps its own lightweight,
privacy-friendly page-view analytics.

## Features

- **MDX posts** with title, excerpt, date, optional "notes from" date and optional disclaimer
- **Drafts** kept out of git and out of production builds, previewable locally
- **Opt-in photos**: posts read as text first; a "Mostrar fotos" switch reveals the photos, which
  are only downloaded once a reader asks for them
- **Accounts**: registration, login (username or email), settings, optional new-post emails opt-in
- **Comments**: logged-in or anonymous; authors can edit and delete their own
- **Hearts** per post, for logged-in and anonymous readers
- **Light/dark theme**, server-rendered from a cookie (no flash)
- **Analytics**: one record per page view with time, path, device, referrer domain, UTM and
  social click IDs (e.g. Instagram `igsh`), bot/prefetch filtering, and no stored IPs or tracking
  cookies; kept for 2 years
- **Privacy page** at `/privacidade` (linked in the footer); no third-party requests (fonts are
  self-hosted) and only functional cookies, so no consent banner is needed

## Tech stack

[Next.js 16](https://nextjs.org) (App Router) · React 19 · MDX · Tailwind CSS 4 · MongoDB ·
TypeScript · pnpm

## Getting started

Requirements: Node.js 20.19+ and pnpm 10+.

```bash
pnpm install
```

Create `.env.local`:

```bash
MONGODB_URI=   # MongoDB connection string, including the database name
JWT_SECRET=    # long random string used to sign session tokens
```

Then run the development server at <http://localhost:3000>:

```bash
pnpm dev
```

`pnpm dev` uses the database in `.env.local`, so use a dedicated development database.

## Scripts

| Command      | Description                                 |
| ------------ | ------------------------------------------- |
| `pnpm dev`   | Development server (drafts visible)         |
| `pnpm build` | Production build, including the type check  |
| `pnpm start` | Serve the production build                  |
| `pnpm lint`  | ESLint                                      |

## Writing posts

Create `src/content/posts/<slug>.mdx`. The file name becomes the URL (`/posts/<slug>`):

```mdx
export const metadata = {
  title: "Título do post",
  excerpt: "Uma frase que aparece na home.",
  date: "2025-05-18",
  // notesDate: "2024-01-10",   optional
  // disclaimer: "...",          optional
};

Texto do post em **Markdown**.
```

### Photos

Reference images with regular Markdown, using `/posts/<slug>/...` paths:

```mdx
![Descrição da foto](/posts/<slug>/1.jpg "Legenda opcional")
```

Photos stay hidden until the reader turns on **Mostrar fotos** at the top of the post (or uses
**Ver fotos** at the end). The controls only appear on posts that have photos.

Where the files go:

- **Published post:** `public/posts/<slug>/`. This is committed, so the photos are public.
- **Draft:** `src/content/drafts/<slug>/`, next to the draft. It's git-ignored and only served by
  `pnpm dev`, at the same URLs.

To publish a draft with photos, move `src/content/drafts/<slug>.mdx` to `src/content/posts/` and the
folder `src/content/drafts/<slug>/` to `public/posts/<slug>/`. The Markdown doesn't change.

### Reader's device

Write `<ReaderDevice />` anywhere in a post to show the reader's kind of device, e.g.
`olhando para o seu <ReaderDevice />` becomes "olhando para o seu iPhone" (or "Mac",
"celular Android", "computador com Windows"...). Unknown devices get "dispositivo". It's worked out
on the server from the browser's user-agent and is never stored.

### Drafts

Put work in progress in `src/content/drafts/` (photos in `src/content/drafts/<slug>/`). That folder
is git-ignored, and drafts only appear with `pnpm dev`. They are never part of a production build.
To publish, move the file to `src/content/posts/` (and its photos as described above).

## Project structure

```
src/app/         Pages, layout and API route handlers
src/components/  UI components and forms
src/content/     Posts (and local drafts)
src/lib/         Server logic: posts, auth, database, reactions, analytics
adr/             Architecture Decision Records
```

## Contributing notes

- [`AGENTS.md`](AGENTS.md) documents architecture, conventions and gotchas in detail, for humans
  and coding agents alike.
- Significant decisions are recorded in [`adr/`](adr/).
