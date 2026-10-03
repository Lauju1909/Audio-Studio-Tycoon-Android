class TycoonAudioEngine {
  constructor() {
    this.isTTSActive = true;
    this.speechRate = 1.1;
  }

  playSound(name, vol = 1.0) {
    try {
      const audio = new Audio(`assets/${name}.ogg`);
      audio.volume = Math.max(0, Math.min(1, vol));
      audio.play().catch(() => {});
    } catch(e) {}
  }

  speak(text, interrupt = false) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => { announcer.textContent = text; }, 30);
    }

    if (!this.isTTSActive || !window.speechSynthesis) return;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'de-DE';
    utter.rate = this.speechRate;
    window.speechSynthesis.speak(utter);
  }

  vibrate(ms = 25) {
    if (window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(ms); } catch(e) {}
    }
  }
}

const AudioEngine = new TycoonAudioEngine();