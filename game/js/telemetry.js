// Stack Tower - Cross-Platform Telemetry & Crashlytics Bridge (Android & iOS)
const FirebaseTracker = {
  isAndroidBridge() {
    return typeof window.FirebaseBridge !== 'undefined' && window.FirebaseBridge !== null;
  },
  isIosBridge() {
    return typeof window.webkit !== 'undefined' &&
      window.webkit !== null &&
      typeof window.webkit.messageHandlers !== 'undefined' &&
      typeof window.webkit.messageHandlers.FirebaseBridge !== 'undefined' &&
      typeof window.webkit.messageHandlers.FirebaseBridge.postMessage === 'function';
  },
  isAvailable() {
    return this.isAndroidBridge() || this.isIosBridge();
  },
  logEvent(name, params = {}) {
    try {
      if (this.isAndroidBridge() && typeof window.FirebaseBridge.logEvent === 'function') {
        window.FirebaseBridge.logEvent(name, JSON.stringify(params));
      } else if (this.isIosBridge()) {
        window.webkit.messageHandlers.FirebaseBridge.postMessage({
          action: 'logEvent',
          name: String(name),
          params: params
        });
      } else {
        console.log(`[Firebase Analytics (Dev)] ${name}`, params);
      }
    } catch (e) {
      console.warn('[FirebaseTracker] logEvent error:', e);
    }
  },
  recordException(error, context = '') {
    try {
      const message = (error && (error.message || error.toString())) || 'Unknown JS Error';
      const stack = (error && error.stack) || (new Error().stack) || '';
      const fullContext = context ? `[Context: ${context}] ${message}` : message;
      if (this.isAndroidBridge() && typeof window.FirebaseBridge.recordException === 'function') {
        window.FirebaseBridge.recordException(fullContext, stack);
      } else if (this.isIosBridge()) {
        window.webkit.messageHandlers.FirebaseBridge.postMessage({
          action: 'recordException',
          message: fullContext,
          stack: stack
        });
      } else {
        console.warn(`[Firebase Crashlytics (Dev)] ${fullContext}\n${stack}`);
      }
    } catch (e) {
      console.warn('[FirebaseTracker] recordException error:', e);
    }
  },
  setUserId(userId) {
    try {
      if (this.isAndroidBridge() && typeof window.FirebaseBridge.setUserId === 'function') {
        window.FirebaseBridge.setUserId(String(userId));
      } else if (this.isIosBridge()) {
        window.webkit.messageHandlers.FirebaseBridge.postMessage({
          action: 'setUserId',
          userId: String(userId)
        });
      }
    } catch (e) {}
  },
  setCustomKey(key, value) {
    try {
      if (this.isAndroidBridge() && typeof window.FirebaseBridge.setCustomKey === 'function') {
        window.FirebaseBridge.setCustomKey(String(key), String(value));
      } else if (this.isIosBridge()) {
        window.webkit.messageHandlers.FirebaseBridge.postMessage({
          action: 'setCustomKey',
          key: String(key),
          value: String(value)
        });
      }
    } catch (e) {}
  },
  log(message) {
    try {
      if (this.isAndroidBridge() && typeof window.FirebaseBridge.log === 'function') {
        window.FirebaseBridge.log(String(message));
      } else if (this.isIosBridge()) {
        window.webkit.messageHandlers.FirebaseBridge.postMessage({
          action: 'log',
          message: String(message)
        });
      }
    } catch (e) {}
  }
};

// Global crash & unhandled promise rejection tracking
window.addEventListener('error', (event) => {
  FirebaseTracker.recordException(
    event.error || event.message,
    `Uncaught Error at ${event.filename || 'unknown'}:${event.lineno || 0}:${event.colno || 0}`
  );
});

window.addEventListener('unhandledrejection', (event) => {
  FirebaseTracker.recordException(
    event.reason,
    'Unhandled Promise Rejection'
  );
});

window.FirebaseTracker = FirebaseTracker;
