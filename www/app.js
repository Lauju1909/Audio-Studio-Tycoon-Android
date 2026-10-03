document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  updateHUD();
  renderReleasedGames();
  startWeeklyLoop();

  // Android Back-Button Handling
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    const openModals = document.querySelectorAll('.modal-overlay[style*="display: flex"], .modal-overlay[style*="display: block"]');
    if (openModals.length > 0) {
      openModals.forEach(m => m.style.display = 'none');
      AudioEngine.vibrate(20);
    }
  });
});

function startWeeklyLoop() {
  if (StudioState.timerInterval) clearInterval(StudioState.timerInterval);
  StudioState.timerInterval = setInterval(() => {
    tickWeek();
  }, 3500); // alle 3.5 Sekunden eine Woche
}

function tickWeek() {
  StudioState.week++;
  if (StudioState.week > 52) {
    StudioState.week = 1;
    StudioState.year++;
    AudioEngine.speak(`Ein neues Geschäftsjahr beginnt! Jahr ${StudioState.year}.`);
  }

  // Laufende Einnahmen aus Soundtrack-Label
  let passiveRoyalties = 0;
  StudioState.soundtrackLabel.forEach(track => {
    passiveRoyalties += Math.round(track.revenuePerWeek);
    track.revenuePerWeek *= 0.98; // leichter Verfall mit der Zeit
  });

  if (passiveRoyalties > 0) {
    StudioState.cash += passiveRoyalties;
  }

  // Personalgehälter abziehen
  const staffCost = StudioState.staff.length * 1500;
  if (staffCost > 0) {
    StudioState.cash -= Math.round(staffCost / 4);
  }

  // Laufende Spielentwicklung ticken
  if (StudioState.activeProject) {
    tickProjectProgress();
  }

  updateHUD();
}

function openDevModal() {
  if (StudioState.activeProject) {
    AudioEngine.playSound('error');
    AudioEngine.speak('Es wird bereits ein Spiel entwickelt! Schließe das aktuelle Projekt erst ab.');
    return;
  }
  document.getElementById('modal-dev').style.display = 'flex';
  AudioEngine.playSound('select');
  AudioEngine.vibrate(25);
  AudioEngine.speak('Neues Spiel konzipieren. Wähle Titel, Thema, Genre und die Sound-Schwerpunkte.');
}

function closeDevModal() {
  document.getElementById('modal-dev').style.display = 'none';
}

function startDevelopment() {
  if (StudioState.cash < 5000) {
    AudioEngine.playSound('error');
    AudioEngine.speak('Nicht genügend Geld! Du benötigst mindestens 5.000 Euro.');
    return;
  }

  const title = document.getElementById('input-game-name').value.trim() || 'Audio Abenteuer';
  const theme = document.getElementById('select-theme').value;
  const genre = document.getElementById('select-genre').value;
  const gameplay = parseInt(document.getElementById('slider-gameplay').value, 10);
  const sound = parseInt(document.getElementById('slider-sound').value, 10);

  StudioState.cash -= 5000;
  closeDevModal();

  StudioState.activeProject = {
    title, theme, genre, gameplay, sound,
    progress: 0,
    features: 0,
    audioPts: 0,
    bugs: 0
  };

  document.getElementById('active-project-card').style.display = 'flex';
  document.getElementById('dev-game-title').textContent = title;
  document.getElementById('btn-finish-dev').style.display = 'none';

  AudioEngine.playSound('buy');
  AudioEngine.vibrate(40);
  AudioEngine.speak(`Entwicklung von ${title} gestartet! Thema ${theme}, Genre ${genre}.`);
  updateHUD();
}

