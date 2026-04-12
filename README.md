# Wanderwell – Travel Package Booking App

A modern travel package booking web application built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **shadcn/ui**. Explore Indian cities, discover places, browse transport options, and bookmark your favourites.

## Features

- 🏙️ Browse curated Indian cities with details and highlights
- 🗺️ Explore places of interest within each city
- 🚌 View transport options between destinations
- 🔖 Bookmark cities and places for later
- 🔍 Fuzzy search across cities and attractions
- 🌙 Dark / light theme support

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React 19 hooks + localStorage for bookmarks
- **Data**: Seeded in-memory fake API (`lib/fake-api.ts`)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/wanderwell.git
cd travel-package-app

# Install dependencies
pnpm install
# or
npm install
```

### Development

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
travel-package-app/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home / city listing page
│   ├── bookmarks/          # Bookmarks page
│   ├── city/[id]/          # City detail page
│   ├── place/[id]/         # Place detail page
│   └── transport/          # Transport listing page
├── components/
│   └── ui/                 # shadcn/ui component library
├── hooks/                  # Custom React hooks
├── lib/
│   ├── fake-api.ts         # Client-side data fetching layer
│   ├── seeds/              # Seed data (cities, places, transport)
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── styles/                 # Global CSS
```

## Deployment

The app can be deployed to any platform that supports Next.js:

- [Vercel](https://vercel.com) — zero-config deployment
- [Netlify](https://netlify.com)
- Any Node.js server with `pnpm build && pnpm start`

## License

MIT
