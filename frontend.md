# 🎨 Lensify — Dokumentasi Frontend

---

## 📖 Daftar Isi

- [Overview](#-overview)
- [Tech Stack Frontend](#-tech-stack-frontend)
- [Struktur Folder](#-struktur-folder)
- [Konfigurasi](#-konfigurasi)
- [Routing & Navigasi](#-routing--navigasi)
- [State Management](#-state-management)
- [API Service Layer](#-api-service-layer)
- [Komponen](#-komponen)
- [Halaman (Pages)](#-halaman-pages)
- [Desain & Styling](#-desain--styling)
- [Animasi & Transisi](#-animasi--transisi)
- [Autentikasi & Proteksi Route](#-autentikasi--proteksi-route)
- [Menjalankan Frontend](#-menjalankan-frontend)

---

## 🌐 Overview

Frontend Lensify dibangun menggunakan **React 18** dengan **Vite** sebagai build tool. Aplikasi ini menggunakan pendekatan **Single Page Application (SPA)** dengan client-side routing via React Router DOM. Desain mengutamakan pengalaman premium dengan animasi halus menggunakan Framer Motion dan styling yang responsif dengan TailwindCSS.

### Karakteristik Utama

- ⚡ **Fast Refresh** dengan Vite HMR
- 🎭 **Animasi halaman** dengan Framer Motion (AnimatePresence)
- 🛡️ **Role-Based Access Control (RBAC)** di sisi client
- 🛒 **Shopping Cart** dengan persistensi (Zustand + localStorage)
- 📱 **Responsive Design** untuk desktop dan mobile
- 📄 **PDF Export** untuk laporan (html2canvas + jsPDF)
- 🔔 **Toast Notifications** untuk feedback user (react-hot-toast)

---

## 🛠 Tech Stack Frontend

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React | ^18.3.1 | Library UI utama (component-based) |
| Vite | ^6.0.3 | Build tool & development server |
| React Router DOM | ^6.28.0 | Client-side routing & navigasi |
| Zustand | ^5.0.2 | State management global (ringan & modern) |
| Axios | ^1.7.9 | HTTP client untuk komunikasi dengan backend API |
| TailwindCSS | ^3.4.16 | Utility-first CSS framework |
| Framer Motion | ^12.40.0 | Library animasi deklaratif |
| Lucide React | ^0.468.0 | Icon library (modern, tree-shakeable) |
| React Hot Toast | ^2.4.1 | Sistem notifikasi toast |
| date-fns | ^4.1.0 | Utilitas manipulasi dan format tanggal |
| React DatePicker | ^7.5.0 | Komponen input tanggal interaktif |
| html2canvas | ^1.4.1 | Screenshot elemen DOM ke canvas |
| jsPDF | ^4.2.1 | Generasi file PDF di client-side |
| Styled Components | ^6.4.2 | CSS-in-JS (digunakan selektif) |
| PostCSS | ^8.4.49 | Post-processing CSS |
| Autoprefixer | ^10.4.20 | Auto vendor prefix CSS |

---

## 📁 Struktur Folder

```
frontend/
├── public/
│   └── uploads/                  # File gambar yang diupload (kamera, KTP, avatar)
│
├── src/
│   ├── App.jsx                   # Root component: routing, layout, protected routes
│   ├── main.jsx                  # Entry point: render App ke DOM
│   ├── index.css                 # Global styles & Tailwind directives
│   │
│   ├── components/
│   │   ├── features/             # Komponen fitur bisnis
│   │   │   ├── CameraCard.jsx    # Kartu kamera untuk katalog
│   │   │   └── CartDrawer.jsx    # Drawer keranjang belanja slide-in
│   │   │
│   │   ├── layout/               # Komponen layout struktural
│   │   │   ├── Navbar.jsx        # Navigasi atas (user-facing)
│   │   │   ├── Footer.jsx        # Footer website
│   │   │   ├── AdminSidebar.jsx  # Sidebar navigasi admin
│   │   │   └── UserSidebar.jsx   # Sidebar navigasi user dashboard
│   │   │
│   │   └── ui/                   # Komponen UI reusable
│   │       ├── FlipCard.jsx      # Kartu flip animasi (kategori di landing)
│   │       ├── GlobalLoader.jsx  # Full-screen loading overlay
│   │       ├── HowItWorksCard.jsx# Kartu langkah "Cara Kerja"
│   │       ├── Loader.jsx        # Animasi loader kustom
│   │       └── Tooltip.jsx       # Tooltip interaktif
│   │
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Auth.jsx              # Halaman login/register (unified)
│   │   ├── Login.jsx             # Komponen form login
│   │   ├── Register.jsx          # Komponen form register
│   │   ├── Catalog.jsx           # Halaman katalog kamera
│   │   ├── CategoryPage.jsx      # Halaman per kategori dengan sidebar
│   │   ├── CameraDetail.jsx      # Halaman detail kamera
│   │   ├── Checkout.jsx          # Halaman checkout multi-item
│   │   ├── BookingHistory.jsx    # Riwayat booking user + invoice
│   │   ├── UserDashboard.jsx     # Dashboard overview user
│   │   ├── UserSettings.jsx      # Pengaturan akun user
│   │   ├── UserTestimonials.jsx  # Halaman testimoni user
│   │   ├── Profile.jsx           # Halaman profil user
│   │   ├── Unauthorized.jsx      # Halaman 403/404 error
│   │   └── admin/                # Halaman-halaman admin
│   │       ├── AdminLogin.jsx    # Login khusus admin
│   │       ├── Dashboard.jsx     # Dashboard analytics admin
│   │       ├── Products.jsx      # CRUD manajemen produk kamera
│   │       ├── Orders.jsx        # Manajemen pesanan/booking
│   │       ├── Reports.jsx       # Laporan revenue + export PDF
│   │       ├── Settings.jsx      # Pengaturan admin
│   │       └── AdminTestimonials.jsx # Kelola review & testimoni
│   │
│   ├── services/
│   │   └── api.js                # Axios instance + semua endpoint API
│   │
│   └── store/                    # Zustand state stores
│       ├── authStore.js          # State autentikasi (user, token, login/logout)
│       ├── cartStore.js          # State keranjang belanja (items, add/remove)
│       └── loadingStore.js       # State loading global
│
├── index.html                    # HTML template entry
├── vite.config.js                # Konfigurasi Vite (proxy, port)
├── tailwind.config.js            # Konfigurasi TailwindCSS (theme, colors)
├── postcss.config.js             # Konfigurasi PostCSS
└── package.json                  # Dependencies & scripts
```

---

## ⚙️ Konfigurasi

### Vite (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,                     // Port dev server
    proxy: {
      '/uploads': {                 // Proxy upload file ke backend
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

**Penjelasan Proxy**: Saat development, request ke `/uploads/*` diteruskan ke backend server di port 5000, sehingga gambar yang diupload bisa diakses langsung dari frontend tanpa konfigurasi CORS tambahan.

### TailwindCSS (`tailwind.config.js`)

Custom theme yang didefinisikan mencakup:
- **Custom colors**: Warna brand Lensify (orange, surface, dll.)
- **Custom fonts**: Manrope (heading) dan Inter (body)
- **Custom animations**: Untuk komponen interaktif
- **Container queries plugin**: Responsive component-level

### Environment (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> Variabel ini diakses dalam kode menggunakan `import.meta.env.VITE_API_BASE_URL`

---

## 🗺 Routing & Navigasi

Routing menggunakan **React Router DOM v6** dengan konfigurasi terpusat di `App.jsx`.

### Daftar Route

#### Route Publik (Tanpa Login)

| Path | Komponen | Layout | Deskripsi |
|------|----------|--------|-----------|
| `/` | `Home` | MainLayout | Landing page |
| `/catalog` | `Catalog` | MainLayout (hideNavbar) | Katalog kamera |
| `/cameras/:id` | `CameraDetail` | MainLayout (hideNavbar) | Detail kamera |
| `/login` | `Auth` | — | Halaman login (redirect jika sudah login) |
| `/register` | `Auth` | — | Halaman register (redirect jika sudah login) |

#### Route User (Memerlukan Login + Role USER)

| Path | Komponen | Proteksi | Deskripsi |
|------|----------|----------|-----------|
| `/dashboard` | `UserDashboard` | `userOnly` | Dashboard user |
| `/category/:slug` | `CategoryPage` | `userOnly` | Halaman kategori |
| `/checkout` | `Checkout` | `userOnly` | Checkout multi-item |
| `/bookings` | `BookingHistory` | `userOnly` | Riwayat booking |
| `/profile` | `Profile` | `userOnly` | Profil user |
| `/settings` | `UserSettings` | `userOnly` | Pengaturan user |
| `/testimonials` | `UserTestimonials` | `userOnly` | Testimoni user |

#### Route Admin (Memerlukan Login + Role ADMIN)

| Path | Komponen | Proteksi | Deskripsi |
|------|----------|----------|-----------|
| `/admin/login` | `AdminLogin` | — | Login admin |
| `/admin` | `Dashboard` | `adminOnly` | Dashboard analytics |
| `/admin/products` | `Products` | `adminOnly` | Kelola produk kamera |
| `/admin/orders` | `Orders` | `adminOnly` | Kelola pesanan |
| `/admin/reports` | `Reports` | `adminOnly` | Laporan revenue |
| `/admin/settings` | `Settings` | `adminOnly` | Pengaturan admin |
| `/admin/testimonials` | `AdminTestimonials` | `adminOnly` | Kelola testimoni |

#### Route Fallback

| Path | Komponen | Deskripsi |
|------|----------|-----------|
| `*` | `Unauthorized` (404 mode) | Halaman tidak ditemukan |

### Layout Wrappers

```
App.jsx
├── MainLayout          # Navbar + AnimatedPage + Footer
│   ├── hideNavbar      # Opsi sembunyikan navbar (catalog, detail)
│   └── AnimatedPage    # Framer Motion page transition
├── AdminLayout         # Minimal wrapper (sidebar ada di masing-masing halaman)
└── ProtectedRoute      # Guard berdasarkan role (userOnly / adminOnly)
```

---

## 📦 State Management

Menggunakan **Zustand** sebagai state management — ringan, tanpa boilerplate, dan mudah digunakan.

### 1. Auth Store (`store/authStore.js`)

Mengelola seluruh state autentikasi pengguna.

| State | Tipe | Deskripsi |
|-------|------|-----------|
| `user` | `Object \| null` | Data user yang sedang login |
| `token` | `String \| null` | JWT token |
| `isLoading` | `Boolean` | Status loading saat login/register |
| `isInitialized` | `Boolean` | Apakah verifikasi token awal sudah selesai |

| Action | Deskripsi |
|--------|-----------|
| `login(credentials)` | Login user, simpan token ke sessionStorage |
| `register(data)` | Registrasi user baru |
| `logout()` | Hapus token & user dari state dan sessionStorage |
| `refreshUser()` | Verifikasi token dengan server via `GET /api/auth/me` |
| `setUser(user)` | Update data user di state |
| `setToken(token)` | Update token di state |

**Penyimpanan**: Token dan data user disimpan di `sessionStorage` (otomatis terhapus saat browser ditutup).

**Inisialisasi**: Saat aplikasi pertama kali load, `App.jsx` memanggil `refreshUser()` untuk memverifikasi token yang ada di sessionStorage. Selama proses ini, halaman menampilkan loading spinner.

### 2. Cart Store (`store/cartStore.js`)

Mengelola keranjang belanja pengguna.

| State | Tipe | Deskripsi |
|-------|------|-----------|
| `items` | `Array` | List item di keranjang (`{id, name, brand, image, pricePerDay, stock, category}`) |

| Action | Deskripsi |
|--------|-----------|
| `addItem(camera)` | Tambah kamera ke cart (tidak duplikat) |
| `removeItem(id)` | Hapus item berdasarkan ID |
| `clearCart()` | Kosongkan seluruh cart |
| `isInCart(id)` | Cek apakah kamera sudah ada di cart |
| `totalItems()` | Jumlah total item di cart |

**Persistensi**: Menggunakan Zustand `persist` middleware — data cart disimpan di `localStorage` dengan key `lensify-cart`, sehingga tetap ada walau halaman di-refresh.

### 3. Loading Store (`store/loadingStore.js`)

Global loading overlay untuk operasi yang memerlukan feedback visual.

| State | Tipe | Deskripsi |
|-------|------|-----------|
| `isLoading` | `Boolean` | Status loading |
| `message` | `String` | Pesan yang ditampilkan saat loading |

| Action | Deskripsi |
|--------|-----------|
| `showLoader(message)` | Tampilkan loader dengan pesan kustom |
| `hideLoader()` | Sembunyikan loader |

---

## 🌐 API Service Layer

Seluruh komunikasi dengan backend terpusat di `services/api.js`.

### Axios Instance

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
})
```

### Interceptors

#### Request Interceptor
- Otomatis menambahkan header `Authorization: Bearer <token>` dari sessionStorage

#### Response Interceptor
- Jika response status `401`: Hapus token & redirect ke `/login`

### API Modules

#### `authAPI` — Autentikasi

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `register(data)` | `POST /auth/register` | Registrasi user baru |
| `login(data)` | `POST /auth/login` | Login user |
| `getMe()` | `GET /auth/me` | Ambil data user saat ini |
| `updateProfile(data)` | `PUT /auth/profile` | Update profil (multipart) |

#### `cameraAPI` — Kamera

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `getTop()` | `GET /cameras/top` | Kamera terpopuler (3 teratas) |
| `getAll(params)` | `GET /cameras` | Daftar kamera dengan filter |
| `getById(id)` | `GET /cameras/:id` | Detail kamera |

#### `bookingAPI` — Booking

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `create(data)` | `POST /bookings` | Buat booking baru (multipart) |
| `getMy()` | `GET /bookings/my` | Booking milik user |
| `getById(id)` | `GET /bookings/:id` | Detail booking |
| `cancel(id)` | `PUT /bookings/:id/cancel` | Batalkan booking |

#### `reviewAPI` — Review

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `create(data)` | `POST /reviews` | Submit review |
| `getByCameraId(id)` | `GET /reviews/camera/:id` | Review per kamera |
| `getMyReviews()` | `GET /reviews/my` | Review milik user |

#### `testimonialAPI` — Testimoni

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `create(data)` | `POST /testimonials` | Submit testimoni |
| `getMy()` | `GET /testimonials/my` | Testimoni milik user |
| `getAll()` | `GET /testimonials` | Semua testimoni (publik) |

#### `adminAPI` — Admin

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `getStats(params)` | `GET /admin/stats` | Statistik dashboard |
| `getAllUsers()` | `GET /admin/users` | Daftar semua user |
| `getAllBookings(params)` | `GET /admin/bookings` | Semua booking |
| `createOfflineBooking(data)` | `POST /admin/bookings` | Booking offline |
| `updateBookingStatus(id, status)` | `PUT /admin/bookings/:id/status` | Update status booking |
| `getAllCameras()` | `GET /admin/cameras` | Semua kamera (admin) |
| `createCamera(data)` | `POST /admin/cameras` | Tambah kamera baru |
| `updateCamera(id, data)` | `PUT /admin/cameras/:id` | Edit kamera |
| `deleteCamera(id)` | `DELETE /admin/cameras/:id` | Soft delete kamera |
| `getAllReviews()` | `GET /admin/reviews` | Semua review |
| `replyReview(id, reply)` | `PUT /admin/reviews/:id/reply` | Balas review |
| `getAllTestimonialsAdmin()` | `GET /admin/testimonials` | Semua testimoni (admin) |
| `replyTestimonial(id, reply)` | `PUT /admin/testimonials/:id/reply` | Balas testimoni |

---

## 🧩 Komponen

### Layout Components (`components/layout/`)

#### `Navbar.jsx`
- Navigasi atas untuk halaman user-facing
- Logo Lensify, menu navigasi, cart badge, profil dropdown
- Responsive: hamburger menu di mobile
- Sticky di atas halaman

#### `Footer.jsx`
- Footer website dengan informasi brand, link navigasi, dan copyright
- Ditampilkan di semua halaman dengan `MainLayout`

#### `AdminSidebar.jsx`
- Sidebar navigasi untuk halaman admin
- Menu: Dashboard, Produk, Pesanan, Testimoni, Laporan, Pengaturan
- Icon dari Lucide React
- Highlight active route

#### `UserSidebar.jsx`
- Sidebar navigasi untuk dashboard user
- Menu: Dashboard, Booking, Testimoni, Settings
- Ditampilkan di halaman `UserDashboard`, `BookingHistory`, `UserSettings`, `UserTestimonials`

### Feature Components (`components/features/`)

#### `CameraCard.jsx`
- Kartu produk kamera untuk ditampilkan di katalog
- Menampilkan: gambar, nama, brand, harga per hari, rating, tombol tambah ke cart
- Animasi hover effect
- Link ke halaman detail kamera

#### `CartDrawer.jsx`
- Drawer slide-in dari sisi kanan untuk menampilkan isi keranjang
- Daftar item, tombol hapus per item, total harga, tombol ke checkout
- Overlay backdrop saat terbuka

### UI Components (`components/ui/`)

#### `FlipCard.jsx`
- Kartu dengan efek flip 3D (depan dan belakang)
- Digunakan di landing page untuk menampilkan kategori gear (DSLR, Mirrorless, Action Cam, dll.)

#### `GlobalLoader.jsx`
- Full-screen overlay loading indicator
- Dikontrol oleh `loadingStore`
- Ditampilkan saat proses checkout, login, atau operasi berat lainnya

#### `HowItWorksCard.jsx`
- Kartu langkah-langkah "Cara Kerja" di landing page
- Numbered steps dengan icon dan deskripsi

#### `Loader.jsx`
- Animasi loading kustom (spinner/skeleton)
- Digunakan di berbagai halaman saat fetching data

#### `Tooltip.jsx`
- Komponen tooltip interaktif
- Muncul saat hover pada elemen tertentu

---

## 📄 Halaman (Pages)

### Halaman Publik

#### `Home.jsx` — Landing Page
- **Hero Section**: Headline, tagline, CTA button
- **Kategori Gear**: FlipCard untuk DSLR, Mirrorless, Action Cam, Lensa, dll.
- **Top Cameras**: 3 kamera terpopuler berdasarkan jumlah booking
- **Cara Kerja**: Langkah-langkah penyewaan (Pilih → Checkout → Ambil → Kembalikan)
- **Testimoni**: Carousel testimoni dari pengguna

#### `Auth.jsx` — Login / Register
- Form unified untuk login dan register
- Toggle antara mode login dan register
- Validasi input client-side
- Redirect otomatis berdasarkan role setelah login

#### `Catalog.jsx` — Katalog Kamera
- Grid CameraCard dengan fitur:
  - 🔍 Pencarian berdasarkan nama/brand
  - 📂 Filter kategori
  - 💰 Filter range harga
  - 📅 Filter ketersediaan berdasarkan tanggal
- Navbar kustom (terpisah dari Navbar utama)
- Cart drawer terintegrasi

#### `CameraDetail.jsx` — Detail Kamera
- Galeri gambar kamera (multi-image)
- Spesifikasi lengkap
- Harga per hari
- Status ketersediaan
- Tombol "Tambah ke Keranjang"
- Section review & rating dari pengguna lain
- Benefits section
- Navbar kustom ringan

#### `Checkout.jsx` — Checkout Multi-Item
- Ringkasan item di cart
- Form data penyewaan:
  - Input tanggal mulai & selesai (DatePicker)
  - Nama lengkap, nomor telepon, alamat
  - Upload foto KTP
  - Pilihan metode pembayaran
- Kalkulasi otomatis: total hari × harga per item
- Konfirmasi dan submit booking

### Halaman User

#### `UserDashboard.jsx` — Dashboard User
- Sidebar navigasi (UserSidebar)
- Overview statistik:
  - Total booking
  - Total pengeluaran
  - Kamera favorit
  - Booking aktif
- Quick actions ke halaman lain

#### `BookingHistory.jsx` — Riwayat Booking
- Daftar semua booking user
- Detail per booking: kamera, tanggal, harga, status badge
- Aksi per status:
  - `PENDING`: Tombol Cancel
  - `RETURNED`: Tombol Review + Cetak Invoice
- Modal review gear (rating 1-5, komentar)
- Invoice generation & print

#### `UserSettings.jsx` — Pengaturan User
- Edit profil: nama, telepon, avatar
- Sidebar navigasi

#### `UserTestimonials.jsx` — Testimoni User
- Form submit testimoni layanan (rating + pesan)
- Daftar testimoni yang sudah dikirim
- Balasan admin ditampilkan

#### `Profile.jsx` — Profil User
- Tampilan profil user
- Edit nama, telepon, avatar (with upload)

#### `Unauthorized.jsx` — Error Page
- Halaman error custom (403 / 404)
- Desain TV-themed yang menarik
- Pesan error dinamis berdasarkan kode

### Halaman Admin

#### `AdminLogin.jsx` — Login Admin
- Form login khusus admin
- Desain berbeda dari login user

#### `Dashboard.jsx` — Dashboard Analytics Admin
- **Stat Cards**: Booking hari ini, pending, ongoing, revenue, total kamera, total user
- **Chart Tren**: Grafik bar booking & revenue (toggle harian/bulanan)
- **Top Performers**: 5 kamera paling banyak disewa
- **Distribusi Kategori**: Pie chart kategori kamera
- **Filter Period**: Bulan ini, bulan lalu, tahun ini, semua waktu
- Hover interaktif: bar chart berubah warna (gray → orange)

#### `Products.jsx` — Kelola Produk
- Tabel daftar produk kamera
- Search by nama, ID, serial number
- Modal tambah/edit kamera:
  - Input: nama, brand, kategori, deskripsi, spesifikasi, harga, stok
  - Upload gambar (hingga 5 foto)
- Soft delete produk
- Toggle ketersediaan

#### `Orders.jsx` — Kelola Pesanan
- Tabel daftar booking semua user
- Filter status (PENDING, CONFIRMED, ONGOING, RETURNED, CANCELLED)
- Search by nama user, nama kamera, ID booking
- Modal detail booking:
  - Info user (nama, telepon, alamat, KTP)
  - Info kamera, tanggal, durasi, harga
  - Metode pembayaran
- Update status via dropdown
- Cetak invoice (untuk status RETURNED)

#### `Reports.jsx` — Laporan Revenue
- Filter tanggal mulai & selesai
- Toggle grafik: harian vs bulanan
- Chart bar revenue & jumlah order
- Ringkasan statistik periode
- **Export PDF** (html2canvas + jsPDF)

#### `Settings.jsx` — Pengaturan Admin
- Edit profil admin (nama, telepon, avatar)
- Manajemen akun

#### `AdminTestimonials.jsx` — Kelola Testimoni
- Tab: Review Gear | Testimoni Layanan
- Daftar review/testimoni dari semua user
- Form balas review/testimoni
- Filter berdasarkan status balasan

---

## 🎨 Desain & Styling

### Framework CSS

- **TailwindCSS 3.4** sebagai utility-first CSS framework utama
- **Custom CSS** di `index.css` untuk styles global
- **Styled Components** digunakan selektif di beberapa komponen

### Tipografi

| Font | Jenis | Penggunaan |
|------|-------|------------|
| **Manrope** | Sans-serif | Heading, judul, UI prominent |
| **Inter** | Sans-serif | Body text, paragraf, label |
| **Material Symbols** | Icon font | Ikon tambahan |

### Skema Warna

Warna dikonfigurasi di `tailwind.config.js` dengan palet kustom yang mencakup:
- **Primary (Orange)**: Warna aksen utama brand
- **Surface**: Background gelap untuk dark theme
- **Neutral Tones**: Gray scale untuk teks dan border

### Responsivitas

- Breakpoint standar TailwindCSS: `sm`, `md`, `lg`, `xl`, `2xl`
- Layout fleksibel: grid dan flexbox
- Sidebar collapse pada layar kecil
- Navbar menjadi hamburger menu di mobile

---

## 🎬 Animasi & Transisi

Menggunakan **Framer Motion** untuk animasi profesional:

### Page Transitions (`AnimatedPage`)

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.97, y: 15 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
```

- Setiap navigasi halaman memiliki efek fade-in + subtle scale-up
- Menggunakan `AnimatePresence` dengan `mode="popLayout"` untuk transisi mulus

### Komponen Animasi

| Elemen | Animasi |
|--------|---------|
| Page transition | Fade in + scale up |
| FlipCard | 3D flip on hover |
| Cart Drawer | Slide in dari kanan |
| Toast notification | Slide in dari atas kanan |
| Loading spinner | Rotate infinite |
| Chart bars | Hover highlight (gray → orange) |
| CameraCard | Scale up on hover |

---

## 🔐 Autentikasi & Proteksi Route

### Alur Autentikasi

```
1. User login → Server return JWT token + user data
2. Token disimpan di sessionStorage
3. Setiap request API → Token diattach via Axios interceptor
4. Saat app load → refreshUser() verifikasi token ke server
5. Jika token invalid/expired → Auto logout & redirect ke /login
```

### ProtectedRoute Component

```jsx
const ProtectedRoute = ({ children, adminOnly, userOnly }) => {
  const { user, token } = useAuthStore()
  
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Unauthorized />
  if (userOnly && user?.role === 'ADMIN') return <Unauthorized />
  
  return children
}
```

### Redirect Logic (Login/Register)

- Jika sudah login sebagai USER → Redirect ke `/dashboard`
- Jika sudah login sebagai ADMIN → Redirect ke `/admin`
- Jika mengakses route tanpa izin → Tampilkan halaman `Unauthorized` (403)

---

## 🚀 Menjalankan Frontend

### Development

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`

### Build Production

```bash
npm run build
```

Output di folder `dist/`

### Preview Build

```bash
npm run preview
```

---

> **Lihat juga**: [lensify.md](./lensify.md) untuk dokumentasi umum project, dan [backend.md](./backend.md) untuk dokumentasi backend.
