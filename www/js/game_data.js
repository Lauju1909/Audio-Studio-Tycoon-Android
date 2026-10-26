/**
 * Audio Studio Tycoon - Game Data, Historical Progression, Synergies & Catalog
 * Full Historical Parity: 1930 - 2026 (51 Platforms, 97 Year Events, 18 Feature Unlocks, 172 Topics)
 */

const START_YEAR = 1930;
const WEEKS_PER_YEAR = 48;

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

const HISTORICAL_ERAS = [
  { start: 1930, end: 1949, name_de: "Pionier-Ära (Mechanik & Röhren)", name_en: "Pioneer Era (Mechanical & Tubes)" },
  { start: 1950, end: 1976, name_de: "Frühe Computer & Arcade-Anfänge", name_en: "Early Computing & Arcade Dawn" },
  { start: 1977, end: 1989, name_de: "8-Bit & Homecomputer-Boom", name_en: "8-Bit & Home Computer Boom" },
  { start: 1990, end: 1999, name_de: "16-Bit, 3D & CD-ROM Revolution", name_en: "16-Bit, 3D & CD-ROM Revolution" },
  { start: 2000, end: 2012, name_de: "Online-Gaming, HD & Mobile", name_en: "Online Gaming, HD & Mobile" },
  { start: 2013, end: 2026, name_de: "Cloud, VR & KI-Moderne", name_en: "Cloud, VR & AI Era" }
];

