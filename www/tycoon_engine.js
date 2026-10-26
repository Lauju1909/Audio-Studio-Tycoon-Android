/**
 * Audio Studio Tycoon - Tycoon Simulation Engine
 * Core Game Logic, Synergies, Research Technologies, Engines, and State Management
 */

const TRANSLATIONS = {
  de: {
    app_title: "Audio Studio Tycoon",
    date_format: "Jahr {year} • Woche {week}",
    cash_label: "Guthaben:",
    fans_label: "Fans:",
    rp_label: "Forschung:",
    debt_label: "Schulden:",
    new_game: "Neues Spiel entwickeln",
    new_game_desc: "Thema, Genre, Audio-Engine & Team wählen",
    research: "Forschungslabor",
    research_desc: "Audio-Technologien & Engines freischalten",
    custom_engine: "Engine-Werkstatt",
    custom_engine_desc: "Eigene Sound-Engines für Projekte bauen",
    staff: "Personal & Team",
    staff_desc: "Audio-Designer & Programmierer anheuern / Urlaub",
    marketing: "Marketing & Hype",
    marketing_desc: "Kampagnen starten und Bekanntheit steigern",
    soundcon: "SoundCon Messe",
    soundcon_desc: "Große Spielemesse buchen & Fans begeistern",
    label: "Soundtrack-Label",
    label_desc: "Game-Soundtracks veröffentlichen & Tantiemen",
    bank: "Bank & Kredite",
    bank_desc: "Darlehen aufnehmen oder vorzeitig tilgen",
    achievements: "Bisherige Erfolge",
    no_games_yet: "Noch kein Spiel veröffentlicht. Starte dein erstes Projekt!",
    active_dev_title: "Aktuelle Spieleentwicklung",
    features_stat: "Features",
    sound_stat: "Audio-Punkte",
    bugs_stat: "Bugs",
    finish_publish: "✨ Spiel fertigstellen & veröffentlichen",
    year_change: "Ein neues Geschäftsjahr beginnt! Jahr {year}.",
    not_enough_money: "Nicht genügend Geld! Du benötigst mindestens {cost}.",
    not_enough_rp: "Nicht genügend Forschungspunkte! Du brauchst {rp} FP.",
    dev_started: "Entwicklung von {title} gestartet! ({theme} / {genre}).",
    dev_finished: "Kritikerwertung für {title}: {score} von 100 Punkten! Einnahmen: {rev}. {fans} neue Fans gewonnen!",
    soundcon_success: "Die SoundCon war ein voller Erfolg! {fans} neue begeisterte Fans strömen zu deinem Studio.",
    hired_success: "{name} ({role}) wurde für {salary} / Monat eingestellt!",
    vacation_sent: "{name} ist nun für 4 Wochen im Erholungsurlaub.",
    loan_taken: "Kredit über {amount} erfolgreich ausgezahlt.",
    loan_repaid: "Kredit über {amount} getilgt.",
    loan_interest_paid: "Wöchentliche Kreditzinsen: {cost} bezahlt.",
    loan_limit_reached: "Kreditlimit erreicht! Dein Studio kann maximal {max} aufnehmen.",
    no_debt_to_repay: "Du hast derzeit keine offenen Kredite zu tilgen.",
    game_saved: "Spielstand erfolgreich im Smartphone-Speicher gesichert!",
    game_loaded: "Spielstand geladen!",
    goty_winner: "🏆 AUSZEICHNUNG! Dein Spiel '{title}' hat den Preis für den besten Sound des Jahres gewonnen! +50.000 € Bonus und +3.000 Fans!"
  },
  en: {
    app_title: "Audio Studio Tycoon",
    date_format: "Year {year} • Week {week}",
    cash_label: "Cash:",
    fans_label: "Fans:",
    rp_label: "Research:",
    debt_label: "Debt:",
    new_game: "Develop New Game",
    new_game_desc: "Select theme, genre, audio engine & team",
    research: "Research Lab",
    research_desc: "Unlock cutting-edge audio tech & systems",
    custom_engine: "Engine Workshop",
    custom_engine_desc: "Build custom sound engines for projects",
    staff: "Staff & Team",
    staff_desc: "Hire audio designers & coders / vacations",
    marketing: "Marketing & Hype",
    marketing_desc: "Launch campaigns to build player hype",
    soundcon: "SoundCon Expo",
    soundcon_desc: "Book trade shows and win loyal fans",
    label: "Soundtrack Label",
    label_desc: "Release game soundtracks & earn royalties",
    bank: "Bank & Loans",
    bank_desc: "Borrow capital or repay outstanding debt",
    achievements: "Released Games & Portfolio",
    no_games_yet: "No games released yet. Start your first game project above!",
    active_dev_title: "Active Game Development",
    features_stat: "Features",
    sound_stat: "Audio Pts",
    bugs_stat: "Bugs",
    finish_publish: "✨ Complete & Release Game",
    year_change: "A new fiscal year begins! Year {year}.",
    not_enough_money: "Insufficient funds! You need at least {cost}.",
    not_enough_rp: "Insufficient research points! You need {rp} RP.",
    dev_started: "Development of {title} started! ({theme} / {genre}).",
    dev_finished: "Review score for {title}: {score} out of 100! Revenue: {rev}. Gained {fans} new fans!",
    soundcon_success: "SoundCon was a huge success! Gained {fans} enthusiastic new fans.",
    hired_success: "{name} ({role}) was hired for {salary} / month!",
    vacation_sent: "{name} has been sent on 4-week paid vacation.",
    loan_taken: "Loan of {amount} successfully disbursed.",
    loan_repaid: "Repaid {amount} of outstanding loan.",
    loan_interest_paid: "Weekly loan interest of {cost} deducted.",
    loan_limit_reached: "Credit limit reached! Your studio's maximum borrowing limit is {max}.",
    no_debt_to_repay: "You have no outstanding loans to repay.",
    game_saved: "Game saved successfully to device storage!",
    game_loaded: "Game state loaded successfully!",
    goty_winner: "🏆 AWARD! Your title '{title}' won Best Audio of the Year! +50,000 € bonus and +3,000 fans!"
  }
};

