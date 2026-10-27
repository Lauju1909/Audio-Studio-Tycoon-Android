/**
 * Audio Studio Tycoon - Studio State Model & Financial Helpers
 */

function createDefaultState(startYear = 1930) {
  const initYear = (typeof START_YEAR !== 'undefined') ? START_YEAR : (startYear || 1930);

  const initPlatforms = (typeof getAvailablePlatforms === 'function')
    ? getAvailablePlatforms(initYear).map(p => p.name)
    : ["Hand-Abakus"];

  const baseThemes = ["Fantasy", "SciFi", "Cyberpunk", "Medieval", "Horror", "Retro"];
  const histTopics = (typeof getAvailableTopics === 'function')
    ? getAvailableTopics(initYear).map(t => t.name)
    : ["Abakus", "Radio-Drama", "Stummfilm", "Logistik", "Schach", "Mathematik"];
  const initTopics = Array.from(new Set([...baseThemes, ...histTopics]));

  const state = {
    studioName: "Audio Wave Studios",
    year: initYear,
    week: 1,
    weeksPerYear: 48,
    cash: 50000,
    fans: 150,
    rp: 15,
    loan: 0,
    loanInterestRate: 0.005,
        // Automatische Spracherkennung: 'de' für Deutsch, 'en' für alle anderen
    language: (() => {
      try {
        if (typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem('ast_language');
          if (saved) return saved;
        }
        const nav = (typeof navigator !== 'undefined' && ((navigator.languages && navigator.languages[0]) || navigator.language)) || '';
        return nav.toLowerCase().startsWith('de') ? 'de' : 'en';
      } catch (e) {
        return 'en';
      }
    })(),
    unlockedTech: [],
    unlockedFeatures: [],
    unlockedPlatforms: initPlatforms,
    unlockedGenres: ["Action", "Puzzle", "Casual", "Simulation", "Strategy"],
    unlockedTopics: initTopics,
    salesMultiplier: 1.0,
    hypeMultiplier: 1.0,
    hype: 50,
    prestige: 0,
    taxRate: 0.1,
    logicMultiplier: 1.0,
    devSpeedMultiplier: 1.0,
    salaryMultiplier: 1.0,
    devCostMultiplier: 1.0,
    serverCosts: 0,
    marketingEfficiency: 1.0,
    streamerHypeMulti: 1.0,
    subscriptionMulti: 1.0,
    qualityStandardMulti: 1.0,
    currentTrend: { topic: "Radio-Drama", genre: "Abenteuer" },
    eventLog: [],
    customEngines: [
      { id: 'engine_basic_1', name: 'Monophonic 8-Bit Engine', features: ['basic_audio'], audioBonus: 5, techBonus: 5, bugReduction: 0 }
    ],
    staff: [
      { id: 1, name: "Max Melodie", role: "sound", salary: 1500, skill: 2, fatigue: 0, morale: 100, onVacationWeeks: 0 }
    ],
    marketingCampaign: null,
    activeProject: null,
    releasedGames: [],
    soundtrackLabel: [],
    gotyAwards: [],
    isTimerRunning: true,
    isPaused: false,
    isGameOver: false,
    endlessMode: false,
    timerInterval: null // Runtime only, NEVER serialized to localStorage
  };

  // Apply initial startYear historical event
  const initEvent = (typeof getYearEvent === 'function')
    ? getYearEvent(initYear)
    : ((typeof YEAR_EVENTS !== 'undefined') ? YEAR_EVENTS[initYear] : null);

  if (initEvent) {
    if (initEvent.effect === 'sales_multi' || initEvent.effect === 'money_multi') {
      state.salesMultiplier = initEvent.value;
    } else if (initEvent.effect === 'rp') {
      state.rp += initEvent.value;
    }
    state.eventLog.push({
      year: initYear,
      text: initEvent.text,
      effect: initEvent.effect,
      value: initEvent.value
    });
  }

  return state;
}

const StudioState = (typeof window !== 'undefined' && window.StudioState) ? window.StudioState : createDefaultState();

function formatMoney(amount) {
  const lang = (StudioState && StudioState.language === 'en') ? 'en-US' : 'de-DE';
  const currency = (StudioState && StudioState.language === 'en') ? 'USD' : 'EUR';
  return new Intl.NumberFormat(lang, { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
}

function getMaxLoan() {
  const base = 50000;
  const fanBonus = Math.round((StudioState.fans || 0) * 30);
  const revenueBonus = Math.max(0, Math.round((StudioState.cash || 0) * 0.5));
  return Math.min(1000000, base + fanBonus + revenueBonus);
}

if (typeof window !== 'undefined') {
  window.createDefaultState = createDefaultState;
  window.StudioState = StudioState;
  window.formatMoney = formatMoney;
  window.getMaxLoan = getMaxLoan;
}
