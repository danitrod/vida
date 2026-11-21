# AGENTS.md

Guidance for coding agents working in this repository. Read this before making changes.

## What this is

**vida** is a small personal blog (in Brazilian Portuguese) built with Next.js App Router. Posts are
MDX files in the repo; readers can register, log in, comment (also anonymously) and "heart" posts.
The site also records its own privacy-friendly page-view analytics. Data lives in MongoDB.

The repository is **public**. Never commit secrets, `.env*` files or unpublished drafts.

## Stack

| Area      | Choice                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, Turbopack for dev and build), React 19           |
| Content   | MDX via `@next/mdx` (`src/content/posts/*.mdx`)                          |
| Styling   | Tailwind CSS 4 + `@tailwindcss/typography`, CSS variables for theming    |
| Data      | MongoDB via the official driver (v7), no ORM                             |
| Auth      | Hand-rolled: bcrypt password hashes + JWT in an httpOnly cookie          |
| Language  | TypeScript (strict). `tsc` is TypeScript 7; see "TypeScript setup"       |
| Tooling   | pnpm, ESLint 10 flat config (`eslint-config-next`)                       |

Requirements: Node.js **20.19+** (MongoDB driver 7), pnpm **10+** (uses `allowBuilds` in
`pnpm-workspace.yaml`). The project also runs on current Node releases.

## Commands

```bash
pnpm install
pnpm dev     # next dev (Turbopack); drafts are visible here
pnpm build   # production build; runs the type check (tsc), not lint
pnpm start   # serve the production build
pnpm lint    # eslint . (next lint no longer exists in Next 16)
npx tsc --noEmit   # type check only
```

There is **no test suite**. Verify changes with `npx tsc --noEmit`, `pnpm lint` and `pnpm build`, and
for behavior, by running the app (see "Verifying without touching real data").

## Environment

Configured in `.env.local` (git-ignored). Never print or commit values.

| Variable          | Purpose                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `MONGODB_URI`     | MongoDB connection string. The database used is the one named in the URI path (`mongo.db()`). |
| `JWT_SECRET`      | Signs auth/anon JWTs. Also keys the daily analytics visitor hash.                             |
| `ANALYTICS_DEBUG` | Optional. `1` logs every analytics record/skip decision to the server console.               |

`src/lib/mongodb.ts` throws at import time if `MONGODB_URI` is missing, so any route touching the
database needs it, including during `next build`.

### Verifying without touching real data

`pnpm dev` and `pnpm start` read `.env.local`, so they talk to whatever database it points at, and
page views get recorded there. To exercise server code safely, override the URI with an unreachable
one (real environment variables take precedence over `.env` files):

```bash
pnpm build
MONGODB_URI="mongodb://127.0.0.1:1/none?serverSelectionTimeoutMS=300" ANALYTICS_DEBUG=1 PORT=3457 pnpm start
```

Pages that don't need the database render normally; database calls fail fast and are logged.

## Repository layout

```
adr/                     Architecture Decision Records (see "Decisions")
src/
  app/
    layout.tsx           Root layout: theme cookie -> <html class>, single <UserProvider>, Header/Footer
    page.tsx             Home: list of published posts
    posts/[slug]/page.tsx  Post page: MDX content, hearts, comments
    not-found.tsx
    api/                 Route handlers (JSON): comments, login, logout, me, me/full, reactions, register, user
  components/            UI (client components unless noted); forms/ holds modal forms
  content/
    posts/               Published posts (*.mdx)
    drafts/              Git-ignored drafts (only .gitkeep is tracked); <slug>/ holds draft photos
  context/UserContext.tsx  Client-side current-user state (fetches /api/me)
  hooks/                 Client hooks (useAnonUid)
  lib/                   Server/shared logic: posts, auth, mongodb, reactions, analytics, validation, dates
  types/                 Shared TS types
  mdx-components.tsx     MDX element overrides (external links open in a new tab with an icon)
```

## Content: posts and drafts

- A post is `src/content/posts/<slug>.mdx`; the filename is the URL slug (`/posts/<slug>`).
  Slugs must match `^[\w-]+$`.
- Each post exports a `metadata` object:
  ```js
  export const metadata = {
    title: "Título",
    excerpt: "Resumo exibido na home e na meta description.",
    date: "2025-04-25",           // ISO date; home sorts by it, newest first
    notesDate: "2024-01-10",      // optional: "Com notas de ..." line
    disclaimer: "Texto...",       // optional: rendered in <Disclaimer> above the post
  };
  ```
