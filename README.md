# BTC Store - Next.js

SEO-optimized business software solutions website built with Next.js 14 App Router.

## Features

- ✅ Next.js 14 App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Multi-language support (TR, EN, DE, FR, ES, AR) with next-intl
- ✅ SEO optimized with metadata
- ✅ Supabase integration
- ✅ Admin panel
- ✅ Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/          # Public pages
│   │   │   ├── page.tsx       # Home
│   │   │   ├── products/
│   │   │   ├── stories/
│   │   │   └── ...
│   │   ├── admin/             # Admin pages
│   │   └── layout.tsx
│   └── layout.tsx
├── components/                 # Reusable components
├── i18n/                      # Internationalization
├── layouts/                   # Layout components
├── pages/                     # Page components (legacy)
└── store/                     # State management
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Deployment

Deploy easily on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
