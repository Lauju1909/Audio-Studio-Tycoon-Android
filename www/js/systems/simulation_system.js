/**
 * Audio Studio Tycoon - Weekly Simulation Loop & Historical Timeline System
 * Full Historical Progression: 1930 - 2026 (48 Weeks / Year, Year Events, Platform Retiring, Feature Unlocks)
 */

function startWeeklyLoop() {
  if (StudioState.timerInterval) {
    clearInterval(StudioState.timerInterval);
    StudioState.timerInterval = null;
  }
  const speed = Math.max(0.5, Number(StudioState.gameSpeed) || 1);
  const intervalMs = Math.round(3500 / speed);
  StudioState.timerInterval = setInterval(() => {
    if (!StudioState.isPaused) {
      tickWeek();
    }
  }, intervalMs);
}

function togglePause() {
  StudioState.isPaused = !StudioState.isPaused;
  const isEn = StudioState.language === 'en';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('click');
    AudioEngine.speak(StudioState.isPaused
      ? (isEn ? 'Simulation paused' : 'Simulation pausiert')
      : (isEn ? 'Simulation resumed' : 'Simulation läuft weiter'));
  }
  if (typeof updateHUD === 'function') updateHUD();
  return StudioState.isPaused;
}

function setGameSpeed(speed) {
  StudioState.gameSpeed = Number(speed) || 1;
  StudioState.isPaused = false;
  startWeeklyLoop();
  const isEn = StudioState.language === 'en';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('click');
    AudioEngine.speak(isEn ? `Game speed: ${StudioState.gameSpeed}x` : `Spielgeschwindigkeit: ${StudioState.gameSpeed}x`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return StudioState.gameSpeed;
}

function manualTickWeek() {
  tickWeek();
  const isEn = StudioState.language === 'en';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('click');
    AudioEngine.speak(isEn
      ? `Advanced to Year ${StudioState.year}, Week ${StudioState.week}. Cash: ${formatMoney(StudioState.cash)}`
      : `Weiter zu Jahr ${StudioState.year}, Woche ${StudioState.week}. Kontostand: ${formatMoney(StudioState.cash)}`);
  }
}

function getSimGlobalValue(name, fallback) {
  if (typeof window !== 'undefined' && window[name] !== undefined) return window[name];
  if (typeof global !== 'undefined' && global[name] !== undefined) return global[name];
  return fallback;
}

function getAvailableContracts(year) {
  const y = (year !== undefined && year !== null) ? Number(year) : (StudioState ? StudioState.year : 1930);
  const catalog = (typeof CONTRACTS_CATALOG !== 'undefined' && Array.isArray(CONTRACTS_CATALOG))
    ? CONTRACTS_CATALOG
    : getSimGlobalValue('CONTRACTS_CATALOG', []);
  return catalog.filter(c => (c.unlockYear || 1930) <= y);
}

function renderContractsModal() {
  if (typeof renderContractsList === 'function') {
    renderContractsList();
  }
  return getAvailableContracts(StudioState ? StudioState.year : 1930);
}

function getLabelRoyaltyMultiplier() {
  const techIds = (StudioState && Array.isArray(StudioState.unlockedTech)) ? StudioState.unlockedTech : [];
  const catalog = (typeof RESEARCH_CATALOG !== 'undefined' && Array.isArray(RESEARCH_CATALOG))
    ? RESEARCH_CATALOG
    : getSimGlobalValue('RESEARCH_CATALOG', []);
  let bonusPct = 0;
  techIds.forEach(id => {
    const tech = catalog.find(t => t.id === id);
    if (tech && tech.effect && tech.effect.labelRoyaltyPct) {
      bonusPct += tech.effect.labelRoyaltyPct;
    } else if (!tech) {
      if (id === 'vinyl_mastering') bonusPct += 15;
      else if (id === 'ai_composition') bonusPct += 35;
    }
  });
  return 1 + (bonusPct / 100);
}