- **Drafts** go in `src/content/drafts/` (git-ignored, so they never reach the public repo or a
  deploy). They are listed and readable **only under `next dev`**. Publishing = moving the file to
  `src/content/posts/`. There is no `status` field.
- How drafts stay out of production (`src/lib/posts.ts`): every drafts reference sits inside a literal
  `process.env.NODE_ENV === "development"` check, which Next inlines at build time, so production
  bundles contain no draft code, path or content. `next.config.ts` also excludes the folder from
  output file tracing. Keep both properties if you touch this code.
- `loadPost(slug)` is the single entry point for reading a post; `getAllPosts()` builds the list.
  The post route uses `dynamicParams = false`, so only slugs from `generateStaticParams` resolve.
- **Photos:** Markdown images (`![alt](/posts/<slug>/1.jpg "optional caption")`) are rendered by
  `components/photos/Photo` (mapped as `img` in `mdx-components.tsx`). Published photos live in
  `public/posts/<slug>/`; draft photos in `src/content/drafts/<slug>/` (git-ignored). The URL is
  the same for both, so publishing = moving the `.mdx` to `posts/` and the photo folder to
  `public/posts/<slug>/`, without editing the Markdown. Never put draft photos in `public/`
  (committed, and so public). See "Post photos" below.
- **`<ReaderDevice />`** can be used in any post (no import; registered in `mdx-components.tsx`).
  It renders the reader's kind of device as a masculine noun ("iPhone", "Mac", "celular Android",
  "computador com Windows", ...; "dispositivo" for unknown, bots and scripts), e.g.
  `olhando para o seu <ReaderDevice />`. It's a server component using `describeDevice()` in
  `src/lib/device.ts`, which only reads the `User-Agent` header during rendering. Keep it that
  way: never store or log the result, and don't move detection to client-side JavaScript.
- Post content and all UI copy are in Portuguese (pt-BR). UI strings are mostly lowercase
  ("enviar comentário", "fechar"). Keep that voice; don't translate content.

## Rendering model

- Every route is dynamic: the root layout reads the `theme` cookie, and pages read request
  headers/cookies. Partial prerendering / `cacheComponents` is not enabled (deliberately, for now).
- Request-time APIs are async in Next 16: always `await params`, `await searchParams`,
  `await cookies()`, `await headers()`.
- There is no `proxy.ts` (formerly `middleware.ts`). If you add one, remember Next strips its own
  router headers from the request a proxy sees.
- Side effects that shouldn't delay the response use `after()` from `next/server`.

## Post photos

Photos are off by default so a post can be read as text first. `components/photos/PostPhotos.tsx`
wraps the post body on the post page and provides the state; `Photo.tsx` renders each image.

- A "Mostrar fotos" switch at the top shows or hides all photos. A "Ver fotos" link at the bottom
  turns them on and scrolls to the first `[data-photo]` in the post. Both appear only when the post
  contains a photo (CSS `:has` in `globals.css`), so posts without photos are unaffected.
- Nothing is downloaded until the first switch-on: no `<img>` is rendered before that
  (`activated`). After it, images stay mounted while hidden, so toggling again is instant.
- Hidden photos collapse to zero height (grid `0fr`/`1fr` transition with opacity, disabled under
  `prefers-reduced-motion`). A paragraph that only holds a photo loses its margins, so text-only
  reading has no gaps.
- `Photo` must only render inline elements (`<span>`): MDX puts images inside `<p>`, and a block
  element there breaks hydration.
- Plain `<img>` is used on purpose, because post photos have no known dimensions for `next/image`.
  Export photos at a sensible web size (e.g. ≤ 2000px wide, compressed).
- Outside `PostPhotos` (no provider) a `Photo` renders normally.
- Draft photos are served by `src/app/posts/[slug]/[file]/route.dev.ts`. The `.dev.ts` extension
  is only added to `pageExtensions` in the dev-server phase (`next.config.ts`), so the route
  doesn't exist in production builds; it also checks `NODE_ENV` and only serves plain file names
  with image extensions. Next serves `public/` files first, so published photos win. Use the
  same `*.dev.ts` naming for any other dev-only route.

## Auth and identity

- **Users:** register/login via `/api/register` and `/api/login` (login accepts username or email,
  case-insensitive). Passwords are hashed with bcrypt. On success `authorize()` sets
  `auth_token` (httpOnly JWT, 180 days, payload `{ user: { username, email } }`).
