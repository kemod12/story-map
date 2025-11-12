import PushNotificationService from '../../utils/push-notification-service';
import IndexedDBService from '../../utils/indexeddb-service';

export default class NotificationSettingsPage {
  constructor() {
    this.pushService = new PushNotificationService();
    this.indexedDB = new IndexedDBService();
  }

  async render() {
    return `
      <section class="container notification-settings-page">
        <div class="settings-container">
          <h1>Notification Settings</h1>
          
          <div class="settings-card">
            <h2>Push Notifications</h2>
            <p class="setting-description">Receive real-time notifications about new stories and updates.</p>
            
            <div class="setting-item">
              <div class="setting-label">
                <h3>Enable Push Notifications</h3>
                <p class="setting-info" id="permission-status">Checking permission status...</p>
              </div>
              <button 
                id="toggle-notification-btn" 
                class="toggle-button" 
                aria-label="Toggle push notifications">
                <span class="toggle-switch"></span>
              </button>
            </div>

            <div class="setting-actions">
              <button id="test-notification-btn" class="action-button" disabled>
                📬 Send Test Notification
              </button>
              <button id="refresh-status-btn" class="action-button secondary">
                🔄 Refresh Status
              </button>
            </div>

            <div class="notification-info">
              <p><strong>Status:</strong> <span id="notification-status">Loading...</span></p>
              <p><strong>Permission:</strong> <span id="notification-permission">Loading...</span></p>
              <div id="subscription-info" class="subscription-details" style="display: none;">
                <p><strong>Subscription Status:</strong> <span id="subscription-status">Active</span></p>
                <p class="small-text">You will receive push notifications about new stories.</p>
              </div>
            </div>
          </div>

          <div class="settings-card faq-section">
            <h2>FAQ</h2>
            <details>
              <summary>What are push notifications?</summary>
              <p>Push notifications are messages sent to your device from the Story Map server. You'll receive alerts about new stories shared by other users.</p>
            </details>
            <details>
              <summary>How do I enable notifications?</summary>
              <p>Click the "Enable Push Notifications" toggle button above. Your browser will ask for permission to send notifications.</p>
            </details>
            <details>
              <summary>Can I disable notifications anytime?</summary>
              <p>Yes! Just click the toggle button to disable notifications. You can re-enable them anytime.</p>
            </details>
            <details>
              <summary>Will my data be safe?</summary>
              <p>Your subscription data is encrypted and stored securely. We only use it to send you notifications about new stories.</p>
            </details>
          </div>

          <div class="back-button-container">
            <button id="back-to-home-btn" class="back-button">← Back to Home</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.indexedDB.init();
    
    const toggleBtn = document.getElementById('toggle-notification-btn');
    const testBtn = document.getElementById('test-notification-btn');
    const refreshBtn = document.getElementById('refresh-status-btn');
    const backBtn = document.getElementById('back-to-home-btn');

    // Initialize push service
    const initialized = await this.pushService.init();
    
    if (!initialized) {
      this.updateStatus('error', 'Push notifications are not supported on this browser');
      toggleBtn.disabled = true;
      return;
    }

    // Update status on load
    await this.updateNotificationStatus();

    // Toggle subscription
    toggleBtn.addEventListener('click', async () => {
      await this.toggleSubscription();
    });

    // Test notification
    testBtn.addEventListener('click', async () => {
      await this.sendTestNotification();
    });

    // Refresh status
    refreshBtn.addEventListener('click', async () => {
      await this.updateNotificationStatus();
    });

    // Back button
    backBtn.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

  async updateNotificationStatus() {
    const statusEl = document.getElementById('notification-status');
    const permissionEl = document.getElementById('notification-permission');
    const toggleBtn = document.getElementById('toggle-notification-btn');
    const testBtn = document.getElementById('test-notification-btn');
    const subscriptionInfoEl = document.getElementById('subscription-info');

    try {
      const isSubscribed = await this.pushService.isSubscribed();
      const permission = Notification.permission;

      // Update UI
      statusEl.textContent = isSubscribed ? '✅ Enabled' : '❌ Disabled';
      permissionEl.textContent = this.formatPermission(permission);

      if (isSubscribed) {
        toggleBtn.classList.add('active');
        testBtn.disabled = false;
        subscriptionInfoEl.style.display = 'block';
      } else {
        toggleBtn.classList.remove('active');
        testBtn.disabled = true;
        subscriptionInfoEl.style.display = 'none';
      }

      const statusEl2 = document.getElementById('permission-status');
      if (permission === 'granted' && isSubscribed) {
        statusEl2.textContent = '✅ Notifications are enabled';
        statusEl2.style.color = '#28a745';
      } else if (permission === 'denied') {
        statusEl2.textContent = '❌ You have denied notifications. Enable them in browser settings.';
        statusEl2.style.color = '#dc3545';
        toggleBtn.disabled = true;
      } else if (permission === 'default') {
        statusEl2.textContent = '⚠️ Click toggle to enable notifications';
        statusEl2.style.color = '#ffc107';
      }
    } catch (err) {
      console.error('[NotificationSettings] Error updating status:', err);
      statusEl.textContent = 'Error';
      statusEl.style.color = '#dc3545';
    }
  }

  async toggleSubscription() {
    const toggleBtn = document.getElementById('toggle-notification-btn');
    toggleBtn.disabled = true;

    try {
      const isSubscribed = await this.pushService.isSubscribed();

      if (isSubscribed) {
        // Unsubscribe
        const success = await this.pushService.unsubscribe();
        if (success) {
          await this.indexedDB.deletePushSubscription();
          alert('Push notifications have been disabled');
        }
      } else {
        // Request permission first
        const hasPermission = await this.pushService.requestPermission();
        if (!hasPermission) {
          alert('Permission denied. Please enable notifications in your browser settings.');
          toggleBtn.disabled = false;
          return;
        }

        // Subscribe with VAPID public key
        // Note: Replace with actual VAPID public key from your server
        const VAPID_PUBLIC_KEY = 'BEl62iUEL8kIAcD78j6O7u0zkz7HLEcqU8MKS0Ny2m89KBj1t_ULhfYoxKiVv0vJi0lxPKKWLXu5b3vZHgUzN7I';

        const subscription = await this.pushService.subscribe(VAPID_PUBLIC_KEY);
        if (subscription) {
          // Save to IndexedDB
          await this.indexedDB.savePushSubscription(subscription);

          // Send to server
          const token = localStorage.getItem('token');
          if (token) {
            try {
              await this.pushService.sendSubscriptionToServer(subscription, token);
            } catch (err) {
              console.warn('[NotificationSettings] Could not send subscription to server:', err);
              // Still show success as subscription is saved locally
            }
          }

          alert('Push notifications have been enabled!');
        } else {
          alert('Failed to enable notifications. Please try again.');
        }
      }

      await this.updateNotificationStatus();
    } catch (err) {
      console.error('[NotificationSettings] Error toggling subscription:', err);
      alert('Error: ' + err.message);
    } finally {
      toggleBtn.disabled = false;
    }
  }

  async sendTestNotification() {
    try {
      const testBtn = document.getElementById('test-notification-btn');
      testBtn.disabled = true;

      await this.pushService.showLocalNotification('Test Notification', {
        body: '✅ Push notifications are working! You will receive notifications about new stories.',
        tag: 'test-notification',
        requireInteraction: true,
        actions: [
          { action: 'view-all', title: 'View All Stories' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      });

      alert('Test notification sent!');
    } catch (err) {
      console.error('[NotificationSettings] Error sending test notification:', err);
      alert('Error: ' + err.message);
    } finally {
      const testBtn = document.getElementById('test-notification-btn');
      testBtn.disabled = false;
    }
  }

  formatPermission(permission) {
    switch (permission) {
      case 'granted':
        return '✅ Granted';
      case 'denied':
        return '❌ Denied';
      case 'default':
        return '⚠️ Not Set';
      default:
        return 'Unknown';
    }
  }

  updateStatus(status, message) {
    const statusEl = document.getElementById('notification-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = status === 'error' ? '#dc3545' : '#28a745';
    }
  }
}