function acceptContract(contractId) {
  const isEn = StudioState.language === 'en';
  if (StudioState.activeContract) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'A contract is already in progress!' : 'Es läuft bereits eine Auftragsarbeit!');
    }
    return false;
  }
  const catalog = (typeof CONTRACTS_CATALOG !== 'undefined' && Array.isArray(CONTRACTS_CATALOG))
    ? CONTRACTS_CATALOG
    : getSimGlobalValue('CONTRACTS_CATALOG', []);
  const spec = contractId
    ? catalog.find(c => c.id === contractId)
    : getAvailableContracts(StudioState.year)[0];
  if (!spec) return false;

  const unlockYear = spec.unlockYear || 1930;
  if (StudioState.year < unlockYear) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      const cName = isEn ? (spec.name_en || spec.name) : spec.name;
      AudioEngine.speak(isEn
        ? `Contract "${cName}" is locked until ${unlockYear}!`
        : `Auftrag "${cName}" ist erst ab Jahr ${unlockYear} verfügbar!`);
    }
    return false;
  }

  const eraScale = (StudioState.year >= 1990) ? 2.5 : (StudioState.year >= 1970 ? 1.6 : 1.0);
  const scaledReward = Math.round((spec.reward * eraScale) / 100) * 100;
  const scaledPenalty = Math.round((spec.penalty * eraScale) / 100) * 100;

  StudioState.activeContract = {
    id: spec.id,
    name: spec.name,
    name_en: spec.name_en,
    category: spec.category,
    reward: scaledReward,
    penalty: scaledPenalty,
    requiredPoints: spec.requiredPoints,
    currentPoints: 0,
    weeksLeft: spec.weeks
  };

  if (typeof closeContractsModal === 'function') closeContractsModal();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    const cName = isEn ? spec.name_en : spec.name;
    AudioEngine.speak(isEn
      ? `Contract accepted: ${cName} (${formatMoney(scaledReward)}, ${spec.weeks} weeks)`
      : `Auftrag angenommen: ${cName} (${formatMoney(scaledReward)}, ${spec.weeks} Wochen)`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

function tickContractProgress() {
  const ac = StudioState.activeContract;
  if (!ac) return;
  const isEn = StudioState.language === 'en';

  let teamPts = 15;
  if (Array.isArray(StudioState.staff)) {
    StudioState.staff.forEach(emp => {
      if ((emp.onVacationWeeks || 0) <= 0) {
        teamPts += (emp.skill || 1) * 8;
      }
    });
  }
  ac.currentPoints += teamPts;

  if (ac.currentPoints >= ac.requiredPoints) {
    StudioState.cash += ac.reward;
    StudioState.rp += 2;
    const cName = isEn ? (ac.name_en || ac.name) : ac.name;
    const reward = ac.reward;
    StudioState.activeContract = null;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('cash');
      AudioEngine.speak(isEn
        ? `Contract "${cName}" completed! Earned ${formatMoney(reward)} and +2 RP!`
        : `Auftragsarbeit "${cName}" abgeschlossen! ${formatMoney(reward)} und +2 FP erhalten!`);
    }
  } else {
    ac.weeksLeft--;
    if (ac.weeksLeft <= 0) {
      StudioState.cash -= ac.penalty;
      const cName = isEn ? (ac.name_en || ac.name) : ac.name;
      const pen = ac.penalty;
      StudioState.activeContract = null;
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.playSound('error');
        AudioEngine.speak(isEn
          ? `Contract "${cName}" missed deadline! Penalty: -${formatMoney(pen)}`
          : `Auftragsfrist für "${cName}" abgelaufen! Vertragsstrafe: -${formatMoney(pen)}`);
      }
    }
  }
}

function upgradeStudioOffice() {
  const isEn = StudioState.language === 'en';
  const catalog = (typeof OFFICE_UPGRADES_CATALOG !== 'undefined') ? OFFICE_UPGRADES_CATALOG : [];
  const nextLevel = (StudioState.officeLevel || 0) + 1;
  const nextSpec = catalog[nextLevel];
  if (!nextSpec) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn ? 'Maximum studio campus level already reached!' : 'Maximale Studio-Ausbaustufe bereits erreicht!');
    }
    return false;
  }
  if (StudioState.cash < nextSpec.cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(nextSpec.cost) }));
    }
    return false;
  }
  StudioState.cash -= nextSpec.cost;
  StudioState.officeLevel = nextLevel;
  StudioState.prestige = (StudioState.prestige || 0) + 10;
  const oName = isEn ? nextSpec.name_en : nextSpec.name;
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.speak(isEn
      ? `Upgraded studio to ${oName}! Max staff: ${nextSpec.maxStaff}, Quality bonus: +${Math.round(nextSpec.qualityBonus * 100)}%!`
      : `Tonstudio ausgebaut zu ${oName}! Max. Team: ${nextSpec.maxStaff}, Qualitätsbonus: +${Math.round(nextSpec.qualityBonus * 100)}%!`);
  }
  if (typeof renderStaffList === 'function') renderStaffList();
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