function tickProjectProgress() {
  const p = StudioState.activeProject;
  if (!p) return;

  p.progress = Math.min(100, p.progress + 15);
  p.features += Math.floor(Math.random() * 4) + 2;
  p.audioPts += Math.floor(Math.random() * 5) + 3;
  if (Math.random() < 0.4) p.bugs += Math.floor(Math.random() * 2) + 1;

  AudioEngine.playSound('typing', 0.2);

  document.getElementById('dev-progress-percent').textContent = `${p.progress}%`;
  document.getElementById('dev-progress-bar').style.width = `${p.progress}%`;
  document.getElementById('dev-pts-feat').textContent = p.features;
  document.getElementById('dev-pts-sound').textContent = p.audioPts;
  document.getElementById('dev-pts-bugs').textContent = p.bugs;

  if (p.progress >= 100) {
    document.getElementById('btn-finish-dev').style.display = 'block';
    AudioEngine.playSound('blip');
    AudioEngine.vibrate(30);
  }
}

function finishDevelopment() {
  const p = StudioState.activeProject;
  if (!p) return;

  // Presse-Bewertung berechnen
  let score = 70;
  if (p.sound >= 60) score += 12;
  if (p.bugs < 3) score += 8;
  score = Math.min(99, Math.max(50, score + Math.floor(Math.random() * 10) - 5));

  const earnedCash = score * 850;
  const earnedFans = Math.round(score * 12);
  const earnedRP = Math.round(score / 8);

  StudioState.cash += earnedCash;
  StudioState.fans += earnedFans;
  StudioState.rp += earnedRP;

  const finishedGame = {
    title: p.title,
    theme: p.theme,
    genre: p.genre,
    score: score,
    revenue: earnedCash,
    year: StudioState.year
  };

  StudioState.releasedGames.unshift(finishedGame);
  StudioState.soundtrackLabel.push({
    title: `${p.title} (Original Soundtrack)`,
    revenuePerWeek: Math.round(earnedCash / 12)
  });

  StudioState.activeProject = null;
  document.getElementById('active-project-card').style.display = 'none';

  AudioEngine.playSound('drumroll');
  setTimeout(() => {
    AudioEngine.playSound('success');
    AudioEngine.vibrate([60, 40, 60]);
    AudioEngine.speak(`Kritikerwertung für ${finishedGame.title}: ${score} Prozent! Einnahmen: ${formatMoney(earnedCash)}. ${earnedFans} neue Fans gewonnen!`);
  }, 1000);

  updateHUD();
  renderReleasedGames();
}