const PLATFORMS = [
  {
    "name": "Hand-Abakus",
    "license_fee": 10000,
    "market_multi": 1.0,
    "unlock_year": 1930,
    "end_year": 1940,
    "type": "Konsole"
  },
  {
    "name": "Zuse Z1",
    "license_fee": 10000,
    "market_multi": 1.0,
    "unlock_year": 1935,
    "end_year": 1945,
    "type": "Konsole"
  },
  {
    "name": "Zuse Z3",
    "license_fee": 16000,
    "market_multi": 1.6,
    "unlock_year": 1941,
    "end_year": 1951,
    "type": "Konsole"
  },
  {
    "name": "ENIAC",
    "license_fee": 0,
    "market_multi": 2.4,
    "unlock_year": 1946,
    "end_year": 1956,
    "type": "Heimcomputer"
  },
  {
    "name": "UNIVAC I",
    "license_fee": 0,
    "market_multi": 3.1,
    "unlock_year": 1951,
    "end_year": 1961,
    "type": "Heimcomputer"
  },
  {
    "name": "Nimrod",
    "license_fee": 31000,
    "market_multi": 3.1,
    "unlock_year": 1951,
    "end_year": 1961,
    "type": "Konsole"
  },
  {
    "name": "EDSAC (OXO)",
    "license_fee": 0,
    "market_multi": 3.3,
    "unlock_year": 1952,
    "end_year": 1962,
    "type": "Heimcomputer"
  },
  {
    "name": "PDP-1 (Spacewar)",
    "license_fee": 45000,
    "market_multi": 4.5,
    "unlock_year": 1960,
    "end_year": 1970,
    "type": "Konsole"
  },
  {
    "name": "IBM 360",
    "license_fee": 0,
    "market_multi": 5.2,
    "unlock_year": 1965,
    "end_year": 1975,
    "type": "Heimcomputer"
  },
  {
    "name": "Magnavox Odyssey",
    "license_fee": 63000,
    "market_multi": 6.3,
    "unlock_year": 1972,
    "end_year": 1982,
    "type": "Konsole"
  },
  {
    "name": "Fairchild Ch. F",
    "license_fee": 69000,
    "market_multi": 6.9,
    "unlock_year": 1976,
    "end_year": 1986,
    "type": "Konsole"
  },
  {
    "name": "Atari 2600",
    "license_fee": 70000,
    "market_multi": 7.0,
    "unlock_year": 1977,
    "end_year": 1987,
    "type": "Konsole"
  },
  {
    "name": "Commodore PET",
    "license_fee": 0,
    "market_multi": 6.5,
    "unlock_year": 1977,
    "end_year": 1987,
    "type": "Heimcomputer"
  },
  {
    "name": "Apple II",
    "license_fee": 0,
    "market_multi": 6.8,
    "unlock_year": 1977,
    "end_year": 1987,
    "type": "Heimcomputer"
  },
  {
    "name": "Bally Astrocade",
    "license_fee": 72000,
    "market_multi": 7.2,
    "unlock_year": 1978,
    "end_year": 1988,
    "type": "Konsole"
  },
  {
    "name": "C64",
    "license_fee": 0,
    "market_multi": 7.5,
    "unlock_year": 1980,
    "end_year": 1990,
    "type": "Heimcomputer"
  },
  {
    "name": "Vectrex",
    "license_fee": 78000,
    "market_multi": 7.8,
    "unlock_year": 1982,
    "end_year": 1992,
    "type": "Konsole"
  },
  {
    "name": "ZX Spectrum",
    "license_fee": 0,
    "market_multi": 7.6,
    "unlock_year": 1982,
    "end_year": 1992,
    "type": "Heimcomputer"
  },
  {
    "name": "Famicom (NES)",
    "license_fee": 79000,
    "market_multi": 7.9,
    "unlock_year": 1983,
    "end_year": 1993,
    "type": "Konsole"
  },
  {
    "name": "Famicom Disk Sys",
    "license_fee": 84000,
    "market_multi": 8.4,
    "unlock_year": 1986,
    "end_year": 1996,
    "type": "Konsole"
  },
  {
    "name": "Sega Genesis",
    "license_fee": 87000,
    "market_multi": 8.7,
    "unlock_year": 1988,
    "end_year": 1998,
    "type": "Konsole"
  },
  {
    "name": "Neo Geo AES",
    "license_fee": 90000,
    "market_multi": 9.0,
    "unlock_year": 1990,
    "end_year": 2000,
    "type": "Konsole"
  },
  {
    "name": "SNES",
    "license_fee": 90000,
    "market_multi": 9.0,
    "unlock_year": 1990,
    "end_year": 2000,
    "type": "Konsole"
  },
  {
    "name": "Game Boy",
    "license_fee": 85000,
    "market_multi": 8.5,
    "unlock_year": 1989,
    "end_year": 1999,
    "type": "Handheld"
  },
  {
    "name": "Philips CD-i",
    "license_fee": 92000,
    "market_multi": 9.2,
    "unlock_year": 1991,
    "end_year": 2001,
    "type": "Konsole"
  },
  {
    "name": "Atari Jaguar",
    "license_fee": 94000,
    "market_multi": 9.4,
    "unlock_year": 1993,
    "end_year": 2003,
    "type": "Konsole"
  },
  {
    "name": "PlayStation 1",
    "license_fee": 96000,
    "market_multi": 9.6,
    "unlock_year": 1994,
    "end_year": 2004,
    "type": "Konsole"
  },
  {
    "name": "Sega Saturn",
    "license_fee": 95000,
    "market_multi": 9.5,
    "unlock_year": 1994,
    "end_year": 2004,
    "type": "Konsole"
  },
  {
    "name": "Nintendo 64",
    "license_fee": 99000,
    "market_multi": 9.9,
    "unlock_year": 1996,
    "end_year": 2006,
    "type": "Konsole"
  },
  {
    "name": "Dreamcast",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 1998,
    "end_year": 2008,
    "type": "Konsole"
  },
  {
    "name": "PlayStation 2",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2000,
    "end_year": 2010,
    "type": "Konsole"
  },
  {
    "name": "PlayStation Portable",
    "license_fee": 98000,
    "market_multi": 9.8,
    "unlock_year": 2004,
    "end_year": 2014,
    "type": "Handheld"
  },
  {
    "name": "GameCube",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2001,
    "end_year": 2011,
    "type": "Konsole"
  },
  {
    "name": "Xbox 360",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2005,
    "end_year": 2015,
    "type": "Konsole"
  },
  {
    "name": "PlayStation 3",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2006,
    "end_year": 2016,
    "type": "Konsole"
  },
  {
    "name": "Gizmondo",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2008,
    "end_year": 2018,
    "type": "Handheld"
  },
  {
    "name": "PlayStation 4",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2013,
    "end_year": 2023,
    "type": "Konsole"
  },
  {
    "name": "Xbox One",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2013,
    "end_year": 2023,
    "type": "Konsole"
  },
  {
    "name": "PlayStation 4 Pro",
    "license_fee": 110000,
    "market_multi": 10.5,
    "unlock_year": 2016,
    "end_year": 2026,
    "type": "Konsole"
  },
  {
    "name": "Switch",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2017,
    "end_year": 2027,
    "type": "Handheld"
  },
  {
    "name": "Playdate",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2018,
    "end_year": 2028,
    "type": "Handheld"
  },
  {
    "name": "PlayStation 5",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2020,
    "end_year": 2030,
    "type": "Konsole"
  },
  {
    "name": "Analogue Pocket",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2021,
    "end_year": 2031,
    "type": "Handheld"
  },
  {
    "name": "Evercade EXP",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2022,
    "end_year": 2032,
    "type": "Handheld"
  },
  {
    "name": "Steam Deck",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2022,
    "end_year": 2032,
    "type": "Handheld"
  },
  {
    "name": "Oculus Rift (VR)",
    "license_fee": 300000,
    "market_multi": 8.0,
    "unlock_year": 2016,
    "end_year": 2026,
    "type": "VR"
  },
  {
    "name": "HTC Vive (VR)",
    "license_fee": 350000,
    "market_multi": 8.5,
    "unlock_year": 2016,
    "end_year": 2026,
    "type": "VR"
  },
  {
    "name": "PSVR (VR)",
    "license_fee": 300000,
    "market_multi": 8.0,
    "unlock_year": 2016,
    "end_year": 2026,
    "type": "VR"
  },
  {
    "name": "Meta Quest 2 (VR)",
    "license_fee": 500000,
    "market_multi": 12.0,
    "unlock_year": 2020,
    "end_year": 2030,
    "type": "VR"
  },
  {
    "name": "Cloud-Console",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2025,
    "end_year": 2035,
    "type": "Streaming"
  },
  {
    "name": "Neural-Box 1",
    "license_fee": 100000,
    "market_multi": 10.0,
    "unlock_year": 2026,
    "end_year": 2036,
    "type": "Konsole"
  }
];