function processAnnualTransition() {
  // 1. GOTY Awards
  if (typeof handleAnnualAwards === 'function') {
    handleAnnualAwards();
  }

  const currentYear = StudioState.year;

  // 2. Historical Year Event Processing
  const event = (typeof getYearEvent === 'function') ? getYearEvent(currentYear) : ((typeof YEAR_EVENTS !== 'undefined') ? YEAR_EVENTS[currentYear] : null);
  if (event) {
    const effectType = event.effect;
    const val = event.value;

    switch (effectType) {
      case 'money':
        StudioState.cash += val;
        break;
      case 'money_multi':
        StudioState.cash = Math.round(StudioState.cash * val);
        break;
      case 'fans':
        StudioState.fans += val;
        break;
      case 'hype':
        StudioState.hype = Math.min(250, (StudioState.hype || 50) + val);
        break;
      case 'hype_multi':
        StudioState.hypeMultiplier = (StudioState.hypeMultiplier || 1.0) * val;
        break;
      case 'rp':
        StudioState.rp += val;
        break;
      case 'prestige':
        StudioState.prestige = (StudioState.prestige || 0) + val;
        break;
      case 'tax_increase':
        StudioState.taxRate = Math.max(0, Math.min(0.99, (StudioState.taxRate || 0.1) + val));
        break;
      case 'sales_multi':
      case 'market_boom':
      case 'market_crash':
      case 'digital_sales':
      case 'crowdfunding':
        StudioState.salesMultiplier = (StudioState.salesMultiplier || 1.0) * val;
        break;
      case 'logic_boost':
        StudioState.logicMultiplier = (StudioState.logicMultiplier || 1.0) * val;
        break;
      case 'dev_speed':
        StudioState.devSpeedMultiplier = (StudioState.devSpeedMultiplier || 1.0) * val;
        break;
      case 'interest_increase':
        StudioState.loanInterestRate = (StudioState.loanInterestRate || 0.005) + val;
        break;
      case 'marketing_rev':
        StudioState.marketingEfficiency = (StudioState.marketingEfficiency || 1.0) * val;
        break;
      case 'streamer_impact':
        StudioState.streamerHypeMulti = (StudioState.streamerHypeMulti || 1.0) * val;
        break;
      case 'subscription_boom':
      case 'subscription_standard':
        StudioState.subscriptionMulti = (StudioState.subscriptionMulti || 1.0) * val;
        break;
      case 'quality_standard':
      case 'story_standard':
      case 'graphics_standard':
      case 'complexity_boost':
      case 'story_boost':
      case 'multiplayer_boost':
        StudioState.qualityStandardMulti = (StudioState.qualityStandardMulti || 1.0) * val;
        break;
      case 'trend':
        if (val && typeof val === 'object') {
          StudioState.currentTrend = {
            topic: val.topic || (StudioState.currentTrend ? StudioState.currentTrend.topic : 'Radio-Drama'),
            genre: val.genre || (StudioState.currentTrend ? StudioState.currentTrend.genre : 'Action')
          };
        }
        break;
      case 'trend_topic':
        if (!StudioState.currentTrend) StudioState.currentTrend = {};
        StudioState.currentTrend.topic = val;
        break;
      case 'trend_genre':
        if (!StudioState.currentTrend) StudioState.currentTrend = {};
        StudioState.currentTrend.genre = val;
        break;
      case 'trend_difficulty':
        StudioState.difficultyTrend = val;
        break;
      case 'unlock_tech':
        if (!StudioState.unlockedTech) StudioState.unlockedTech = [];
        if (!StudioState.unlockedTech.includes(val)) {
          StudioState.unlockedTech.push(val);
        }
        break;
      case 'unlock_genre':
        if (!StudioState.unlockedGenres) StudioState.unlockedGenres = [];
        if (!StudioState.unlockedGenres.includes(val)) {
          StudioState.unlockedGenres.push(val);
        }
        break;
      case 'salary_increase':
        StudioState.salaryMultiplier = (StudioState.salaryMultiplier || 1.0) * (1 + (val > 1 ? val - 1 : val));
        break;
      case 'cost_increase':
        StudioState.devCostMultiplier = (StudioState.devCostMultiplier || 1.0) * (1 + (val > 1 ? val - 1 : val));
        break;
      case 'quality_penalty':
        StudioState.qualityStandardMulti = (StudioState.qualityStandardMulti || 1.0) * Math.max(0.2, (1 - Math.abs(val)));
        break;
      case 'medium_upgrade':
        StudioState.salesMultiplier = (StudioState.salesMultiplier || 1.0) * 1.25;
        break;
      case 'market_shift':
      case 'rival_boost':
        StudioState.salesMultiplier = (StudioState.salesMultiplier || 1.0) * (val || 1.0);
        break;
      case 'server_costs':
        StudioState.serverCosts = (StudioState.serverCosts || 0) + Math.round(val * 100);
        break;
      case 'crypto_crash':
        StudioState.hype = Math.max(0, (StudioState.hype || 50) - 35);
        break;
      case 'censorship_risk':
        StudioState.hypeMultiplier = (StudioState.hypeMultiplier || 1.0) * Math.max(0.5, (1 - (val > 1 ? val / 10 : val * 0.2)));
        break;
      case 'unlock_platform':
        if (typeof PLATFORMS !== 'undefined') {
          const match = PLATFORMS.find(p => p.name.toLowerCase().includes(String(val).toLowerCase()));
          if (match && !StudioState.unlockedPlatforms.includes(match.name)) {
            StudioState.unlockedPlatforms.push(match.name);
          }
        }
        break;
      case 'game_end':
        StudioState.isGameOver = true;
        StudioState.gameOverReason = "historical_end";
        if (typeof showGameOverModal === 'function') {
          showGameOverModal();
        }
        break;
    }

    if (!StudioState.eventLog) StudioState.eventLog = [];
    StudioState.eventLog.unshift({
      year: currentYear,
      text: event.text,
      effect: effectType,
      value: val
    });

    const eventText = (typeof t === 'function') ? t(event.text) : event.text;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('confirm');
      AudioEngine.speak(`${t('year_change', { year: currentYear })} ${eventText}`);
    }

    if (typeof showTimelineEventBanner === 'function') {
      showTimelineEventBanner(currentYear, eventText, event);
    }
  } else {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.speak(t('year_change', { year: currentYear }));
    }
  }

  // 3. Platform Unlocks
  if (typeof getNewlyUnlockedPlatforms === 'function') {
    const newPlats = getNewlyUnlockedPlatforms(currentYear);
    newPlats.forEach(plat => {
      if (!StudioState.unlockedPlatforms) StudioState.unlockedPlatforms = [];
      if (!StudioState.unlockedPlatforms.includes(plat.name)) {
        StudioState.unlockedPlatforms.push(plat.name);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.speak(t('platform_unlocked', { name: plat.name, type: plat.type }));
      }
    });
  }

  // 4. Platform Retirements
  if (typeof getNewlyRetiredPlatforms === 'function') {
    const retiredPlats = getNewlyRetiredPlatforms(currentYear);
    retiredPlats.forEach(plat => {
      if (StudioState.unlockedPlatforms) {
        StudioState.unlockedPlatforms = StudioState.unlockedPlatforms.filter(name => name !== plat.name);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.speak(t('platform_retired', { name: plat.name }));
      }
    });
  }

  // 5. Feature Unlocks
  if (typeof getNewlyUnlockedFeatures === 'function') {
    const newFeatures = getNewlyUnlockedFeatures(currentYear);
    newFeatures.forEach(feat => {
      if (!StudioState.unlockedFeatures) StudioState.unlockedFeatures = [];
      if (!StudioState.unlockedFeatures.includes(feat.id)) {
        StudioState.unlockedFeatures.push(feat.id);
      }
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.speak(t('feature_unlocked', { name: feat.name }));
      }
    });
  }

  // 6. Historical Topics Unlocks
  if (typeof getNewlyUnlockedTopics === 'function') {
    const newTopics = getNewlyUnlockedTopics(currentYear);
    newTopics.forEach(topic => {
      if (!StudioState.unlockedTopics) StudioState.unlockedTopics = [];
      if (!StudioState.unlockedTopics.includes(topic.name)) {
        StudioState.unlockedTopics.push(topic.name);
      }
    });
  }

  // 7. Update UI elements affected by features & eras
  if (typeof applyFeatureUnlocksToUI === 'function') {
    applyFeatureUnlocksToUI();
  }
}

