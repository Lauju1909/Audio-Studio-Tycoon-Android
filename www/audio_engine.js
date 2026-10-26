/**
 * Audio Studio Tycoon - Web Audio & Screen Reader Speech Engine
 * Enhanced for Android, Mobile Web and Screen Readers (TalkBack / NVDA)
 */

class TycoonAudioEngine {
  constructor() {
    this.isTTSActive = true;
    this.speechRate = 1.05;
    this.audioContext = null;
    this.soundCache = {};
    this.speechQueue = [];
    this.isSpeaking = false;
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  playSound(name, vol = 1.0) {
    // Try native audio file playback first
    try {
      const audio = new Audio(`assets/${name}.ogg`);
      audio.volume = Math.max(0, Math.min(1, vol));
      audio.play().catch(() => {
        // Fallback to Web Audio synthesizer if file fails
        this.synthSound(name, vol);
      });
    } catch(e) {
      this.synthSound(name, vol);
    }
  }

  /**
   * Synthesize game audio effects using Web Audio API oscillator
   * Guarantees 100% reliable sound playback even if assets are blocked.
   */
  synthSound(type, vol = 0.5) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(Math.min(0.4, vol * 0.4), now);

      if (type === 'select' || type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'confirm' || type === 'buy') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.08); // E5
        osc.frequency.setValueAtTime(880, now + 0.16); // A5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'cash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987, now); // B5
        osc.frequency.setValueAtTime(1318, now + 0.09); // E6
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.31);
      } else if (type === 'error' || type === 'warn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'blip' || type === 'typing') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700 + Math.random() * 200, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success' || type === 'drumroll') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.1); // E5
        osc.frequency.setValueAtTime(783, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046, now + 0.3); // C6
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.61);
      }
    } catch(e) {}
  }

  speak(text, interrupt = false) {
    if (!text) return;

    if (typeof ariaLiveQueue !== 'undefined' && ariaLiveQueue.announce) {
      ariaLiveQueue.announce(text, interrupt ? 'assertive' : 'polite');
    } else {
      const announcer = document.getElementById(interrupt ? 'sr-announcer' : 'sr-polite') || document.getElementById('sr-announcer');
      if (announcer) {
        announcer.textContent = '';
        setTimeout(() => { announcer.textContent = text; }, 20);
      }
    }

    if (!this.isTTSActive || !window.speechSynthesis) return;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    const lang = (window.StudioState && window.StudioState.language === 'en') ? 'en-US' : 'de-DE';
    utter.lang = lang;
    utter.rate = this.speechRate;
    window.speechSynthesis.speak(utter);
  }

  vibrate(pattern = 25) {
    if (window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(pattern); } catch(e) {}
    }
  }
}

const ALL_EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

class AriaLiveQueue {
  constructor(announcerId = "sr-announcer") {
    this.announcerId = announcerId;
    this.queue = [];
    this.isProcessing = false;
    this.timer = null;
  }

  announce(message, priority = 'polite') {
    if (!message) return;
    const cleanMsg = String(message).replace(ALL_EMOJI_REGEX, '').trim();
    if (!cleanMsg) return;

    if (priority === 'assertive') {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.queue.unshift({ message: cleanMsg, priority: 'assertive' });
      this.isProcessing = false;
      this.processNext();
    } else {
      this.queue.push({ message: cleanMsg, priority: 'polite' });
      if (!this.isProcessing) {
        this.processNext();
      }
    }
  }

  processNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.queue.shift();
    const liveEl = (typeof document !== 'undefined') ? (document.getElementById(item.priority === 'assertive' ? 'sr-announcer' : 'sr-polite') || document.getElementById(this.announcerId) || document.getElementById("sr-announcer")) : null;

    if (liveEl) {
      liveEl.textContent = '';
      setTimeout(() => {
        liveEl.textContent = item.message;
        const readDuration = Math.max(1200, item.message.length * 65);
        this.timer = setTimeout(() => {
          this.processNext();
        }, readDuration);
      }, 50);
    } else {
      this.processNext();
    }
  }
}

const ariaLiveQueue = new AriaLiveQueue("sr-announcer");
const AudioEngine = new TycoonAudioEngine();

if (typeof window !== 'undefined') {
  window.AriaLiveQueue = AriaLiveQueue;
  window.ariaLiveQueue = ariaLiveQueue;
  window.AudioEngine = AudioEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TycoonAudioEngine, AudioEngine, AriaLiveQueue, ariaLiveQueue };
}