const YEAR_EVENTS = {
  "1930": {
    "text": "event_1930",
    "effect": "money_multi",
    "value": 0.8
  },
  "1931": {
    "text": "event_1931",
    "effect": "rp",
    "value": 25
  },
  "1932": {
    "text": "event_1932",
    "effect": "trend_topic",
    "value": "Sport"
  },
  "1933": {
    "text": "event_1933",
    "effect": "sales_multi",
    "value": 1.2
  },
  "1934": {
    "text": "event_1934",
    "effect": "hype",
    "value": 15
  },
  "1935": {
    "text": "event_1935",
    "effect": "trend_topic",
    "value": "Brettspiel"
  },
  "1936": {
    "text": "event_1936",
    "effect": "trend_topic",
    "value": "Leichtathletik"
  },
  "1937": {
    "text": "event_1937",
    "effect": "hype_multi",
    "value": 0.5,
    "topic": "Luftfahrt"
  },
  "1938": {
    "text": "event_1938",
    "effect": "trend_topic",
    "value": "Aliens"
  },
  "1939": {
    "text": "event_1939",
    "effect": "tax_increase",
    "value": 0.1
  },
  "1940": {
    "text": "event_1940",
    "effect": "logic_boost",
    "value": 1.3
  },
  "1941": {
    "text": "event_1941",
    "effect": "trend_topic",
    "value": "Pazifik-Krieg"
  },
  "1942": {
    "text": "event_1942",
    "effect": "hype",
    "value": 200,
    "topic": "Mathematik"
  },
  "1943": {
    "text": "event_1943",
    "effect": "trend_topic",
    "value": "Agenten"
  },
  "1944": {
    "text": "event_1944",
    "effect": "trend_topic",
    "value": "Militär"
  },
  "1945": {
    "text": "event_1945",
    "effect": "sales_multi",
    "value": 2.0
  },
  "1946": {
    "text": "event_1946",
    "effect": "trend_topic",
    "value": "Pioniere"
  },
  "1947": {
    "text": "event_1947",
    "effect": "trend_topic",
    "value": "UFOs"
  },
  "1948": {
    "text": "event_1948",
    "effect": "money",
    "value": 1000
  },
  "1949": {
    "text": "event_1949",
    "effect": "unlock_tech",
    "value": "Sound-Forschung"
  },
  "1950": {
    "text": "event_1950",
    "effect": "trend_topic",
    "value": "Militär"
  },
  "1951": {
    "text": "event_1951",
    "effect": "prestige",
    "value": 50
  },
  "1952": {
    "text": "event_1952",
    "effect": "hype",
    "value": 40
  },
  "1953": {
    "text": "event_1953",
    "effect": "trend_topic",
    "value": "Wissenschaft"
  },
  "1954": {
    "text": "event_1954",
    "effect": "trend_topic",
    "value": "Fußball"
  },
  "1955": {
    "text": "event_1955",
    "effect": "trend_topic",
    "value": "Vergnügungspark"
  },
  "1956": {
    "text": "event_1956",
    "effect": "trend_topic",
    "value": "Rock 'n' Roll"
  },
  "1957": {
    "text": "event_1957",
    "effect": "hype",
    "value": 500,
    "topic": "Weltraum"
  },
  "1958": {
    "text": "event_1958",
    "effect": "hype",
    "value": 30
  },
  "1959": {
    "text": "event_1959",
    "effect": "trend_topic",
    "value": "Mode/Puppen"
  },
  "1960": {
    "text": "event_1960",
    "effect": "trend_topic",
    "value": "Freiheit"
  },
  "1961": {
    "text": "event_1961",
    "effect": "money_multi",
    "value": 0.5
  },
  "1962": {
    "text": "event_1962",
    "effect": "hype",
    "value": 50
  },
  "1963": {
    "text": "event_1963",
    "effect": "sales_multi",
    "value": 0.7
  },
  "1964": {
    "text": "event_1964",
    "effect": "trend_topic",
    "value": "Band"
  },
  "1965": {
    "text": "event_1965",
    "effect": "trend_topic",
    "value": "Chaos/Protest"
  },
  "1966": {
    "text": "event_1966",
    "effect": "unlock_genre",
    "value": "RPG"
  },
  "1967": {
    "text": "event_1967",
    "effect": "trend_topic",
    "value": "Hippies"
  },
  "1968": {
    "text": "event_1968",
    "effect": "salary_increase",
    "value": 0.15
  },
  "1969": {
    "text": "event_1969",
    "effect": "hype",
    "value": 100
  },
  "1970": {
    "text": "event_1970",
    "effect": "trend_topic",
    "value": "Natur"
  },
  "1971": {
    "text": "event_1971",
    "effect": "trend_topic",
    "value": "Lernen"
  },
  "1972": {
    "text": "event_1972",
    "effect": "market_boom",
    "value": 2.0
  },
  "1973": {
    "text": "event_1973",
    "effect": "cost_increase",
    "value": 0.5
  },
  "1974": {
    "text": "event_1974",
    "effect": "unlock_genre",
    "value": "RPG"
  },
  "1975": {
    "text": "event_1975",
    "effect": "rival_boost",
    "value": 1.2
  },
  "1976": {
    "text": "event_1976",
    "effect": "market_boom",
    "value": 1.5
  },
  "1977": {
    "text": "event_1977",
    "effect": "trend_topic",
    "value": "Weltraum"
  },
  "1978": {
    "text": "event_1978",
    "effect": "trend_genre",
    "value": "Action"
  },
  "1979": {
    "text": "event_1979",
    "effect": "unlock_tech",
    "value": "Sound-Marketing"
  },
  "1980": {
    "text": "event_1980",
    "effect": "trend_genre",
    "value": "Puzzle"
  },
  "1981": {
    "text": "event_1981",
    "effect": "hype",
    "value": 40
  },
  "1982": {
    "text": "event_1982",
    "effect": "market_crash",
    "value": 0.1
  },
  "1983": {
    "text": "event_1983",
    "effect": "quality_penalty",
    "value": 2.0
  },
  "1984": {
    "text": "event_1984",
    "effect": "hype",
    "value": 300,
    "topic": "Puzzle"
  },
  "1985": {
    "text": "event_1985",
    "effect": "trend_genre",
    "value": "Action"
  },
  "1986": {
    "text": "event_1986",
    "effect": "complexity_boost",
    "value": 1.2
  },
  "1987": {
    "text": "event_1987",
    "effect": "story_boost",
    "value": 1.5
  },
  "1988": {
    "text": "event_1988",
    "effect": "graphics_standard",
    "value": 2
  },
  "1989": {
    "text": "event_1989",
    "effect": "market_boom",
    "value": 1.3
  },
  "1990": {
    "text": "event_1990",
    "effect": "sales_multi",
    "value": 1.15
  },
  "1991": {
    "text": "event_1991",
    "effect": "trend_genre",
    "value": "Kampfspiel"
  },
  "1992": {
    "text": "event_1992",
    "effect": "unlock_genre",
    "value": "Action"
  },
  "1993": {
    "text": "event_1993",
    "effect": "censorship_risk",
    "value": 0.5
  },
  "1994": {
    "text": "event_1994",
    "effect": "medium_upgrade",
    "value": "CD-ROM"
  },
  "1995": {
    "text": "event_1995",
    "effect": "market_boom",
    "value": 1.4
  },
  "1996": {
    "text": "event_1996",
    "effect": "trend_topic",
    "value": "Monster"
  },
  "1997": {
    "text": "event_1997",
    "effect": "server_costs",
    "value": 2.0
  },
  "1998": {
    "text": "event_1998",
    "effect": "trend_genre",
    "value": "Action"
  },
  "1999": {
    "text": "event_1999",
    "effect": "trend_topic",
    "value": "Simulation"
  },
  "2000": {
    "text": "event_2000",
    "effect": "market_boom",
    "value": 1.5
  },
  "2001": {
    "text": "event_2001",
    "effect": "sales_multi",
    "value": 0.8
  },
  "2002": {
    "text": "event_2002",
    "effect": "multiplayer_boost",
    "value": 1.5
  },
  "2003": {
    "text": "event_2003",
    "effect": "digital_sales",
    "value": 1.2
  },
  "2004": {
    "text": "event_2004",
    "effect": "subscription_boom",
    "value": 2.0
  },
  "2005": {
    "text": "event_2005",
    "effect": "marketing_rev",
    "value": 1.5
  },
  "2006": {
    "text": "event_2006",
    "effect": "trend_genre",
    "value": "Casual"
  },
  "2007": {
    "text": "event_2007",
    "effect": "market_shift",
    "value": "Casual"
  },
  "2008": {
    "text": "event_2008",
    "effect": "interest_increase",
    "value": 0.2
  },
  "2009": {
    "text": "event_2009",
    "effect": "trend_topic",
    "value": "Sandbox/Voxel"
  },
  "2010": {
    "text": "event_2010",
    "effect": "market_boom",
    "value": 1.4
  },
  "2011": {
    "text": "event_2011",
    "effect": "streamer_impact",
    "value": 2.0
  },
  "2012": {
    "text": "event_2012",
    "effect": "crowdfunding",
    "value": 1.5
  },
  "2013": {
    "text": "event_2013",
    "effect": "quality_standard",
    "value": 1.5
  },
  "2014": {
    "text": "event_2014",
    "effect": "prestige",
    "value": 30
  },
  "2015": {
    "text": "event_2015",
    "effect": "story_standard",
    "value": 2.0
  },
  "2016": {
    "text": "event_2016",
    "effect": "trend_topic",
    "value": "AR-Jagd"
  },
  "2017": {
    "text": "event_2017",
    "effect": "trend_topic",
    "value": "Battle-Royale"
  },
  "2018": {
    "text": "event_2018",
    "effect": "graphics_standard",
    "value": 3.0
  },
  "2019": {
    "text": "event_2019",
    "effect": "subscription_standard",
    "value": 1.5
  },
  "2020": {
    "text": "event_2020",
    "effect": "sales_multi",
    "value": 2.5
  },
  "2021": {
    "text": "event_2021",
    "effect": "crypto_crash",
    "value": 0.0
  },
  "2022": {
    "text": "event_2022",
    "effect": "trend_difficulty",
    "value": "Hard"
  },
  "2023": {
    "text": "event_2023",
    "effect": "dev_speed",
    "value": 1.5
  },
  "2024": {
    "text": "event_2024",
    "effect": "trend_topic",
    "value": "Mars-Kolonisierung"
  },
  "2025": {
    "text": "event_2025",
    "effect": "unlock_platform",
    "value": "Neural"
  },
  "2026": {
    "text": "event_2026",
    "effect": "game_end",
    "value": 0
  }
};