function tickWeek() {
  if (StudioState.isGameOver && !StudioState.endlessMode) {
    return;
  }

  StudioState.week++;
  const weeksInYear = StudioState.weeksPerYear || 48;
  if (StudioState.week > weeksInYear) {
    StudioState.week = 1;
    StudioState.year++;
    processAnnualTransition();
  }

  // 1. Passive Royalties from Soundtrack Label (if unlocked)
  const isLabelUnlocked = (typeof isFeatureUnlocked === 'function') ? isFeatureUnlocked('soundtrack_label', StudioState.year) : (StudioState.year >= 1985);
  if (isLabelUnlocked && StudioState.soundtrackLabel && StudioState.soundtrackLabel.length > 0) {
    let passiveRoyalties = 0;
    const royaltyMultiplier = getLabelRoyaltyMultiplier();

    StudioState.soundtrackLabel.forEach(track => {
      const weeklyEarn = Math.round(track.revenuePerWeek * royaltyMultiplier);
      passiveRoyalties += weeklyEarn;
      track.totalRevenue = (track.totalRevenue || 0) + weeklyEarn;
      track.revenuePerWeek = Math.max(10, Math.round(track.revenuePerWeek * 0.985));
    });

    if (passiveRoyalties > 0) {
      StudioState.cash += passiveRoyalties;
    }
  }

  // 1b. Passive Weekly Royalties from Licensed Custom Engines
  if (Array.isArray(StudioState.customEngines)) {
    let engineRoyalties = 0;
    StudioState.customEngines.forEach(eng => {
      if (eng && eng.licensedOut === true) {
        const weeklyFee = 350 * (eng.techBonus || 5);
        engineRoyalties += weeklyFee;
        eng.totalRoyalties = (eng.totalRoyalties || 0) + weeklyFee;
      }
    });
    if (engineRoyalties > 0) {
      StudioState.cash += engineRoyalties;
    }
  }

  // 1c. Passive Weekly Royalties from Custom Hardware (1975+)
  if (Array.isArray(StudioState.customHardware)) {
    let hardwareRoyalties = 0;
    StudioState.customHardware.forEach(hw => {
      const hwEntry = (hw && typeof hw === 'object') ? hw : resolveHardwareCatalogItem(hw);
      if (!hwEntry) return;
      const royalty = Number(hwEntry.weeklyRoyalty) || 0;
      if (royalty > 0) {
        hardwareRoyalties += royalty;
        if (hw && typeof hw === 'object') {
          hw.totalRoyalties = (hw.totalRoyalties || 0) + royalty;
        }
      }
    });
    if (hardwareRoyalties > 0) {
      StudioState.cash += hardwareRoyalties;
    }
  }

  // 1d. Passive Weekly Net Revenue & Growth for AudioPass Subscription (1995+)
  if (StudioState.subscriptionService && StudioState.subscriptionService.active && isSubscriptionUnlocked()) {
    const subFin = calculateSubscriptionWeeklyFinance();
    StudioState.cash += subFin.net;
    const sub = StudioState.subscriptionService;
    const target = subFin.targetSubscribers;
    const delta = Math.round((target - sub.subscribers) * 0.15);
    sub.subscribers = Math.max(50, (sub.subscribers || 0) + (delta !== 0 ? delta : (target > sub.subscribers ? 1 : 0)));
  }

  // 1e. Passive Weekly Dividends from Acquired Rival Studios
  if (Array.isArray(StudioState.rivals)) {
    let rivalDividends = 0;
    StudioState.rivals.forEach(rival => {
      if (rival && rival.acquired === true) {
        rivalDividends += Number(rival.weeklyDividend) || 0;
      }
    });
    if (rivalDividends > 0) {
      StudioState.cash += rivalDividends;
    }
  }

  // 2. Staff Payroll & Vacation Recovery
  let totalSalaries = 0;
  if (StudioState.staff) {
    const salaryMulti = StudioState.salaryMultiplier || 1.0;
    StudioState.staff.forEach(emp => {
      totalSalaries += Math.round((emp.salary * salaryMulti) / 4);

      if (emp.onVacationWeeks > 0) {
        emp.onVacationWeeks--;
        emp.fatigue = Math.max(0, emp.fatigue - 25);
        emp.morale = Math.min(100, emp.morale + 15);
      } else if (!StudioState.activeProject) {
        emp.fatigue = Math.max(0, emp.fatigue - 5);
        emp.morale = Math.min(100, emp.morale + 2);
      }
    });
  }

  if (totalSalaries > 0) {
    StudioState.cash -= totalSalaries;
  }

  // Server maintenance expenses
  if (StudioState.serverCosts > 0) {
    StudioState.cash -= StudioState.serverCosts;
  }

  // 3. Weekly Loan Interest
  if (StudioState.loan > 0) {
    const interestRate = StudioState.loanInterestRate || 0.005;
    const interest = Math.round(StudioState.loan * interestRate);
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
    if (typeof tickProjectProgress === 'function') tickProjectProgress();
  }

  // 6. Active Contract Work Progress
  if (StudioState.activeContract) {
    tickContractProgress();
  }

  // Auto-save every 4 weeks
  if (StudioState.week % 4 === 0) {
    if (typeof saveGame === 'function') saveGame();
  }

  if (typeof updateHUD === 'function') updateHUD();
}

