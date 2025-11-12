// Push Notification Service

export default class PushNotificationService {
  constructor() {
    this.serviceWorkerReady = false;
    this.subscribed = false;
  }

  // Initialize service worker and request notification permission
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PushNotification] Service Worker not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('[PushNotification] Push Manager not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      console.log('[PushNotification] Service Worker registered', registration);
      this.serviceWorkerReady = true;
      
      // Check current subscription status
      const subscription = await registration.pushManager.getSubscription();
      this.subscribed = subscription !== null;
      
      return true;
    } catch (err) {
      console.error('[PushNotification] Service Worker registration failed:', err);
      return false;
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('[PushNotification] Notification not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('[PushNotification] Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('[PushNotification] Permission request failed:', err);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe(vapidPublicKey) {
    if (!this.serviceWorkerReady) {
      console.error('[PushNotification] Service Worker not ready');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('[PushNotification] Subscription successful', subscription);
      this.subscribed = true;
      
      return subscription;
    } catch (err) {
      console.error('[PushNotification] Subscription failed:', err);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.serviceWorkerReady) {
      console.error('[PushNotification] Service Worker not ready');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('[PushNotification] Unsubscription successful');
        this.subscribed = false;
        return true;
      }

      return false;
    } catch (err) {
      console.error('[PushNotification] Unsubscription failed:', err);
      return false;
    }
  }

  // Get current subscription
  async getSubscription() {
    if (!this.serviceWorkerReady) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (err) {
      console.error('[PushNotification] Failed to get subscription:', err);
      return null;
    }
  }

  // Check if user is subscribed
  async isSubscribed() {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  // Convert VAPID public key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Send subscription to server for backend push notifications
  async sendSubscriptionToServer(subscription, token) {
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[PushNotification] Subscription sent to server:', data);
      return data;
    } catch (err) {
      console.error('[PushNotification] Failed to send subscription to server:', err);
      throw err;
    }
  }

  // Show a local notification (for testing)
  async showLocalNotification(title, options = {}) {
    if (!this.serviceWorkerReady) {
      console.error('[PushNotification] Service Worker not ready');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'story-notification',
        requireInteraction: false,
        ...options,
      });
    } catch (err) {
      console.error('[PushNotification] Failed to show notification:', err);
    }
  }
}