const FEATURE_UNLOCKS = {
  "esports": {
    "year": 2005,
    "name": "E-Sports"
  },
  "vr_headset": {
    "year": 2016,
    "name": "VR Hardware Labor"
  },
  "metaverse": {
    "year": 2018,
    "name": "Das AudioVerse (Metaverse)"
  },
  "transmedia": {
    "year": 2000,
    "name": "Filmrechte & Transmedia"
  },
  "ipo": {
    "year": 1995,
    "office_level": 3,
    "name": "Boersengang (IPO)"
  },
  "darknet": {
    "year": 2000,
    "name": "Cyber-Attacken / Darknet"
  },
  "cloud_gaming": {
    "year": 2010,
    "name": "Cloud Gaming"
  },
  "merch": {
    "year": 1990,
    "name": "Merchandising"
  },
  "ai_tools": {
    "year": 2020,
    "name": "KI-Tools"
  },
  "streaming_platform": {
    "year": 2005,
    "name": "Streaming-Plattform"
  },
  "creator_sponsorship": {
    "year": 2010,
    "name": "Content Creators Sponsern"
  },
  "acquisition": {
    "year": 2000,
    "office_level": 3,
    "name": "Studio-Akquise"
  },
  "soundcon": {
    "year": 1995,
    "name": "SoundCon Messe"
  },
  "soundtrack_label": {
    "year": 1985,
    "name": "Soundtrack-Label"
  },
  "subscription_vault": {
    "year": 1995,
    "name": "Abo-Modell"
  },
  "live_services": {
    "year": 2012,
    "name": "Live-Services (Lootboxen)"
  },
  "publishing_label": {
    "year": 2005,
    "name": "Publishing Label (Indie-Fund)"
  },
  "crypto_scam": {
    "year": 2019,
    "name": "Web3 & Blockchain-Games"
  }
};