function resolveSimGlobal(name, fallback) {
  if (typeof window !== 'undefined' && window[name] !== undefined) return window[name];
  if (typeof global !== 'undefined' && global[name] !== undefined) return global[name];
  return fallback;
}

function resolveHardwareCatalogItem(item) {
  const hwId = (item && typeof item === 'object') ? item.id : item;
  const catalog = (typeof HARDWARE_CATALOG !== 'undefined' && Array.isArray(HARDWARE_CATALOG))
    ? HARDWARE_CATALOG
    : resolveSimGlobal('HARDWARE_CATALOG', []);
  return catalog.find(entry => entry.id === hwId) || null;
}

function isSubscriptionUnlocked(year = StudioState.year) {
  const y = Number(year) || 1930;
  if (typeof isFeatureUnlocked === 'function') {
    return isFeatureUnlocked('subscription_vault', y);
  }
  return y >= 1995;
}

/**
 * Computes weekly AudioPass subscriber target, gross revenue, upkeep and net cashflow.
 */
function calculateSubscriptionWeeklyFinance() {
  const sub = StudioState && StudioState.subscriptionService;
  const price = Math.max(1, Math.min(49, Number(sub && sub.price) || 9));
  const subMulti = Number(StudioState && StudioState.subscriptionMulti) || 1.0;
  const priceFactor = Math.max(0.25, 1.4 - (price / 20));
  const fans = Number(StudioState && StudioState.fans) || 0;
  const gamesCount = Array.isArray(StudioState && StudioState.releasedGames) ? StudioState.releasedGames.length : 0;
  const targetSubscribers = Math.max(120, Math.round(((fans * 0.25) + (gamesCount * 150)) * priceFactor * subMulti));
  if (!sub || !sub.active || !isSubscriptionUnlocked()) {
    return { active: false, price, subscribers: sub ? (sub.subscribers || 0) : 0, targetSubscribers, gross: 0, upkeep: 0, net: 0 };
  }
  const subscribers = Math.max(0, Math.round(Number(sub.subscribers) || 0));
  const gross = Math.round(subscribers * (price / 4) * subMulti);
  const upkeep = 200 + Math.round(subscribers * 0.8);
  const net = gross - upkeep;
  return { active: true, price, subscribers, targetSubscribers, gross, upkeep, net };
}

