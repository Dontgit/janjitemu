# Tech Stack — Temujanji

## Prinsip Pemilihan Stack
Stack dipilih dengan prinsip:
- cepat dibangun
- mudah dirawat
- murah dioperasikan
- cocok untuk MVP SaaS
- gampang dikembangkan setelah validasi pasar

## Rekomendasi Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui atau komponen custom sederhana

Alasan:
- cepat untuk bangun dashboard + public booking page
- SEO landing page bagus
- satu codebase untuk app dan marketing site
- komponen UI cepat dibangun

### Backend
- Next.js Route Handlers atau Express.js
- TypeScript

Rekomendasi praktis:
- untuk MVP, pakai **Next.js fullstack** agar lebih cepat
- jika nanti logic makin besar, bisa dipisah ke backend service terpisah

### Database
- PostgreSQL

Alasan:
- kuat untuk relational data
- cocok untuk booking, schedule, user, service, staff, dan appointment
- fleksibel untuk growth

### ORM
- Prisma

Alasan:
- cepat development
- schema jelas
- migration lebih rapi
- enak untuk maintain MVP

### Authentication
- Auth.js / NextAuth atau custom session auth

Rekomendasi:
- Auth.js untuk owner/admin dashboard

### Deployment
- Vercel untuk app
- Neon / Supabase / Railway PostgreSQL untuk database

Alternatif:
- VPS sendiri jika ingin biaya lebih hemat jangka panjang

### Email / Reminder
Untuk awal tanpa API rumit:
- email reminder sederhana
- internal reminder dashboard

Tahap berikutnya:
- WhatsApp gateway pihak ketiga
- notifikasi SMS jika diperlukan

### File Storage
- local dulu jika sangat awal
- lalu pindah ke S3-compatible storage bila perlu

### Analytics
- Plausible / Umami / PostHog (opsional)

## Struktur Teknis Awal
- marketing landing page
- public booking page
- owner dashboard
- admin dashboard ringan
- API booking
- API layanan
- API jadwal
- API customer

## Entitas Data Utama
- users
- businesses
- staff
- services
- business_hours
- availability_rules
- bookings
- booking_status_logs
- customers
- reminders

## Kenapa Stack Ini Cocok
- modern tapi tidak berlebihan
- cepat untuk build MVP
- mudah hire developer lain nanti
- dokumentasi luas
- gampang scale bertahap

## Versi Lebih Simple Kalau Mau Sangat Cepat
Kalau ingin super cepat:
- Next.js
- Tailwind
- Prisma
- PostgreSQL
- Auth.js
- Vercel

Ini sudah cukup kuat untuk MVP dan early paid users.
