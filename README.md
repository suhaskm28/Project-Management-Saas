# ProjectMaster — Enterprise Project Management SaaS

ProjectMaster is a production-grade Project Management SaaS platform built with a modern full-stack architecture. It provides structured project governance, role-based collaboration (RBAC), lifecycle control, Kanban workflows, and complete activity visibility for startups and engineering organizations.

This repository is organized as a monorepo containing both the backend API and frontend application.

---

## 🏗 Architecture Overview

ProjectMaster follows a clean, scalable SaaS architecture:

* **Frontend** : Next.js (App Router)
* **Backend** : NestJS (Modular architecture)
* **ORM** : Prisma
* **Database** : PostgreSQL
* **Authentication** : JWT (Access + Refresh tokens via HTTP-only cookies)
* **Monorepo Structure** : Apps-based separation

---

## 📦 Monorepo Structure

```
apps/
  backend/     → NestJS API (Prisma + PostgreSQL)
  frontend/    → Next.js SaaS frontend
```

### Backend (`apps/backend`)

* NestJS modular architecture
* Prisma ORM
* Role-based access control (Owner / Admin / Member)
* Project lifecycle management (Active / Completed / Archived)
* Activity logging
* JWT authentication with secure cookies

### Frontend (`apps/frontend`)

* Next.js App Router
* TypeScript
* Tailwind CSS
* Framer Motion (UI interactions)
* MDX-ready documentation system
* SEO optimized metadata + OpenGraph support

---

# 🚀 Getting Started

## Prerequisites

* Node.js v18+
* npm (or yarn / pnpm)
* PostgreSQL database

---

## 1️⃣ Install Dependencies

Install backend dependencies:

```
cd apps/backend
npm install
```

Install frontend dependencies:

```
cd ../frontend
npm install
```

---

## 2️⃣ Configure Environment Variables

Create `.env` files in both apps.

### Backend `.env`

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/projectmaster"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=4000
```

Make sure:

* The database exists
* Credentials are correct

---

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If deploying:

* Replace with your production backend URL.

---

## 3️⃣ Database Setup (Backend)

Run Prisma migrations:

```
cd apps/backend
npx prisma migrate deploy
npx prisma generate
```

For development (if no migrations exist yet):

```
npx prisma migrate dev
```

Optional: Open Prisma Studio

```
npx prisma studio
```

---

## 4️⃣ Run Development Servers

### Start Backend

```
cd apps/backend
npm run start:dev
```

Backend runs on:

```
http://localhost:4000
```

---

### Start Frontend

```
cd apps/frontend
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🔐 Authentication Architecture

ProjectMaster uses:

* JWT Access Token (short-lived)
* Refresh Token (HTTP-only secure cookie)
* Server-side validation
* Role-based authorization guards
* CORS with credentials enabled

For production:

* Use HTTPS
* Set secure cookie flags
* Use strong JWT secrets
* Rotate refresh tokens

---

# 🧠 Core Platform Features

## Workspace Governance

* Project lifecycle states (Active, Completed, Archived)
* Structured ownership model
* Archive + delete controls
* Audit logging

## Role-Based Collaboration

* Owner
* Admin
* Member
* Permission-based API guards

## Task Management

* Kanban workflow
* Task assignment
* Due dates
* Priority management

## Activity Logs

* Project-level logging
* User activity tracking
* Structured audit history

## Developer Documentation System

The application includes a fully custom-built documentation system available under the `/docs` route.

This documentation system is implemented entirely on the frontend using:

* Next.js (App Router)
* React Client Components
* Tailwind CSS
* Framer Motion
* Lucide Icons

It is designed to provide a modern, interactive, and developer-friendly documentation experience similar to Stripe or Vercel docs.

---

# 📚 Documentation System (Frontend)

The `/docs` route supports:

* Dynamic sidebar navigation
* Real-time search filtering
* Scroll-spy active section highlighting
* Mobile responsive sidebar
* Collapsible table of contents
* Copy-to-clipboard API examples
* Sticky right-side anchor navigation
* Next / Previous section navigation
* Back-to-top button
* Animated section reveal (Framer Motion)

---

# 🧪 Testing

Backend:

```
cd apps/backend
npm run test
npm run test:e2e
```

Frontend:

```
cd apps/frontend
npm run lint
npm run build
```

---

# 🏭 Production Deployment

## Backend

* Deploy to:
  * Render
  * Railway
  * Fly.io
  * AWS / DigitalOcean
* Set environment variables securely
* Use managed PostgreSQL
* Enable HTTPS

## Frontend

* Deploy to:
  * Vercel (recommended)
  * Netlify
  * Cloudflare Pages

Make sure:

* `NEXT_PUBLIC_API_URL` points to production backend

# 🛠 Developer Notes

* Backend runs on port 4000
* Frontend runs on port 3000
* CORS must allow credentials
* Prisma must generate client before running backend
* Always restart backend after schema changes

# 📄 License

MIT License

---

ProjectMaster is designed as a serious, production-grade SaaS foundation — built for teams that require structure, governance, and clarity in project execution.