/**
 * Develops a custom studio hardware unit from HARDWARE_CATALOG (year-gated 1975+).
 */
function developCustomHardware(hwId) {
  const isEn = StudioState.language === 'en';
  const catalog = (typeof HARDWARE_CATALOG !== 'undefined' && Array.isArray(HARDWARE_CATALOG))
    ? HARDWARE_CATALOG
    : resolveSimGlobal('HARDWARE_CATALOG', []);
  const hw = catalog.find(item => item.id === hwId);
  if (!hw) return false;

  const unlockYear = Number(hw.unlockYear) || 1975;
  if (StudioState.year < unlockYear) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn
        ? `${hw.name_en || hw.name} unlocks in ${unlockYear}!`
        : `${hw.name} wird erst ab ${unlockYear} freigeschaltet!`);
    }
    return false;
  }

  if (!Array.isArray(StudioState.customHardware)) {
    StudioState.customHardware = [];
  }
  const alreadyOwned = StudioState.customHardware.some(item => (item && typeof item === 'object' ? item.id : item) === hw.id);
  if (alreadyOwned) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn
        ? `${hw.name_en || hw.name} is already developed!`
        : `${hw.name} wurde bereits entwickelt!`);
    }
    return false;
  }

  const cost = Number(hw.cost) || 0;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }

  StudioState.cash -= cost;
  StudioState.customHardware.push({
    ...hw,
    builtYear: StudioState.year,
    totalRoyalties: 0
  });

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.vibrate(40);
    const hwLabel = isEn ? (hw.name_en || hw.name) : hw.name;
    AudioEngine.speak(isEn
      ? `Developed ${hwLabel}! +${hw.qualityBonus} release quality, +${formatMoney(hw.weeklyRoyalty)}/week royalties.`
      : `${hwLabel} entwickelt! +${hw.qualityBonus} Release-Qualität, +${formatMoney(hw.weeklyRoyalty)}/Woche Lizenzen.`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

/**
 * Toggles the AudioPass Subscription Service (year-gated 1995+) and optionally updates monthly price.
 */
function toggleSubscriptionService(price) {
  const isEn = StudioState.language === 'en';
  if (!StudioState.subscriptionService || typeof StudioState.subscriptionService !== 'object') {
    StudioState.subscriptionService = { active: false, price: 9, subscribers: 0 };
  }
  if (!isSubscriptionUnlocked(StudioState.year)) {
    StudioState.subscriptionService.active = false;
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn
        ? 'AudioPass Subscription service unlocks in 1995!'
        : 'AudioPass-Abo-Service wird erst ab 1995 freigeschaltet!');
    }
    return false;
  }

  const sub = StudioState.subscriptionService;
  if (price !== undefined && price !== null && !Number.isNaN(Number(price))) {
    sub.price = Math.max(1, Math.min(49, Math.round(Number(price))));
  }
  sub.active = !sub.active;

  if (sub.active && (Number(sub.subscribers) || 0) <= 0) {
    const fin = calculateSubscriptionWeeklyFinance();
    sub.subscribers = Math.max(200, Math.round(fin.targetSubscribers * 0.75));
  }

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound(sub.active ? 'success' : 'click');
    AudioEngine.speak(sub.active
      ? (isEn
          ? `AudioPass activated at ${sub.price} EUR/mo (${sub.subscribers} subscribers)!`
          : `AudioPass aktiviert für ${sub.price} EUR/Monat (${sub.subscribers} Abonnenten)!`)
      : (isEn
          ? 'AudioPass Subscription service paused.'
          : 'AudioPass-Abo-Service pausiert.'));
  }
  if (typeof updateHUD === 'function') updateHUD();
  return sub.active;
}

