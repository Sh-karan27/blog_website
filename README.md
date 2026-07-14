# Blog Website (Inkwell)

Frontend for a full-stack blogging platform, built with Next.js. Talks to the [blog-api](https://github.com/Sh-karan27/blog-api) backend for auth, blogs, comments, likes, bookmarks, playlists, follows, and notifications.

> The frontend UI/UX was redesigned using Claude Code.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19, served via a custom Express (`server.js`) + Socket.io server
- **Styling:** Tailwind CSS + daisyUI
- **State:** Redux Toolkit / React Redux
- **Editor:** Tiptap (rich text editing for blog posts)
- **HTTP:** Axios, with interceptors for JWT access/refresh token handling
- **Realtime:** Socket.io client
- **Language:** TypeScript

## Features

- Auth: login / register, protected routes, automatic access-token refresh
- Home feed, articles listing, individual blog view
- Blog write & edit (rich text editor with image support)
- User profile pages, account settings
- Follow/unfollow, likes, bookmarks
- Light/dark theme toggle
- About & contact pages

## Project Structure

```
src/
├── app/            # Next.js App Router pages (home, blog, write, profile, login, register, settings, ...)
├── components/     # Navbar, Footer, forms, theme provider/toggle, loading states
├── lib/            # axios instance (API client), ProtectedRoute
├── redux/          # Redux store & slices
└── utils/          # toast + loading helpers
server.js           # custom Node server (Express + Socket.io) used for both dev and start
```

## Setup

```bash
npm install
cp .env.sample .env   # or create .env manually, see below
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

### Environment variables

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Set this to your deployed `blog-api` URL in production (e.g. Render).

## Scripts

- `npm run dev` — start dev server (`node server.js`)
- `npm run build` — production build (`next build`)
- `npm run start` — start production server (`node server.js`)
- `npm run lint` — run eslint

## Note on OneDrive

If this project lives inside a OneDrive-synced folder, delete the `.next` folder if `npm run dev` fails with an `EINVAL: readlink` error — OneDrive's cloud placeholder files can conflict with Next.js's build cache cleanup.
