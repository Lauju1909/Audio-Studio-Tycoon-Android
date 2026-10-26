/**
 * Audio Studio Tycoon - Game State Persistence (LocalStorage)
 */

function saveGame() {
  try {
    const stateToSave = { ...StudioState };
    delete stateToSave.timerInterval;
    localStorage.setItem('ast_savegame_v5', JSON.stringify(stateToSave));
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('confirm');
      AudioEngine.vibrate(40);
      AudioEngine.speak(t('game_saved'));
    }
    if (typeof EventBus !== 'undefined') {
      EventBus.emit('game:saved', stateToSave);
    }
  } catch (e) {
    console.error("Save error:", e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem('ast_savegame_v5') || localStorage.getItem('ast_savegame_v4');
    if (raw) {
      const data = JSON.parse(raw);
      if (StudioState.timerInterval) {
        clearInterval(StudioState.timerInterval);
        StudioState.timerInterval = null;
      }
      Object.assign(StudioState, data);
      StudioState.timerInterval = null;
      if (typeof updateHUD === 'function') updateHUD();
      if (typeof renderReleasedGames === 'function') renderReleasedGames();
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('game:loaded', StudioState);
      }
    }
  } catch (e) {
    console.error("Load error:", e);
  }
}

function resetGame() {
  const msg = (StudioState.language === 'en') ? "Reset all progress and start fresh?" : "Gesamten Spielstand zurücksetzen und neues Spiel starten?";
  if (confirm(msg)) {
    localStorage.removeItem('ast_savegame_v5');
    localStorage.removeItem('ast_savegame_v4');
    location.reload();
  }
}

function saveGamePrompt() {
  saveGame();
}

if (typeof window !== 'undefined') {
  window.saveGame = saveGame;
  window.loadGame = loadGame;
  window.resetGame = resetGame;
  window.saveGamePrompt = saveGamePrompt;
}
