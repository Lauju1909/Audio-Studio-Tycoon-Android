/**
 * Audio Studio Tycoon - Event System & PubSub
 * Decouples game logic from UI announcements and audio feedback.
 */

class TycoonEventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${event}:`, err);
      }
    });
  }
}

const EventBus = new TycoonEventBus();

if (typeof window !== 'undefined') {
  window.EventBus = EventBus;
  window.TycoonEventBus = TycoonEventBus;
}
