# Parishkrit Bastakoti - Personal Blog

A minimal, editorial-style personal blog built with Next.js 15, Tailwind CSS, and Supabase.

## Features

- **Minimalist Design**: Clean white background, black text, and professional typography.
- **Performance**: Server-Side Rendering (SSR) for SEO and fast initial load.
- **SEO Optimized**: Dynamic metadata, Open Graph tags, JSON-LD structured data, sitemap, and robots.txt.
- **Admin Dashboard**: Secure interface to create, edit, and delete posts.
- **Comment System**: Public comments with admin moderation (approval required).
- **Supabase Integration**: Auth, Postgres Database, and Row Level Security (RLS).

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth)
- **Styling**: Tailwind CSS, Typography Plugin
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### 1. Environment Setup

The project requires a `.env.local` file with Supabase credentials. This has been pre-configured in the project root.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Database Setup

The database schema is defined in `supabase/schema.sql`. You can run this in the Supabase SQL Editor to set up the tables and security policies.

Key Tables:
- `posts`: Stores blog posts (content, slug, publication status).
- `comments`: Stores user comments (requires approval).

### 3. Installation

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the blog.

### 5. Admin Access

1. Go to `http://localhost:3000/login`.
2. Sign in with the admin credentials (managed in Supabase Auth).
3. Access the dashboard at `http://localhost:3000/admin`.

## Deployment

The project is ready for deployment on Vercel.

1. Push to GitHub.
2. Import project in Vercel.
3. Add Environment Variables in Vercel project settings.
4. Deploy.

## License

All rights reserved. Parishkrit Bastakoti.