/**
 * Acquires a rival studio from StudioState.rivals at its valuation to earn weekly dividends.
 */
function acquireRivalStudio(rivalId) {
  const isEn = StudioState.language === 'en';
  if (!Array.isArray(StudioState.rivals) || StudioState.rivals.length === 0) {
    const catalog = (typeof RIVALS_CATALOG !== 'undefined' && Array.isArray(RIVALS_CATALOG))
      ? RIVALS_CATALOG
      : resolveSimGlobal('RIVALS_CATALOG', []);
    StudioState.rivals = catalog.map(r => ({ ...r, acquired: false }));
  }
  const rival = StudioState.rivals.find(r => r && r.id === rivalId);
  if (!rival) return false;

  if (rival.acquired) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(isEn
        ? `${rival.name} is already part of your studio group!`
        : `${rival.name} gehört bereits zu deinem Konzern!`);
    }
    return false;
  }

  const cost = Number(rival.valuation) || 0;
  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return false;
  }

  StudioState.cash -= cost;
  rival.acquired = true;
  rival.acquiredYear = StudioState.year;

  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('success');
    AudioEngine.vibrate(50);
    AudioEngine.speak(isEn
      ? `Acquired ${rival.name}! Weekly subsidiary dividend: +${formatMoney(rival.weeklyDividend)}.`
      : `${rival.name} übernommen! Wöchentliche Dividende: +${formatMoney(rival.weeklyDividend)}.`);
  }
  if (typeof updateHUD === 'function') updateHUD();
  return true;
}

