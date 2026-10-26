/**
 * Audio Studio Tycoon - Internationalization & Translations Module
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
  const lang = (typeof StudioState !== 'undefined' && StudioState.language) ? StudioState.language : 'de';
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.de;
  let text = dict[key] || TRANSLATIONS.de[key] || key;
  for (const p in params) {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
  }
  return text;
}

if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.t = t;
}
