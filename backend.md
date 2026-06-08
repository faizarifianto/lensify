# ⚙️ Lensify — Dokumentasi Backend

---

## 📖 Daftar Isi

- [Overview](#-overview)
- [Tech Stack Backend](#-tech-stack-backend)
- [Struktur Folder](#-struktur-folder)
- [Konfigurasi & Environment](#-konfigurasi--environment)
- [Entry Point & Middleware Global](#-entry-point--middleware-global)
- [Database & Prisma ORM](#-database--prisma-orm)
- [Middleware](#-middleware)
- [Routes & Endpoints API](#-routes--endpoints-api)
- [Controllers (Business Logic)](#-controllers-business-logic)
- [Utilitas](#-utilitas)
- [Alur Autentikasi (Auth Flow)](#-alur-autentikasi-auth-flow)
- [Alur Booking (Booking Flow)](#-alur-booking-booking-flow)
- [Upload File](#-upload-file)
- [Error Handling](#-error-handling)
- [Menjalankan Backend](#-menjalankan-backend)
- [Perintah Database](#-perintah-database)

---

## 🌐 Overview

Backend Lensify adalah **RESTful API** yang dibangun menggunakan **Express.js** dengan **Prisma ORM** untuk manajemen database **SQLite**. Backend ini menangani seluruh logika bisnis platform penyewaan kamera, termasuk autentikasi, manajemen produk, booking, review, dan dashboard analytics admin.

### Karakteristik Utama

- 🔒 **JWT Authentication** — Token-based dengan expiry 7 hari
- 🛡️ **Role-Based Access Control** — Middleware pemisah USER/ADMIN
- 📏 **Input Validation** — Schema validation menggunakan Zod
- 🗄️ **ORM** — Prisma Client untuk type-safe database queries
- 📁 **File Upload** — Multer untuk gambar kamera, KTP, dan avatar
- 🔄 **Soft Delete** — Kamera dihapus secara logical (flag `isDeleted`)
- 📊 **Analytics** — Aggregation queries untuk dashboard admin

---

## 🛠 Tech Stack Backend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Node.js** | >= 18.x | JavaScript runtime |
| **Express.js** | ^4.21.2 | Web framework / REST API |
| **Prisma ORM** | ^5.22.0 | Database ORM (schema, migrations, queries) |
| **SQLite** | — | Database relasional ringan (file-based) |
| **jsonwebtoken** | ^9.0.2 | JWT token signing & verification |
| **bcryptjs** | ^2.4.3 | Password hashing (cost factor: 12) |
| **Zod** | ^3.24.1 | Schema validation untuk input request |
| **Multer** | ^1.4.5 | Middleware upload file (multipart/form-data) |
| **CORS** | ^2.8.5 | Cross-Origin Resource Sharing |
| **dotenv** | ^16.4.7 | Manajemen environment variables |
| **Nodemon** | ^3.1.9 | Auto-restart server saat development |

---

## 📁 Struktur Folder

```
backend/
├── prisma/
│   ├── schema.prisma              # Definisi model database
│   ├── migrations/                # Riwayat migrasi database
│   │   └── [timestamp]_init/
│   │       └── migration.sql
│   └── dev.db                     # File database SQLite
│
├── src/
│   ├── app.js                     # Entry point server Express
│   │
│   ├── controllers/               # Business logic per domain
│   │   ├── authController.js      # Register, login, getMe, updateProfile
│   │   ├── cameraController.js    # getCameras, getCameraById, getTopCameras
│   │   ├── bookingController.js   # createBooking, getMyBookings, cancelBooking
│   │   ├── reviewController.js    # createReview, getCameraReviews, getMyReviews
│   │   ├── testimonialController.js # createTestimonial, getMyTestimonials, getAll
│   │   └── adminController.js     # Dashboard stats, CRUD kamera, kelola booking, review
│   │
│   ├── routes/                    # Definisi endpoint routing
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── cameraRoutes.js        # /api/cameras/*
│   │   ├── bookingRoutes.js       # /api/bookings/*
│   │   ├── reviewRoutes.js        # /api/reviews/*
│   │   ├── testimonialRoutes.js   # /api/testimonials/*
│   │   └── adminRoutes.js         # /api/admin/*
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── authMiddleware.js      # Verifikasi JWT token
│   │   ├── adminMiddleware.js     # Cek role ADMIN
│   │   └── uploadMiddleware.js    # Konfigurasi Multer upload
│   │
│   └── utils/                     # Script utilitas
│       ├── seed.js                # Seed data awal ke database
│       └── reset-db.js            # Reset/clear database
│
├── uploads/                       # (Legacy) Folder upload alternatif
├── .env                           # Environment variables
└── package.json                   # Dependencies & npm scripts
```

---

## ⚙️ Konfigurasi & Environment

### File `.env`

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="lensify_super_secret_jwt_key_2025"
JWT_EXPIRES_IN="7d"
PORT=5000
```

| Variable | Tipe | Deskripsi | Default |
|----------|------|-----------|---------|
| `DATABASE_URL` | String | Path ke file database SQLite | `file:./dev.db` |
| `JWT_SECRET` | String | Secret key untuk signing JWT token | *(wajib)* |
| `JWT_EXPIRES_IN` | String | Masa berlaku token | `7d` |
| `PORT` | Number | Port server Express | `5000` |

### NPM Scripts

| Script | Command | Deskripsi |
|--------|---------|-----------|
| `npm start` | `node src/app.js` | Jalankan server (production) |
| `npm run dev` | `nodemon src/app.js` | Jalankan server (development, hot reload) |
| `npm run db:migrate` | `npx prisma migrate dev --name init` | Jalankan migrasi database |
| `npm run db:generate` | `npx prisma generate` | Generate Prisma Client |
| `npm run db:studio` | `npx prisma studio` | Buka Prisma Studio (GUI database) |
| `npm run db:seed` | `node src/utils/seed.js` | Seed data awal |

---

## 🚪 Entry Point & Middleware Global

### `src/app.js`

File utama yang menginisialisasi Express server:

```javascript
// 1. Load environment variables
require('dotenv').config();

// 2. Import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');

// 3. Import routes
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
// ... (semua routes)

const app = express();
```

### Middleware Global (Urutan Eksekusi)

| # | Middleware | Deskripsi |
|---|-----------|-----------|
| 1 | `cors()` | Izinkan request dari `localhost:5173` dan `localhost:3000` |
| 2 | `express.json()` | Parse JSON request body |
| 3 | `express.urlencoded()` | Parse URL-encoded request body |
| 4 | `express.static('/uploads')` | Serve file statis dari `frontend/public/uploads/` |

### Konfigurasi CORS

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### Static File Serving

```javascript
app.use('/uploads', express.static(
  path.join(__dirname, '../../frontend/public/uploads')
));
```

File upload (gambar kamera, KTP, avatar) disimpan di folder `frontend/public/uploads/` dan diakses melalui path `/uploads/[filename]`.

### Health Check

```
GET /api/health → { status: 'OK', message: 'Lensify API is running' }
```

### Global Error Handler

Menangkap semua error yang tidak ter-handle dan mengembalikan response dengan format konsisten:

```javascript
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
```

---

## 🗄 Database & Prisma ORM

### Schema (`prisma/schema.prisma`)

#### Provider & Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### Model: User

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String                    // bcrypt hashed
  phone     String?
  avatar    String?                   // Path ke file gambar
  role      String   @default("USER") // "USER" | "ADMIN"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings     Booking[]
  reviews      Review[]
  testimonials Testimonial[]
}
```

| Field | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | Int | PK, auto-increment | ID unik |
| `name` | String | required | Nama lengkap |
| `email` | String | unique | Email (login identifier) |
| `password` | String | required | Password (bcrypt hashed, factor 12) |
| `phone` | String? | optional | Nomor telepon |
| `avatar` | String? | optional | Path file avatar |
| `role` | String | default "USER" | Role: "USER" atau "ADMIN" |

#### Model: Camera

```prisma
model Camera {
  id          Int      @id @default(autoincrement())
  name        String
  brand       String
  category    String                      // "DSLR", "Mirrorless", dll.
  description String
  specs       String                      // JSON string spesifikasi
  pricePerDay Float
  stock       Int      @default(1)
  images      String   @default("[]")     // JSON array path gambar
  isAvailable Boolean  @default(true)
  isDeleted   Boolean  @default(false)    // Soft delete flag
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  bookings Booking[]
  reviews  Review[]
}
```

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `name` | String | Nama kamera (e.g., "Canon EOS R5") |
| `brand` | String | Merek kamera (e.g., "Canon") |
| `category` | String | Kategori: DSLR, Mirrorless, Action Cam, Lensa, dll. |
| `specs` | String | JSON string spesifikasi teknis |
| `pricePerDay` | Float | Harga sewa per hari (Rupiah) |
| `stock` | Int | Jumlah stok unit |
| `images` | String | JSON array path file gambar (`["/uploads/xxx.jpg"]`) |
| `isAvailable` | Boolean | Apakah kamera tersedia untuk disewa |
| `isDeleted` | Boolean | Soft delete flag (true = dianggap terhapus) |

#### Model: Booking

```prisma
model Booking {
  id            Int      @id @default(autoincrement())
  userId        Int                        // FK → User
  cameraId      Int                        // FK → Camera
  startDate     DateTime
  endDate       DateTime
  totalDays     Int
  totalPrice    Float
  status        String   @default("PENDING") // PENDING|CONFIRMED|ONGOING|RETURNED|CANCELLED
  notes         String?
  address       String?                    // Alamat pengiriman
  phone         String?                    // Nomor telepon checkout
  ktpPath       String?                    // Path file foto KTP
  paymentMethod String?                    // Metode pembayaran
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id])
  camera Camera @relation(fields: [cameraId], references: [id])
  review Review?
}
```

#### Model: Review

```prisma
model Review {
  id        Int      @id @default(autoincrement())
  userId    Int                            // FK → User
  cameraId  Int                            // FK → Camera
  bookingId Int      @unique               // FK → Booking (1:1)
  rating    Int                            // 1-5
  comment   String?
  reply     String?                        // Balasan admin
  createdAt DateTime @default(now())

  user    User    @relation(...)
  camera  Camera  @relation(...)
  booking Booking @relation(...)
}
```

#### Model: Testimonial

```prisma
model Testimonial {
  id        Int      @id @default(autoincrement())
  userId    Int                            // FK → User
  rating    Int                            // 1-5
  message   String                         // Minimal 10 karakter
  reply     String?                        // Balasan admin
  createdAt DateTime @default(now())

  user User @relation(...)
}
```

### Relasi Antar Model

```
User ──1:N──► Booking ──1:1──► Review
User ──1:N──► Review
User ──1:N──► Testimonial
Camera ──1:N──► Booking
Camera ──1:N──► Review
```

---

## 🛡 Middleware

### 1. Auth Middleware (`middleware/authMiddleware.js`)

**Tujuan**: Memverifikasi JWT token dari header Authorization.

**Alur Kerja**:

```
Request masuk
    │
    ▼
Cek header "Authorization: Bearer <token>"
    │
    ├── Tidak ada → 401: "No token provided"
    │
    ▼
Verify token dengan jwt.verify(token, JWT_SECRET)
    │
    ├── Gagal → 401: "Invalid or expired token"
    │
    ▼
Extract userId & role dari decoded token
    │
    ▼
Set req.userId & req.userRole
    │
    ▼
next() → Lanjut ke handler berikutnya
```

**Output**:
- `req.userId` — ID pengguna yang ter-autentikasi
- `req.userRole` — Role pengguna (`"USER"` atau `"ADMIN"`)

### 2. Admin Middleware (`middleware/adminMiddleware.js`)

**Tujuan**: Memastikan pengguna yang ter-autentikasi memiliki role ADMIN.

```javascript
const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};
```

> **Catatan**: Middleware ini selalu digunakan setelah `authMiddleware`, karena membutuhkan `req.userRole` yang di-set oleh auth middleware.

### 3. Upload Middleware (`middleware/uploadMiddleware.js`)

**Tujuan**: Konfigurasi Multer untuk menangani file upload.

| Konfigurasi | Nilai |
|-------------|-------|
| **Destinasi** | `frontend/public/uploads/` |
| **Penamaan File** | `[timestamp]-[random].[ext]` |
| **Tipe File Diizinkan** | JPEG, JPG, PNG, WebP |
| **Ukuran Maksimal** | 5 MB |

```javascript
// Penggunaan di routes:
upload.single('avatar')         // Single file (profil, KTP)
upload.single('ktp')            // Single file (KTP checkout)
upload.array('images', 5)       // Multiple files (gambar kamera, maks 5)
```

**Destinasi File**:
File disimpan langsung ke `frontend/public/uploads/` agar bisa diakses langsung oleh frontend tanpa konfigurasi tambahan saat development.

---

## 🛣 Routes & Endpoints API

### Ringkasan Semua Routes

| Prefix | File Route | Middleware | Deskripsi |
|--------|-----------|------------|-----------|
| `/api/auth` | `authRoutes.js` | Partial auth | Autentikasi pengguna |
| `/api/cameras` | `cameraRoutes.js` | None | Data kamera (publik) |
| `/api/bookings` | `bookingRoutes.js` | `authMiddleware` | Booking user |
| `/api/reviews` | `reviewRoutes.js` | Partial auth | Review kamera |
| `/api/testimonials` | `testimonialRoutes.js` | Partial auth | Testimoni layanan |
| `/api/admin` | `adminRoutes.js` | `authMiddleware` + `adminMiddleware` | Manajemen admin |

---

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/auth/register` | ❌ | Registrasi user baru |
| `POST` | `/api/auth/login` | ❌ | Login user |
| `GET` | `/api/auth/me` | ✅ | Ambil data user saat ini |
| `PUT` | `/api/auth/profile` | ✅ + upload | Update profil (nama, phone, avatar) |

#### `POST /api/auth/register`

**Request Body**:
```json
{
  "name": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "phone": "string (optional)"
}
```

**Validasi**: Menggunakan Zod schema.

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": 1, "name": "...", "email": "...", "role": "USER", ... },
    "token": "eyJhbG..."
  }
}
```

#### `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "...", "email": "...", "role": "USER|ADMIN", ... },
    "token": "eyJhbG..."
  }
}
```

#### `GET /api/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "...", "email": "...", "phone": "...", "avatar": "...", "role": "USER", "createdAt": "..." }
  }
}
```

#### `PUT /api/auth/profile`

**Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data**:
| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `name` | string | ❌ | Nama baru |
| `phone` | string | ❌ | Nomor telepon baru |
| `avatar` | file | ❌ | File gambar avatar |

---

### Camera Routes (`/api/cameras`)

Semua route ini **publik** (tidak memerlukan autentikasi).

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/cameras/top` | 3 kamera terpopuler |
| `GET` | `/api/cameras` | Daftar kamera dengan filter |
| `GET` | `/api/cameras/:id` | Detail kamera |

#### `GET /api/cameras`

**Query Parameters**:

| Param | Tipe | Deskripsi |
|-------|------|-----------|
| `category` | string | Filter kategori (e.g., "DSLR") |
| `search` | string | Pencarian nama/brand |
| `minPrice` | number | Harga minimum per hari |
| `maxPrice` | number | Harga maksimum per hari |
| `startDate` | ISO date | Filter ketersediaan mulai tanggal |
| `endDate` | ISO date | Filter ketersediaan sampai tanggal |

**Logika Filter Ketersediaan**:
1. Query semua kamera yang `isDeleted: false` dan `isAvailable: true`
2. Jika ada `startDate` & `endDate`: cari booking yang overlap, exclude kamera yang sudah terbooking
3. Tambahkan `avgRating` dan `reviewCount` dari relasi Review

**Response** (200):
```json
{
  "success": true,
  "data": {
    "cameras": [
      {
        "id": 1,
        "name": "Canon EOS R5",
        "brand": "Canon",
        "category": "Mirrorless",
        "pricePerDay": 250000,
        "images": ["/uploads/xxx.jpg"],
        "avgRating": 4.5,
        "reviewCount": 12,
        ...
      }
    ]
  }
}
```

#### `GET /api/cameras/top`

Mengembalikan 3 kamera paling banyak disewa berdasarkan jumlah booking dengan status `CONFIRMED`, `ONGOING`, atau `RETURNED`. Jika belum ada booking, fallback ke 3 kamera terbaru.

#### `GET /api/cameras/:id`

Mengembalikan detail lengkap kamera termasuk:
- Semua review (beserta user info)
- Booking aktif (untuk pengecekan ketersediaan)
- Average rating dan review count

---

### Booking Routes (`/api/bookings`)

Semua route memerlukan **autentikasi** (`authMiddleware`).

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/bookings` | Buat booking baru (multi-item) |
| `GET` | `/api/bookings/my` | Booking milik user |
| `GET` | `/api/bookings/:id` | Detail booking |
| `PUT` | `/api/bookings/:id/cancel` | Batalkan booking |

#### `POST /api/bookings`

**Content-Type**: `multipart/form-data`

**Form Data**:

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `items` | JSON string | ✅ | Array ID kamera: `"[1, 2, 3]"` |
| `startDate` | ISO date | ✅ | Tanggal mulai sewa |
| `endDate` | ISO date | ✅ | Tanggal selesai sewa |
| `ktp` | file | ✅ | Foto KTP |
| `address` | string | ❌ | Alamat pengiriman |
| `phone` | string | ❌ | Nomor telepon |
| `paymentMethod` | string | ❌ | Metode pembayaran |
| `notes` | string | ❌ | Catatan tambahan |

**Logika Proses**:

```
1. Parse items JSON → array cameraIds
2. Validasi tanggal (endDate > startDate)
3. Cek semua kamera exist & available
4. Cek overlap jadwal per kamera
5. Hitung totalDays & totalPrice per kamera
6. Buat booking dalam TRANSACTION (satu per kamera)
7. Semua booking dibuat dengan status PENDING
```

**Response** (201):
```json
{
  "success": true,
  "message": "Checkout successful",
  "data": {
    "orderId": 1,
    "bookings": [
      {
        "id": 1,
        "cameraId": 1,
        "totalDays": 3,
        "totalPrice": 750000,
        "status": "PENDING",
        "camera": { "name": "Canon EOS R5", ... },
        ...
      }
    ]
  }
}
```

#### `PUT /api/bookings/:id/cancel`

**Syarat**: Hanya booking dengan status `PENDING` yang bisa dibatalkan. User hanya bisa membatalkan booking miliknya sendiri.

---

### Review Routes (`/api/reviews`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/reviews` | ✅ | Submit review |
| `GET` | `/api/reviews/camera/:cameraId` | ❌ | Review per kamera |
| `GET` | `/api/reviews/my` | ✅ | Review milik user |

#### `POST /api/reviews`

**Request Body**:
```json
{
  "bookingId": 1,
  "rating": 5,
  "comment": "Kameranya sangat bagus!"
}
```

**Validasi**:
- Rating harus antara 1-5
- Booking harus milik user yang sedang login
- Status booking harus `RETURNED`
- Belum ada review untuk booking tersebut (1 booking = 1 review)

---

### Testimonial Routes (`/api/testimonials`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/testimonials` | ✅ | Submit testimoni layanan |
| `GET` | `/api/testimonials/my` | ✅ | Testimoni milik user |
| `GET` | `/api/testimonials` | ❌ | Semua testimoni (publik, maks 20) |

#### `POST /api/testimonials`

**Request Body**:
```json
{
  "rating": 5,
  "message": "Layanan Lensify sangat memuaskan! Proses cepat dan kamera berkualitas."
}
```

**Validasi**:
- Rating: 1-5
- Message: minimal 10 karakter

---

### Admin Routes (`/api/admin`)

Semua route memerlukan **autentikasi** DAN **role ADMIN** (`authMiddleware` + `adminMiddleware`).

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| **Dashboard** | | |
| `GET` | `/api/admin/stats` | Statistik dashboard |
| **Users** | | |
| `GET` | `/api/admin/users` | Daftar semua user |
| **Bookings** | | |
| `GET` | `/api/admin/bookings` | Semua booking (paginasi) |
| `POST` | `/api/admin/bookings` | Booking offline (walk-in) |
| `PUT` | `/api/admin/bookings/:id/status` | Update status booking |
| **Cameras** | | |
| `GET` | `/api/admin/cameras` | Semua kamera (termasuk count) |
| `POST` | `/api/admin/cameras` | Tambah kamera baru |
| `PUT` | `/api/admin/cameras/:id` | Edit kamera |
| `DELETE` | `/api/admin/cameras/:id` | Soft delete kamera |
| **Reviews** | | |
| `GET` | `/api/admin/reviews` | Semua review |
| `PUT` | `/api/admin/reviews/:id/reply` | Balas review |
| **Testimonials** | | |
| `GET` | `/api/admin/testimonials` | Semua testimoni |
| `PUT` | `/api/admin/testimonials/:id/reply` | Balas testimoni |

#### `GET /api/admin/stats`

Endpoint paling kompleks — mengambil semua data yang dibutuhkan dashboard admin dalam satu request.

**Query Parameters**:

| Param | Nilai | Deskripsi |
|-------|-------|-----------|
| `period` | `this_month` | Bulan ini (default) |
| | `last_month` | Bulan lalu |
| | `this_year` | Tahun ini |
| | `all_time` | Semua waktu |

**Response Data**:

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalBookingsToday": 5,
      "pendingBookings": 3,
      "ongoingBookings": 8,
      "monthlyRevenue": 15000000,
      "totalBookings": 42,
      "totalCameras": 25,
      "totalUsers": 100,
      "maintenanceCameras": 2,
      "categoryDistribution": [
        { "category": "DSLR", "_count": 10 },
        { "category": "Mirrorless", "_count": 8 }
      ],
      "pendingTestimonials": 5
    },
    "monthlyChart": [
      { "month": "2026-01", "count": 15, "revenue": 5000000 }
    ],
    "dailyChart": [
      { "day": "2026-06-01", "count": 3, "revenue": 750000 }
    ],
    "topPerformers": [
      { "id": 1, "name": "Canon EOS R5", "totalRented": 15, "revenue": 3750000, ... }
    ]
  }
}
```

**Aggregation Queries**:
1. Booking hari ini
2. Booking pending & ongoing
3. Revenue periode terpilih (status: CONFIRMED, ONGOING, RETURNED)
4. Total kamera, user, kamera maintenance
5. Booking per bulan (6 bulan terakhir)
6. Booking per hari (periode terpilih)
7. Distribusi kategori kamera
8. Testimoni & review belum dibalas
9. Top 5 kamera performer

#### `GET /api/admin/bookings`

**Query Parameters**:

| Param | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| `status` | string | — | Filter status booking |
| `page` | number | 1 | Halaman paginasi |
| `limit` | number | 20 | Jumlah per halaman |
| `search` | string | — | Cari by nama user, nama kamera, atau ID |

#### `POST /api/admin/bookings` — Booking Offline

Memungkinkan admin membuat booking langsung untuk customer walk-in.

**Request Body**:
```json
{
  "cameraId": 1,
  "startDate": "2026-06-10",
  "endDate": "2026-06-13",
  "notes": "Walk-in customer",
  "userId": 5,              // Opsional: jika user sudah terdaftar
  "customer": {             // Opsional: jika user baru
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890"
  }
}
```

**Logika**:
- Jika `userId` tersedia → gunakan user tersebut
- Jika `customer` tersedia → cek email sudah terdaftar, jika belum buat user baru (password default: `lensify123`)
- Booking langsung dengan status `ONGOING`

#### `DELETE /api/admin/cameras/:id` — Soft Delete

Kamera tidak benar-benar dihapus dari database, melainkan field `isDeleted` diset ke `true`. Kamera yang soft-deleted tidak muncul di katalog maupun admin panel.

---

## 🎛 Controllers (Business Logic)

### `authController.js`

| Function | Route | Deskripsi |
|----------|-------|-----------|
| `register` | POST `/auth/register` | Validasi (Zod) → cek email unik → hash password (bcrypt, factor 12) → create user → generate JWT |
| `login` | POST `/auth/login` | Validasi (Zod) → find user by email → compare password → generate JWT |
| `getMe` | GET `/auth/me` | Find user by req.userId → return user data (tanpa password) |
| `updateProfile` | PUT `/auth/profile` | Update nama/phone/avatar → handle file upload |

### `cameraController.js`

| Function | Route | Deskripsi |
|----------|-------|-----------|
| `getCameras` | GET `/cameras` | Filter by category, search, price, date availability → include avg rating |
| `getCameraById` | GET `/cameras/:id` | Detail kamera + reviews + active bookings |
| `getTopCameras` | GET `/cameras/top` | Top 3 berdasarkan jumlah booking (fallback: 3 terbaru) |

### `bookingController.js`

| Function | Route | Deskripsi |
|----------|-------|-----------|
| `createBooking` | POST `/bookings` | Multi-item checkout → overlap check → Prisma transaction |
| `getMyBookings` | GET `/bookings/my` | Booking user + info kamera + review |
| `getBookingById` | GET `/bookings/:id` | Detail booking (ownership check) |
| `cancelBooking` | PUT `/bookings/:id/cancel` | Cancel booking PENDING milik user |

### `reviewController.js`

| Function | Route | Deskripsi |
|----------|-------|-----------|
| `createReview` | POST `/reviews` | Validasi rating 1-5 → cek booking RETURNED → cek belum review → create |
| `getCameraReviews` | GET `/reviews/camera/:id` | Review per kamera (publik) |
| `getMyReviews` | GET `/reviews/my` | Review milik user |

### `testimonialController.js`

| Function | Route | Deskripsi |
|----------|-------|-----------|
| `createTestimonial` | POST `/testimonials` | Validasi rating + pesan (min 10 char) → create |
| `getMyTestimonials` | GET `/testimonials/my` | Testimoni milik user |
| `getAllTestimonials` | GET `/testimonials` | Semua testimoni (publik, limit 20) |

### `adminController.js`

Controller terbesar dengan 12 fungsi untuk mengelola seluruh data dari panel admin.

| Function | Deskripsi |
|----------|-----------|
| `getDashboardStats` | Agregasi semua statistik dashboard |
| `getAllBookings` | Daftar booking dengan paginasi & search |
| `updateBookingStatus` | Update status booking (PENDING → CONFIRMED → ONGOING → RETURNED / CANCELLED) |
| `getAllCamerasAdmin` | Semua kamera + count bookings aktif & reviews |
| `createCamera` | Tambah kamera baru + upload gambar |
| `updateCamera` | Edit kamera + update gambar |
| `deleteCamera` | Soft delete kamera |
| `getAllUsers` | Daftar semua user (role USER) |
| `createOfflineBooking` | Booking walk-in customer |
| `getAllReviews` | Semua review + info user & kamera |
| `replyReview` | Balas review |
| `getAllTestimonialsAdmin` | Semua testimoni + info user |
| `replyTestimonial` | Balas testimoni |

---

## 🧰 Utilitas

### `utils/seed.js`

Script untuk mengisi database dengan data awal (kamera, user, dll.). Dijalankan dengan:

```bash
npm run db:seed
```

### `utils/reset-db.js`

Script untuk mereset/membersihkan database. Berguna untuk development.

---

## 🔐 Alur Autentikasi (Auth Flow)

```
┌──────────┐    POST /auth/register    ┌──────────┐
│  Client  │ ─────────────────────────►│  Server  │
│          │                            │          │
│          │    Zod Validation          │          │
│          │    Check email unique      │          │
│          │    bcrypt.hash(pw, 12)     │          │
│          │    prisma.user.create()    │          │
│          │    jwt.sign({userId,role}) │          │
│          │                            │          │
│          │◄─────────────────────────  │          │
│          │    { user, token }         │          │
│          │                            │          │
│          │    POST /auth/login        │          │
│          │ ─────────────────────────►│          │
│          │                            │          │
│          │    Find user by email      │          │
│          │    bcrypt.compare()        │          │
│          │    jwt.sign({userId,role}) │          │
│          │                            │          │
│          │◄─────────────────────────  │          │
│          │    { user, token }         │          │
│          │                            │          │
│          │    GET /auth/me            │          │
│          │    [Auth: Bearer token]    │          │
│          │ ─────────────────────────►│          │
│          │                            │          │
│          │    jwt.verify(token)       │          │
│          │    prisma.user.findUnique()│          │
│          │                            │          │
│          │◄─────────────────────────  │          │
│          │    { user }                │          │
└──────────┘                            └──────────┘
```

### JWT Token Payload

```json
{
  "userId": 1,
  "role": "USER",
  "iat": 1717776000,
  "exp": 1718380800
}
```

### Password Security

- **Algoritma**: bcrypt
- **Cost Factor**: 12 rounds
- Password **tidak pernah** dikembalikan di response API

---

## 📋 Alur Booking (Booking Flow)

```
User melakukan checkout
        │
        ▼
POST /api/bookings (multipart/form-data)
        │
        ▼
1. Parse items JSON → [cameraId1, cameraId2, ...]
        │
        ▼
2. Validasi: endDate > startDate
        │
        ▼
3. Query cameras → cek semua exist & isAvailable
        │
        ▼
4. Per kamera: cek overlap jadwal dengan booking aktif
   (status: PENDING, CONFIRMED, ONGOING)
        │
    ┌───┴──── Overlap? ────┐
    │ Ya                   │ Tidak
    ▼                      ▼
409 Conflict          5. Hitung totalDays & totalPrice
                           │
                           ▼
                     6. Prisma $transaction:
                        Create N bookings (1 per kamera)
                        Status: PENDING
                           │
                           ▼
                     201 Created
                     { orderId, bookings[] }
```

### Status Transition (Admin)

```
PENDING ──[Konfirmasi]──► CONFIRMED ──[Ambil]──► ONGOING ──[Kembali]──► RETURNED
   │                                                                        │
   └───[Batal]───► CANCELLED                                         User dapat Review
```

---

## 📁 Upload File

### Konfigurasi

| Setting | Nilai |
|---------|-------|
| Tujuan folder | `frontend/public/uploads/` |
| Format nama | `[timestamp]-[random].[extension]` |
| Tipe file | JPEG, JPG, PNG, WebP |
| Ukuran maks | 5 MB per file |

### Jenis Upload

| Konteks | Field | Tipe | Maks |
|---------|-------|------|------|
| Profil/Avatar | `avatar` | `single` | 1 file |
| Checkout KTP | `ktp` | `single` | 1 file |
| Gambar Kamera | `images` | `array` | 5 file |

### Path Akses

File yang diupload dapat diakses melalui:
- **Development**: `http://localhost:5173/uploads/[filename]` (via Vite proxy)
- **Direct**: `http://localhost:5000/uploads/[filename]` (via Express static)
- **Database**: Disimpan sebagai path relatif (`/uploads/[filename]`)

---

## ⚠️ Error Handling

### Format Error Response

Semua error mengikuti format konsisten:

```json
{
  "success": false,
  "message": "Deskripsi error yang informatif"
}
```

### Error Codes

| HTTP Status | Penggunaan | Contoh |
|-------------|------------|--------|
| `400` | Validasi gagal, input tidak valid | "All fields are required", "Rating must be between 1 and 5" |
| `401` | Token tidak ada atau tidak valid | "No token provided", "Invalid or expired token" |
| `403` | Akses ditolak (role tidak sesuai) | "Access denied. Admin only." |
| `404` | Resource tidak ditemukan | "Camera not found", "Booking not found" |
| `409` | Konflik data (overlap jadwal) | "Camera is already booked for the selected dates" |
| `500` | Internal server error | "Server error" |

### Validasi Input

- **Zod** digunakan di `authController` untuk validasi:
  - Register: nama (min 2), email (valid), password (min 6)
  - Login: email (valid), password (required)
- **Manual validation** di controller lain untuk:
  - Rating: 1-5
  - Tanggal: endDate > startDate
  - File: KTP wajib saat checkout
  - Status booking: validasi enum

---

## 🚀 Menjalankan Backend

### Development

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:5000`

### Production

```bash
cd backend
npm start
```

### Health Check

```
GET http://localhost:5000/api/health
→ { "status": "OK", "message": "Lensify API is running" }
```

---

## 🗃 Perintah Database

### Generate Prisma Client

Harus dijalankan setelah mengubah `schema.prisma`:

```bash
npx prisma generate
```

### Migrasi Database

Membuat tabel berdasarkan schema:

```bash
npx prisma migrate dev --name init
```

### Prisma Studio

GUI browser untuk melihat dan mengedit data di database:

```bash
npx prisma studio
```

Akses di `http://localhost:5555`

### Seed Data

Mengisi database dengan data awal:

```bash
npm run db:seed
```

### Reset Database

Menghapus semua data:

```bash
node src/utils/reset-db.js
```

---

> **Lihat juga**: [lensify.md](./lensify.md) untuk dokumentasi umum project, dan [frontend.md](./frontend.md) untuk dokumentasi frontend.
