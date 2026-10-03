const StudioState = {
  studioName: "Audio Wave Studios",
  year: 1980,
  week: 1,
  cash: 50000,
  fans: 150,
  rp: 10,
  loan: 0,
  staff: [],
  releasedGames: [],
  soundtrackLabel: [],
  activeProject: null,
  isTimerRunning: false,
  timerInterval: null
};

function formatMoney(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function updateHUD() {
  document.getElementById('studio-name-display').textContent = `🎙️ ${StudioState.studioName}`;
  document.getElementById('hud-date').textContent = `Jahr ${StudioState.year} • Woche ${StudioState.week}`;
  document.getElementById('val-cash').textContent = formatMoney(StudioState.cash);
  document.getElementById('val-fans').textContent = StudioState.fans.toLocaleString('de-DE');
  document.getElementById('val-rp').textContent = `${StudioState.rp} FP`;

  // Farbliche Warnung bei Minus
  const cashEl = document.getElementById('val-cash');
  if (StudioState.cash < 0) {
    cashEl.className = 'hud-val text-red';
  } else {
    cashEl.className = 'hud-val text-green';
  }
}

function saveGame() {
  try {
    localStorage.setItem('ast_savegame_v4', JSON.stringify(StudioState));
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate(40);
    AudioEngine.speak('Spielstand erfolgreich im Smartphone-Speicher gesichert!');
  } catch(e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem('ast_savegame_v4');
    if (raw) {
      const data = JSON.parse(raw);
      Object.assign(StudioState, data);
      updateHUD();
      renderReleasedGames();
    }
  } catch(e) {}
}