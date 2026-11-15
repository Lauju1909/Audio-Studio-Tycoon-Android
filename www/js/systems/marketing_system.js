/**
 * Audio Studio Tycoon - Marketing, Expos & GOTY Awards
 */

function ensureRivalsState() {
  if (!Array.isArray(StudioState.rivals)) {
    StudioState.rivals = (typeof RIVALS_CATALOG !== 'undefined' && Array.isArray(RIVALS_CATALOG))
      ? RIVALS_CATALOG.map(r => ({ ...r, acquired: false }))
      : [];
  }
  return StudioState.rivals;
}

function getRivalFanMultiplier() {
  const rivals = ensureRivalsState();
  return rivals.some(r => r && r.acquired) ? 1.10 : 1.0;
}

function updateRivalReputationsAnnual(wonGoty, wonAudioAward) {
  const rivals = ensureRivalsState();
  rivals.forEach(rival => {
    if (!rival) return;
    const baseRep = typeof rival.reputation === 'number' ? rival.reputation : 50;
    const delta = rival.acquired
      ? ((wonGoty || wonAudioAward) ? 2 : 1)
      : (wonGoty ? -1 : 2);
    rival.reputation = Math.max(10, Math.min(99, baseRep + delta));
  });
}

function handleAnnualAwards() {
  const prevYear = StudioState.year - 1;
  const pastYearGames = (StudioState.releasedGames || []).filter(g => g.year === prevYear);
  const bestGame = pastYearGames.reduce((max, g) => (g.score > (max ? max.score : 0) ? g : max), null);
  const rivalFanMulti = getRivalFanMultiplier();

  let wonGoty = false;
  if (bestGame && bestGame.score >= 85) {
    wonGoty = true;
    const prize = 50000;
    const fanBoost = Math.round(3000 * rivalFanMulti);
    StudioState.cash += prize;
    StudioState.fans += fanBoost;
    StudioState.gotyAwards = StudioState.gotyAwards || [];
    StudioState.gotyAwards.push({
      year: prevYear,
      title: bestGame.title,
      score: bestGame.score
    });

    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('success');
      AudioEngine.vibrate([100, 50, 100]);
      AudioEngine.speak(t('goty_winner', { title: bestGame.title }), true);
    }
    if (typeof EventBus !== 'undefined') {
      EventBus.emit('awards:goty', bestGame);
    }
  }

  // Best Audio Design Award ("Goldenes Mikrofon")
  StudioState.audioDesignAwards = StudioState.audioDesignAwards || [];
  const audioCandidates = pastYearGames.filter(g => g.score >= 75 && (g.audioPts || 0) >= 80);
  const bestAudioGame = audioCandidates.reduce((max, g) => {
    if (!max) return g;
    const maxPts = max.audioPts || 0;
    const curPts = g.audioPts || 0;
    if (curPts > maxPts) return g;
    if (curPts === maxPts && (g.score || 0) > (max.score || 0)) return g;
    return max;
  }, null);

  if (bestAudioGame) {
    const audioPrize = 15000;
    const audioFans = Math.round(800 * rivalFanMulti);
    StudioState.cash += audioPrize;
    StudioState.fans += audioFans;
    StudioState.audioDesignAwards.push({
      year: prevYear,
      title: bestAudioGame.title,
      score: bestAudioGame.score,
      audioPts: bestAudioGame.audioPts || 0
    });

    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('success');
      AudioEngine.vibrate([80, 40, 80]);
      const isEn = StudioState.language === 'en';
      const fallbackMsg = isEn
        ? `AWARD! Your title '${bestAudioGame.title}' wins the Golden Microphone for Best Audio Design (${prevYear})! +15,000 € prize and +${audioFans} fans!`
        : `AUSZEICHNUNG! Dein Spiel '${bestAudioGame.title}' gewinnt das Goldene Mikrofon für Bestes Audio-Design (${prevYear})! +15.000 € Preisgeld und +${audioFans} Fans!`;
      const msg = (typeof t === 'function' && t('audio_award_winner', { title: bestAudioGame.title, year: prevYear }) !== 'audio_award_winner')
        ? t('audio_award_winner', { title: bestAudioGame.title, year: prevYear })
        : fallbackMsg;
      AudioEngine.speak(msg, !wonGoty);
    }
    if (typeof EventBus !== 'undefined') {
      EventBus.emit('awards:audio', bestAudioGame);
    }
  }

  updateRivalReputationsAnnual(wonGoty, Boolean(bestAudioGame));
}

function startMarketingCampaign(type) {
  if (type === 'streamer') {
    const isUnlocked = (typeof isFeatureUnlocked === 'function')
      ? isFeatureUnlocked('creator_sponsorship', StudioState.year)
      : (StudioState.year >= 2010);
    if (!isUnlocked) {
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.playSound('error');
        AudioEngine.speak(t('feature_locked', { feature: 'Content Creators & Streamer', year: 2010 }));
      }
      return;
    }
  }

  let cost = 3000, hype = 25, weeks = 8, fans = 150;
  if (type === 'radio') { cost = 8000; hype = 50; weeks = 12; fans = 600; }
  if (type === 'streamer') { cost = 20000; hype = 90; weeks = 16; fans = 2500; }

  let efficiency = StudioState.marketingEfficiency || 1.0;
  if (type === 'streamer') {
    efficiency *= (StudioState.streamerHypeMulti || 1.0);
  }
  hype = Math.round(hype * efficiency);
  fans = Math.round(fans * efficiency * getRivalFanMultiplier());

  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return;
  }

  StudioState.cash -= cost;
  StudioState.fans += fans;
  StudioState.marketingCampaign = {
    type,
    hypeBoost: hype,
    weeksLeft: weeks
  };

  if (typeof closeMarketingModal === 'function') closeMarketingModal();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate([40, 20, 40]);
    AudioEngine.speak(StudioState.language === 'en' ?
      `Marketing campaign launched! +${hype} Hype boost for upcoming releases.` :
      `Marketing-Kampagne gestartet! +${hype} Hype-Bonus für aktuelle und kommende Spiele.`);
  }
  if (typeof updateHUD === 'function') updateHUD();
}

function attendSoundCon(tier) {
  const isUnlocked = (typeof isFeatureUnlocked === 'function')
    ? isFeatureUnlocked('soundcon', StudioState.year)
    : (StudioState.year >= 1995);
  if (!isUnlocked) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('feature_locked', { feature: 'SoundCon', year: 1995 }));
    }
    return;
  }

  let cost = 2500, fans = 250;
  if (tier === 'medium') { cost = 8500; fans = 1200; }
  if (tier === 'keynote') { cost = 25000; fans = 5000; }
  fans = Math.round(fans * getRivalFanMultiplier());

  if (StudioState.cash < cost) {
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(t('not_enough_money', { cost: formatMoney(cost) }));
    }
    return;
  }

  StudioState.cash -= cost;
  StudioState.fans += fans;
  if (typeof closeSoundConModal === 'function') closeSoundConModal();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate([50, 30, 50]);
    AudioEngine.speak(t('soundcon_success', { fans: fans }));
  }
  if (typeof updateHUD === 'function') updateHUD();
}

if (typeof window !== 'undefined') {
  window.handleAnnualAwards = handleAnnualAwards;
  window.startMarketingCampaign = startMarketingCampaign;
  window.attendSoundCon = attendSoundCon;
  window.getRivalFanMultiplier = getRivalFanMultiplier;
}