const HISTORICAL_TOPICS = [
  {
    "name": "Abakus",
    "unlock_year": 1930,
    "synergy": "Puzzle",
    "hype_level": 1
  },
  {
    "name": "Radio-Drama",
    "unlock_year": 1930,
    "synergy": "Abenteuer",
    "hype_level": 4
  },
  {
    "name": "Logistik",
    "unlock_year": 1930,
    "synergy": "Strategie",
    "hype_level": 3
  },
  {
    "name": "Schach",
    "unlock_year": 1930,
    "synergy": "Puzzle",
    "hype_level": 2
  },
  {
    "name": "Mathematik",
    "unlock_year": 1930,
    "synergy": "Puzzle",
    "hype_level": 3
  },
  {
    "name": "Swing-Musik",
    "unlock_year": 1931,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "Astronomie",
    "unlock_year": 1931,
    "synergy": "Strategie",
    "hype_level": 2
  },
  {
    "name": "Landwirtschaft",
    "unlock_year": 1931,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Kochen",
    "unlock_year": 1932,
    "synergy": "Simulation",
    "hype_level": 1
  },
  {
    "name": "Hörspiel",
    "unlock_year": 1932,
    "synergy": "Abenteuer",
    "hype_level": 5
  },
  {
    "name": "Politik",
    "unlock_year": 1932,
    "synergy": "Strategie",
    "hype_level": 2
  },
  {
    "name": "Detektiv",
    "unlock_year": 1933,
    "synergy": "Abenteuer",
    "hype_level": 3
  },
  {
    "name": "Kartenspiele",
    "unlock_year": 1933,
    "synergy": "Puzzle",
    "hype_level": 3
  },
  {
    "name": "Architektur",
    "unlock_year": 1934,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Postwesen",
    "unlock_year": 1934,
    "synergy": "Simulation",
    "hype_level": 1
  },
  {
    "name": "Zirkus",
    "unlock_year": 1935,
    "synergy": "Casual",
    "hype_level": 2
  },
  {
    "name": "Tonbandgerät",
    "unlock_year": 1935,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Bergbau",
    "unlock_year": 1935,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Eisenbahn",
    "unlock_year": 1936,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Seefahrt",
    "unlock_year": 1936,
    "synergy": "Abenteuer",
    "hype_level": 2
  },
  {
    "name": "Kryptografie",
    "unlock_year": 1937,
    "synergy": "Puzzle",
    "hype_level": 4
  },
  {
    "name": "Feuerwehr",
    "unlock_year": 1937,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Mars-Invasion",
    "unlock_year": 1938,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Zauberei",
    "unlock_year": 1938,
    "synergy": "Abenteuer",
    "hype_level": 2
  },
  {
    "name": "Militär",
    "unlock_year": 1939,
    "synergy": "Strategie",
    "hype_level": 4
  },
  {
    "name": "Chemie",
    "unlock_year": 1939,
    "synergy": "Puzzle",
    "hype_level": 2
  },
  {
    "name": "Brettspiel",
    "unlock_year": 1935,
    "synergy": "Puzzle",
    "hype_level": 3
  },
  {
    "name": "Leichtathletik",
    "unlock_year": 1936,
    "synergy": "Sport",
    "hype_level": 3
  },
  {
    "name": "Aliens",
    "unlock_year": 1938,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Pazifik-Krieg",
    "unlock_year": 1941,
    "synergy": "Strategie",
    "hype_level": 4
  },
  {
    "name": "Frieden",
    "unlock_year": 1945,
    "synergy": "Casual",
    "hype_level": 5
  },
  {
    "name": "Pioniere",
    "unlock_year": 1946,
    "synergy": "Abenteuer",
    "hype_level": 3
  },
  {
    "name": "Wissenschaft",
    "unlock_year": 1953,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Themenpark",
    "unlock_year": 1955,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Mode/Puppen",
    "unlock_year": 1959,
    "synergy": "Casual",
    "hype_level": 3
  },
  {
    "name": "Freiheit",
    "unlock_year": 1960,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Band",
    "unlock_year": 1964,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "Chaos/Protest",
    "unlock_year": 1965,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Natur",
    "unlock_year": 1970,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Lernen",
    "unlock_year": 1971,
    "synergy": "Puzzle",
    "hype_level": 2
  },
  {
    "name": "U-Boot",
    "unlock_year": 1940,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Magnetband",
    "unlock_year": 1940,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Mehrspuraufnahme",
    "unlock_year": 1941,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Spionage",
    "unlock_year": 1942,
    "synergy": "Abenteuer",
    "hype_level": 3
  },
  {
    "name": "Panzer",
    "unlock_year": 1943,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Fallschirmjäger",
    "unlock_year": 1944,
    "synergy": "Action",
    "hype_level": 2
  },
  {
    "name": "Wiederaufbau",
    "unlock_year": 1945,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Journalismus",
    "unlock_year": 1946,
    "synergy": "Strategie",
    "hype_level": 2
  },
  {
    "name": "UFOs",
    "unlock_year": 1947,
    "synergy": "Abenteuer",
    "hype_level": 4
  },
  {
    "name": "Vinyl-Schallplatte",
    "unlock_year": 1948,
    "synergy": "Casual",
    "hype_level": 5
  },
  {
    "name": "Roboter",
    "unlock_year": 1948,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Dschungel",
    "unlock_year": 1949,
    "synergy": "Abenteuer",
    "hype_level": 2
  },
  {
    "name": "Rock 'n' Roll",
    "unlock_year": 1950,
    "synergy": "Casual",
    "hype_level": 5
  },
  {
    "name": "Archäologie",
    "unlock_year": 1950,
    "synergy": "Abenteuer",
    "hype_level": 3
  },
  {
    "name": "Weltraum",
    "unlock_year": 1951,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Transistorradio",
    "unlock_year": 1952,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Wilder Westen",
    "unlock_year": 1952,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Bergsteigen",
    "unlock_year": 1953,
    "synergy": "Sport",
    "hype_level": 2
  },
  {
    "name": "Fußball",
    "unlock_year": 1954,
    "synergy": "Sport",
    "hype_level": 5
  },
  {
    "name": "Vergnügungspark",
    "unlock_year": 1955,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Monster",
    "unlock_year": 1956,
    "synergy": "Horror",
    "hype_level": 2
  },
  {
    "name": "Satelliten",
    "unlock_year": 1957,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Tennis",
    "unlock_year": 1958,
    "synergy": "Sport",
    "hype_level": 4
  },
  {
    "name": "Rennwagen",
    "unlock_year": 1959,
    "synergy": "Rennspiel",
    "hype_level": 3
  },
  {
    "name": "Tiefsee",
    "unlock_year": 1960,
    "synergy": "Abenteuer",
    "hype_level": 2
  },
  {
    "name": "Stereo-Sound",
    "unlock_year": 1960,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Mafia",
    "unlock_year": 1961,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Fantasy",
    "unlock_year": 1962,
    "synergy": "RPG",
    "hype_level": 3
  },
  {
    "name": "Musikkassette",
    "unlock_year": 1963,
    "synergy": "Casual",
    "hype_level": 5
  },
  {
    "name": "Agenten",
    "unlock_year": 1963,
    "synergy": "Abenteuer",
    "hype_level": 4
  },
  {
    "name": "Popstars",
    "unlock_year": 1964,
    "synergy": "Casual",
    "hype_level": 3
  },
  {
    "name": "Dinosaurier",
    "unlock_year": 1965,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Ninjas",
    "unlock_year": 1966,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Hippies",
    "unlock_year": 1967,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Weltrevolution",
    "unlock_year": 1968,
    "synergy": "Strategie",
    "hype_level": 3
  },
  {
    "name": "Mondbasis",
    "unlock_year": 1969,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Synthesizer",
    "unlock_year": 1970,
    "synergy": "Puzzle",
    "hype_level": 3
  },
  {
    "name": "Kung-Fu",
    "unlock_year": 1970,
    "synergy": "Kampfspiel",
    "hype_level": 3
  },
  {
    "name": "Piraten",
    "unlock_year": 1971,
    "synergy": "Abenteuer",
    "hype_level": 4
  },
  {
    "name": "Basketball",
    "unlock_year": 1972,
    "synergy": "Sport",
    "hype_level": 2
  },
  {
    "name": "Motorrad",
    "unlock_year": 1973,
    "synergy": "Rennspiel",
    "hype_level": 3
  },
  {
    "name": "Elektronik-Pop",
    "unlock_year": 1974,
    "synergy": "Puzzle",
    "hype_level": 5
  },
  {
    "name": "Verliese",
    "unlock_year": 1974,
    "synergy": "RPG",
    "hype_level": 4
  },
  {
    "name": "Polizei",
    "unlock_year": 1975,
    "synergy": "Action",
    "hype_level": 2
  },
  {
    "name": "Alien-Jagd",
    "unlock_year": 1976,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Laserschwert",
    "unlock_year": 1977,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Invaders",
    "unlock_year": 1978,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Horrorhaus",
    "unlock_year": 1979,
    "synergy": "Horror",
    "hype_level": 3
  },
  {
    "name": "Gelbe Fresspunkte",
    "unlock_year": 1980,
    "synergy": "Puzzle",
    "hype_level": 5
  },
  {
    "name": "Walkman",
    "unlock_year": 1980,
    "synergy": "Casual",
    "hype_level": 5
  },
  {
    "name": "Büro-Alltag",
    "unlock_year": 1981,
    "synergy": "Simulation",
    "hype_level": 1
  },
  {
    "name": "CD-Technologie",
    "unlock_year": 1982,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Cyberpunk",
    "unlock_year": 1982,
    "synergy": "RPG",
    "hype_level": 4
  },
  {
    "name": "Vampire",
    "unlock_year": 1983,
    "synergy": "Horror",
    "hype_level": 3
  },
  {
    "name": "Breakdance",
    "unlock_year": 1984,
    "synergy": "Casual",
    "hype_level": 2
  },
  {
    "name": "Klempner",
    "unlock_year": 1985,
    "synergy": "Action",
    "hype_level": 5
  },
  {
    "name": "Postapokalypse",
    "unlock_year": 1986,
    "synergy": "RPG",
    "hype_level": 3
  },
  {
    "name": "Mechs",
    "unlock_year": 1987,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Skateboarding",
    "unlock_year": 1988,
    "synergy": "Sport",
    "hype_level": 3
  },
  {
    "name": "Taschenmonster",
    "unlock_year": 1989,
    "synergy": "RPG",
    "hype_level": 5
  },
  {
    "name": "Digital-Audio-Workstation",
    "unlock_year": 1991,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Techno-Rave",
    "unlock_year": 1990,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Krankenhaus",
    "unlock_year": 1990,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Freizeitpark",
    "unlock_year": 1991,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Mars-Shooter",
    "unlock_year": 1992,
    "synergy": "Action",
    "hype_level": 5
  },
  {
    "name": "Urzeit/Survival",
    "unlock_year": 1993,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Anime",
    "unlock_year": 1994,
    "synergy": "RPG",
    "hype_level": 3
  },
  {
    "name": "Hacking",
    "unlock_year": 1995,
    "synergy": "Puzzle",
    "hype_level": 4
  },
  {
    "name": "Stealth-Agent",
    "unlock_year": 1996,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Internet-Radio",
    "unlock_year": 1997,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Elfen & Orks",
    "unlock_year": 1997,
    "synergy": "RPG",
    "hype_level": 3
  },
  {
    "name": "Survival-Insel",
    "unlock_year": 1998,
    "synergy": "Abenteuer",
    "hype_level": 3
  },
  {
    "name": "Skandal-TV",
    "unlock_year": 1999,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Lebens-Sim",
    "unlock_year": 2000,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "MP3-Player",
    "unlock_year": 2000,
    "synergy": "Casual",
    "hype_level": 5
  },
  {
    "name": "Zombie-Hype",
    "unlock_year": 2001,
    "synergy": "Horror",
    "hype_level": 4
  },
  {
    "name": "Musik-Download",
    "unlock_year": 2003,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "Parkplatz-Manager",
    "unlock_year": 2002,
    "synergy": "Simulation",
    "hype_level": 1
  },
  {
    "name": "E-Sport",
    "unlock_year": 2003,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Zauberschule",
    "unlock_year": 2004,
    "synergy": "RPG",
    "hype_level": 4
  },
  {
    "name": "Podcast-Boom",
    "unlock_year": 2005,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Sandbox/Voxel",
    "unlock_year": 2005,
    "synergy": "Abenteuer",
    "hype_level": 5
  },
  {
    "name": "Wikinger",
    "unlock_year": 2006,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Smartphones",
    "unlock_year": 2007,
    "synergy": "Puzzle",
    "hype_level": 3
  },
  {
    "name": "Musik-Streaming",
    "unlock_year": 2008,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Freerunning",
    "unlock_year": 2008,
    "synergy": "Action",
    "hype_level": 2
  },
  {
    "name": "Block-Bauen",
    "unlock_year": 2009,
    "synergy": "Abenteuer",
    "hype_level": 5
  },
  {
    "name": "Streaming-Rev",
    "unlock_year": 2010,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Social Network",
    "unlock_year": 2010,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Hi-Res Audio",
    "unlock_year": 2012,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Indie-Entwickler",
    "unlock_year": 2011,
    "synergy": "Abenteuer",
    "hype_level": 2
  },
  {
    "name": "Battle-Royale",
    "unlock_year": 2012,
    "synergy": "Action",
    "hype_level": 5
  },
  {
    "name": "VR-Simulation",
    "unlock_year": 2013,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Farming-Hype",
    "unlock_year": 2014,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "ASMR",
    "unlock_year": 2015,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Cyber-Krieg",
    "unlock_year": 2015,
    "synergy": "Strategie",
    "hype_level": 3
  },
  {
    "name": "3D-Audio",
    "unlock_year": 2017,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "AR-Jagd",
    "unlock_year": 2016,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Krypto-Mining",
    "unlock_year": 2017,
    "synergy": "Strategie",
    "hype_level": 2
  },
  {
    "name": "Mars-Kolonisierung",
    "unlock_year": 2018,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Streaming-Star",
    "unlock_year": 2019,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "KI-Dystopie",
    "unlock_year": 2020,
    "synergy": "Abenteuer",
    "hype_level": 3
  },
  {
    "name": "Spatial-Audio",
    "unlock_year": 2020,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "NFT-Sammeln",
    "unlock_year": 2021,
    "synergy": "Strategie",
    "hype_level": 1
  },
  {
    "name": "KI-Komposition",
    "unlock_year": 2022,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Metaverse",
    "unlock_year": 2022,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "KI-Utopie",
    "unlock_year": 2023,
    "synergy": "Strategie",
    "hype_level": 4
  },
  {
    "name": "KI-Stimmen",
    "unlock_year": 2024,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Endzeit-Bote",
    "unlock_year": 2024,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Gen-Labor",
    "unlock_year": 2025,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Holo-Konzerte",
    "unlock_year": 2025,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "Neural-Link",
    "unlock_year": 2026,
    "synergy": "RPG",
    "hype_level": 5
  },
  {
    "name": "Hörbuch-Boom",
    "unlock_year": 2000,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "SoundCloud-Rap",
    "unlock_year": 2012,
    "synergy": "Casual",
    "hype_level": 3
  },
  {
    "name": "Vinyl-Revival",
    "unlock_year": 2015,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "Auto-Tune",
    "unlock_year": 1998,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "Multiroom-Audio",
    "unlock_year": 2010,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Dolby Atmos",
    "unlock_year": 2012,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Noise Cancelling",
    "unlock_year": 2000,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "Hörgeräte-Tech",
    "unlock_year": 1950,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Echo-Effekt",
    "unlock_year": 1960,
    "synergy": "Casual",
    "hype_level": 3
  },
  {
    "name": "Reverb-Kammern",
    "unlock_year": 1945,
    "synergy": "Simulation",
    "hype_level": 2
  },
  {
    "name": "Film-Sync",
    "unlock_year": 1930,
    "synergy": "Action",
    "hype_level": 3
  },
  {
    "name": "Surround-Sound",
    "unlock_year": 1975,
    "synergy": "Action",
    "hype_level": 4
  },
  {
    "name": "Audio-Fingerprint",
    "unlock_year": 2005,
    "synergy": "Puzzle",
    "hype_level": 3
  },
  {
    "name": "Algo-Playlists",
    "unlock_year": 2015,
    "synergy": "Strategie",
    "hype_level": 4
  },
  {
    "name": "Lo-Fi Beats",
    "unlock_year": 2017,
    "synergy": "Casual",
    "hype_level": 4
  },
  {
    "name": "True Wireless",
    "unlock_year": 2016,
    "synergy": "Simulation",
    "hype_level": 4
  },
  {
    "name": "Podcasting 2.0",
    "unlock_year": 2020,
    "synergy": "Simulation",
    "hype_level": 3
  },
  {
    "name": "KI-Mastering",
    "unlock_year": 2021,
    "synergy": "Simulation",
    "hype_level": 5
  },
  {
    "name": "Audio-Deepfakes",
    "unlock_year": 2023,
    "synergy": "Abenteuer",
    "hype_level": 4
  },
  {
    "name": "Neuro-Interface",
    "unlock_year": 2026,
    "synergy": "RPG",
    "hype_level": 5
  }
];

