/**
 * Audio Studio Tycoon - Mobile Web Application Controller
 * Handles UI interactions, game loops, staff management, engines, research, marketing & awards.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  updateHUD();
  renderReleasedGames();
  startWeeklyLoop();
  applyLanguageToUI();

  // Android Hardware Back-Button Handling
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    closeAllModals();
    AudioEngine.vibrate(20);
  });

  // Global ESC key to close open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
});

function closeAllModals() {
  const openModals = document.querySelectorAll('.modal-overlay');
  openModals.forEach(m => m.style.display = 'none');
}

// ==========================================
// WEEKLY SIMULATION LOOP
// ==========================================

function startWeeklyLoop() {
  if (StudioState.timerInterval) {
    clearInterval(StudioState.timerInterval);
    StudioState.timerInterval = null;
  }
  StudioState.timerInterval = setInterval(() => {
    if (!StudioState.isPaused) {
      tickWeek();
    }
  }, 3500); // 3.5 seconds per week
}

function tickWeek() {
  StudioState.week++;
  if (StudioState.week > 52) {
    StudioState.week = 1;
    StudioState.year++;
    handleAnnualAwards();
    AudioEngine.speak(t('year_change', { year: StudioState.year }));
  }

  // 1. Passive Royalties from Soundtrack Label
  let passiveRoyalties = 0;
  const hasAITech = StudioState.unlockedTech.includes('ai_composition');
  const royaltyMultiplier = hasAITech ? 1.35 : 1.0;

  StudioState.soundtrackLabel.forEach(track => {
    const weeklyEarn = Math.round(track.revenuePerWeek * royaltyMultiplier);
    passiveRoyalties += weeklyEarn;
    track.totalRevenue = (track.totalRevenue || 0) + weeklyEarn;
    track.revenuePerWeek = Math.max(10, Math.round(track.revenuePerWeek * 0.985)); // Gradual market decay
  });

  if (passiveRoyalties > 0) {
    StudioState.cash += passiveRoyalties;
  }

  // 2. Staff Payroll & Vacation Recovery
  let totalSalaries = 0;
  StudioState.staff.forEach(emp => {
    totalSalaries += Math.round(emp.salary / 4); // Weekly salary

    if (emp.onVacationWeeks > 0) {
      emp.onVacationWeeks--;
      emp.fatigue = Math.max(0, emp.fatigue - 25);
      emp.morale = Math.min(100, emp.morale + 15);
    } else if (!StudioState.activeProject) {
      // Idle staff slowly recover fatigue
      emp.fatigue = Math.max(0, emp.fatigue - 5);
      emp.morale = Math.min(100, emp.morale + 2);
    }
  });

  if (totalSalaries > 0) {
    StudioState.cash -= totalSalaries;
  }

  // 3. Weekly Loan Interest (0.5% per week)
  if (StudioState.loan > 0) {
    const interest = Math.round(StudioState.loan * 0.005);
    StudioState.cash -= interest;
  }

  // 4. Marketing Campaign Decay
  if (StudioState.marketingCampaign) {
    StudioState.marketingCampaign.weeksLeft--;
    if (StudioState.marketingCampaign.weeksLeft <= 0) {
      StudioState.marketingCampaign = null;
    }
  }

  // 5. Active Game Development Progress
  if (StudioState.activeProject) {
    tickProjectProgress();
  }

  // Auto-save every 4 weeks
  if (StudioState.week % 4 === 0) {
    saveGame();
  }

  updateHUD();
}

function handleAnnualAwards() {
  // Check if player has any game released in the past year that scored >= 85
  const pastYearGames = StudioState.releasedGames.filter(g => g.year === StudioState.year - 1);
  const bestGame = pastYearGames.reduce((max, g) => (g.score > (max ? max.score : 0) ? g : max), null);

  if (bestGame && bestGame.score >= 85) {
    const prize = 50000;
    const fanBoost = 3000;
    StudioState.cash += prize;
    StudioState.fans += fanBoost;
    StudioState.gotyAwards.push({
      year: StudioState.year - 1,
      title: bestGame.title,
      score: bestGame.score
    });

    AudioEngine.playSound('success');
    AudioEngine.vibrate([100, 50, 100]);
    AudioEngine.speak(t('goty_winner', { title: bestGame.title }), true);
  }
}

// ==========================================
// GAME DEVELOPMENT SYSTEM
// ==========================================

function openDevModal() {
  if (StudioState.activeProject) {
    AudioEngine.playSound('error');
    AudioEngine.speak(StudioState.language === 'en' ? 'A game is already in development! Finish it first.' : 'Es wird bereits ein Spiel entwickelt! Schließe das aktuelle Projekt erst ab.');
    return;
  }

  // Populate Custom Engines Select
  const engineSelect = document.getElementById('select-engine');
  if (engineSelect) {
    engineSelect.innerHTML = '';
    StudioState.customEngines.forEach(eng => {
      const opt = document.createElement('option');
      opt.value = eng.id;
      opt.textContent = `${eng.name} (+${eng.audioBonus} Audio, +${eng.techBonus} Tech)`;
      engineSelect.appendChild(opt);
    });
  }

  // Populate Staff Checkboxes
  const staffContainer = document.getElementById('dev-staff-selection');
  if (staffContainer) {
    staffContainer.innerHTML = '';
    if (StudioState.staff.length === 0) {
      staffContainer.innerHTML = `<p class="empty-hint">${StudioState.language === 'en' ? 'No staff hired. Solo development.' : 'Keine Mitarbeiter angestellt. Alleinentwicklung.'}</p>`;
    } else {
      StudioState.staff.forEach(emp => {
        const isVacation = emp.onVacationWeeks > 0;
        const roleName = emp.role === 'sound' ? (StudioState.language === 'en' ? 'Sound Designer' : 'Audio-Designer') :
                         emp.role === 'coder' ? (StudioState.language === 'en' ? 'Programmer' : 'Programmierer') : (StudioState.language === 'en' ? 'Writer' : 'Autor');
        const div = document.createElement('label');
        div.className = 'staff-checkbox-item';
        div.innerHTML = `
          <input type="checkbox" name="dev-staff" value="${emp.id}" ${isVacation ? 'disabled' : 'checked'}>
          <span><strong>${emp.name}</strong> (${roleName}) - ${isVacation ? (StudioState.language === 'en' ? 'On Vacation' : 'Im Urlaub') : `Erschöpfung: ${emp.fatigue}%`}</span>
        `;
        staffContainer.appendChild(div);
      });
    }
  }

  document.getElementById('modal-dev').style.display = 'flex';
  AudioEngine.playSound('select');
  AudioEngine.vibrate(25);
  AudioEngine.speak(StudioState.language === 'en' ? 'Design new game. Choose title, theme, genre, engine and staff.' : 'Neues Spiel konzipieren. Wähle Titel, Thema, Genre, Engine und Team.');
}

function closeDevModal() {
  document.getElementById('modal-dev').style.display = 'none';
}

function generateRandomTitle() {
  const titlesDE = ["Echo des Schicksals", "Symphonie des Grauens", "Pixel Beat", "Klang der Ewigkeit", "Neon Groove", "Rhythmus Rebell", "Flüsternde Schatten", "Der Schallmeister"];
  const titlesEN = ["Echo of Destiny", "Symphony of Dread", "Pixel Beat", "Sound of Eternity", "Neon Groove", "Rhythm Rebel", "Whispering Shadows", "Sonic Master"];
  const list = StudioState.language === 'en' ? titlesEN : titlesDE;
  const picked = list[Math.floor(Math.random() * list.length)];
  const input = document.getElementById('input-game-name');
  if (input) {
    input.value = picked;
    AudioEngine.playSound('click');
    AudioEngine.speak(picked);
  }
}

function startDevelopment() {
  const cost = 5000;
  if (StudioState.cash < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    return;
  }

  const title = (document.getElementById('input-game-name').value || '').trim() || (StudioState.language === 'en' ? 'Audio Adventure' : 'Audio Abenteuer');
  const theme = document.getElementById('select-theme').value;
  const genre = document.getElementById('select-genre').value;
  const engineId = document.getElementById('select-engine') ? document.getElementById('select-engine').value : 'engine_basic_1';
  const gameplay = parseInt(document.getElementById('slider-gameplay').value, 10);
  const sound = parseInt(document.getElementById('slider-sound').value, 10);

  // Gather assigned staff IDs
  const assignedStaffIds = [];
  document.querySelectorAll('input[name="dev-staff"]:checked').forEach(cb => {
    assignedStaffIds.push(parseInt(cb.value, 10));
  });

  StudioState.cash -= cost;
  closeDevModal();

  StudioState.activeProject = {
    title, theme, genre, engineId, gameplay, sound,
    assignedStaffIds,
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
  AudioEngine.speak(t('dev_started', { title, theme, genre }));
  updateHUD();
}

function tickProjectProgress() {
  const p = StudioState.activeProject;
  if (!p) return;

  // Selected engine perks
  const engine = StudioState.customEngines.find(e => e.id === p.engineId) || StudioState.customEngines[0];
  const engineAudioBonus = engine ? engine.audioBonus : 5;
  const engineTechBonus = engine ? engine.techBonus : 5;

  // Research tech effects
  const hasChiptune = StudioState.unlockedTech.includes('chiptune');
  const hasPolyphonic = StudioState.unlockedTech.includes('polyphonic');
  const hasDSP = StudioState.unlockedTech.includes('dsp_effects');
  const has3D = StudioState.unlockedTech.includes('binaural_3d');
  const hasAI = StudioState.unlockedTech.includes('ai_composition');

  // Base progress step
  let progressStep = 10;
  if (hasAI) progressStep += 4; // AI speed boost

  // Staff contribution
  let coderSkill = 0;
  let soundSkill = 0;
  let writerSkill = 0;

  StudioState.staff.forEach(emp => {
    if (p.assignedStaffIds.includes(emp.id) && emp.onVacationWeeks <= 0) {
      if (emp.role === 'coder') coderSkill += emp.skill;
      if (emp.role === 'sound') soundSkill += emp.skill;
      if (emp.role === 'writer') writerSkill += emp.skill;

      // Staff accumulates fatigue during work
      emp.fatigue = Math.min(100, emp.fatigue + Math.floor(Math.random() * 3) + 2);
    }
  });

  progressStep += coderSkill * 3;
  p.progress = Math.min(100, p.progress + progressStep);

  // Features gain (coders + writers)
  const featGained = Math.floor(Math.random() * 3) + 1 + Math.round(coderSkill * 1.5) + Math.round(writerSkill * 2) + Math.round(engineTechBonus / 3);
  p.features += featGained;

  // Audio points gain (sound designers + research + sound slider)
  let soundGained = Math.floor(Math.random() * 4) + 2 + Math.round(soundSkill * 3) + Math.round(engineAudioBonus / 2);
  if (hasPolyphonic) soundGained += 2;
  if (hasDSP) soundGained = Math.round(soundGained * 1.2);
  if (has3D) soundGained = Math.round(soundGained * 1.3);
  if (hasChiptune && (p.theme === 'Retro' || p.theme === 'Cyberpunk')) soundGained = Math.round(soundGained * 1.25);
  p.audioPts += soundGained;

  // Bugs generation (fatigue increases bugs, coders reduce bugs)
  let bugChance = 0.35;
  if (hasDSP) bugChance *= 0.8;
  const avgFatigue = p.assignedStaffIds.length > 0 ?
    p.assignedStaffIds.map(id => StudioState.staff.find(e => e.id === id)?.fatigue || 0).reduce((a, b) => a + b, 0) / p.assignedStaffIds.length : 0;

  if (avgFatigue > 60) bugChance += 0.25;

  if (Math.random() < bugChance) {
    let newBugs = Math.floor(Math.random() * 2) + 1;
    if (coderSkill >= 3 && Math.random() < 0.5) {
      newBugs = 0; // High coder fixes bug immediately
    }
    p.bugs += newBugs;
  }

  AudioEngine.playSound('typing', 0.15);

  document.getElementById('dev-progress-percent').textContent = `${p.progress}%`;
  document.getElementById('dev-progress-bar').style.width = `${p.progress}%`;
  document.getElementById('dev-pts-feat').textContent = p.features;
  document.getElementById('dev-pts-sound').textContent = p.audioPts;
  document.getElementById('dev-pts-bugs').textContent = p.bugs;

  if (p.progress >= 100) {
    document.getElementById('btn-finish-dev').style.display = 'block';
    AudioEngine.playSound('blip');
    AudioEngine.vibrate(35);
  }
}

function finishDevelopment() {
  const p = StudioState.activeProject;
  if (!p) return;

  // 1. Synergy calculation
  const synergyTable = THEME_GENRE_SYNERGIES[p.theme] || {};
  const synergyMult = synergyTable[p.genre] || 1.0;

  // 2. Base Review Score Calculation
  let baseScore = 65;

  // Sound focus & Audio Points contribution
  if (p.sound >= 60) baseScore += 8;
  if (p.audioPts > 50) baseScore += 10;
  if (p.audioPts > 120) baseScore += 8;

  // Features vs bugs
  if (p.features > 40) baseScore += 6;
  if (p.bugs === 0) baseScore += 8;
  else if (p.bugs > 6) baseScore -= Math.min(25, p.bugs * 3);

  // Apply synergy multiplier
  let finalScore = Math.round(baseScore * synergyMult);

  // Research bonuses
  if (StudioState.unlockedTech.includes('surround_51') && (p.genre === 'Action' || p.theme === 'Horror')) {
    finalScore += 8;
  }
  if (StudioState.unlockedTech.includes('raytracing_audio')) {
    finalScore += 12;
  }

  finalScore = Math.min(99, Math.max(45, finalScore + Math.floor(Math.random() * 7) - 3));

  // 3. Financial and Fan Rewards
  let marketingMult = 1.0;
  if (StudioState.marketingCampaign) {
    marketingMult += (StudioState.marketingCampaign.hypeBoost / 100);
  }

  const baseSales = finalScore * 400 * marketingMult;
  const fanBonus = Math.round(StudioState.fans * (finalScore / 100) * 1.5);
  const earnedCash = Math.round((baseSales + fanBonus) * 2.2);

  let earnedFans = Math.round(finalScore * 18 * marketingMult);
  if (StudioState.unlockedTech.includes('binaural_3d')) {
    earnedFans = Math.round(earnedFans * 1.5);
  }

  const earnedRP = Math.max(3, Math.round(finalScore / 9));

  StudioState.cash += earnedCash;
  StudioState.fans += earnedFans;
  StudioState.rp += earnedRP;

  const finishedGame = {
    id: Date.now(),
    title: p.title,
    theme: p.theme,
    genre: p.genre,
    score: finalScore,
    sales: Math.round(baseSales + fanBonus),
    revenue: earnedCash,
    week: StudioState.week,
    year: StudioState.year
  };

  StudioState.releasedGames.unshift(finishedGame);

  // Automatically catalog game soundtrack in label
  const royaltyWeekly = Math.max(50, Math.round(earnedCash / 16));
  StudioState.soundtrackLabel.unshift({
    id: Date.now() + 1,
    title: `${p.title} (OST)`,
    gameTitle: p.title,
    format: "Digital / Vinyl",
    revenuePerWeek: royaltyWeekly,
    totalRevenue: 0
  });

  StudioState.activeProject = null;
  document.getElementById('active-project-card').style.display = 'none';

  AudioEngine.playSound('drumroll');
  setTimeout(() => {
    AudioEngine.playSound('success');
    AudioEngine.vibrate([60, 40, 60]);
    AudioEngine.speak(t('dev_finished', {
      title: finishedGame.title,
      score: finalScore,
      rev: formatMoney(earnedCash),
      fans: earnedFans
    }), true);
  }, 1000);

  updateHUD();
  renderReleasedGames();
}

function renderReleasedGames() {
  const container = document.getElementById('released-games-list');
  if (!container) return;

  if (StudioState.releasedGames.length === 0) {
    container.innerHTML = `<p class="empty-hint">${t('no_games_yet')}</p>`;
    return;
  }

  container.innerHTML = '';
  StudioState.releasedGames.forEach(g => {
    const card = document.createElement('div');
    card.className = 'released-card';
    card.innerHTML = `
      <div>
        <strong>${g.title}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">${g.theme} • ${g.genre} (J${g.year}/W${g.week})</p>
      </div>
      <div style="text-align: right;">
        <strong style="color: var(--accent); font-size: 1.15rem;">${g.score}%</strong>
        <p style="font-size: 0.8rem; color: var(--green);">${formatMoney(g.revenue)}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// RESEARCH SYSTEM
// ==========================================

function openResearchModal() {
  const modal = document.getElementById('modal-research');
  modal.style.display = 'flex';
  renderResearchList();
  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'Research laboratory opened.' : 'Forschungslabor geöffnet.');
}

function closeResearchModal() {
  document.getElementById('modal-research').style.display = 'none';
}

function renderResearchList() {
  const container = document.getElementById('research-items-list');
  if (!container) return;
  container.innerHTML = '';

  RESEARCH_CATALOG.forEach(tech => {
    const isUnlocked = StudioState.unlockedTech.includes(tech.id);
    const isYearAvailable = StudioState.year >= tech.year;

    const div = document.createElement('div');
    div.className = 'released-card';
    div.style.marginBottom = '10px';

    div.innerHTML = `
      <div style="flex: 1; padding-right: 12px;">
        <strong>${tech.name}</strong>
        <p style="font-size: 0.85rem; color: #94a3b8;">${tech.desc}</p>
        <span style="font-size: 0.75rem; color: var(--accent);">Verfügbar ab ${tech.year}</span>
      </div>
      <div>
        ${isUnlocked ?
          `<span class="badge" style="background: var(--green); color: #fff;">Erforscht</span>` :
          `<button class="btn btn-primary" style="padding: 8px 14px; font-size: 0.85rem;" ${!isYearAvailable ? 'disabled' : ''} onclick="doResearch('${tech.id}', ${tech.cost})">
            ${tech.cost} FP
          </button>`
        }
      </div>
    `;
    container.appendChild(div);
  });
}

function doResearch(techId, cost) {
  if (StudioState.rp < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('not_enough_rp', { rp: cost }));
    return;
  }

  const tech = RESEARCH_CATALOG.find(t => t.id === techId);
  if (!tech) return;

  StudioState.rp -= cost;
  if (!StudioState.unlockedTech.includes(techId)) {
    StudioState.unlockedTech.push(techId);
  }

  renderResearchList();
  AudioEngine.playSound('confirm');
  AudioEngine.vibrate([40, 30, 40]);
  AudioEngine.speak(StudioState.language === 'en' ?
    `Research complete! ${tech.name} unlocked.` :
    `Forschung abgeschlossen! ${tech.name} erfolgreich freigeschaltet.`);
  updateHUD();
}

// ==========================================
// ENGINE WORKSHOP
// ==========================================

function openEngineModal() {
  const modal = document.getElementById('modal-engine');
  modal.style.display = 'flex';
  renderEngineList();
  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'Custom Engine Workshop opened.' : 'Engine-Werkstatt geöffnet.');
}

function closeEngineModal() {
  document.getElementById('modal-engine').style.display = 'none';
}

function renderEngineList() {
  const container = document.getElementById('engine-list-display');
  if (!container) return;
  container.innerHTML = '';

  StudioState.customEngines.forEach(eng => {
    const div = document.createElement('div');
    div.className = 'released-card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div>
        <strong>${eng.name}</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">+${eng.audioBonus} Audio-Punkte | +${eng.techBonus} Features</p>
      </div>
      <span class="badge" style="background: #1e293b;">Aktiv</span>
    `;
    container.appendChild(div);
  });
}

function buildNewEngine() {
  const cost = 15000;
  if (StudioState.cash < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    return;
  }

  const num = StudioState.customEngines.length + 1;
  const name = prompt(StudioState.language === 'en' ? 'Enter Engine Name:' : 'Name der neuen Sound-Engine:', `Sonic Audio Engine v${num}`);
  if (!name || !name.trim()) return;

  // Bonus scales with unlocked tech
  const audioBonus = 8 + StudioState.unlockedTech.length * 4;
  const techBonus = 6 + StudioState.unlockedTech.length * 3;

  StudioState.cash -= cost;
  StudioState.customEngines.push({
    id: `custom_eng_${Date.now()}`,
    name: name.trim(),
    audioBonus,
    techBonus,
    features: [...StudioState.unlockedTech]
  });

  renderEngineList();
  AudioEngine.playSound('buy');
  AudioEngine.vibrate(50);
  AudioEngine.speak(StudioState.language === 'en' ? `Engine ${name} constructed successfully!` : `Sound-Engine ${name} erfolgreich gebaut!`);
  updateHUD();
}

// ==========================================
// STAFF & VACATION MANAGEMENT
// ==========================================

function openStaffModal() {
  document.getElementById('modal-staff').style.display = 'flex';
  renderStaffList();
  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'Staff management opened.' : 'Personalmanagement geöffnet.');
}

function closeStaffModal() {
  document.getElementById('modal-staff').style.display = 'none';
}

function renderStaffList() {
  const container = document.getElementById('current-staff-list');
  if (!container) return;
  container.innerHTML = '';

  if (StudioState.staff.length === 0) {
    container.innerHTML = `<p class="empty-hint">${StudioState.language === 'en' ? 'No staff hired yet.' : 'Bisher keine Mitarbeiter angestellt.'}</p>`;
    return;
  }

  StudioState.staff.forEach(emp => {
    const isVacation = emp.onVacationWeeks > 0;
    const roleName = emp.role === 'sound' ? (StudioState.language === 'en' ? 'Sound Designer' : 'Audio-Designer') :
                     emp.role === 'coder' ? (StudioState.language === 'en' ? 'Programmer' : 'Programmierer') : (StudioState.language === 'en' ? 'Writer' : 'Autor');

    const card = document.createElement('div');
    card.className = 'staff-item';
    card.innerHTML = `
      <div>
        <strong>${emp.name} (${roleName})</strong>
        <p style="font-size: 0.8rem; color: #94a3b8;">
          Gehalt: ${formatMoney(emp.salary)}/Monat • Skill: ${emp.skill}⭐ • Erschöpfung: ${emp.fatigue}%
        </p>
        <span class="badge" style="background: ${isVacation ? 'var(--accent)' : 'var(--card-border)'};">
          ${isVacation ? `Im Urlaub (${emp.onVacationWeeks} W)` : 'Verfügbar'}
        </span>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" ${isVacation ? 'disabled' : ''} onclick="sendStaffVacation(${emp.id})">
          🏖️ Urlaub
        </button>
        <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 0.8rem; color: var(--red);" onclick="fireStaff(${emp.id})">
          ❌ Feuern
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function sendStaffVacation(empId) {
  const emp = StudioState.staff.find(e => e.id === empId);
  if (!emp) return;

  emp.onVacationWeeks = 4;
  renderStaffList();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(t('vacation_sent', { name: emp.name }));
}

function fireStaff(empId) {
  const emp = StudioState.staff.find(e => e.id === empId);
  if (!emp) return;

  if (confirm(StudioState.language === 'en' ? `Are you sure you want to fire ${emp.name}?` : `${emp.name} wirklich entlassen?`)) {
    StudioState.staff = StudioState.staff.filter(e => e.id !== empId);
    renderStaffList();
    AudioEngine.playSound('error');
    AudioEngine.speak(StudioState.language === 'en' ? `${emp.name} has been let go.` : `${emp.name} wurde entlassen.`);
    updateHUD();
  }
}

function hireNewCandidate(role) {
  const names = ["Felix Bach", "Elena Rhythmus", "Klaus Bass", "Julia Synthesizer", "David Code", "Sarah Script", "Linus Pixel", "Anna Story"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const salary = role === 'sound' ? 1600 : (role === 'coder' ? 1500 : 1300);
  const skill = Math.floor(Math.random() * 2) + 2;

  const newEmp = {
    id: Date.now(),
    name: randomName,
    role: role,
    salary: salary,
    skill: skill,
    fatigue: 0,
    morale: 100,
    onVacationWeeks: 0
  };

  StudioState.staff.push(newEmp);
  renderStaffList();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(t('hired_success', {
    name: randomName,
    role: role === 'sound' ? 'Audio-Designer' : (role === 'coder' ? 'Programmierer' : 'Autor'),
    salary: formatMoney(salary)
  }));
  updateHUD();
}

// ==========================================
// MARKETING & HYPE
// ==========================================

function openMarketingModal() {
  document.getElementById('modal-marketing').style.display = 'flex';
  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'Marketing headquarters opened.' : 'Marketing-Zentrale geöffnet.');
}

function closeMarketingModal() {
  document.getElementById('modal-marketing').style.display = 'none';
}

function startMarketingCampaign(type) {
  let cost = 3000, hype = 25, weeks = 8, fans = 150;
  if (type === 'radio') { cost = 8000; hype = 50; weeks = 12; fans = 600; }
  if (type === 'streamer') { cost = 20000; hype = 90; weeks = 16; fans = 2500; }

  if (StudioState.cash < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    return;
  }

  StudioState.cash -= cost;
  StudioState.fans += fans;
  StudioState.marketingCampaign = {
    type,
    hypeBoost: hype,
    weeksLeft: weeks
  };

  closeMarketingModal();
  AudioEngine.playSound('confirm');
  AudioEngine.vibrate([40, 20, 40]);
  AudioEngine.speak(StudioState.language === 'en' ?
    `Marketing campaign launched! +${hype} Hype boost for upcoming releases.` :
    `Marketing-Kampagne gestartet! +${hype} Hype-Bonus für aktuelle und kommende Spiele.`);
  updateHUD();
}

// ==========================================
// SOUNDCON TRADE FAIR
// ==========================================

function openSoundConModal() {
  document.getElementById('modal-soundcon').style.display = 'flex';
  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'SoundCon Expo booth booking.' : 'SoundCon Spielemesse. Wähle deinen Stand.');
}

function closeSoundConModal() {
  document.getElementById('modal-soundcon').style.display = 'none';
}

function attendSoundCon(tier) {
  let cost = 2500, fans = 250;
  if (tier === 'medium') { cost = 8500; fans = 1200; }
  if (tier === 'keynote') { cost = 25000; fans = 5000; }

  if (StudioState.cash < cost) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    return;
  }

  StudioState.cash -= cost;
  StudioState.fans += fans;
  closeSoundConModal();
  AudioEngine.playSound('confirm');
  AudioEngine.vibrate([50, 30, 50]);
  AudioEngine.speak(t('soundcon_success', { fans: fans }));
  updateHUD();
}

// ==========================================
// SOUNDTRACK LABEL
// ==========================================

function openLabelModal() {
  document.getElementById('modal-label').style.display = 'flex';
  const list = document.getElementById('label-releases-list');
  list.innerHTML = '';

  if (StudioState.soundtrackLabel.length === 0) {
    list.innerHTML = `<p class="empty-hint">${StudioState.language === 'en' ? 'Release games first to license original soundtracks.' : 'Veröffentliche zuerst Spiele, um Soundtracks zu lizenzieren.'}</p>`;
  } else {
    StudioState.soundtrackLabel.forEach(t => {
      const div = document.createElement('div');
      div.className = 'released-card';
      div.innerHTML = `
        <div>
          <span>🎵 <strong>${t.title}</strong></span>
          <p style="font-size: 0.8rem; color: #94a3b8;">Gesamteinnahmen: ${formatMoney(t.totalRevenue || 0)}</p>
        </div>
        <strong class="text-green">+${formatMoney(t.revenuePerWeek)}/Woche</strong>
      `;
      list.appendChild(div);
    });
  }

  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'Soundtrack label catalog opened.' : 'Soundtrack-Label Übersicht geöffnet.');
}

function closeLabelModal() {
  document.getElementById('modal-label').style.display = 'none';
}

// ==========================================
// BANKING & LOAN SYSTEM (ROBUST & CAPPED)
// ==========================================

function openBankModal() {
  document.getElementById('modal-bank').style.display = 'flex';
  updateBankModalUI();
  AudioEngine.playSound('select');
  AudioEngine.speak(StudioState.language === 'en' ? 'Bank and loan accounts.' : 'Bank und Kreditkonto geöffnet.');
}

function closeBankModal() {
  document.getElementById('modal-bank').style.display = 'none';
}

function updateBankModalUI() {
  const max = getMaxLoan();
  const currentLoan = StudioState.loan || 0;
  const weeklyInterest = Math.round(currentLoan * 0.005);

  const debtInfo = document.getElementById('bank-debt-info');
  if (debtInfo) {
    debtInfo.innerHTML = `
      <div style="background: #0f172a; padding: 12px; border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--card-border);">
        <p><strong>${t('debt_label')}</strong> <span class="text-red" style="font-size: 1.1rem; font-weight: bold;">${formatMoney(currentLoan)}</span></p>
        <p style="font-size: 0.85rem; color: #94a3b8;">Maximaler Kreditrahmen: ${formatMoney(max)}</p>
        <p style="font-size: 0.85rem; color: var(--accent);">Wöchentliche Kreditzinsen (0.5%): ${formatMoney(weeklyInterest)}</p>
      </div>
    `;
  }
}

function takeLoan(val) {
  const max = getMaxLoan();
  if (StudioState.loan + val > max) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('loan_limit_reached', { max: formatMoney(max) }));
    return;
  }

  StudioState.cash += val;
  StudioState.loan += val;
  updateBankModalUI();
  AudioEngine.playSound('cash');
  AudioEngine.speak(t('loan_taken', { amount: formatMoney(val) }));
  updateHUD();
}

function repayLoan(val) {
  if (StudioState.loan <= 0) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('no_debt_to_repay'));
    return;
  }

  const repayAmount = Math.min(StudioState.loan, val);
  if (StudioState.cash < repayAmount) {
    AudioEngine.playSound('error');
    AudioEngine.speak(StudioState.language === 'en' ? 'Insufficient funds to repay loan!' : 'Nicht genügend Guthaben zur Kredittilgung.');
    return;
  }

  StudioState.cash -= repayAmount;
  StudioState.loan -= repayAmount;
  updateBankModalUI();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(t('loan_repaid', { amount: formatMoney(repayAmount) }));
  updateHUD();
}

function repayAllLoans() {
  if (StudioState.loan <= 0) {
    AudioEngine.playSound('error');
    AudioEngine.speak(t('no_debt_to_repay'));
    return;
  }
  repayLoan(StudioState.loan);
}

// ==========================================
// SETTINGS & ACCESSIBILITY CONTROLS
// ==========================================

function toggleLanguage() {
  StudioState.language = StudioState.language === 'de' ? 'en' : 'de';
  applyLanguageToUI();
  updateHUD();
  AudioEngine.playSound('confirm');
  AudioEngine.speak(StudioState.language === 'en' ? 'Language switched to English.' : 'Sprache auf Deutsch umgestellt.', true);
}

function applyLanguageToUI() {
  const lang = StudioState.language || 'de';
  const btnLang = document.getElementById('btn-toggle-lang');
  if (btnLang) {
    btnLang.textContent = lang === 'en' ? '🇬🇧 EN' : '🇩🇪 DE';
    btnLang.setAttribute('aria-label', lang === 'en' ? 'Switch language to German' : 'Sprache auf Englisch umschalten');
  }

  // Update card titles and text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

function toggleTTS() {
  AudioEngine.isTTSActive = !AudioEngine.isTTSActive;
  const btn = document.getElementById('btn-toggle-tts');
  if (btn) btn.textContent = AudioEngine.isTTSActive ? '🔊' : '🔇';
  AudioEngine.speak(AudioEngine.isTTSActive ? (StudioState.language === 'en' ? 'Speech active' : 'Sprachausgabe aktiv') : (StudioState.language === 'en' ? 'Speech muted' : 'Sprachausgabe stumm'), true);
}

function saveGamePrompt() {
  saveGame();
}

// Expose functions globally for HTML onclick handlers
window.openDevModal = openDevModal;
window.closeDevModal = closeDevModal;
window.generateRandomTitle = generateRandomTitle;
window.startDevelopment = startDevelopment;
window.finishDevelopment = finishDevelopment;
window.openResearchModal = openResearchModal;
window.closeResearchModal = closeResearchModal;
window.doResearch = doResearch;
window.openEngineModal = openEngineModal;
window.closeEngineModal = closeEngineModal;
window.buildNewEngine = buildNewEngine;
window.openStaffModal = openStaffModal;
window.closeStaffModal = closeStaffModal;
window.hireNewCandidate = hireNewCandidate;
window.sendStaffVacation = sendStaffVacation;
window.fireStaff = fireStaff;
window.openMarketingModal = openMarketingModal;
window.closeMarketingModal = closeMarketingModal;
window.startMarketingCampaign = startMarketingCampaign;
window.openSoundConModal = openSoundConModal;
window.closeSoundConModal = closeSoundConModal;
window.attendSoundCon = attendSoundCon;
window.openLabelModal = openLabelModal;
window.closeLabelModal = closeLabelModal;
window.openBankModal = openBankModal;
window.closeBankModal = closeBankModal;
window.takeLoan = takeLoan;
window.repayLoan = repayLoan;
window.repayAllLoans = repayAllLoans;
window.toggleLanguage = toggleLanguage;
window.toggleTTS = toggleTTS;
window.saveGamePrompt = saveGamePrompt;
window.renderReleasedGames = renderReleasedGames;