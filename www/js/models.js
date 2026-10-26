/**
 * Audio Studio Tycoon - Studio State Model & Financial Helpers
 */

function createDefaultState(startYear = 1930) {
  const initYear = (typeof START_YEAR !== 'undefined') ? START_YEAR : (startYear || 1930);
  return {
    studioName: "Audio Wave Studios",
    year: initYear,
    week: 1,
    weeksPerYear: 48,
    cash: 50000,
    fans: 150,
    rp: 15,
    loan: 0,
    loanInterestRate: 0.005,
    language: "de",
    unlockedTech: [],
    unlockedFeatures: [],
    unlockedPlatforms: [],
    unlockedTopics: [],
    salesMultiplier: 1.0,
    hypeMultiplier: 1.0,
    hype: 50,
    prestige: 0,
    taxRate: 0.1,
    logicMultiplier: 1.0,
    devSpeedMultiplier: 1.0,
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
    timerInterval: null // Runtime only, NEVER serialized to localStorage
  };
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
