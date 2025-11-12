# 🚀 GitHub Pages Deployment Guide

**Date:** 11 December 2025  
**Project:** Story Map PWA  
**Platform:** GitHub Pages (Free Hosting)

---

## 📋 Prerequisites

Sebelum memulai, pastikan Anda memiliki:

- ✅ GitHub account (gratis di https://github.com)
- ✅ Git installed di komputer Anda
- ✅ Project ini sudah siap build
- ✅ npm dan Node.js installed

---

## 🎯 Step-by-Step Deployment

### Step 1: Buat Repository GitHub

**Option A: Buat repo baru di GitHub.com**

1. Buka https://github.com/new
2. Repository name: `story-map` (atau nama lain)
3. Description: "A Progressive Web Application for story sharing with offline support"
4. Choose public (free)
5. ✅ Create repository

**Option B: Gunakan existing repo**

Jika repo sudah ada, skip ke Step 2.

---

### Step 2: Push Code ke GitHub

Di terminal/command prompt, jalankan perintah berikut:

```bash
# 1. Navigate ke project folder
cd c:\Users\hermo\Downloads\starter-project-with-webpack\starter-project-with-webpack

# 2. Inisialisasi git (jika belum ada)
git init

# 3. Add remote repository (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/story-map.git

# 4. Rename branch ke main (jika diperlukan)
git branch -M main

# 5. Add semua files
git add .

# 6. Commit
git commit -m "Initial commit: Story Map PWA with offline support"

# 7. Push ke GitHub
git push -u origin main
```

**Jika ada error tentang branch existence:**
```bash
git push --force -u origin main
```

---

### Step 3: Enable GitHub Pages

1. Buka repository Anda di GitHub: `https://github.com/USERNAME/story-map`
2. Klik **Settings** (tab paling kanan)
3. Scroll ke bawah sampai menemukan **Pages** di sidebar kiri
4. Di bawah "Build and deployment":
   - **Source:** Pilih "GitHub Actions"
   - (Automatic deployment akan aktif)
5. ✅ Save

---

### Step 4: Trigger Deployment

GitHub Actions akan otomatis trigger ketika Anda push. Untuk memastikan:

```bash
# Di terminal, buat commit baru
git add .
git commit -m "Enable GitHub Pages deployment"
git push
```

---

### Step 5: Monitor Deployment

1. Buka repository Anda di GitHub
2. Klik tab **Actions** (di atas file list)
3. Cari workflow `Deploy to GitHub Pages`
4. Tunggu sampai berwarna ✅ hijau (success)

**Status:**
- 🟡 Yellow = Running (sedang build)
- ✅ Green = Success (deploy berhasil!)
- ❌ Red = Failed (ada error)

---

### Step 6: Akses Aplikasi Anda

Setelah deployment success, aplikasi akan tersedia di:

```
https://USERNAME.github.io/story-map/
```

**Ganti USERNAME dengan username GitHub Anda.**

Contoh:
- Jika username GitHub: `budi123`
- Repository: `story-map`
- URL: `https://budi123.github.io/story-map/`

---

## ⚙️ Konfigurasi Penting

### ✅ Sudah Dikonfigurasi Untuk GitHub Pages

✓ `.github/workflows/deploy.yml` - GitHub Actions workflow  
✓ Webpack build untuk `dist/` folder  
✓ Service Worker untuk offline support  
✓ Hash-based routing (#/) - kompatibel dengan GH Pages  
✓ Favicon dan assets - sudah properly bundled

### ⚠️ Catatan Khusus GitHub Pages

**1. HTTPS Automatically Enabled**
- GitHub Pages menggunakan HTTPS otomatis
- PWA features (install prompt, notifications) akan fully work

**2. Custom Domain (Optional)**
Jika Anda punya custom domain:
1. Settings → Pages → Custom domain
2. Masukkan domain Anda
3. Setup DNS records sesuai instruksi GitHub
4. Aplikasi akan accessible di domain Anda

**3. Subpath Deployment**
Jika deploy ke subpath (`username.github.io/story-map`):
- ✅ Sudah support (hash routing #/ tidak perlu base path)

---

## 🧪 Testing Deployment

Setelah aplikasi live, test beberapa hal:

### 1. Test PWA Installation
```
1. Buka https://username.github.io/story-map/
2. Klik address bar → "Install Story Map"
3. Aplikasi akan install sebagai PWA
4. Buka dari app drawer atau home screen
```

### 2. Test Offline Mode
```
1. Buka aplikasi
2. DevTools (F12) → Network → Offline
3. Coba add story
4. Story should save to IndexedDB
5. Kembali Online
6. Click sync
7. Story should upload
```

### 3. Test Manifest
```
1. DevTools (F12) → Application → Manifest
2. Pastikan manifest load dengan benar
3. Icons should display
```

---

## 📊 Troubleshooting

### ❌ Deployment Failed?

**Check GitHub Actions Logs:**
1. Buka repository → Actions tab
2. Klik workflow yang failed
3. Lihat error message di log

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Build failed | Jalankan `npm run build` locally untuk verify |
| Service worker error | Pastikan HTTPS enabled (GitHub Pages otomatis) |
| Assets 404 | Check webpack config bundle output |
| Routing issue | Hash routing (#/) digunakan, seharusnya OK |

### ❌ App tidak bisa diakses?

```bash
# Verify git push successful
git log --oneline -5

# Check GitHub Pages settings
# Settings → Pages → Check source and branch
```

### ❌ PWA tidak bisa install?

GitHub Pages requires HTTPS (✅ already enabled)
- Manifest must be valid ✅
- Icons must load correctly ✅
- Service Worker must register ✅

---

## 🔄 Continuous Deployment

Setelah setup awal, setiap kali Anda push ke `main` branch:

```bash
# Make changes
# Edit files...

# Commit & Push
git add .
git commit -m "Your message"
git push

# ✅ GitHub Actions automatically:
# 1. Build project (npm run build)
# 2. Deploy to GitHub Pages
# 3. Live in ~1-2 minutes
```

**No manual steps needed!** 🎉

---

## 📝 Updating Deployment

Jika ingin rebuild/redeploy:

```bash
# Method 1: Push new commit
git add .
git commit -m "Update"
git push

# Method 2: Trigger manually from GitHub
# Actions tab → Deploy workflow → Run workflow button
```

---

## 🔐 Security Notes

- ✅ HTTPS automatically enabled
- ✅ Service Worker only caches from same origin
- ✅ No sensitive data in localStorage (JWT is OK)
- ✅ CORS configured for API calls

---

## 📱 Access from Mobile

**Android:**
```
1. Buka Chrome
2. Navigate ke: https://username.github.io/story-map/
3. 3-dot menu → Install app
4. App installed
```

**iOS:**
```
1. Buka Safari
2. Navigate ke: https://username.github.io/story-map/
3. Share button → Add to Home Screen
4. App installed
```

---

## 📊 Domain & URL Reference

**GitHub Pages URL Format:**
```
https://USERNAME.github.io/REPOSITORY/

Examples:
- https://johndoe.github.io/story-map/
- https://alice.github.io/story-map/
- https://myusername.github.io/story-map/
```

**Find your GitHub username:**
1. Buka https://github.com/settings/profile
2. Username terlihat di halaman profile

---

## ✅ Deployment Checklist

- [ ] GitHub account created
- [ ] Repository created
- [ ] Code pushed to main branch
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Workflow file present: `.github/workflows/deploy.yml`
- [ ] First deployment successful (Actions tab shows ✅)
- [ ] App accessible at: https://username.github.io/repository/
- [ ] HTTPS working
- [ ] Favicon displaying
- [ ] Manifest loading
- [ ] Service Worker active
- [ ] Offline mode tested
- [ ] PWA installation tested

---

## 🆘 Need Help?

**Check these resources:**
- GitHub Pages docs: https://pages.github.com/
- GitHub Actions docs: https://docs.github.com/en/actions
- Troubleshooting: https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-publishing-with-github-pages

**Common Commands:**

```bash
# Check git status
git status

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Force push (⚠️ use with caution)
git push --force-with-lease

# Check remote
git remote -v
```

---

## 🎉 Success Indicators

Deployment berhasil ketika:

```
✅ GitHub Actions shows green checkmark
✅ App accessible at https://username.github.io/repository/
✅ No 404 errors in browser console
✅ Manifest loads correctly
✅ Service Worker active
✅ Favicon displays
✅ Can navigate all pages
✅ Offline mode works
```

---

## 📞 Quick Reference Commands

```bash
# Initial setup
git init
git remote add origin https://github.com/USERNAME/story-map.git
git branch -M main

# Push code
git add .
git commit -m "Initial commit"
git push -u origin main

# Subsequent pushes
git add .
git commit -m "Your message"
git push

# View deployment status
# Go to: https://github.com/USERNAME/story-map/actions

# Visit live app
# Go to: https://USERNAME.github.io/story-map/
```

---

**Status:** ✅ Ready for GitHub Pages Deployment  
**Deployment Type:** Automatic (GitHub Actions)  
**Hosting:** Free (GitHub Pages)  
**Custom Domain:** Supported (Optional)  
**HTTPS:** Automatic ✅  

Last Updated: 11 December 2025
