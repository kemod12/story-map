# Story Map Application

Aplikasi web untuk membuat dan melihat peta cerita interaktif menggunakan Leaflet.js.

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Pengembangan](#pengembangan)
- [Membangun untuk Produksi](#membangun-untuk-produksi)
- [Deploy ke GitHub Pages](#deploy-ke-github-pages)
- [Struktur Proyek](#struktur-proyek)

## Prasyarat

- [Node.js](https://nodejs.org/) (versi 14 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (versi 6 atau lebih tinggi)
- Akun GitHub

## Instalasi

1. Clone repository ini:
   ```bash
   git clone https://github.com/hermo/story-map.git
   cd story-map
   ```

2. Pasang dependencies:
   ```bash
   npm install
   ```

## Pengembangan

Untuk memulai server pengembangan:
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:8080`

## Membangun untuk Produksi

Untuk membuat build produksi:
```bash
npm run build
```

File hasil build akan tersedia di direktori `dist`.

## Deploy ke GitHub Pages

1. Pastikan repository Anda sudah diinisialisasi dengan Git dan terhubung ke GitHub
2. Pastikan nama repository adalah `story-map` (atau sesuaikan field `homepage` di `package.json`)
3. Jalankan perintah deploy:
   ```bash
   npm run deploy
   ```
4. Aplikasi akan dideploy ke: https://hermo.github.io/story-map/

## Struktur Proyek

```
src/
├── scripts/         # File JavaScript
├── styles/          # File CSS
├── images/          # Aset gambar
└── index.html       # File HTML utama
dist/               # File hasil build (tergenerasi otomatis)
public/             # File statis
webpack/            # Konfigurasi webpack
```

## Lisensi

Proyek ini dilisensikan di bawah ISC License.

```text
starter-project/
├── dist/                   # Compiled files for production
├── src/                    # Source project files
│   ├── public/             # Public files
│   ├── scripts/            # Source JavaScript files
│   │   └── index.js        # Main JavaScript entry file
│   ├── styles/             # Source CSS files
│   │   └── styles.css      # Main CSS file
│   └── index.html/         # Main HTML file
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Project metadata and dependencies
├── README.md               # Project documentation
├── STUDENT.txt             # Student information
├── webpack.common.js       # Webpack common configuration
├── webpack.dev.js          # Webpack development configuration
└── webpack.prod.js         # Webpack production configuration
```
