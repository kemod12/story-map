const fs = require('fs');
const path = require('path');

// Buat favicon SVG sederhana
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007bff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="192" height="192" fill="url(#grad)"/>
  
  <!-- Map marker circle -->
  <circle cx="96" cy="76" r="35" fill="#ffffff"/>
  
  <!-- Map marker point -->
  <polygon points="96,126 76,96 116,96" fill="#ffffff"/>
  
  <!-- Inner dot -->
  <circle cx="96" cy="76" r="20" fill="#007bff"/>
</svg>`;

// Create SVG file
const svgPath = path.join(__dirname, 'src/public/favicon.svg');
fs.writeFileSync(svgPath, faviconSvg);
console.log('✅ Created favicon.svg');

// Jika ada sharp, coba konversi ke PNG
try {
  const sharp = require('sharp');
  
  sharp(svgPath)
    .png()
    .toFile(path.join(__dirname, 'src/public/favicon.png'))
    .then(() => {
      console.log('✅ Created favicon.png (192x192) from SVG');
    })
    .catch((err) => {
      console.warn('⚠️ Sharp tidak tersedia atau error:', err.message);
      console.log('Install sharp dengan: npm install sharp');
    });
} catch (e) {
  console.warn('⚠️ sharp tidak tersedia. Gunakan favicon.svg untuk sekarang.');
  console.log('Untuk konversi ke PNG, jalankan: npm install sharp && node create-favicon.js');
}