function renderReleasedGames() {
  const container = document.getElementById('released-games-list');
  if (StudioState.releasedGames.length === 0) {
    container.innerHTML = '<p class="empty-hint">Noch kein Spiel veröffentlicht. Starte dein erstes Projekt oben!</p>';
    return;
  }

  container.innerHTML = '';
  StudioState.releasedGames.forEach(g => {
    const card = document.createElement('div');
    card.className = 'released-card';
    card.innerHTML = `
      <div>
        <strong>${g.title}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">${g.theme} • ${g.genre} (${g.year})</p>
      </div>
      <div style="text-align: right;">
        <strong style="color: var(--accent); font-size: 1.1rem;">${g.score}%</strong>
        <p style="font-size: 0.8rem; color: var(--green);">${formatMoney(g.revenue)}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// MODAL FUNKTIONEN
function openSoundConModal() {
  document.getElementById('modal-soundcon').style.display = 'flex';
  AudioEngine.playSound('select');
  AudioEngine.speak('SoundCon Spielemesse. Wähle deinen Stand.');
}
function closeSoundConModal() { document.getElementById('modal-soundcon').style.display = 'none'; }

function attendSoundCon(tier) {
  let cost = 2000, fans = 200;
  if (tier === 'medium') { cost = 7500; fans = 1000; }
  if (tier === 'keynote') { cost = 20000; fans = 4000; }

  if (StudioState.cash < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak('Nicht genügend Geld für diese Messe-Präsenz!');
    return;
  }

  StudioState.cash -= cost;
  StudioState.fans += fans;
  closeSoundConModal();
  AudioEngine.playSound('confirm');
  AudioEngine.vibrate([40, 30, 50]);
  AudioEngine.speak(`Die SoundCon war ein voller Erfolg! ${fans} neue begeisterte Fans strömen zu deinem Studio.`);
  updateHUD();
}

function openLabelModal() {
  document.getElementById('modal-label').style.display = 'flex';
  const list = document.getElementById('label-releases-list');
  list.innerHTML = '';
  if (StudioState.soundtrackLabel.length === 0) {
    list.innerHTML = '<p class="empty-hint">Veröffentliche zuerst Spiele, um Soundtracks zu lizenzieren.</p>';
  } else {
    StudioState.soundtrackLabel.forEach(t => {
      const div = document.createElement('div');
      div.className = 'released-card';
      div.innerHTML = `<span>🎵 ${t.title}</span><strong class="text-green">+${formatMoney(t.revenuePerWeek)}/Woche</strong>`;
      list.appendChild(div);
    });
  }
  AudioEngine.playSound('select');
  AudioEngine.speak('Soundtrack-Label Übersicht geöffnet.');
}
function closeLabelModal() { document.getElementById('modal-label').style.display = 'none'; }

function openStaffModal() {
  document.getElementById('modal-staff').style.display = 'flex';
  AudioEngine.playSound('select');
}
function closeStaffModal() { document.getElementById('modal-staff').style.display = 'none'; }

function hireStaff(role) {
  StudioState.staff.push(role);
  closeStaffModal();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(`Neuer Mitarbeiter für ${role === 'sound' ? 'Audio-Design' : 'Entwicklung'} erfolgreich eingestellt!`);
  updateHUD();
}

function openBankModal() {
  document.getElementById('modal-bank').style.display = 'flex';
  AudioEngine.playSound('select');
}
function closeBankModal() { document.getElementById('modal-bank').style.display = 'none'; }

function takeLoan(val) {
  StudioState.cash += val;
  StudioState.loan += val;
  closeBankModal();
  AudioEngine.playSound('cash');
  AudioEngine.speak(`Kredit über ${formatMoney(val)} erfolgreich ausgezahlt.`);
  updateHUD();
}

function repayLoan(val) {
  if (StudioState.cash < val) {
    AudioEngine.playSound('error');
    AudioEngine.speak('Nicht genügend Guthaben zur Kredittilgung.');
    return;
  }
  StudioState.cash -= val;
  StudioState.loan = Math.max(0, StudioState.loan - val);
  closeBankModal();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(`Kredit über ${formatMoney(val)} getilgt.`);
  updateHUD();
}

function openResearchModal() {
  document.getElementById('modal-research').style.display = 'flex';
  const list = document.getElementById('research-items-list');
  list.innerHTML = `
    <div class="released-card" style="margin-bottom: 8px;">
      <div><strong>Binaurale 3D-Audio-Engine</strong><p>+25% Audio-Punkte bei allen Projekten</p></div>
      <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;" onclick="doResearch('3d_audio', 20)">Erforschen (20 FP)</button>
    </div>
    <div class="released-card">
      <div><strong>Synthesizer Chiptune Modul</strong><p>Schaltet Retro-Genre Boni frei</p></div>
      <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;" onclick="doResearch('chiptune', 15)">Erforschen (15 FP)</button>
    </div>
  `;
  AudioEngine.playSound('select');
}
function closeResearchModal() { document.getElementById('modal-research').style.display = 'none'; }

function doResearch(tech, cost) {
  if (StudioState.rp < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak(`Nicht genügend Forschungspunkte! Du brauchst ${cost} Punkte.`);
    return;
  }
  StudioState.rp -= cost;
  closeResearchModal();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(`Technologie erforscht und freigeschaltet!`);
  updateHUD();
}

function saveGamePrompt() {
  saveGame();
}

function toggleTTS() {
  AudioEngine.isTTSActive = !AudioEngine.isTTSActive;
  document.getElementById('btn-toggle-tts').textContent = AudioEngine.isTTSActive ? '🔊' : '🔇';
  AudioEngine.speak(AudioEngine.isTTSActive ? 'Sprachausgabe aktiv' : 'Sprachausgabe stumm', true);
}