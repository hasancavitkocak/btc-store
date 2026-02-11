# React (Vite) to Next.js Migration Guide

## Completed Changes

### 1. Project Structure
- ✅ Converted from Vite to Next.js 14 App Router
- ✅ Created `src/app/[locale]` structure for internationalization
- ✅ Separated public and admin routes with route groups

### 2. Routing
- ✅ Replaced `react-router-dom` with Next.js App Router
- ✅ Converted `<Link>` components to Next.js `Link`
- ✅ Replaced `useNavigate()` with `useRouter()` from `next/navigation`
- ✅ Replaced `useParams()` with Next.js `useParams()`
- ✅ Replaced `useSearchParams()` with Next.js `useSearchParams()`
- ✅ Replaced `useLocation()` with `usePathname()`

### 3. Internationalization (i18n)
- ✅ Migrated from `react-i18next` to `next-intl`
- ✅ Replaced `useTranslation()` with `useTranslations()`
- ✅ Replaced `i18n.language` with `useLocale()`
- ✅ Created middleware for locale detection
- ✅ Configured `next-intl` with request config

### 4. Components
- ✅ Added `'use client'` directive to all interactive components
- ✅ Updated all components to use Next.js hooks
- ✅ Removed `ScrollToTop` component (Next.js handles this automatically)

### 5. Layouts
- ✅ Converted `<Outlet />` to `{children}` in layouts
- ✅ Created nested layouts for public and admin sections
- ✅ Added metadata for SEO optimization

### 6. Configuration Files
- ✅ Created `next.config.mjs`
- ✅ Updated `tsconfig.json` for Next.js
- ✅ Created `.eslintrc.json` for Next.js
- ✅ Updated `postcss.config.mjs`
- ✅ Removed Vite-specific files

### 7. SEO Optimization
- ✅ Added metadata to all pages
- ✅ Configured OpenGraph and Twitter cards
- ✅ Added robots meta for admin pages
- ✅ Implemented proper HTML lang attributes

## Key Differences

### Before (React + Vite)
```tsx
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <Link to="/products">
      {t('menu.products')}
    </Link>
  );
}
```

### After (Next.js)
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

function Component() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  return (
    <Link href="/products">
      {t('menu.products')}
    </Link>
  );
}
```

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Test All Routes**
   - Public pages: `/`, `/products`, `/stories`, etc.
   - Admin pages: `/admin`, `/admin/products`, etc.
   - Language switching functionality

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

5. **Deploy to Vercel**
   - Push to GitHub
   - Import project in Vercel
   - Configure environment variables
   - Deploy

## Benefits of Next.js

1. **SEO Optimization**: Server-side rendering and static generation
2. **Performance**: Automatic code splitting and optimization
3. **Image Optimization**: Built-in `next/image` component
4. **API Routes**: Built-in API endpoints (if needed)
5. **File-based Routing**: Intuitive routing system
6. **TypeScript Support**: First-class TypeScript support
7. **Production Ready**: Optimized for production out of the box

## Troubleshooting

### Issue: "use client" errors
- Make sure all interactive components have `'use client'` at the top

### Issue: Translation keys not working
- Check that locale files are in `src/i18n/locales/`
- Verify middleware configuration in `src/middleware.ts`

### Issue: Links not working
- Use `href` instead of `to` for Next.js Link
- Ensure paths start with `/`

### Issue: Images not loading
- Move images to `public/` folder
- Use `/image.png` paths (not `./image.png`)
- Consider using `next/image` for optimization