- **Anonymous visitors:** the first anonymous comment or heart creates `anon_comment_token`
  (JWT `{ anon: true, uid }`, 90 days, **not** httpOnly). The client decodes the `uid` in
  `useAnonUid` to show edit/delete controls on its own comments. The server always re-validates.
- Server helpers in `src/lib/auth.ts`: `validateAuth()` → user or null, `validateAnonToken()` → uid or
  null, `createAnonToken()`.
- Ownership: comments match on `author` (username) or `anonToken`; reactions on `user` or
  `anonToken`. Renaming a user (`PATCH /api/user`) cascades the new username to their comments and
  reactions; keep that in sync if you add collections that reference usernames.
- Client state: one `<UserProvider>` in the root layout. Don't add nested providers. Components read it
  with `useUser()`, and forms call `refreshUser()` after login/logout/save so the whole page updates.

## Data model (MongoDB collections)

| Collection  | Shape (main fields)                                                                 |
| ----------- | ----------------------------------------------------------------------------------- |
| `users`     | `username`, `email`, `password` (bcrypt), `subscribeToPosts`, `createdAt`, `updatedAt` |
| `comments`  | `slug`, `content`, `author`, `anonToken?`, `createdAt`, `updatedAt?`                 |
| `reactions` | `post` (slug), `type: "love"`, `user?` or `anonToken?`, `createdAt`                  |
| `pageviews` | Time-series collection, one document per view (see "Analytics")                     |
| `analytics` | **Legacy**, no longer written: per-path counters from the old implementation        |

Note the inconsistent slug field name: `comments.slug` vs `reactions.post`.

There are no migrations. `migrate-mongo-config.js` is a leftover (the tool isn't a dependency and
there is no `migrations/` directory). Collections are created implicitly, except `pageviews`, which
`src/lib/analytics.ts` creates as a time-series collection on first use.

## Hearts (reactions)

`src/lib/reactions.ts#getLoveState(slug)` returns `{ count, loved }` for the current visitor. The post
page uses it for the initial render. `GET /api/reactions?post=` exposes it so `HeartButton` can refresh
after login/logout. `POST /api/reactions` toggles. Keep page and endpoint on the shared helper.

## Analytics

Implemented in `src/lib/analytics.ts`. `trackPageView(path, searchParams)` is called from page
components **after** the page is known to exist (after any `notFound()`):

- Pages re-render on in-app navigation (layouts don't), so both full loads (`nav: "landing"`) and
  client navigations (`nav: "internal"`) are counted. 404s and drafts never reach it.
- Navigation type comes from Fetch Metadata headers: `sec-fetch-dest: document` = full load;
  `empty` + `sec-fetch-site: same-origin` = Next router fetch. Anything else is skipped, which
  also filters most scripts. Bots (`userAgent().isBot`, a UA not starting with `Mozilla/`, or headless/automation browsers) and
  speculative prefetch/prerender (`sec-purpose`) are skipped. Next `<Link>` prefetches don't render
  dynamic pages, so they're not counted (verified with a real browser: each visible link triggers
  two small `?_rsc=` prefetches, `/_tree` and route, and neither renders the page). Setting `prefetch={true}` on a `<Link>` would break that.
- Each view is one document: `ts`, `meta.path`, `nav`, `device`, `browser`, `os`, `inApp` (Instagram,
  Threads, Facebook, TikTok, LinkedIn, Twitter in-app browsers), `referrer` (domain only; `self` for
  same-site full loads), `utm` (all five `utm_*` values), `clickIds` (values of `fbclid`, `igsh`,
  `igshid`, `gclid`, ...), `visitor` (HMAC of IP + UA + UTC day; daily-unique only).
- Privacy: no raw IP, no analytics cookies. Keep it that way.
- Retention: `pageviews` documents expire after 2 years (`RETENTION_SECONDS`, MongoDB TTL), as
  stated on the privacy page.
- The write runs in `after()` and must never break or slow the page; errors are only logged.
- If you add a new page that should be counted, call `trackPageView` in it.

## Privacy

The privacy policy is `src/app/privacidade/page.tsx` (Portuguese, linked from the footer). It
describes exactly what the code collects, the cookies, legal bases, processors, retention and
contact. **When a change affects any of that, update the page in the same change** and bump its
`LAST_UPDATED` date. That includes new fields stored about readers or users, new or changed cookies,
new third-party services or requests, and retention changes. Mention the update when reporting
the change.

