// Verification Script to check manifest and service worker
console.log('=== STORY MAP APPLICATION VERIFICATION ===\n');

// 1. Check Manifest
console.log('1. MANIFEST CHECK:');
fetch('/manifest.webmanifest')
  .then(response => response.json())
  .then(manifest => {
    console.log('✅ Manifest loaded successfully');
    console.log(`   Name: ${manifest.name}`);
    console.log(`   Short Name: ${manifest.short_name}`);
    console.log(`   Display: ${manifest.display}`);
    console.log(`   Theme Color: ${manifest.theme_color}`);
    console.log(`   Icons: ${manifest.icons.length} icons configured`);
    manifest.icons.forEach((icon, i) => {
      console.log(`     [${i}] ${icon.src} - ${icon.sizes} - Purpose: ${icon.purpose}`);
    });
  })
  .catch(err => console.error('❌ Manifest error:', err));

// 2. Check Service Worker
console.log('\n2. SERVICE WORKER CHECK:');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      if (registrations.length > 0) {
        console.log(`✅ Service Worker registered (${registrations.length})`);
        registrations.forEach((reg, i) => {
          console.log(`   [${i}] Scope: ${reg.scope}`);
          console.log(`       State: ${reg.active ? 'ACTIVE' : 'INACTIVE'}`);
        });
      } else {
        console.log('⚠️  No service workers registered');
        console.log('   Attempting registration...');
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('✅ Service Worker registered'))
          .catch(err => console.error('❌ SW registration failed:', err));
      }
    })
    .catch(err => console.error('❌ SW check error:', err));
} else {
  console.error('❌ Service Workers not supported');
}

// 3. Check Cache Storage
console.log('\n3. CACHE STORAGE CHECK:');
if ('caches' in window) {
  caches.keys()
    .then(cacheNames => {
      if (cacheNames.length > 0) {
        console.log(`✅ ${cacheNames.length} cache(s) found:`);
        cacheNames.forEach(name => {
          console.log(`   • ${name}`);
          caches.open(name).then(cache => {
            cache.keys().then(requests => {
              console.log(`     Contains ${requests.length} items`);
            });
          });
        });
      } else {
        console.log('⚠️  No caches found');
      }
    })
    .catch(err => console.error('❌ Cache check error:', err));
} else {
  console.error('❌ Cache API not supported');
}

// 4. Check IndexedDB
console.log('\n4. INDEXEDDB CHECK:');
if ('indexedDB' in window) {
  const dbRequest = indexedDB.open('story-app-db');
  
  dbRequest.onerror = () => {
    console.error('❌ IndexedDB not available');
  };
  
  dbRequest.onsuccess = () => {
    const db = dbRequest.result;
    const storeNames = Array.from(db.objectStoreNames);
    if (storeNames.length > 0) {
      console.log(`✅ IndexedDB available with ${storeNames.length} stores:`);
      storeNames.forEach(name => {
        console.log(`   • ${name}`);
      });
    } else {
      console.log('⚠️  IndexedDB exists but no stores');
    }
    db.close();
  };
} else {
  console.error('❌ IndexedDB not supported');
}

// 5. Network Status
console.log('\n5. NETWORK STATUS:');
console.log(`Online: ${navigator.onLine ? '✅ YES' : '❌ NO'}`);

// 6. PWA Capability
console.log('\n6. PWA CAPABILITY:');
console.log(`HTTPS: ${window.location.protocol === 'https:' ? '✅ YES (PWA ready)' : '⚠️  HTTP (PWA local dev)'}`);
console.log(`Service Worker: ${navigator.serviceWorker ? '✅ Supported' : '❌ Not supported'}`);
console.log(`Web App Manifest: ${document.querySelector('link[rel="manifest"]') ? '✅ Linked' : '❌ Not linked'}`);
console.log(`Offline Capable: ${'serviceWorker' in navigator && 'caches' in window ? '✅ YES' : '❌ NO'}`);

console.log('\n=== VERIFICATION COMPLETE ===');
