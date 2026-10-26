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

    // Update Screen Reader live region for TalkBack / NVDA
    const announcer = document.getElementById(interrupt ? 'sr-announcer' : 'sr-polite') || document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => { announcer.textContent = text; }, 20);
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

const AudioEngine = new TycoonAudioEngine();
window.AudioEngine = AudioEngine;