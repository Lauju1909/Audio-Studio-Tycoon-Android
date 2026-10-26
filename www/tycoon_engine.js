/**
 * Audio Studio Tycoon - Tycoon Engine Facade & Core Loader
 * Loads modular components: i18n, game_data, event_system, models, and persistence.
 */

// If running in Node.js / headless test environment, load modular sub-scripts:
if (typeof fs !== 'undefined' && typeof fs.readFileSync === 'function') {
  const modulesToLoad = [
    'www/js/i18n.js',
    'www/js/game_data.js',
    'www/js/event_system.js',
    'www/js/models.js',
    'www/js/persistence.js'
  ];
  modulesToLoad.forEach(file => {
    try {
      const code = fs.readFileSync(file, 'utf8');
      (1, eval)(code);
    } catch (e) {
      console.error(`Failed to load submodule ${file}:`, e);
    }
  });
}

// Global facade bindings for backward compatibility
if (typeof window !== 'undefined') {
  window.StudioState = typeof StudioState !== 'undefined' ? StudioState : (window.StudioState || {});
  window.TRANSLATIONS = typeof TRANSLATIONS !== 'undefined' ? TRANSLATIONS : window.TRANSLATIONS;
  window.t = typeof t !== 'undefined' ? t : window.t;
  window.START_YEAR = typeof START_YEAR !== 'undefined' ? START_YEAR : 1930;
  window.WEEKS_PER_YEAR = typeof WEEKS_PER_YEAR !== 'undefined' ? WEEKS_PER_YEAR : 48;
  window.PLATFORMS = typeof PLATFORMS !== 'undefined' ? PLATFORMS : [];
  window.YEAR_EVENTS = typeof YEAR_EVENTS !== 'undefined' ? YEAR_EVENTS : {};
  window.FEATURE_UNLOCKS = typeof FEATURE_UNLOCKS !== 'undefined' ? FEATURE_UNLOCKS : {};
  window.HISTORICAL_TOPICS = typeof HISTORICAL_TOPICS !== 'undefined' ? HISTORICAL_TOPICS : [];
  window.HISTORICAL_ERAS = typeof HISTORICAL_ERAS !== 'undefined' ? HISTORICAL_ERAS : [];
  window.getCurrentEra = typeof getCurrentEra !== 'undefined' ? getCurrentEra : window.getCurrentEra;
  window.getAvailablePlatforms = typeof getAvailablePlatforms !== 'undefined' ? getAvailablePlatforms : window.getAvailablePlatforms;
  window.getNewlyUnlockedPlatforms = typeof getNewlyUnlockedPlatforms !== 'undefined' ? getNewlyUnlockedPlatforms : window.getNewlyUnlockedPlatforms;
  window.getNewlyRetiredPlatforms = typeof getNewlyRetiredPlatforms !== 'undefined' ? getNewlyRetiredPlatforms : window.getNewlyRetiredPlatforms;
  window.getNewlyUnlockedFeatures = typeof getNewlyUnlockedFeatures !== 'undefined' ? getNewlyUnlockedFeatures : window.getNewlyUnlockedFeatures;
  window.isFeatureUnlocked = typeof isFeatureUnlocked !== 'undefined' ? isFeatureUnlocked : window.isFeatureUnlocked;
  window.getYearEvent = typeof getYearEvent !== 'undefined' ? getYearEvent : window.getYearEvent;
  window.THEME_GENRE_SYNERGIES = typeof THEME_GENRE_SYNERGIES !== 'undefined' ? THEME_GENRE_SYNERGIES : window.THEME_GENRE_SYNERGIES;
  window.RESEARCH_CATALOG = typeof RESEARCH_CATALOG !== 'undefined' ? RESEARCH_CATALOG : window.RESEARCH_CATALOG;
  window.getMaxLoan = typeof getMaxLoan !== 'undefined' ? getMaxLoan : window.getMaxLoan;
  window.formatMoney = typeof formatMoney !== 'undefined' ? formatMoney : window.formatMoney;
  window.saveGame = typeof saveGame !== 'undefined' ? saveGame : window.saveGame;
  window.loadGame = typeof loadGame !== 'undefined' ? loadGame : window.loadGame;
  window.resetGame = typeof resetGame !== 'undefined' ? resetGame : window.resetGame;
}