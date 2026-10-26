/**
 * Audio Studio Tycoon - Studio State Model & Financial Helpers
 */

function createDefaultState() {
  return {
    studioName: "Audio Wave Studios",
    year: 1980,
    week: 1,
    cash: 50000,
    fans: 150,
    rp: 15,
    loan: 0,
    language: "de",
    unlockedTech: [],
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
