# EDU-Platfrom-NexLearn

> **Your Next Level of Learning Starts Here** ⚡

A production-ready, full-stack AI-powered Online Tutoring Platform built with **Next.js 16**, **MongoDB**, **Stripe**, **Jitsi Meet**, **Cloudinary**, and **Google Gemini AI**.

---

## 👨‍💻 Developer

**Built by [Asif](https://github.com/md-asif-iqbal)**

---

## 🚀 Features

- 🤖 **AI Tools** — Homework Helper, Quiz Generator, Essay Checker, Study Planner (Google Gemini 2.5 Flash)
- 🎥 **Live Video Sessions** — Jitsi Meet (free, no key needed)
- 💳 **Payments** — Stripe integration for course enrollment
- ☁️ **File Uploads** — Cloudinary for avatars and course thumbnails
- 📧 **Transactional Emails** — Resend API (welcome & session booking)
- 🔐 **Authentication** — NextAuth.js (credentials + Google OAuth)
- 📊 **Dashboards** — Student, Tutor, and Admin dashboards
- 🎓 **Course System** — Video lessons with YouTube embeds, enrollment, progress tracking
- ⭐ **Reviews & Ratings** — Verified student reviews
- 📱 **Fully Responsive** — Mobile-first design with Tailwind CSS v4

---

## 🛠️ Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Framework   | Next.js 16.1.6 (App Router, Turbopack) |
| Language    | TypeScript                             |
| Styling     | Tailwind CSS v4 + shadcn/ui            |
| Database    | MongoDB Atlas (Mongoose)               |
| Auth        | NextAuth.js                            |
| AI          | Google Gemini 2.5 Flash                |
| Payments    | Stripe                                 |
| Video       | Jitsi Meet (meet.jit.si)               |
| Storage     | Cloudinary                             |
| Email       | Resend                                 |
| Deployment  | Vercel                                 |

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/md-asif-iqbal/EDU-Platfrom-NexLearn.git
cd EDU-Platfrom-NexLearn
npm install
```

### 2. Set up environment variables

Create `.env.local` in the root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/nexlearn
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NexLearn
NEXT_PUBLIC_APP_TAGLINE=Your Next Level of Learning Starts Here
```

### 3. Seed the database

```bash
npx tsx scripts/seed.ts
```

Creates admin, student accounts + 6 tutors + 6 full courses.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Register
│   ├── (dashboard)/     # Student / Tutor / Admin dashboards
│   ├── api/             # REST API routes
│   ├── ai/              # AI Tools page
│   ├── courses/         # Course listing & detail
│   ├── tutors/          # Tutor directory
│   ├── session/         # Live Jitsi video sessions
│   └── profile/         # User profiles
├── components/          # Reusable UI components
├── lib/                 # DB, auth, email, cloudinary helpers
├── models/              # Mongoose models
└── types/               # TypeScript types
```

---

## 🚢 Deploy to Vercel

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com/new)
3. Add all env variables in Vercel dashboard
4. Deploy ✅

---

## 📄 License

MIT © 2025 [Asif](https://github.com/md-asif-iqbal)