function t(key, params = {}) {
  const lang = StudioState.language || 'de';
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.de;
  let text = dict[key] || TRANSLATIONS.de[key] || key;
  for (const p in params) {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
  }
  return text;
}

const THEME_GENRE_SYNERGIES = {
  "Fantasy": { "RPG": 1.18, "Action": 1.05, "Strategy": 1.08, "Simulation": 0.92, "Puzzle": 0.95 },
  "SciFi": { "Strategy": 1.18, "Simulation": 1.12, "Action": 1.10, "RPG": 1.05, "Puzzle": 0.98 },
  "Cyberpunk": { "Action": 1.15, "RPG": 1.15, "Strategy": 1.02, "Simulation": 0.95, "Puzzle": 0.92 },
  "Horror": { "Action": 1.14, "RPG": 1.06, "Puzzle": 1.10, "Strategy": 0.88, "Simulation": 0.85 },
  "Medieval": { "Strategy": 1.16, "RPG": 1.12, "Simulation": 1.04, "Action": 1.02, "Puzzle": 0.90 },
  "Retro": { "Puzzle": 1.16, "Action": 1.10, "Simulation": 1.00, "RPG": 1.02, "Strategy": 0.95 }
};

const RESEARCH_CATALOG = [
  { id: 'chiptune', name: 'Synthesizer Chiptune Modul', cost: 15, year: 1980, desc: '+20% Audio-Punkte bei Retro- & Cyberpunk-Titeln', effect: { audioPct: 20, themes: ['Retro', 'Cyberpunk'] } },
  { id: 'polyphonic', name: 'Polyphone Sound-Synthese', cost: 25, year: 1982, desc: 'Schaltet mehrstimmige Audio-Spuren für alle Genres frei (+15 Audio)', effect: { flatAudio: 15 } },
  { id: 'dsp_effects', name: 'DSP-Effektprozessor (Reverb/Chorus)', cost: 40, year: 1985, desc: 'Erhöht Audio-Punkte um 20% und senkt Bug-Rate um 20%', effect: { audioPct: 20, bugReduction: 0.20 } },
  { id: 'surround_51', name: '5.1 Surround Sound System', cost: 60, year: 1992, desc: 'Enormer Hype- und Wertungsbonus bei Action & Horror (+15%)', effect: { scorePct: 15, genres: ['Action', 'Horror'] } },
  { id: 'binaural_3d', name: 'Binaurale 3D-Audio-Engine', cost: 80, year: 2000, desc: 'Kopfhörer-Raumklang für Screenreader & Gamer (+30% Audio & +50% Fans)', effect: { audioPct: 30, fanMultiplier: 1.5 } },
  { id: 'ai_composition', name: 'KI-Prozedurale Soundtrack-Engine', cost: 120, year: 2015, desc: 'Beschleunigt Entwicklung um 25% und erhöht Soundtrack-Tantiemen um 35%', effect: { speedBoost: 0.25, labelRoyaltyPct: 35 } },
  { id: 'raytracing_audio', name: 'Echtzeit-Acoustic Raytracing', cost: 160, year: 2020, desc: 'Physikalisch korrekte Schallwellen-Berechnung (+25 Gesamt-Wertungspunkte)', effect: { flatScore: 25 } }
];