function getCurrentEra(year) {
  const currentY = Number(year) || START_YEAR;
  if (currentY < HISTORICAL_ERAS[0].start) return HISTORICAL_ERAS[0];
  if (currentY > HISTORICAL_ERAS[HISTORICAL_ERAS.length - 1].end) {
    return HISTORICAL_ERAS[HISTORICAL_ERAS.length - 1];
  }
  return HISTORICAL_ERAS.find(e => currentY >= e.start && currentY <= e.end) || HISTORICAL_ERAS[HISTORICAL_ERAS.length - 1];
}

function getAvailablePlatforms(year, extraUnlocked = []) {
  const currentY = Number(year) || START_YEAR;
  const base = PLATFORMS.filter(p => {
    const start = p.unlock_year != null ? p.unlock_year : START_YEAR;
    const end = p.end_year != null ? p.end_year : 9999;
    return currentY >= start && currentY <= end;
  });
  const result = [...base];
  const baseNames = new Set(base.map(p => p.name));

  const extraList = Array.isArray(extraUnlocked) && extraUnlocked.length > 0 ? extraUnlocked : ((typeof StudioState !== 'undefined' && StudioState && StudioState.unlockedPlatforms) ? StudioState.unlockedPlatforms : []);
  extraList.forEach(platName => {
    if (!baseNames.has(platName)) {
      const match = PLATFORMS.find(p => p.name === platName);
      if (match) {
        const end = match.end_year != null ? match.end_year : 9999;
        if (currentY <= end) {
          result.push(match);
          baseNames.add(platName);
        }
      }
    }
  });

  return result;
}

