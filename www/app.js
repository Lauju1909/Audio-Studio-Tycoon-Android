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