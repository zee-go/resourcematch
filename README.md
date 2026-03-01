# ResourceMatch

B2B marketplace connecting international companies with AI-vetted senior Filipino professionals in accounting, e-commerce operations, healthcare administration, and digital marketing.

## Tech Stack

- **Framework**: Next.js 15 (Pages Router), React 18, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (credentials provider, JWT sessions)
- **Payments**: Stripe (credit packs + subscriptions)
- **AI Vetting**: Claude API (4-layer pipeline)
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Deployment**: Docker (Cloud Run)

## Getting Started

```bash
npm install
cp .env.example .env.local  # Fill in your credentials
npx prisma db push
npx prisma db seed
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample candidates |
| `npm run db:studio` | Open Prisma Studio |