function getNewlyUnlockedPlatforms(year) {
  const currentY = Number(year);
  return PLATFORMS.filter(p => p.unlock_year === currentY);
}

function getNewlyRetiredPlatforms(year) {
  const currentY = Number(year);
  return PLATFORMS.filter(p => p.end_year === currentY - 1);
}

function getNewlyUnlockedFeatures(year) {
  const currentY = Number(year);
  const unlocked = [];
  for (const [key, feat] of Object.entries(FEATURE_UNLOCKS)) {
    if (feat.year === currentY) {
      unlocked.push({ id: key, ...feat });
    }
  }
  return unlocked;
}

function isFeatureUnlocked(featureId, year) {
  const currentY = Number(year) || START_YEAR;
  const feat = FEATURE_UNLOCKS[featureId];
  if (!feat) return true;
  return currentY >= feat.year;
}

function getYearEvent(year) {
  const currentY = Number(year);
  return YEAR_EVENTS[currentY] || null;
}

function getNewlyUnlockedTopics(year) {
  const currentY = Number(year);
  return HISTORICAL_TOPICS.filter(t => t.unlock_year === currentY);
}

function getAvailableTopics(year) {
  const currentY = Number(year) || START_YEAR;
  return HISTORICAL_TOPICS.filter(t => t.unlock_year <= currentY);
}