Constraints the current policy (and the absence of a consent banner) depends on:

- No third-party requests from readers' browsers: no CDN fonts, scripts, embeds or trackers.
  Fonts are self-hosted with `next/font` (`layout.tsx`); loading Google Fonts directly would send
  visitors' IPs to Google.
- Only cookies needed for features the reader uses (login, anonymous comment/heart ownership,
  chosen theme). Anything else (tracking, ads, analytics cookies) would need opt-in consent.
- No client-side JavaScript reading device information for analytics or personalisation (EU
  ePrivacy rules treat that as access to the device). Server-side use of request headers, not
  stored, is fine (e.g. `ReaderDevice`).

If a change would break one of these, stop and ask the maintainer first.

## Coding conventions

- **Code is in English:** identifiers, file and component names, comments and commit messages
  (e.g. `ReaderDevice`, not `SeuDispositivo`). Portuguese is only for reader-facing content: post
  text, UI copy, API `message` strings and public URLs like `/privacidade`.
- Path alias `@/*` → `src/*`.
- Server-only logic lives in `src/lib`; don't import `lib/auth`, `lib/mongodb`, `lib/posts`,
  `lib/reactions` or `lib/analytics` from client components.
- Route handlers return `NextResponse.json`, with user-facing `message` strings in Portuguese.
  Always call `await mongo.connect()` before `mongo.db()`.
- Never interpolate request input into a query operator. For case-insensitive exact matches use
  `equalsIgnoreCase()` from `src/lib/mongodb.ts` (it regex-escapes). Check that body fields are
  strings (or booleans) before using them in a query or storing them.
- Client data fetching uses `fetch` in effects/handlers. Lint enforces the React Compiler rules from
  `eslint-config-next`, including `react-hooks/set-state-in-effect` as an **error**: set state from
  async callbacks (with an `ignore` flag for cleanup), derive state during render, or use
  `useSyncExternalStore` for browser-only values (see `useAnonUid`). Don't disable the rule.
- Theming: `dark` class on `<html>` (Tailwind custom variant), colors as CSS variables in
  `src/app/globals.css` (`--color-accent`, `--background`, ...). The theme is persisted in a `theme`
  cookie and server-rendered to avoid a flash.
- Formatting follows Prettier defaults (double quotes, semicolons, trailing commas), though Prettier
  isn't installed.
- Commit messages: short, imperative, capitalized (`Add drafts folder`, `Improve analytics`,
  `Add post: <title>`).

## TypeScript setup

TypeScript 7 has no JavaScript API yet, which `typescript-eslint` and editor tooling need. Following
the TypeScript team's guidance, `package.json` aliases:

```json
"@typescript/native": "npm:typescript@^7.0.2",
"typescript": "npm:@typescript/typescript6@^6.0.2"
```

`tsc` (and Next's build-time check) runs TypeScript 7; anything importing `typescript` gets the 6.0
API. Remove the aliases once `typescript-eslint` supports TypeScript 7. `tsconfig.json` is partly
managed by Next (it rewrote `jsx` to `react-jsx` and added `.next/dev/types`); that's expected.

## Known rough edges

- No tests or CI.
- `/api/comments/[id]` returns 500 (not 400/404) for malformed ids (`new ObjectId` throws).
- Anonymous commenters can choose any display name, including an existing username.
- `validateRegistration` reports "pelo menos 6 caracteres" for passwords longer than 32.
- `RegistrationForm` has a malformed class (`text-[var(--color-foreground)`).

## Decisions

Major architectural decisions are recorded as ADRs in `adr/`. Read the relevant ADRs before
changing what they cover.

The bar for a new ADR is high: a hard-to-reverse choice that shapes the whole system, such as
replacing the framework or database, changing how auth works, or restructuring the data model.
Feature-level and workflow choices (how a feature is built, where files go, a new route or
component) don't get an ADR; document them in this file or the README instead. Don't write an ADR
on your own initiative: propose it and wait for the maintainer's agreement.

- File name: `adr/NNNN-short-kebab-title.md`, numbered sequentially from `0001`.
- Sections: **Title**, **Date**, **Status** (Proposed / Accepted / Superseded by NNNN),
  **Context**, **Decision**, **Consequences**.
- Never rewrite an accepted ADR's decision; supersede it with a new one and update the old one's status.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
