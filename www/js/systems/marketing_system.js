/**
 * Audio Studio Tycoon - Marketing, Expos & GOTY Awards
 */

function handleAnnualAwards() {
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

    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('success');
      AudioEngine.vibrate([100, 50, 100]);
      AudioEngine.speak(t('goty_winner', { title: bestGame.title }), true);
    }
    if (typeof EventBus !== 'undefined') {
      EventBus.emit('awards:goty', bestGame);
    }
  }
}

function startMarketingCampaign(type) {
  let cost = 3000, hype = 25, weeks = 8, fans = 150;
  if (type === 'radio') { cost = 8000; hype = 50; weeks = 12; fans = 600; }
  if (type === 'streamer') { cost = 20000; hype = 90; weeks = 16; fans = 2500; }

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
  let cost = 2500, fans = 250;
  if (tier === 'medium') { cost = 8500; fans = 1200; }
  if (tier === 'keynote') { cost = 25000; fans = 5000; }

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
}
