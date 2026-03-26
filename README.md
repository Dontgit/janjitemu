# Temujanji MVP

Temujanji adalah MVP SaaS booking & scheduling untuk bisnis jasa. Repo ini sekarang sudah punya fondasi aplikasi nyata berbasis Next.js App Router, Prisma, dan PostgreSQL, sambil tetap menyimpan dokumen produk yang sudah ada.

## Fitur yang sudah jalan

- landing page dan CTA ke flow owner
- register + login owner berbasis password hash + signed cookie session
- forgot password / reset password flow yang practical untuk MVP
- onboarding bisnis + settings bisnis
- CRUD layanan
- CRUD customer
- CRUD booking + update status / reschedule
- halaman schedule / operasional
- halaman booking publik berbasis slug bisnis
- validasi jam operasional + bentrok slot booking
- fallback mock data saat database belum siap untuk kebutuhan read UI
- search / filter di halaman bookings, customers, dan services
- preservasi nilai form publik saat validasi gagal

## Route utama

- `/`
- `/dashboard`
- `/services`
- `/bookings`
- `/customers`
- `/schedule`
- `/settings`
- `/onboarding`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password?token=...`
- `/book/[slug]`

## Stack

- Next.js 15 App Router
- React 19
- Prisma
- PostgreSQL
- Tailwind CSS v4

## Struktur penting

- `app/` — route dan page App Router
- `components/` — UI reusable, layout, dan booking flow publik
- `lib/actions.ts` — server actions utama
- `lib/data.ts` — query helpers + fallback read data
- `lib/auth.ts` — session cookie, hashing password, reset token helpers
- `prisma/schema.prisma` — schema database utama
- `prisma/migrations/` — migration SQL yang bisa diaudit / diaplikasikan manual

## Environment

Gunakan `.env.example` sebagai template. Jangan commit credential asli ke repo.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
AUTH_SECRET="ganti-dengan-random-secret-minimal-32-karakter"
```

Keterangan:

- `DATABASE_URL`: koneksi PostgreSQL aplikasi.
- `AUTH_SECRET`: dipakai untuk menandatangani session cookie owner.
- development masih punya fallback secret internal bila `AUTH_SECRET` kosong, tapi sebaiknya tetap diisi agar perilaku konsisten.
- production wajib memakai `AUTH_SECRET` yang kuat dan unik.

Contoh membuat secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Setup lokal

1. Install dependency

```bash
npm install
```

2. Generate Prisma Client

```bash
npm run prisma:generate
```

3. Jalankan migration

```bash
npm run prisma:migrate:dev
```

4. Jalankan app

```bash
npm run dev
```

5. Buka `http://localhost:3000`

## Flow auth owner

1. Register di `/auth/register`
2. Sistem membuat akun owner + bisnis awal + jam operasional default
3. Setelah login, owner diarahkan ke onboarding / dashboard
4. Jika lupa password, buka `/auth/forgot-password`
5. MVP saat ini belum kirim email; sistem membuat link reset sekali pakai yang ditampilkan di halaman agar bisa langsung dites / dipakai admin internal

## Catatan forgot password MVP

Flow reset password saat ini sengaja sederhana:

- token reset disimpan di database
- masa berlaku 30 menit
- token hanya bisa dipakai sekali
- request reset baru akan menonaktifkan token lama
- belum ada email delivery provider; link reset ditampilkan di UI agar praktis untuk tahap MVP / internal ops

Kalau nanti mau production-ready, langkah berikutnya tinggal sambungkan email provider / WhatsApp notification lalu kirim link reset ke user.

## Prisma & database

- migration awal ada di `prisma/migrations/202603260001_init`
- migration reset password ada di `prisma/migrations/202603261410_add_password_reset_tokens`
- render read pages akan fallback ke mock data jika DB belum siap / error
- write actions tetap butuh `DATABASE_URL` yang valid

## Validasi yang sudah ada

- password minimal 8 karakter
- email dan nomor WhatsApp divalidasi basic
- booking harus di masa depan
- booking harus ada dalam jam operasional
- slot bentrok tidak bisa dipakai
- layanan dengan histori booking akan dinonaktifkan, bukan dihapus keras
- customer dengan booking tidak bisa dihapus

## Verifikasi yang disarankan setelah setup

```bash
npm run lint
npm run typecheck
npm run build
```

## Yang masih belum ada

- pengiriman email / WhatsApp otomatis
- staff / multi-user permission yang serius
- pembayaran online
- pagination / filter yang lebih advance
- calendar drag-and-drop
- upload asset / foto layanan
