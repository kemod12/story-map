// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import PushNotificationService from './utils/push-notification-service';
import IndexedDBService from './utils/indexeddb-service';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize IndexedDB
  const indexedDB = new IndexedDBService();
  try {
    await indexedDB.init();
    console.log('[App] IndexedDB initialized');
  } catch (err) {
    console.error('[App] Failed to initialize IndexedDB:', err);
  }

  // Initialize Push Notification Service
  const pushService = new PushNotificationService();
  try {
    const initialized = await pushService.init();
    if (initialized) {
      console.log('[App] Push notification service initialized');
    }
  } catch (err) {
    console.error('[App] Failed to initialize push notifications:', err);
  }

  // Initialize app
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Handle online/offline status
  window.addEventListener('online', () => {
    console.log('[App] Online');
    // Trigger sync of pending stories
  });

  window.addEventListener('offline', () => {
    console.log('[App] Offline');
  });
});