if (typeof window !== 'undefined') {
  window.START_YEAR = START_YEAR;
  window.WEEKS_PER_YEAR = WEEKS_PER_YEAR;
  window.THEME_GENRE_SYNERGIES = THEME_GENRE_SYNERGIES;
  window.RESEARCH_CATALOG = RESEARCH_CATALOG;
  window.RANDOM_TITLES = RANDOM_TITLES;
  window.HISTORICAL_ERAS = HISTORICAL_ERAS;
  window.PLATFORMS = PLATFORMS;
  window.YEAR_EVENTS = YEAR_EVENTS;
  window.FEATURE_UNLOCKS = FEATURE_UNLOCKS;
  window.HISTORICAL_TOPICS = HISTORICAL_TOPICS;
  window.getCurrentEra = getCurrentEra;
  window.getAvailablePlatforms = getAvailablePlatforms;
  window.getNewlyUnlockedPlatforms = getNewlyUnlockedPlatforms;
  window.getNewlyRetiredPlatforms = getNewlyRetiredPlatforms;
  window.getNewlyUnlockedFeatures = getNewlyUnlockedFeatures;
  window.isFeatureUnlocked = isFeatureUnlocked;
  window.getYearEvent = getYearEvent;
  window.getNewlyUnlockedTopics = getNewlyUnlockedTopics;
  window.getAvailableTopics = getAvailableTopics;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    START_YEAR, WEEKS_PER_YEAR, THEME_GENRE_SYNERGIES, RESEARCH_CATALOG,
    RANDOM_TITLES, HISTORICAL_ERAS, PLATFORMS, YEAR_EVENTS, FEATURE_UNLOCKS,
    HISTORICAL_TOPICS, getCurrentEra, getAvailablePlatforms, getNewlyUnlockedPlatforms,
    getNewlyRetiredPlatforms, getNewlyUnlockedFeatures, isFeatureUnlocked,
    getYearEvent, getNewlyUnlockedTopics, getAvailableTopics
  };
}