const StudioState = {
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
  timerInterval: null // Runtime only, NEVER serialized to localStorage
};

function formatMoney(amount) {
  const lang = StudioState.language === 'en' ? 'en-US' : 'de-DE';
  const currency = StudioState.language === 'en' ? 'USD' : 'EUR';
  return new Intl.NumberFormat(lang, { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(amount);
}

function getMaxLoan() {
  const base = 50000;
  const fanBonus = Math.round(StudioState.fans * 30);
  const revenueBonus = Math.max(0, Math.round(StudioState.cash * 0.5));
  return Math.min(1000000, base + fanBonus + revenueBonus);
}

function updateHUD() {
  const nameEl = document.getElementById('studio-name-display');
  const dateEl = document.getElementById('hud-date');
  const cashEl = document.getElementById('val-cash');
  const fansEl = document.getElementById('val-fans');
  const rpEl = document.getElementById('val-rp');
  const debtBadge = document.getElementById('hud-debt-badge');

  if (nameEl) nameEl.textContent = `🎙️ ${StudioState.studioName}`;
  if (dateEl) dateEl.textContent = t('date_format', { year: StudioState.year, week: StudioState.week });
  if (fansEl) fansEl.textContent = StudioState.fans.toLocaleString(StudioState.language === 'en' ? 'en-US' : 'de-DE');
  if (rpEl) rpEl.textContent = `${StudioState.rp} FP`;

  if (cashEl) {
    cashEl.textContent = formatMoney(StudioState.cash);
    cashEl.className = StudioState.cash < 0 ? 'hud-val text-red' : 'hud-val text-green';
  }

  if (debtBadge) {
    if (StudioState.loan > 0) {
      debtBadge.style.display = 'inline-block';
      debtBadge.textContent = `${t('debt_label')} ${formatMoney(StudioState.loan)}`;
    } else {
      debtBadge.style.display = 'none';
    }
  }
}

function saveGame() {
  try {
    // Clone state without non-serializable properties
    const stateToSave = { ...StudioState };
    delete stateToSave.timerInterval;
    localStorage.setItem('ast_savegame_v5', JSON.stringify(stateToSave));
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate(40);
    AudioEngine.speak(t('game_saved'));
  } catch(e) {
    console.error("Save error:", e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('ast_savegame_v5') || localStorage.getItem('ast_savegame_v4');
    if (raw) {
      const data = JSON.parse(raw);
      // Clean previous timer interval if any
      if (StudioState.timerInterval) {
        clearInterval(StudioState.timerInterval);
        StudioState.timerInterval = null;
      }
      Object.assign(StudioState, data);
      StudioState.timerInterval = null;
      updateHUD();
      if (typeof renderReleasedGames === 'function') renderReleasedGames();
    }
  } catch(e) {
    console.error("Load error:", e);
  }
}

function resetGame() {
  if (confirm(StudioState.language === 'en' ? "Reset all progress and start fresh?" : "Gesamten Spielstand zurücksetzen und neues Spiel starten?")) {
    localStorage.removeItem('ast_savegame_v5');
    localStorage.removeItem('ast_savegame_v4');
    location.reload();
  }
}

window.StudioState = StudioState;
window.TRANSLATIONS = TRANSLATIONS;
window.t = t;
window.THEME_GENRE_SYNERGIES = THEME_GENRE_SYNERGIES;
window.RESEARCH_CATALOG = RESEARCH_CATALOG;
window.getMaxLoan = getMaxLoan;
window.formatMoney = formatMoney;
window.updateHUD = updateHUD;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.resetGame = resetGame;