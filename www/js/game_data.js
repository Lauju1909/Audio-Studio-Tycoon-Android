/**
 * Audio Studio Tycoon - Game Data, Synergies, and Research Catalog
 */

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

const RANDOM_TITLES = {
  de: ["Echo des Schicksals", "Symphonie des Grauens", "Pixel Beat", "Klang der Ewigkeit", "Neon Groove", "Rhythmus Rebell", "Flüsternde Schatten", "Der Schallmeister"],
  en: ["Echo of Destiny", "Symphony of Dread", "Pixel Beat", "Sound of Eternity", "Neon Groove", "Rhythm Rebel", "Whispering Shadows", "Sonic Master"]
};

if (typeof window !== 'undefined') {
  window.THEME_GENRE_SYNERGIES = THEME_GENRE_SYNERGIES;
  window.RESEARCH_CATALOG = RESEARCH_CATALOG;
  window.RANDOM_TITLES = RANDOM_TITLES;
}
