// Stack Tower - Telemetry & Crashlytics Bridge
  const FirebaseTracker = {
    isAvailable() {
      return typeof window.FirebaseBridge !== 'undefined' && window.FirebaseBridge !== null;
    },
    logEvent(name, params = {}) {
      try {
        if (this.isAvailable() && typeof window.FirebaseBridge.logEvent === 'function') {
          window.FirebaseBridge.logEvent(name, JSON.stringify(params));
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
        if (this.isAvailable() && typeof window.FirebaseBridge.recordException === 'function') {
          window.FirebaseBridge.recordException(fullContext, stack);
        } else {
          console.warn(`[Firebase Crashlytics (Dev)] ${fullContext}\n${stack}`);
        }
      } catch (e) {
        console.warn('[FirebaseTracker] recordException error:', e);
      }
    },
    setUserId(userId) {
      try {
        if (this.isAvailable() && typeof window.FirebaseBridge.setUserId === 'function') {
          window.FirebaseBridge.setUserId(String(userId));
        }
      } catch (e) {}
    },
    setCustomKey(key, value) {
      try {
        if (this.isAvailable() && typeof window.FirebaseBridge.setCustomKey === 'function') {
          window.FirebaseBridge.setCustomKey(String(key), String(value));
        }
      } catch (e) {}
    },
    log(message) {
      try {
        if (this.isAvailable() && typeof window.FirebaseBridge.log === 'function') {
          window.FirebaseBridge.log(String(message));
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