const ACHIEVEMENT_PREDICATES = {
  first_release: s => Array.isArray(s.releasedGames) && s.releasedGames.length >= 1,
  hit_80: s => Array.isArray(s.releasedGames) && s.releasedGames.some(g => (g.score || 0) >= 80),
  masterpiece_90: s => Array.isArray(s.releasedGames) && s.releasedGames.some(g => (g.score || 0) >= 90),
  custom_engine: s => Array.isArray(s.customEngines) && s.customEngines.length >= 2,
  golden_mic: s => Array.isArray(s.audioDesignAwards) && s.audioDesignAwards.length >= 1,
  millionaire: s => (Number(s.cash) || 0) >= 1000000,
  fan_legend: s => (Number(s.fans) || 0) >= 10000,
  hardware_pioneer: s => Array.isArray(s.customHardware) && s.customHardware.length >= 1,
  media_mogul: s => Array.isArray(s.rivals) && s.rivals.some(r => r && r.acquired === true),
  century_veteran: s => (Number(s.year) || 1930) >= 2026
};

/**
 * Evaluates all ACHIEVEMENTS_CATALOG milestones, unlocks newly earned ones, and grants rewards.
 */
function checkAchievements() {
  const isEn = StudioState.language === 'en';
  if (!Array.isArray(StudioState.achievements)) {
    StudioState.achievements = [];
  }
  const catalog = (typeof ACHIEVEMENTS_CATALOG !== 'undefined' && Array.isArray(ACHIEVEMENTS_CATALOG))
    ? ACHIEVEMENTS_CATALOG
    : resolveSimGlobal('ACHIEVEMENTS_CATALOG', []);
  const newlyUnlocked = [];

  catalog.forEach(ach => {
    if (!ach || StudioState.achievements.includes(ach.id)) return;
    const predicate = ACHIEVEMENT_PREDICATES[ach.id];
    if (typeof predicate === 'function' && predicate(StudioState)) {
      StudioState.achievements.push(ach.id);
      StudioState.cash += Number(ach.rewardCash) || 0;
      StudioState.fans += Number(ach.rewardFans) || 0;
      StudioState.rp += Number(ach.rewardRp) || 0;
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    const names = newlyUnlocked.map(a => (isEn ? (a.name_en || a.name) : a.name)).join(', ');
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('success');
      AudioEngine.speak(isEn
        ? `Milestone unlocked: ${names}!`
        : `Meilenstein freigeschaltet: ${names}!`);
    }
    if (typeof updateHUD === 'function') updateHUD();
  }
  return newlyUnlocked;
}

[
  typeof window !== 'undefined' ? window : null,
  typeof global !== 'undefined' ? global : null
].forEach(target => {
  if (!target) return;
  target.startWeeklyLoop = startWeeklyLoop;
  target.togglePause = togglePause;
  target.setGameSpeed = setGameSpeed;
  target.manualTickWeek = manualTickWeek;
  target.getAvailableContracts = getAvailableContracts;
  target.renderContractsModal = renderContractsModal;
  target.getLabelRoyaltyMultiplier = getLabelRoyaltyMultiplier;
  target.acceptContract = acceptContract;
  target.tickContractProgress = tickContractProgress;
  target.upgradeStudioOffice = upgradeStudioOffice;
  target.processAnnualTransition = processAnnualTransition;
  target.tickWeek = tickWeek;
  target.calculateSubscriptionWeeklyFinance = calculateSubscriptionWeeklyFinance;
  target.developCustomHardware = developCustomHardware;
  target.toggleSubscriptionService = toggleSubscriptionService;
  target.acquireRivalStudio = acquireRivalStudio;
  target.checkAchievements = checkAchievements;
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startWeeklyLoop, togglePause, setGameSpeed, manualTickWeek,
    getAvailableContracts, renderContractsModal, getLabelRoyaltyMultiplier,
    acceptContract, tickContractProgress, upgradeStudioOffice,
    processAnnualTransition, tickWeek,
    calculateSubscriptionWeeklyFinance, developCustomHardware,
    toggleSubscriptionService, acquireRivalStudio, checkAchievements
  };
}
