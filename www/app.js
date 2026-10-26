/**
 * Audio Studio Tycoon - Mobile Application Controller Facade
 * Composes modular systems: finance, research, engine, staff, marketing, dev, simulation, hud, modals.
 */

// If running in Node.js / headless test environment, load modular system scripts:
if (typeof fs !== 'undefined' && typeof fs.readFileSync === 'function') {
  const systemsToLoad = [
    'www/js/systems/finance_system.js',
    'www/js/systems/research_system.js',
    'www/js/systems/engine_system.js',
    'www/js/systems/staff_system.js',
    'www/js/systems/marketing_system.js',
    'www/js/systems/dev_system.js',
    'www/js/systems/simulation_system.js',
    'www/js/ui/hud.js',
    'www/js/ui/modals.js'
  ];
  systemsToLoad.forEach(file => {
    try {
      const code = fs.readFileSync(file, 'utf8');
      (1, eval)(code);
    } catch (e) {
      console.error(`Failed to load system ${file}:`, e);
    }
  });
}

// Browser lifecycle and event listeners
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof loadGame === 'function') loadGame();
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof renderReleasedGames === 'function') renderReleasedGames();
    if (typeof startWeeklyLoop === 'function') startWeeklyLoop();
    if (typeof applyLanguageToUI === 'function') applyLanguageToUI();

    // Display initial historical event banner (e.g. 1930 Weltwirtschaftskrise)
    if (typeof showTimelineEventBanner === 'function' && StudioState.eventLog && StudioState.eventLog.length > 0) {
      const latestEv = StudioState.eventLog[0];
      const evText = (typeof t === 'function') ? t(latestEv.text) : latestEv.text;
      showTimelineEventBanner(latestEv.year, evText, latestEv);
    }

    // Android Hardware Back-Button Handling
    document.addEventListener('backbutton', (e) => {
      e.preventDefault();
      if (typeof dismissEventBanner === 'function') dismissEventBanner();
      if (typeof closeAllModals === 'function') closeAllModals();
      if (typeof AudioEngine !== 'undefined') AudioEngine.vibrate(20);
    });

    // Global ESC key to close open modals and event banner
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (typeof dismissEventBanner === 'function') dismissEventBanner();
        if (typeof closeAllModals === 'function') closeAllModals();
      }
    });
  });
}

// --- FEEDBACK SYSTEM ---
function openFeedbackModal() {
  const modal = document.getElementById('modal-feedback');
  if (modal) modal.style.display = 'flex';
  const sender = document.getElementById('fb-sender');
  if (sender) sender.focus();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.speak(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'Feedback dialog opened.' : 'Feedback-Dialog geöffnet.');
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('modal-feedback');
  if (modal) modal.style.display = 'none';
  const statusEl = document.getElementById('fb-status');
  if (statusEl) statusEl.textContent = '';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.speak(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'Feedback closed.' : 'Feedback geschlossen.');
  }
}

async function sendTycoonFeedback() {
  const senderInput = document.getElementById('fb-sender');
  const textInput = document.getElementById('fb-text');
  const statusEl = document.getElementById('fb-status');

  const sender = (senderInput && senderInput.value.trim()) || 'Anonym';
  const text = (textInput && textInput.value.trim()) || '';

  const isEn = typeof currentLang !== 'undefined' && currentLang === 'en';

  if (!text) {
    const msg = isEn ? 'Please enter a message!' : 'Bitte gib eine Nachricht ein!';
    if (statusEl) {
      statusEl.style.color = '#ef4444';
      statusEl.textContent = msg;
    }
    if (typeof AudioEngine !== 'undefined') AudioEngine.speak(msg, true);
    return;
  }

  if (statusEl) {
    statusEl.style.color = '#eab308';
    statusEl.textContent = isEn ? 'Sending...' : 'Wird gesendet...';
  }

  const payload = `App: tycoon\nVersion: 4.2\nAbsender: ${sender}\nDatum: ${new Date().toISOString()}\nNachricht:\n${text}`;

  try {
    const res = await fetch('https://ntfy.sh/lauju_app_feedback', {
      method: 'POST',
      body: payload,
      headers: {
        'Title': `🎧 Tycoon Feedback von ${sender}`,
        'Tags': 'headphones,speech_balloon,tycoon',
        'Priority': 'default'
      }
    });

    if (res.ok) {
      const succ = isEn ? 'Thank you! Feedback sent successfully.' : 'Vielen Dank! Dein Feedback wurde erfolgreich gesendet.';
      if (statusEl) {
        statusEl.style.color = '#22c55e';
        statusEl.textContent = succ;
      }
      if (textInput) textInput.value = '';
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.playSound('level_up');
        AudioEngine.speak(succ, true);
      }
      setTimeout(closeFeedbackModal, 2000);
    } else {
      throw new Error('Server responded with ' + res.status);
    }
  } catch (err) {
    console.error('Feedback error:', err);
    const errMsg = isEn ? 'Error sending feedback. Please check your connection.' : 'Fehler beim Senden. Bitte Verbindung prüfen.';
    if (statusEl) {
      statusEl.style.color = '#ef4444';
      statusEl.textContent = errMsg;
    }
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(errMsg, true);
    }
  }
}
