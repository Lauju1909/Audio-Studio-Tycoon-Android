const assert = require('assert');
const fs = require('fs');

// Mock browser globals
global.window = global;
const mockElements = {};
function createMockElement(tag = 'div', id = '') {
  let _innerHTML = '';
  const _classes = new Set();
  return {
    id,
    tagName: tag.toUpperCase(),
    style: {},
    textContent: '',
    value: '',
    get innerHTML() { return _innerHTML; },
    set innerHTML(val) {
      _innerHTML = String(val);
      this.children.length = 0;
    },
    children: [],
    _attrs: {},
    appendChild(child) {
      this.children.push(child);
      _innerHTML += `<${child.tagName || 'DIV'} value="${child.value || ''}">${child.textContent || ''}</${child.tagName || 'DIV'}>`;
    },
    setAttribute(k, v) { this._attrs[k] = String(v); },
    removeAttribute(k) { delete this._attrs[k]; },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    classList: {
      add(...cls) { cls.forEach(c => _classes.add(c)); },
      remove(...cls) { cls.forEach(c => _classes.delete(c)); },
      contains(c) { return _classes.has(c); }
    }
  };
}

global.document = {
  addEventListener: () => {},
  querySelectorAll: () => Object.values(mockElements),
  createElement: (tag) => createMockElement(tag),
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = createMockElement('div', id);
    }
    return mockElements[id];
  }
};
global.localStorage = {
  data: {},
  setItem(k, v) { this.data[k] = String(v); },
  getItem(k) { return this.data[k] || null; },
  removeItem(k) { delete this.data[k]; },
  clear() { this.data = {}; }
};

// Load code in order
eval(fs.readFileSync('www/audio_engine.js', 'utf8'));
eval(fs.readFileSync('www/sound.js', 'utf8'));
eval(fs.readFileSync('www/tycoon_engine.js', 'utf8'));
eval(fs.readFileSync('www/app.js', 'utf8'));

console.log("=== TEST 1: Initial state & HUD (Historical 1930 start) ===");
assert.ok(global.Sound, "Sound compatibility shim should be available");
assert.strictEqual(StudioState.cash, 50000);
assert.strictEqual(StudioState.year, 1930);
assert.strictEqual(StudioState.week, 1);
assert.strictEqual(StudioState.weeksPerYear, 48);
assert.strictEqual(StudioState.loan, 0);
assert(StudioState.unlockedPlatforms.includes("Hand-Abakus"), "1930 initial state must include Hand-Abakus");
assert(StudioState.unlockedTopics.includes("Abakus"), "1930 initial state must include historical topic Abakus");
assert(StudioState.unlockedTopics.includes("Fantasy"), "1930 initial state must include base theme Fantasy");
assert.strictEqual(StudioState.salesMultiplier, 0.8, "1930 initial state must apply 1930 Great Depression salesMultiplier 0.8");
assert.strictEqual(StudioState.eventLog.length, 1, "1930 initial state must log the 1930 historical event");
assert.strictEqual(StudioState.eventLog[0].year, 1930);
updateHUD();

console.log("=== TEST 2: Weekly tick, payroll & loan interest ===");
StudioState.staff.push({
  id: 10,
  name: "Test Staff",
  role: "sound",
  salary: 2000,
  skill: 2,
  fatigue: 50,
  morale: 80,
  onVacationWeeks: 0
});
const cashBefore = StudioState.cash;
tickWeek(); // Deduct 1 week of salary: 2000/4 = 500 (plus 1500/4 for existing staff = 375 => 875 total)
assert(StudioState.cash < cashBefore, "Cash should decrease from payroll");
assert.strictEqual(StudioState.week, 2);

console.log("=== TEST 3: Vacation fatigue recovery ===");
StudioState.staff[1].onVacationWeeks = 2;
tickWeek();
assert.strictEqual(StudioState.staff[1].onVacationWeeks, 1);
assert(StudioState.staff[1].fatigue < 50, "Fatigue should drop during vacation");

console.log("=== TEST 4: Loan limits, interest & repayment ===");
const maxLoan = getMaxLoan();
assert(maxLoan > 50000, "Max loan should be greater than base 50k");
takeLoan(maxLoan + 100000);
assert.strictEqual(StudioState.loan, 0, "Loan over limit should be rejected");

takeLoan(25000);
assert.strictEqual(StudioState.loan, 25000);
const cashWithLoan = StudioState.cash;
tickWeek();
assert(StudioState.cash < cashWithLoan, "Interest should be deducted");

repayLoan(10000);
assert.strictEqual(StudioState.loan, 15000);

repayAllLoans();
assert.strictEqual(StudioState.loan, 0);

console.log("=== TEST 5: Research technology mechanics ===");
StudioState.rp = 100;
StudioState.year = 1930;
// In 1930, researching 1985 tech should be blocked
doResearch('dsp_effects', 40);
assert.strictEqual(StudioState.unlockedTech.includes('dsp_effects'), false, "DSP effects (1985) must be blocked in 1930");
assert.strictEqual(StudioState.rp, 100, "RP should NOT be deducted for blocked research");

// In 1985, researching 1985 tech succeeds
StudioState.year = 1985;
doResearch('dsp_effects', 40);
assert(StudioState.unlockedTech.includes('dsp_effects'), "DSP effects should be unlocked in state at year 1985");
assert.strictEqual(StudioState.rp, 60, "RP should be deducted");
StudioState.year = 1930;

console.log("=== TEST 6: Custom Engine Workshop ===");
StudioState.cash = 100000;
const prevEnginesCount = StudioState.customEngines.length;
global.prompt = () => "Mega Synth Engine";
buildNewEngine();
assert.strictEqual(StudioState.customEngines.length, prevEnginesCount + 1);
assert.strictEqual(StudioState.customEngines[prevEnginesCount].name, "Mega Synth Engine");

console.log("=== TEST 7: Game Development Lifecycle & Synergies ===");
StudioState.activeProject = {
  title: "Fantasy Epic",
  theme: "Fantasy",
  genre: "RPG",
  engineId: StudioState.customEngines[0].id,
  platform: "Hand-Abakus",
  platformMarketMulti: 1.0,
  gameplay: 50,
  sound: 80,
  assignedStaffIds: [StudioState.staff[0].id],
  progress: 90,
  features: 30,
  audioPts: 50,
  bugs: 1
};
tickProjectProgress();
assert(StudioState.activeProject.progress >= 100, "Progress should reach 100%");
finishDevelopment();
assert.strictEqual(StudioState.activeProject, null, "Active project should be cleared on finish");
assert.strictEqual(StudioState.releasedGames.length, 1);
assert.strictEqual(StudioState.releasedGames[0].title, "Fantasy Epic");
assert.strictEqual(StudioState.releasedGames[0].platform, "Hand-Abakus");
assert(StudioState.releasedGames[0].score >= 70, "Fantasy + RPG synergy should give a high score");
assert(StudioState.soundtrackLabel.length > 0, "Soundtrack should be added to label");

console.log("=== TEST 8: Save and Load serialization roundtrip ===");
StudioState.isPaused = false;
StudioState.timerInterval = 99999;
saveGame();

const rawSaved = localStorage.getItem('ast_savegame_v5');
assert(rawSaved, "Savegame should exist in localStorage");
const parsed = JSON.parse(rawSaved);
assert.strictEqual(parsed.timerInterval, undefined, "timerInterval should NOT be saved in localStorage");

StudioState.cash = 0;
StudioState.year = 1;
loadGame();
assert(StudioState.cash > 0, "Cash should be restored from save");
assert.strictEqual(StudioState.year, 1930, "Year should be restored to saved year");
assert.strictEqual(StudioState.timerInterval, null, "timerInterval should be cleanly null on load");

console.log("=== TEST 9: Language toggle & translations ===");
assert.strictEqual(StudioState.language, "de");
assert.strictEqual(t("app_title"), "Audio Studio Tycoon");
toggleLanguage();
assert.strictEqual(StudioState.language, "en");
assert.strictEqual(t("app_title"), "Audio Studio Tycoon");
assert.strictEqual(t("new_game"), "Develop New Game");
toggleLanguage(); // back to DE

console.log("=== TEST 10: Marketing Campaigns & Decay ===");
StudioState.cash = 50000;
StudioState.year = 1930;
// In 1930, streamer campaign is blocked
startMarketingCampaign('streamer');
assert.strictEqual(StudioState.cash, 50000, "Streamer marketing must be blocked in 1930");
assert.strictEqual(StudioState.marketingCampaign, null, "No campaign created in 1930");

// In 2010, streamer campaign succeeds
StudioState.year = 2010;
const fansBeforeCampaign = StudioState.fans;
startMarketingCampaign('streamer');
assert.strictEqual(StudioState.cash, 30000, "Streamer marketing costs 20,000 EUR");
assert.strictEqual(StudioState.fans, fansBeforeCampaign + 2500, "Streamer marketing gains 2500 fans");
assert.strictEqual(StudioState.marketingCampaign.weeksLeft, 16);
tickWeek();
assert.strictEqual(StudioState.marketingCampaign.weeksLeft, 15);
StudioState.year = 1930;

console.log("=== TEST 11: SoundCon Expo Attendance ===");
StudioState.cash = 100000;
StudioState.year = 1930;
// In 1930, SoundCon is blocked
attendSoundCon('keynote');
assert.strictEqual(StudioState.cash, 100000, "SoundCon must be blocked in 1930");

// In 1995, SoundCon succeeds
StudioState.year = 1995;
const fansBeforeCon = StudioState.fans;
attendSoundCon('keynote');
assert.strictEqual(StudioState.cash, 75000, "Keynote booth costs 25,000 EUR");
assert.strictEqual(StudioState.fans, fansBeforeCon + 5000, "Keynote booth gains 5,000 fans");
StudioState.year = 1930;

console.log("=== TEST 12: Annual GOTY Awards with 48 Weeks / Year ===");
StudioState.releasedGames.push({
  title: "Masterpiece Odyssey",
  year: StudioState.year,
  score: 100,
  revenue: 250000
});
// Roll over to new year (week 48 -> week 1 of next year)
StudioState.week = 48;
const cashBeforeAward = StudioState.cash;
tickWeek();
assert.strictEqual(StudioState.week, 1);
assert.strictEqual(StudioState.gotyAwards.length, 1, "Top scored title should win GOTY award");
assert.strictEqual(StudioState.gotyAwards[0].title, "Masterpiece Odyssey");
assert(StudioState.cash > cashBeforeAward + 45000, "GOTY award provides 50k bonus (plus royalties minus payroll)");

console.log("=== TEST 13: Staff Hiring and Termination ===");
global.confirm = () => true;
const staffCountBefore = StudioState.staff.length;
hireNewCandidate('coder');
assert.strictEqual(StudioState.staff.length, staffCountBefore + 1, "Staff count should increment on hire");
const hiredEmp = StudioState.staff[StudioState.staff.length - 1];
assert.strictEqual(hiredEmp.role, 'coder');
assert.strictEqual(hiredEmp.salary, 1500);
fireStaff(hiredEmp.id);
assert.strictEqual(StudioState.staff.length, staffCountBefore, "Staff count should decrement on fire");

console.log("=== TEST 14: EventBus PubSub & Modals ===");
let eventFired = false;
EventBus.on('test:ping', (payload) => {
  if (payload === 'pong') eventFired = true;
});
EventBus.emit('test:ping', 'pong');
assert.strictEqual(eventFired, true, "EventBus should properly deliver events to listeners");

openBankModal();
const modalBank = document.getElementById('modal-bank');
assert.strictEqual(modalBank.style.display, 'flex');
closeBankModal();
assert.strictEqual(modalBank.style.display, 'none');

console.log("=== TEST 15: Timeline 1930-2026 Calendar & Era Progression ===");
assert.strictEqual(START_YEAR, 1930);
assert.strictEqual(WEEKS_PER_YEAR, 48);
const era1930 = getCurrentEra(1930);
assert.strictEqual(era1930.name_de, "Pionier-Ära (Mechanik & Röhren)");
const era1985 = getCurrentEra(1985);
assert.strictEqual(era1985.name_de, "8-Bit & Homecomputer-Boom");
const era2020 = getCurrentEra(2020);
assert.strictEqual(era2020.name_de, "Cloud, VR & KI-Moderne");

console.log("=== TEST 16: Historical Platform Availability & Retirement ===");
assert.strictEqual(PLATFORMS.length, 51, "Must contain all 51 historical platforms");
const plats1930 = getAvailablePlatforms(1930);
assert(plats1930.some(p => p.name === "Hand-Abakus"), "1930 must have Hand-Abakus");
assert(!plats1930.some(p => p.name === "C64"), "1930 must NOT have C64");
assert(!plats1930.some(p => p.name === "PlayStation 5"), "1930 must NOT have PS5");

const plats1980 = getAvailablePlatforms(1980);
assert(plats1980.some(p => p.name === "C64"), "1980 must have C64");

const plats1941 = getAvailablePlatforms(1941);
assert(!plats1941.some(p => p.name === "Hand-Abakus"), "Hand-Abakus ended in 1940 and must be retired in 1941");
const retired1941 = getNewlyRetiredPlatforms(1941);
assert(retired1941.some(p => p.name === "Hand-Abakus"), "Hand-Abakus must be in newly retired platforms of 1941");

const plats2020 = getAvailablePlatforms(2020);
assert(plats2020.some(p => p.name === "PlayStation 5"), "2020 must have PlayStation 5");

console.log("=== TEST 17: Platform Selection & Market Multiplier in Game Dev ===");
StudioState.year = 1980;
StudioState.cash = 100000;
document.getElementById('select-platform').value = "C64";
openDevModal();
startDevelopment();
assert.strictEqual(StudioState.activeProject.platform, "C64");
assert.strictEqual(StudioState.activeProject.platformMarketMulti, 7.5);
StudioState.activeProject.progress = 100;
finishDevelopment();
const lastReleased = StudioState.releasedGames[0];
assert.strictEqual(lastReleased.platform, "C64");
assert.strictEqual(lastReleased.platformMulti, 7.5);
assert(lastReleased.sales > 10000, "High market multiplier should yield substantial sales");

console.log("=== TEST 18: Historical Year Events (97 Events) ===");
assert.strictEqual(Object.keys(YEAR_EVENTS).length, 97, "Must contain all 97 historical year events");
// Test 1930: Great Depression (money_multi 0.8)
StudioState.year = 1929;
StudioState.week = 48;
StudioState.cash = 10000;
tickWeek();
assert.strictEqual(StudioState.year, 1930);
assert.strictEqual(StudioState.eventLog[0].year, 1930);
assert.strictEqual(StudioState.eventLog[0].effect, "money_multi");

// Test 1931: RP Bonus (+25 RP)
StudioState.year = 1930;
StudioState.week = 48;
const rpBefore = StudioState.rp;
tickWeek();
assert.strictEqual(StudioState.year, 1931);
assert.strictEqual(StudioState.rp, rpBefore + 25, "1931 event must grant +25 RP");

// Test 1948: Marshall Plan (One-time $1,000 cash grant)
StudioState.year = 1947;
StudioState.week = 48;
const cashBefore48 = StudioState.cash;
const weeklyPayroll = StudioState.staff.reduce((acc, emp) => acc + Math.round(emp.salary / 4), 0);
tickWeek();
assert.strictEqual(StudioState.year, 1948);
assert.strictEqual(StudioState.cash, cashBefore48 + 1000 - weeklyPayroll, "1948 event grants 1000 cash minus weekly payroll");

console.log("=== TEST 19: Timeline Feature Unlocks Progression ===");
assert.strictEqual(Object.keys(FEATURE_UNLOCKS).length, 18, "Must have 18 progression features");
assert.strictEqual(isFeatureUnlocked("soundtrack_label", 1930), false);
assert.strictEqual(isFeatureUnlocked("soundtrack_label", 1985), true);
assert.strictEqual(isFeatureUnlocked("soundcon", 1994), false);
assert.strictEqual(isFeatureUnlocked("soundcon", 1995), true);
assert.strictEqual(isFeatureUnlocked("vr_headset", 2016), true);
assert.strictEqual(isFeatureUnlocked("metaverse", 2018), true);

console.log("=== TEST 20: AriaLiveQueue Serialization & Accessibility ===");
assert.ok(global.ariaLiveQueue, "ariaLiveQueue instance should exist");
let queuedCount = 0;
global.ariaLiveQueue.announce("Test message 1", "polite");
global.ariaLiveQueue.announce("⚠️ Urgent interruption 2", "assertive");
assert.ok(true, "AriaLiveQueue handles polite and assertive announcements cleanly without crashing");

console.log("=== TEST 21: Era Boundaries Clamping ===");
const eraPast = getCurrentEra(1850);
assert.strictEqual(eraPast.name_de, "Pionier-Ära (Mechanik & Röhren)", "Years before 1930 clamp to Pioneer Era");
const eraFuture = getCurrentEra(2050);
assert.strictEqual(eraFuture.name_de, "Cloud, VR & KI-Moderne", "Years after 2026 clamp to modern AI era");

console.log("=== TEST 22: Dynamic Theme & Genre Selection with Historical Synergy ===");
StudioState.year = 1935;
StudioState.unlockedTopics = getAvailableTopics(1935).map(t => t.name);
openDevModal();
const themeSelect = document.getElementById('select-theme');
const genreSelect = document.getElementById('select-genre');
assert.ok(themeSelect.innerHTML.includes('Abakus'), "select-theme must contain unlocked historical topics");
assert.ok(genreSelect.innerHTML.includes('Action'), "select-genre must contain unlocked genres");

// Test historical topic synergy in development
StudioState.cash = 100000;
themeSelect.value = "Abakus";
genreSelect.value = "Puzzle";
startDevelopment();
assert.strictEqual(StudioState.activeProject.theme, "Abakus");
StudioState.activeProject.progress = 100;
finishDevelopment();
const abakusGame = StudioState.releasedGames[0];
assert.strictEqual(abakusGame.theme, "Abakus");
assert.strictEqual(abakusGame.genre, "Puzzle");
assert.ok(abakusGame.score >= 70, "Abakus + Puzzle historical synergy should boost score");

console.log("=== TEST 23: Historical Event Effects Coverage ===");
// Test salary_increase (1968)
const salaryBefore = StudioState.salaryMultiplier || 1.0;
StudioState.year = 1967;
StudioState.week = 48;
tickWeek();
assert.strictEqual(StudioState.year, 1968);
assert(StudioState.salaryMultiplier > salaryBefore, "1968 event must increase salaryMultiplier");

// Test server_costs (1997)
StudioState.year = 1996;
StudioState.week = 48;
tickWeek();
assert.strictEqual(StudioState.year, 1997);
assert(StudioState.serverCosts > 0, "1997 event must establish serverCosts");

// Test medium_upgrade (1994)
StudioState.year = 1993;
StudioState.week = 48;
const salesBefore94 = StudioState.salesMultiplier;
tickWeek();
assert.strictEqual(StudioState.year, 1994);
assert.strictEqual(StudioState.salesMultiplier, salesBefore94 * 1.25, "1994 event must boost salesMultiplier by 1.25");

console.log("=== TEST 24: Year 2026 Game End & Endless Mode Transition ===");
StudioState.year = 2025;
StudioState.week = 48;
StudioState.isGameOver = false;
StudioState.endlessMode = false;
tickWeek();
assert.strictEqual(StudioState.year, 2026);
assert.strictEqual(StudioState.isGameOver, true, "2026 year transition must set isGameOver to true");

// tickWeek should now pause and NOT advance time
const week2026 = StudioState.week;
tickWeek();
assert.strictEqual(StudioState.week, week2026, "Time must NOT advance when isGameOver is true and endlessMode is false");

// Activate Endless Mode
continueEndlessMode();
assert.strictEqual(StudioState.endlessMode, true, "Endless mode must be active");
tickWeek();
assert.strictEqual(StudioState.week, week2026 + 1, "Time must advance once endlessMode is enabled");

console.log("=== TEST 25: German i18n Zero Mojibake Verification ===");
const deTranslations = fs.readFileSync('www/js/i18n.js', 'utf8');
assert(!deTranslations.includes('Ã¼'), "No 'Ã¼' mojibake allowed");
assert(!deTranslations.includes('Ã¶'), "No 'Ã¶' mojibake allowed");
assert(!deTranslations.includes('Ã¤'), "No 'Ã¤' mojibake allowed");
assert(!deTranslations.includes('ÃŸ'), "No 'ÃŸ' mojibake allowed");
assert.strictEqual(t("event_1934").includes("für"), true, "event_1934 must contain proper 'für'");
assert.strictEqual(t("event_1951").includes("Großrechner"), true, "event_1951 must contain proper 'Großrechner'");
assert.strictEqual(t("event_1973").includes("Ölkrise"), true, "event_1973 must contain proper 'Ölkrise'");

console.log("=== TEST 26: Contract Work System (Safe Early Income & Deadline Handling) ===");
Object.assign(StudioState, createDefaultState(1930));
StudioState.cash = 10000;
assert.strictEqual(acceptContract('jingle_radio'), true, "Should accept jingle_radio contract");
assert.ok(StudioState.activeContract, "activeContract must be populated");
assert.strictEqual(acceptContract('foley_drama'), false, "Cannot accept a second contract while one is active");
for (let i = 0; i < 3; i++) {
  tickWeek();
}
assert.strictEqual(StudioState.activeContract, null, "Contract should complete within 3 weeks");
assert(StudioState.cash > 12000, "Cash must increase from completed contract reward");

console.log("=== TEST 27: Studio Office Upgrades & Staff Training / Capacity Gating ===");
StudioState.cash = 100000;
StudioState.officeLevel = 0;
while (StudioState.staff.length < 4) {
  hireNewCandidate('coder');
}
assert.strictEqual(StudioState.staff.length, 4);
assert.strictEqual(hireNewCandidate('sound'), false, "Garage office (level 0) must cap staff at 4");
assert.strictEqual(upgradeStudioOffice(), true, "Should upgrade to Small Recording Studio (level 1)");
assert.strictEqual(StudioState.officeLevel, 1);
assert.strictEqual(hireNewCandidate('sound'), true, "Upgraded studio (level 1) allows up to 6 staff");
const prevSkill = StudioState.staff[0].skill;
assert.strictEqual(trainStaffMember(StudioState.staff[0].id), true, "Should train staff member");
assert.strictEqual(StudioState.staff[0].skill, prevSkill + 1, "Training must increase staff skill by 1");

console.log("=== TEST 28: Pre-Release QA Polish, Live Audio Boost & Dual-Slider Genre Synergy ===");
StudioState.cash = 50000;
StudioState.activeProject = {
  title: 'Detective Noir',
  theme: 'Detektiv',
  genre: 'Puzzle',
  engineId: 'engine_basic_1',
  gameplay: 85,
  sound: 65,
  platform: 'Hand-Abakus',
  platformMarketMulti: 1.0,
  assignedStaffIds: [StudioState.staff[0].id],
  progress: 90,
  features: 45,
  audioPts: 65,
  bugs: 6,
  polishPasses: 0,
  decisionMade: false,
  qualityBoost: 0,
  sequelNumber: 1
};
assert.strictEqual(polishActiveProject(), true, "QA Polish pass should succeed");
assert.strictEqual(StudioState.activeProject.bugs, 2, "QA Polish must remove up to 4 bugs");
assert.strictEqual(boostActiveProjectAudio(), true, "Live Audio Session boost should succeed once");
assert.strictEqual(boostActiveProjectAudio(), false, "Duplicate Live Audio Session on same project must be blocked");
assert.strictEqual(polishActiveProject(), true, "Second QA Polish pass removes remaining 2 bugs");
assert.strictEqual(StudioState.activeProject.bugs, 0);

console.log("=== TEST 29: Post-Release Lifecycle (Post-Mortem Report, Patch & Addon/DLC Caps) ===");
StudioState.activeProject.bugs = 3; // Leave 3 bugs to test post-release patch
finishDevelopment();
const relGame = StudioState.releasedGames[0];
assert.strictEqual(relGame.title, 'Detective Noir');
assert.strictEqual(relGame.bugs, 3);
const rpBeforePostMortem = StudioState.rp;
assert.strictEqual(analyzePostMortem(relGame.id), true, "First Post-Mortem analysis should succeed");
assert.strictEqual(StudioState.rp, rpBeforePostMortem + 10, "Post-Mortem must award +10 RP");
assert.strictEqual(analyzePostMortem(relGame.id), false, "Duplicate Post-Mortem on same game must fail");

assert.strictEqual(releaseGamePatch(relGame.id), true, "Patch should fix bugs on released game");
assert.strictEqual(relGame.bugs, 0);
assert.strictEqual(releaseGamePatch(relGame.id), false, "Second patch when bugs == 0 must fail");

assert.strictEqual(releaseGameDLC(relGame.id), true, "1st DLC should succeed");
assert.strictEqual(releaseGameDLC(relGame.id), true, "2nd DLC should succeed");
assert.strictEqual(relGame.dlcCount, 2);
assert.strictEqual(releaseGameDLC(relGame.id), false, "3rd DLC must be blocked (max 2 DLCs per game)");

console.log("=== TEST 30: Accessible Time & Speed Controls ===");
StudioState.isPaused = false;
assert.strictEqual(togglePause(), true, "togglePause should pause simulation");
assert.strictEqual(setGameSpeed(2), 2, "setGameSpeed(2) should set speed to 2x and unpause");
assert.strictEqual(StudioState.isPaused, false);
if (StudioState.timerInterval) {
  clearInterval(StudioState.timerInterval);
  StudioState.timerInterval = null;
}

console.log("=== TEST 31: Sequel Auto-Naming, Engine Upgrade vs Fatigue & QA Polish Cap ===");
StudioState.cash = 200000;
const origForSeq = StudioState.releasedGames[0];
origForSeq.title = "Symphonie der Nacht";
origForSeq.sequelNumber = 1;
origForSeq.engineId = "engine_basic_1";
document.getElementById('input-game-name').value = ""; // Blank input -> auto sequel title
document.getElementById('select-sequel').value = String(origForSeq.id);
document.getElementById('select-engine').value = "engine_basic_1"; // Same engine -> franchise fatigue (-4)
startDevelopment();
assert.strictEqual(StudioState.activeProject.title, "Symphonie der Nacht 2", "Blank input on sequel must auto-name '<orig.title> 2'");
assert.strictEqual(StudioState.activeProject.qualityBoost, -4, "Reusing identical engine on sequel must apply -4 franchise fatigue");

// Test QA Polish cap at 3 passes (+9 qualityBoost max even if new bugs appear)
StudioState.activeProject.bugs = 20;
assert.strictEqual(polishActiveProject(), true); // pass 1 (-4 -> -1)
assert.strictEqual(polishActiveProject(), true); // pass 2 (-1 -> +2)
assert.strictEqual(polishActiveProject(), true); // pass 3 (+2 -> +5)
assert.strictEqual(StudioState.activeProject.polishPasses, 3);
assert.strictEqual(StudioState.activeProject.qualityBoost, 5);
// 4th pass with remaining bugs fixes bugs but does NOT increase qualityBoost beyond 3 passes
assert.strictEqual(polishActiveProject(), true);
assert.strictEqual(StudioState.activeProject.polishPasses, 3, "polishPasses must cap at 3");
assert.strictEqual(StudioState.activeProject.qualityBoost, 5, "qualityBoost must not stack infinitely past 3 QA passes");

console.log("=== TEST 32: Mid-Development Save/Load DOM Restoration & English Localization ===");
assert.strictEqual(boostActiveProjectAudio(), true);
assert.strictEqual(StudioState.activeProject.decisionMade, true);
saveGame();
// Simulate fresh page state before loadGame()
document.getElementById('active-project-card').style.display = 'none';
document.getElementById('dev-game-title').textContent = 'Placeholder';
document.getElementById('btn-boost-dev').style.display = 'inline-block';
loadGame();
assert.strictEqual(document.getElementById('active-project-card').style.display, 'flex', "loadGame must restore active-project-card visibility");
assert.strictEqual(document.getElementById('dev-game-title').textContent, 'Symphonie der Nacht 2', "loadGame must restore active project title in DOM");
assert.strictEqual(document.getElementById('btn-boost-dev').style.display, 'none', "loadGame must keep boost button hidden when decisionMade is true");

// Switch language to English and verify HUD/active-dev buttons localize
StudioState.language = 'de';
toggleLanguage();
assert.strictEqual(StudioState.language, 'en');
assert.ok(document.getElementById('btn-time-next').textContent.includes('Week'), "Next week button must localize to English");
assert.ok(document.getElementById('btn-polish-dev').textContent.includes('Polish'), "QA Polish button must localize to English");
toggleLanguage(); // back to 'de'
StudioState.activeProject = null;

function resetTestState(year = 1930, lang = 'de') {
  if (StudioState.timerInterval) {
    clearInterval(StudioState.timerInterval);
    StudioState.timerInterval = null;
  }
  Object.assign(StudioState, createDefaultState(year));
  StudioState.year = year;
  StudioState.language = lang;
  StudioState.isPaused = true;
}

console.log("=== TEST 33: All 14 Research Technologies (1930-2024), Pre-1980 Availability & Sorted UI ===");
resetTestState(1930, 'de');
assert.strictEqual(RESEARCH_CATALOG.length, 14, "RESEARCH_CATALOG must contain exactly 14 technologies");
const expectedTechYears = {
  acoustic_isolation: 1930,
  magnetic_tape: 1938,
  vinyl_mastering: 1948,
  stereo_panning: 1958,
  moog_modular: 1968,
  pcm_digital: 1975,
  chiptune: 1980,
  polyphonic: 1982,
  dsp_effects: 1985,
  surround_51: 1992,
  binaural_3d: 2000,
  ai_composition: 2015,
  raytracing_audio: 2020,
  neural_acoustics: 2024
};
Object.entries(expectedTechYears).forEach(([id, expectedYear]) => {
  const entry = RESEARCH_CATALOG.find(item => item.id === id);
  assert.ok(entry, `Missing research tech ${id}`);
  assert.strictEqual(entry.year, expectedYear, `${id} must unlock in ${expectedYear}`);
  assert.ok(entry.name && entry.name_en, `${id} must have DE and EN names`);
  assert.ok(entry.desc && entry.desc_en, `${id} must have DE and EN descriptions`);
});

StudioState.rp = 1000;
StudioState.year = 1930;
assert.strictEqual(doResearch('acoustic_isolation'), true, "acoustic_isolation (1930) must be available in 1930");
assert.strictEqual(doResearch('acoustic_isolation'), false, "Duplicate research of acoustic_isolation must fail");
assert.strictEqual(doResearch('magnetic_tape'), false, "magnetic_tape (1938) must be locked in 1930");
assert.strictEqual(StudioState.rp, 990, "Locked research must not spend RP");

const pre1980Checks = [
  ['magnetic_tape', 1938],
  ['vinyl_mastering', 1948],
  ['stereo_panning', 1958],
  ['moog_modular', 1968],
  ['pcm_digital', 1975]
];
pre1980Checks.forEach(([id, unlockYr]) => {
  StudioState.year = unlockYr - 1;
  assert.strictEqual(doResearch(id), false, `${id} must be blocked at ${unlockYr - 1}`);
  StudioState.year = unlockYr;
  assert.strictEqual(doResearch(id), true, `${id} must succeed at ${unlockYr}`);
});

StudioState.year = 2023;
assert.strictEqual(doResearch('neural_acoustics'), false, "neural_acoustics (2024) must be blocked in 2023");
StudioState.year = 2024;
assert.strictEqual(doResearch('neural_acoustics'), true, "neural_acoustics (2024) must succeed in 2024");

renderResearchList();
const researchContainer = document.getElementById('research-items-list');
assert.strictEqual(researchContainer.children.length, 14, "renderResearchList must render all 14 technologies");
assert.ok(researchContainer.children[0].innerHTML.includes('1930'), "First rendered research item must be 1930");
assert.ok(researchContainer.children[13].innerHTML.includes('2024'), "Last rendered research item must be 2024");

console.log("=== TEST 34: Research Effects in Development & OST Label Royalties ===");
const origRand34 = Math.random;
try {
  Math.random = () => 0.5;
  // Compare baseline project vs. pre-1980 + modern audio tech effects
  resetTestState(1978, 'de');
  const baseProj = {
    title: "Baseline Sound",
    theme: "Fantasy",
    genre: "Action",
    engineId: "engine_basic_1",
    platform: "Atari 2600",
    platformMarketMulti: 7.0,
    gameplay: 80,
    sound: 75,
    assignedStaffIds: [StudioState.staff[0].id],
    progress: 0,
    features: 0,
    audioPts: 0,
    bugs: 0
  };
  StudioState.activeProject = { ...baseProj };
  tickProjectProgress();
  const baseAudioAfter1Tick = StudioState.activeProject.audioPts;
  const baseProgressAfter1Tick = StudioState.activeProject.progress;

  resetTestState(2024, 'de');
  StudioState.unlockedTech = ['acoustic_isolation', 'magnetic_tape', 'vinyl_mastering', 'stereo_panning', 'pcm_digital', 'ai_composition'];
  StudioState.activeProject = { ...baseProj };
  tickProjectProgress();
  assert(StudioState.activeProject.audioPts > baseAudioAfter1Tick, "Pre-1980 flatAudio & audioPct techs must boost tick audioPts");
  assert(StudioState.activeProject.progress > baseProgressAfter1Tick, "ai_composition speedBoost (0.25) must accelerate weekly progress");

  // Verify bugReduction (magnetic_tape 0.10, pcm_digital 0.15, dsp_effects 0.20) & theme-scoped chiptune
  Math.random = () => 0.3; // < 0.35 base bugChance, > 0.35 * 0.90 * 0.85 * 0.80 (0.2142)
  resetTestState(1985, 'de');
  StudioState.activeProject = { ...baseProj, theme: "Retro" };
  tickProjectProgress();
  const bugsWithoutTech = StudioState.activeProject.bugs;

  resetTestState(1985, 'de');
  StudioState.unlockedTech = ['magnetic_tape', 'pcm_digital', 'dsp_effects', 'chiptune'];
  StudioState.activeProject = { ...baseProj, theme: "Retro" };
  tickProjectProgress();
  assert(bugsWithoutTech > 0, "With random=0.3 and no bugReduction tech, base bugChance (0.35) must trigger bugs");
  assert.strictEqual(StudioState.activeProject.bugs, 0, "bugReduction techs must drop bugChance below 0.3");
  const retroAudioWithChiptune = StudioState.activeProject.audioPts;

  resetTestState(1985, 'de');
  StudioState.unlockedTech = ['magnetic_tape', 'pcm_digital', 'dsp_effects', 'chiptune'];
  StudioState.activeProject = { ...baseProj, theme: "Fantasy" };
  tickProjectProgress();
  assert(retroAudioWithChiptune > StudioState.activeProject.audioPts, "chiptune must boost Retro theme audioPts more than Fantasy");
  Math.random = () => 0.5;

  // Verify finishDevelopment score/fan boosts from moog_modular, surround_51 (genre Action), binaural_3d, raytracing_audio, neural_acoustics
  const scoreTestProj = {
    ...baseProj,
    gameplay: 40,
    sound: 40,
    progress: 100,
    features: 20,
    audioPts: 30,
    bugs: 3
  };
  resetTestState(2024, 'de');
  StudioState.activeProject = { ...scoreTestProj };
  finishDevelopment();
  const noTechGame = StudioState.releasedGames[0];

  resetTestState(2024, 'de');
  StudioState.unlockedTech = ['moog_modular', 'surround_51', 'binaural_3d', 'raytracing_audio', 'neural_acoustics'];
  StudioState.activeProject = { ...scoreTestProj };
  const fansBeforeBinaural = StudioState.fans;
  finishDevelopment();
  const techBoostedGame = StudioState.releasedGames[0];
  assert(noTechGame.score < 90, `Baseline score (${noTechGame.score}) should leave headroom below 99`);
  assert(techBoostedGame.score > noTechGame.score, `moog_modular + surround_51 + raytracing_audio + neural_acoustics must raise score (${techBoostedGame.score} > ${noTechGame.score})`);
  assert(StudioState.fans - fansBeforeBinaural > noTechGame.score * 18, "binaural_3d fanMultiplier (1.5x) must boost earned fans");
} finally {
  Math.random = origRand34;
}

// Verify OST labelRoyaltyPct (vinyl_mastering +15%, ai_composition +35%) in getLabelRoyaltyMultiplier & tickWeek
resetTestState(1986, 'de');
assert.strictEqual(getLabelRoyaltyMultiplier(), 1.0, "Base OST royalty multiplier without tech must be 1.0");
StudioState.unlockedTech = ['vinyl_mastering'];
assert.strictEqual(getLabelRoyaltyMultiplier(), 1.15, "vinyl_mastering must grant +15% OST royalties (1.15x)");
StudioState.unlockedTech = ['vinyl_mastering', 'ai_composition'];
assert.strictEqual(getLabelRoyaltyMultiplier(), 1.50, "vinyl_mastering + ai_composition must grant +50% OST royalties (1.50x)");

StudioState.cash = 10000;
StudioState.staff = []; // isolate OST payout without payroll noise
StudioState.soundtrackLabel = [{ id: 99, title: "Test OST", revenuePerWeek: 1000, totalRevenue: 0 }];
tickWeek();
assert.strictEqual(StudioState.cash, 11500, "tickWeek must pay 1,500 EUR (1,000 * 1.50) OST royalty in 1986");
assert.strictEqual(StudioState.soundtrackLabel[0].totalRevenue, 1500);

console.log("=== TEST 35: Target Audience Compatibility & Review Score / Sales Impact ===");
assert.strictEqual(AUDIENCE_CATALOG.length, 3, "AUDIENCE_CATALOG must define 3 target audiences");
assert.strictEqual(getAudienceCompatibility('Horror', 'Action', 'hardcore'), 3, "Horror + Action + hardcore must be 3 (perfect)");
assert.strictEqual(getAudienceCompatibility('Horror', 'Action', 'everyone'), 1, "Horror + Action + everyone must be 1 (mismatch)");
assert.strictEqual(getAudienceCompatibility('Abakus', 'Puzzle', 'everyone'), 3, "Abakus + Puzzle + everyone must be 3 (perfect)");
assert.strictEqual(getAudienceCompatibility('Abakus', 'Puzzle', 'youth'), 1, "Abakus + Puzzle + youth must be 1 (mismatch)");
assert.strictEqual(getAudienceCompatibility('Cyberpunk', 'Action', 'youth'), 3, "Cyberpunk + Action + youth must be 3 (perfect)");
assert.strictEqual(getAudienceCompatibility('Fantasy', 'Casual', 'hardcore'), 1, "Casual genre + hardcore must be 1 (mismatch)");
assert.strictEqual(getAudienceCompatibility('Medieval', 'Simulation', 'youth'), 2, "Medieval + Simulation + youth must be 2 (neutral)");
assert.strictEqual(getAudienceCompatibility('Fantasy', 'RPG', 'everyone'), 2, "Fantasy + RPG + everyone must be 2 (neutral)");

const origRand35 = Math.random;
try {
  Math.random = () => 0.5;
  resetTestState(1980, 'de');
  StudioState.activeProject = {
    title: "Dark Resonance",
    theme: "Horror",
    genre: "Action",
    audience: "hardcore",
    publisherId: "self_pub",
    engineId: "engine_basic_1",
    platform: "C64",
    platformMarketMulti: 7.5,
    gameplay: 50,
    sound: 50,
    assignedStaffIds: [1],
    progress: 100,
    features: 20,
    audioPts: 30,
    bugs: 2
  };
  finishDevelopment();
  const hardcoreHorror = StudioState.releasedGames[0];
  assert.strictEqual(analyzePostMortem(hardcoreHorror.id), true);
  assert.ok(hardcoreHorror.postMortemReport.includes('Zielgruppe'), "Post-Mortem report in DE must include audience feedback");

  resetTestState(1980, 'de');
  StudioState.activeProject = {
    title: "Family Horror",
    theme: "Horror",
    genre: "Action",
    audience: "everyone",
    publisherId: "self_pub",
    engineId: "engine_basic_1",
    platform: "C64",
    platformMarketMulti: 7.5,
    gameplay: 50,
    sound: 50,
    assignedStaffIds: [1],
    progress: 100,
    features: 20,
    audioPts: 30,
    bugs: 2
  };
  finishDevelopment();
  const everyoneHorror = StudioState.releasedGames[0];

  assert.strictEqual(hardcoreHorror.audienceCompatibility, 3);
  assert.strictEqual(everyoneHorror.audienceCompatibility, 1);
  assert.strictEqual(hardcoreHorror.score - everyoneHorror.score, 9, "Perfect fit (+4) vs mismatch (-5) must produce +9 score spread");
  assert(hardcoreHorror.sales > everyoneHorror.sales * 1.4, "1.15x sales + higher score must clearly outsell 0.75x mismatch");
} finally {
  Math.random = origRand35;
}

console.log("=== TEST 36: Publisher Contracts (Advance Rescue, Reach, Royalty Cut & MinScore Bonus/Penalty) ===");
assert.strictEqual(PUBLISHERS_CATALOG.length, 5, "PUBLISHERS_CATALOG must contain self_pub + 4 publishers");
resetTestState(1930, 'de');
StudioState.cash = 1000; // Not enough for 5000 base + 10000 Hand-Abakus license = 15000
document.getElementById('select-platform').value = "Hand-Abakus";
document.getElementById('select-audience').value = "everyone";
document.getElementById('select-publisher').value = "self_pub";
assert.strictEqual(startDevelopment(), false, "Self-published start with 1,000 EUR for 15,000 EUR cost must be rejected");
assert.strictEqual(StudioState.cash, 1000);

// Rescued by Polyphonie advance (22,000 EUR >= 15,000 EUR totalCost -> netCost = 0)
document.getElementById('select-publisher').value = "polyphonie";
assert.strictEqual(startDevelopment(), true, "Publisher advance (22,000 EUR) must rescue tight cash (1,000 EUR)");
assert.strictEqual(StudioState.cash, 8000, "Cash must equal 1000 - 15000 + 22000 = 8000");
assert.strictEqual(StudioState.activeProject.publisherId, "polyphonie");

const origRand36 = Math.random;
try {
  Math.random = () => 0.5;
  // Compare self_pub vs omnimedia (2.15x reach, 40% royaltyCut, minScore 85) when goal IS met
  resetTestState(1980, 'de');
  StudioState.unlockedTech = ['raytracing_audio', 'neural_acoustics']; // guarantee score >= 85
  StudioState.activeProject = {
    title: "Indie Baseline",
    theme: "Fantasy",
    genre: "RPG",
    audience: "hardcore",
    publisherId: "self_pub",
    engineId: "engine_basic_1",
    platform: "C64",
    platformMarketMulti: 7.5,
    gameplay: 55,
    sound: 80,
    assignedStaffIds: [1],
    progress: 100,
    features: 60,
    audioPts: 140,
    bugs: 0
  };
  finishDevelopment();
  const selfGame = StudioState.releasedGames[0];

  resetTestState(1980, 'de');
  StudioState.unlockedTech = ['raytracing_audio', 'neural_acoustics'];
  const fansBeforeOmniWin = StudioState.fans;
  StudioState.activeProject = {
    title: "Omni Hit",
    theme: "Fantasy",
    genre: "RPG",
    audience: "hardcore",
    publisherId: "omnimedia",
    engineId: "engine_basic_1",
    platform: "C64",
    platformMarketMulti: 7.5,
    gameplay: 55,
    sound: 80,
    assignedStaffIds: [1],
    progress: 100,
    features: 60,
    audioPts: 140,
    bugs: 0
  };
  finishDevelopment();
  const omniWinGame = StudioState.releasedGames[0];
  assert(omniWinGame.score >= 85, "Omni Hit must meet minScore 85");
  assert.strictEqual(omniWinGame.publisherGoalMet, true, "Publisher minScore goal must be marked met");
  assert(omniWinGame.sales > selfGame.sales * 2.0, "OmniMedia 2.15x reachMulti must more than double sales");
  const expectedOmniNet = Math.round(omniWinGame.sales * 2.2) - Math.round(Math.round(omniWinGame.sales * 2.2) * 0.40);
  assert.strictEqual(omniWinGame.revenue, expectedOmniNet, "OmniMedia 40% royaltyCut must be deducted from gross revenue");
  assert.strictEqual(StudioState.fans, fansBeforeOmniWin + Math.round(omniWinGame.score * 18) + 300, "Meeting publisher minScore must grant +300 bonus fans");

  // Case where minScore (85) is MISSED -> -100 fan penalty
  resetTestState(1980, 'de');
  StudioState.fans = 500;
  StudioState.activeProject = {
    title: "Omni Flop",
    theme: "Horror",
    genre: "Casual",
    audience: "everyone",
    publisherId: "omnimedia",
    engineId: "engine_basic_1",
    platform: "C64",
    platformMarketMulti: 7.5,
    gameplay: 0,
    sound: 20,
    assignedStaffIds: [1],
    progress: 100,
    features: 5,
    audioPts: 10,
    bugs: 12
  };
  finishDevelopment();
  const omniFlopGame = StudioState.releasedGames[0];
  assert(omniFlopGame.score < 85, "Buggy mismatched project must fall below minScore 85");
  assert.strictEqual(omniFlopGame.publisherGoalMet, false, "Missed publisher minScore must mark publisherGoalMet false");
  assert.strictEqual(StudioState.fans, 500 + Math.round(omniFlopGame.score * 18) - 100, "Missing publisher minScore must deduct 100 fans");
} finally {
  Math.random = origRand36;
}
document.getElementById('select-publisher').value = "self_pub";
document.getElementById('select-audience').value = "everyone";

console.log("=== TEST 37: Custom Engine Third-Party Licensing & Passive Weekly Royalties ===");
resetTestState(1985, 'de');
StudioState.cash = 100000;
StudioState.staff = [];
global.prompt = (_msg, defVal) => defVal; // Use era default engine name
buildNewEngine();
const builtEng = StudioState.customEngines[StudioState.customEngines.length - 1];
assert.ok(builtEng.name.includes('Chiptune-Synth Engine'), "1985 engine default name must match Chiptune-Synth era");
assert.strictEqual(builtEng.createdYear, 1985);
assert.strictEqual(builtEng.licensedOut, false);
assert.strictEqual(builtEng.totalRoyalties, 0);

assert.strictEqual(toggleEngineLicense('nonexistent_engine'), false, "Unknown engine ID must return false");
assert.strictEqual(toggleEngineLicense(builtEng.id), true, "Toggling engine license ON must return true");
assert.strictEqual(builtEng.licensedOut, true);

const expectedWeeklyFee = 350 * builtEng.techBonus;
const cashBeforeLicenseTick = StudioState.cash;
tickWeek();
assert.strictEqual(builtEng.totalRoyalties, expectedWeeklyFee, "tickWeek must accumulate weekly engine royalties");
assert.strictEqual(StudioState.cash, cashBeforeLicenseTick + expectedWeeklyFee, "tickWeek must credit engine royalties to cash");

renderEngineList();
const engineListEl = document.getElementById('engine-list-display');
const licensedCardHtml = engineListEl.children.map(c => c.innerHTML).join('\n');
assert.ok(licensedCardHtml.includes('1985'), "Engine list must display built year 1985");
assert.ok(licensedCardHtml.includes('Lizenziert'), "Engine list must display Lizenziert badge when licensedOut is true");

updateBankModalUI();
const bankHtml = document.getElementById('bank-debt-info').innerHTML;
assert.ok(bankHtml.includes('bank-weekly-flow'), "Bank modal must include weekly financial flow summary");

assert.strictEqual(toggleEngineLicense(builtEng.id), false, "Toggling engine license OFF must return false");
tickWeek();
assert.strictEqual(builtEng.totalRoyalties, expectedWeeklyFee, "Unlicensed engine must stop earning royalties");

console.log("=== TEST 38: Vacation Blocks Staff Training ===");
resetTestState(1930, 'de');
StudioState.cash = 50000;
const staffMem = StudioState.staff[0];
const skillBeforeVac = staffMem.skill;
sendStaffVacation(staffMem.id);
assert.strictEqual(staffMem.onVacationWeeks, 4);
assert.strictEqual(trainStaffMember(staffMem.id), false, "trainStaffMember must return false while employee is on vacation");
assert.strictEqual(staffMem.skill, skillBeforeVac, "Skill must not change when training is blocked");
assert.strictEqual(StudioState.cash, 50000, "Cash must not be deducted when training is blocked");

renderStaffList();
const staffHtml = document.getElementById('current-staff-list').children.map(c => c.innerHTML).join('\n');
assert.ok(/<button[^>]*disabled[^>]*onclick="trainStaffMember/.test(staffHtml), "Train button must be disabled in UI while staff is on vacation");

for (let w = 0; w < 4; w++) tickWeek();
assert.strictEqual(staffMem.onVacationWeeks, 0);
assert.strictEqual(trainStaffMember(staffMem.id), true, "Training must succeed again once vacation ends");
assert.strictEqual(staffMem.skill, skillBeforeVac + 1);

console.log("=== TEST 39: Era-Gated Contracts (8 Contracts: 1930 vs 1972 vs 1985 vs 2000 vs 2016) ===");
assert.strictEqual(CONTRACTS_CATALOG.length, 8, "CONTRACTS_CATALOG must contain 8 contracts");
resetTestState(1930, 'de');
assert.strictEqual(getAvailableContracts(1930).length, 4, "1930 must unlock 4 starter contracts");
assert.strictEqual(getAvailableContracts(1971).length, 4, "1971 must still have 4 contracts");
assert.strictEqual(acceptContract('arcade_soundchip'), false, "arcade_soundchip (1972) must be rejected in 1930");
assert.strictEqual(StudioState.activeContract, null);
assert.strictEqual(renderContractsModal().length, 4);
assert.strictEqual(document.getElementById('contracts-list').children.length, 4, "Contracts modal in 1930 must display 4 contracts");

assert.strictEqual(getAvailableContracts(1972).length, 5, "1972 must unlock 5th contract (arcade_soundchip)");
assert.strictEqual(getAvailableContracts(1985).length, 6, "1985 must unlock 6th contract (cd_redbook_ost)");
assert.strictEqual(getAvailableContracts(2000).length, 7, "2000 must unlock 7th contract (surround_cinema_mix)");
assert.strictEqual(getAvailableContracts(2016).length, 8, "2016 must unlock all 8 contracts (vr_binaural_suite)");

StudioState.year = 2016;
assert.strictEqual(renderContractsModal().length, 8);
assert.strictEqual(document.getElementById('contracts-list').children.length, 8, "Contracts modal in 2016 must display 8 contracts");
assert.strictEqual(acceptContract('vr_binaural_suite'), true, "vr_binaural_suite must be acceptable in 2016");
assert.strictEqual(StudioState.activeContract.id, 'vr_binaural_suite');
assert.strictEqual(StudioState.activeContract.reward, 52000 * 2.5, "2016 contract must apply 2.5x era reward scaling");

console.log("=== TEST 40: Annual Best Audio Design Award (Goldenes Mikrofon: score >= 75 && audioPts >= 80) ===");
resetTestState(1980, 'de');
StudioState.staff = [];
StudioState.cash = 50000;
StudioState.fans = 1000;
// Game with score >= 75 but audioPts < 80 -> NO audio award
StudioState.releasedGames.push({ id: 1, title: "Low Audio Game", year: 1980, score: 82, audioPts: 65 });
StudioState.week = 48;
tickWeek(); // advances to 1981 week 1
assert.strictEqual(StudioState.year, 1981);
assert.strictEqual(StudioState.audioDesignAwards.length, 0, "Game with audioPts < 80 must not win Best Audio Award");
assert.strictEqual(StudioState.gotyAwards.length, 0, "Game with score < 85 must not win GOTY");

// Game with score = 78 (>= 75, < 85) and audioPts = 95 (>= 80) -> wins Best Audio ONLY (+15,000 cash, +800 fans)
StudioState.releasedGames.push({ id: 2, title: "Golden Ear Symphony", year: 1981, score: 78, audioPts: 95 });
const cashBeforeAudioAward = StudioState.cash;
const fansBeforeAudioAward = StudioState.fans;
StudioState.week = 48;
tickWeek(); // advances to 1982 week 1
assert.strictEqual(StudioState.year, 1982);
assert.strictEqual(StudioState.gotyAwards.length, 0, "Score 78 must not win GOTY");
assert.strictEqual(StudioState.audioDesignAwards.length, 1, "Score >= 75 and audioPts >= 80 must win Best Audio Award");
assert.strictEqual(StudioState.audioDesignAwards[0].title, "Golden Ear Symphony");
assert.strictEqual(StudioState.fans, fansBeforeAudioAward + 800, "Best Audio Award must grant +800 fans");
assert.strictEqual(StudioState.cash, cashBeforeAudioAward + 15000, "Best Audio Award must grant +15,000 EUR");

// Game with score = 92 (>= 85) and audioPts = 130 (>= 80) -> wins BOTH GOTY and Best Audio Award
StudioState.releasedGames.push({ id: 3, title: "Audio Magnum Opus", year: 1982, score: 92, audioPts: 130 });
StudioState.week = 48;
tickWeek(); // advances to 1983 week 1
assert.strictEqual(StudioState.gotyAwards.length, 1, "Score 92 must win GOTY");
assert.strictEqual(StudioState.audioDesignAwards.length, 2, "Score 92 & audioPts 130 must also win Best Audio Award");

console.log("=== TEST 41: Complete DE/EN Key Parity & Zero Mojibake Across i18n, Data & HTML ===");
const i18nSrc = fs.readFileSync('www/js/i18n.js', 'utf8');
const gameDataSrc = fs.readFileSync('www/js/game_data.js', 'utf8');
const htmlSrc = fs.readFileSync('www/index.html', 'utf8');
const mojibakePatterns = ['Ã¼', 'Ã¶', 'Ã¤', 'ÃŸ', 'Ãœ', 'Ã–', 'Ã„', '\uFFFD'];
[
  ['www/js/i18n.js', i18nSrc],
  ['www/js/game_data.js', gameDataSrc],
  ['www/index.html', htmlSrc]
].forEach(([fileLabel, content]) => {
  mojibakePatterns.forEach(pat => {
    assert.strictEqual(content.includes(pat), false, `Mojibake pattern "${pat}" found in ${fileLabel}`);
  });
});

const deKeys = Object.keys(TRANSLATIONS.de);
const enKeys = Object.keys(TRANSLATIONS.en);
const missingInEn = deKeys.filter(k => !Object.prototype.hasOwnProperty.call(TRANSLATIONS.en, k));
const missingInDe = enKeys.filter(k => !Object.prototype.hasOwnProperty.call(TRANSLATIONS.de, k));
assert.deepStrictEqual(missingInEn, [], `Keys missing in EN: ${missingInEn.join(', ')}`);
assert.deepStrictEqual(missingInDe, [], `Keys missing in DE: ${missingInDe.join(', ')}`);

const requiredNewKeys = [
  'audience_label', 'audience_everyone', 'audience_youth', 'audience_hardcore',
  'audience_fit_perfect', 'audience_fit_neutral', 'audience_fit_mismatch',
  'publisher_label', 'publisher_advance_short', 'publisher_royalty_short',
  'publisher_reach_short', 'publisher_min_score_short',
  'engine_license_btn', 'engine_unlicense_btn', 'engine_licensed_badge',
  'engine_year_label', 'engine_licensed_announced', 'engine_unlicensed_announced',
  'audio_award_name', 'audio_award_winner', 'best_audio_awards_label', 'goty_awards_label'
];
requiredNewKeys.forEach(key => {
  assert.ok(typeof TRANSLATIONS.de[key] === 'string' && TRANSLATIONS.de[key].length > 0, `DE key ${key} must be non-empty`);
  assert.ok(typeof TRANSLATIONS.en[key] === 'string' && TRANSLATIONS.en[key].length > 0, `EN key ${key} must be non-empty`);
});

console.log("=== TEST 42: Dev Modal UI Integration, Net Advance Cost & DE/EN Live Sync ===");
resetTestState(1980, 'de');
openDevModal();
const selAud = document.getElementById('select-audience');
const selPub = document.getElementById('select-publisher');
const selPlat = document.getElementById('select-platform');
const selTheme = document.getElementById('select-theme');
const selGenre = document.getElementById('select-genre');
assert.strictEqual(selAud.children.length, 3, "select-audience must populate 3 options");
assert.strictEqual(selPub.children.length, 5, "select-publisher must populate 5 options");

// Add Horror & Action if needed and select Horror + Action + hardcore + C64 (fee 0) + aetherwelle (advance 8000)
if (!StudioState.unlockedTopics.includes('Horror')) StudioState.unlockedTopics.push('Horror');
populateDevModalOptions();
selTheme.value = 'Horror';
selGenre.value = 'Action';
selAud.value = 'hardcore';
selPlat.value = 'C64';
selPub.value = 'aetherwelle';
updateDevSynergyPreview();

const previewDe = document.getElementById('dev-synergy-preview').textContent;
assert.ok(previewDe.includes('3/3'), "Horror + Action + Hardcore should show 3/3 combined synergy");
assert.ok(previewDe.includes('Hardcore-Gamer'), "DE preview must localize audience name");
const submitDeFree = document.getElementById('btn-submit-dev').textContent;
assert.ok(submitDeFree.includes('Vorschuss'), "DE submit button must show publisher advance");

// Verify Atari 2600 (70,000 fee + 5,000 base = 75,000) minus aetherwelle 8,000 advance = 67,000 net cost
selPlat.value = 'Atari 2600';
updateDevSynergyPreview();
const submitDePaid = document.getElementById('btn-submit-dev').textContent;
assert.ok(submitDePaid.includes('67.000'), "DE submit button must reflect net cost 67.000 EUR after 8.000 advance");

// Switch to English and check live UI sync
toggleLanguage();
assert.strictEqual(StudioState.language, 'en');
assert.ok(selAud.innerHTML.includes('Hardcore Gamers'), "Audience options must localize to EN on toggleLanguage()");
assert.ok(document.getElementById('dev-synergy-preview').textContent.includes('Hardcore Gamers'), "Synergy preview must sync to EN");
assert.ok(document.getElementById('btn-submit-dev').textContent.includes('Advance'), "Submit button must sync to EN");
assert.ok(document.getElementById('hud-era').textContent.includes('8-Bit & Home Computer Boom'), "HUD era must sync to EN");
assert.ok(document.getElementById('timeline-current-era-text').textContent.includes('8-Bit & Home Computer Boom'), "Timeline era text must sync to EN");
toggleLanguage(); // back to 'de'
closeDevModal();

console.log("=== TEST 43: HTML DOM Structure & TalkBack Accessibility Contract ===");
const idxAud = htmlSrc.indexOf('id="select-audience"');
const idxPub = htmlSrc.indexOf('id="select-publisher"');
const idxSeq = htmlSrc.indexOf('id="select-sequel"');
assert(idxAud > 0 && idxPub > 0 && idxSeq > 0, "index.html must contain select-audience, select-publisher, and select-sequel");
assert(idxAud < idxSeq && idxPub < idxSeq, "select-audience and select-publisher must appear before select-sequel in #modal-dev");
assert.ok(htmlSrc.includes('for="select-audience"') && htmlSrc.includes('for="select-publisher"'), "New selects must have matching labels");
assert.ok(htmlSrc.includes('id="dev-synergy-preview"') && htmlSrc.includes('aria-live="polite"'), "Live regions must have aria-live='polite'");
assert.ok(htmlSrc.includes('id="sr-announcer"') && htmlSrc.includes('id="sr-polite"'), "Screenreader live regions must be present");

const collectMockHtml = (el) => {
  if (!el) return '';
  const own = (el.innerHTML || '') + (el.textContent || '');
  const kids = Array.isArray(el.children) ? el.children.map(collectMockHtml).join('\n') : '';
  return own + '\n' + kids;
};

console.log("=== TEST 44: Remaster Projects (Cost, 35% Boost, Completion & UI Button Hiding) ===");
resetTestState(1985, 'de');
StudioState.releasedGames = [
  {
    id: 1001,
    title: "Wave Pioneer",
    theme: "Sci-Fi",
    genre: "RPG",
    audience: "hardcore",
    engineId: "engine_basic_1",
    platform: "Hand-Abakus",
    score: 74,
    audioPts: 80,
    bugs: 0,
    sales: 12000,
    revenue: 26400,
    dlcCount: 0,
    year: 1978,
    isRemaster: false,
    remastered: false
  }
];

StudioState.cash = 2000;
assert.strictEqual(startRemasterProject(1001), false, "Remaster start must fail with cash < 2,500 EUR");
assert.strictEqual(StudioState.activeProject, null);

StudioState.cash = 50000;
assert.strictEqual(startRemasterProject(1001), true, "Remaster start must succeed with cash >= 2,500 EUR");
assert.strictEqual(StudioState.cash, 47500, "Remaster must deduct 2,500 EUR upfront");
assert.ok(StudioState.activeProject, "activeProject must be created for Remaster");
assert.strictEqual(StudioState.activeProject.title, "Wave Pioneer Remastered");
assert.strictEqual(StudioState.activeProject.progress, 35, "Remaster must start at 35% progress");
assert.strictEqual(StudioState.activeProject.qualityBoost, 5, "Remaster must apply +5 qualityBoost");
assert.strictEqual(StudioState.activeProject.isRemaster, true);
assert.strictEqual(String(StudioState.activeProject.remasteredFromId), "1001");
assert.strictEqual(StudioState.activeProject.features, Math.round(80 * 0.25));
assert.strictEqual(StudioState.activeProject.audioPts, Math.round(80 * 0.35));
assert.notStrictEqual(StudioState.activeProject.platform, "Hand-Abakus", "Remaster in 1985 must pick a modern active platform");
assert.strictEqual(startRemasterProject(1001), false, "Concurrent remaster while activeProject is running must fail");

const origRand44 = Math.random;
try {
  Math.random = () => 0.5;
  StudioState.activeProject.progress = 100;
  finishDevelopment();
} finally {
  Math.random = origRand44;
}

const origAfter44 = StudioState.releasedGames.find(g => String(g.id) === "1001");
const remAfter44 = StudioState.releasedGames.find(g => g.title === "Wave Pioneer Remastered");
assert.strictEqual(StudioState.releasedGames.length, 2, "Finished remaster must be added to releasedGames");
assert.ok(origAfter44 && origAfter44.remastered === true, "Original game must be flagged remastered = true");
assert.ok(remAfter44 && remAfter44.isRemaster === true, "Remastered release must be flagged isRemaster = true");
assert.strictEqual(String(remAfter44.remasteredFromId), "1001");
assert.strictEqual(startRemasterProject(1001), false, "Already-remastered game cannot be remastered twice");
assert.strictEqual(startRemasterProject(remAfter44.id), false, "A Remaster release cannot be remastered again");

// Verify UI renders Remaster button only for eligible non-remastered releases
StudioState.releasedGames.push({
  id: 1002,
  title: "Fresh Symphony",
  theme: "Musik",
  genre: "Simulation",
  platform: "C64",
  score: 80,
  audioPts: 70,
  bugs: 0,
  sales: 5000,
  revenue: 11000,
  dlcCount: 0,
  year: 1984
});
renderReleasedGames();
const releasedHtml44 = collectMockHtml(document.getElementById('released-games-list'));
assert.ok(releasedHtml44.includes("startRemasterProject('1002')"), "Eligible release must show Remaster button");
assert.strictEqual(releasedHtml44.includes("startRemasterProject('1001')"), false, "Already-remastered original must hide Remaster button");
assert.strictEqual(releasedHtml44.includes(`startRemasterProject('${remAfter44.id}')`), false, "Remaster release must hide Remaster button");

console.log("=== TEST 45: Staff Specialization Traits (5 Traits, Hiring, UI Badge & Simulation Effects) ===");
assert.strictEqual(STAFF_TRAITS.length, 5, "STAFF_TRAITS must define 5 specializations");
const expectedTraitIds = ['foley_master', 'crunch_proof', 'synth_pioneer', 'bug_hunter', 'story_virtuoso'];
expectedTraitIds.forEach(tid => {
  assert.ok(STAFF_TRAITS.some(tr => tr.id === tid), `STAFF_TRAITS must contain ${tid}`);
});

resetTestState(1980, 'de');
assert.strictEqual(StudioState.staff[0].trait, 'foley_master', "Starter founder must begin with foley_master trait");

StudioState.cash = 100000;
assert.strictEqual(hireNewCandidate('sound'), true, "Hiring new candidate must succeed");
const hiredMember = StudioState.staff[StudioState.staff.length - 1];
assert.ok(expectedTraitIds.includes(hiredMember.trait), "Hired staff member must receive a valid trait from STAFF_TRAITS");

// UI badge DE/EN check
renderStaffList();
const foleyTrait = STAFF_TRAITS.find(tr => tr.id === 'foley_master');
assert.ok(collectMockHtml(document.getElementById('current-staff-list')).includes(foleyTrait.name), "Staff list in DE must show localized trait name");
StudioState.language = 'en';
renderStaffList();
assert.ok(collectMockHtml(document.getElementById('current-staff-list')).includes(foleyTrait.name_en), "Staff list in EN must show localized English trait name");
StudioState.language = 'de';

// Deterministic trait effect checks
const origRand45 = Math.random;
try {
  // 1) foley_master (+15% audioPts), synth_pioneer (+15% features), crunch_proof (-30% fatigue)
  const runSingleDevWeekWithTrait = (traitId, randVal) => {
    resetTestState(1980, 'de');
    StudioState.staff = [{ id: 1, name: "Specialist", role: "sound", skill: 3, fatigue: 0, vacationWeeks: 0, trait: traitId }];
    StudioState.activeProject = {
      title: "Trait Bench",
      theme: "Fantasy",
      genre: "RPG",
      audience: "everyone",
      publisherId: "self_pub",
      engineId: "engine_basic_1",
      platform: "C64",
      platformMarketMulti: 7.5,
      gameplay: 50,
      sound: 50,
      assignedStaffIds: [1],
      progress: 0,
      features: 0,
      audioPts: 0,
      bugs: 0
    };
    Math.random = () => randVal;
    tickProjectProgress();
    return {
      audioPts: StudioState.activeProject.audioPts,
      features: StudioState.activeProject.features,
      bugs: StudioState.activeProject.bugs,
      fatigue: StudioState.staff[0].fatigue
    };
  };

  const baseWeek = runSingleDevWeekWithTrait(null, 0.99);
  const foleyWeek = runSingleDevWeekWithTrait('foley_master', 0.99);
  const synthWeek = runSingleDevWeekWithTrait('synth_pioneer', 0.99);
  const crunchWeek = runSingleDevWeekWithTrait('crunch_proof', 0.99);

  assert(foleyWeek.audioPts > baseWeek.audioPts, "foley_master must generate more audioPts per week than no trait");
  assert(synthWeek.features > baseWeek.features, "synth_pioneer must generate more feature points per week than no trait");
  assert.strictEqual(baseWeek.fatigue, 4, "At Math.random()=0.99 base fatigue gain must be 4");
  assert.strictEqual(crunchWeek.fatigue, 3, "crunch_proof must reduce fatigue gain from 4 to 3 (-30% rounded)");

  // 2) bug_hunter (-30% bug chance: 0.30 triggers 0.35 base, misses 0.35 * 0.7 = 0.245)
  const noBugHunter = runSingleDevWeekWithTrait(null, 0.30);
  const withBugHunter = runSingleDevWeekWithTrait('bug_hunter', 0.30);
  assert(noBugHunter.bugs >= 1, "Baseline at random=0.30 (< 0.35) must roll at least 1 bug");
  assert.strictEqual(withBugHunter.bugs, 0, "bug_hunter at random=0.30 (>= 0.245) must prevent bug");

  // 3) story_virtuoso (+3 review score bonus on finishDevelopment)
  const finishWithTrait = (traitId) => {
    resetTestState(1980, 'de');
    StudioState.staff = [{ id: 1, name: "Writer", role: "general", skill: 2, fatigue: 0, vacationWeeks: 0, trait: traitId }];
    StudioState.activeProject = {
      title: "Narrative Sound",
      theme: "Fantasy",
      genre: "RPG",
      audience: "everyone",
      publisherId: "self_pub",
      engineId: "engine_basic_1",
      platform: "C64",
      platformMarketMulti: 7.5,
      gameplay: 50,
      sound: 50,
      assignedStaffIds: [1],
      progress: 100,
      features: 10,
      audioPts: 25,
      bugs: 0
    };
    Math.random = () => 0.5;
    finishDevelopment();
    return StudioState.releasedGames[0].score;
  };
  const scoreNoStory = finishWithTrait(null);
  const scoreWithStory = finishWithTrait('story_virtuoso');
  assert.strictEqual(scoreWithStory, scoreNoStory + 3, "story_virtuoso must add +3 review score bonus");
} finally {
  Math.random = origRand45;
}

console.log("=== TEST 46: Custom Hardware Lab (1975+, Catalog, Royalties, Quality Bonus & Bank UI) ===");
assert.strictEqual(HARDWARE_CATALOG.length, 4, "HARDWARE_CATALOG must contain 4 hardware items");
resetTestState(1974, 'de');
StudioState.staff = [];
StudioState.cash = 500000;
assert.strictEqual(developCustomHardware('fm_soundcard_8bit'), false, "Hardware lab must block development before 1975");

StudioState.year = 1975;
StudioState.cash = 10000;
assert.strictEqual(developCustomHardware('fm_soundcard_8bit'), false, "Insufficient cash (< 25,000 EUR) must reject hardware development");

StudioState.cash = 100000;
assert.strictEqual(developCustomHardware('fm_soundcard_8bit'), true, "fm_soundcard_8bit must succeed in 1975");
assert.strictEqual(StudioState.cash, 75000, "fm_soundcard_8bit must cost 25,000 EUR");
assert.strictEqual(developCustomHardware('fm_soundcard_8bit'), false, "Duplicate custom hardware development must be blocked");
assert.strictEqual(developCustomHardware('pcm_wavetable_card'), false, "Future 1989 hardware must stay locked in 1975");
assert.strictEqual(getOwnedHardwareQualityBonus(), 2, "fm_soundcard_8bit must grant +2 hardware quality bonus");

const cashBeforeHwWeek = StudioState.cash;
tickWeek();
assert.strictEqual(StudioState.cash, cashBeforeHwWeek + 900, "tickWeek() must pay +900 EUR weekly hardware royalty");
assert.strictEqual(StudioState.customHardware[0].totalRoyalties, 900, "Hardware totalRoyalties must accumulate weekly");

// Verify Bank modal weekly cashflow displays hardware revenue
updateBankModalUI();
const bankHtml46 = collectMockHtml(document.getElementById('bank-debt-info')) + collectMockHtml(document.getElementById('bank-weekly-flow'));
assert.ok(bankHtml46.includes('900'), "Bank weekly flow must include 900 EUR hardware royalties");

// Verify finishDevelopment adds +2 hardware quality bonus
const origRand46 = Math.random;
try {
  Math.random = () => 0.5;
  resetTestState(1980, 'de');
  StudioState.staff = [];
  StudioState.activeProject = {
    title: "HW Compare", theme: "Fantasy", genre: "RPG", audience: "everyone",
    publisherId: "self_pub", engineId: "engine_basic_1", platform: "C64", platformMarketMulti: 7.5,
    gameplay: 50, sound: 50, assignedStaffIds: [], progress: 100, features: 10, audioPts: 25, bugs: 0
  };
  finishDevelopment();
  const noHwScore = StudioState.releasedGames[0].score;

  resetTestState(1980, 'de');
  StudioState.staff = [];
  StudioState.cash = 100000;
  developCustomHardware('fm_soundcard_8bit');
  StudioState.activeProject = {
    title: "HW Compare", theme: "Fantasy", genre: "RPG", audience: "everyone",
    publisherId: "self_pub", engineId: "engine_basic_1", platform: "C64", platformMarketMulti: 7.5,
    gameplay: 50, sound: 50, assignedStaffIds: [], progress: 100, features: 10, audioPts: 25, bugs: 0
  };
  finishDevelopment();
  const withHwScore = StudioState.releasedGames[0].score;
  assert.strictEqual(withHwScore, noHwScore + 2, "Owned custom hardware must add +2 quality bonus to review score");
} finally {
  Math.random = origRand46;
}

console.log("=== TEST 47: AudioPass Subscription Service (1995+, Pricing, Net Cashflow & Subscribers) ===");
resetTestState(1994, 'de');
StudioState.staff = [];
StudioState.fans = 30000;
StudioState.releasedGames = [{ id: 1, title: "90s Hit", score: 85, year: 1993 }];
assert.strictEqual(isSubscriptionUnlocked(1994), false, "AudioPass must be locked before 1995");
assert.strictEqual(toggleSubscriptionService(9), false, "AudioPass activation before 1995 must fail");

StudioState.year = 1995;
assert.strictEqual(isSubscriptionUnlocked(1995), true, "AudioPass must unlock in 1995");
assert.strictEqual(toggleSubscriptionService(14), true, "AudioPass must activate in 1995");
assert.strictEqual(StudioState.subscriptionService.active, true);
assert.strictEqual(StudioState.subscriptionService.price, 14);
assert(StudioState.subscriptionService.subscribers >= 200, "Activation must seed >= 200 initial subscribers");

const subFin47 = calculateSubscriptionWeeklyFinance();
assert.strictEqual(subFin47.active, true);
assert.strictEqual(subFin47.net, subFin47.gross - subFin47.upkeep, "Subscription net must equal gross - upkeep");
assert.strictEqual(calculateWeeklyFinancialFlow().weeklySubNet, subFin47.net, "Bank flow must report exact AudioPass net");

const cashBeforeSubWeek = StudioState.cash;
const subsBeforeWeek = StudioState.subscriptionService.subscribers;
tickWeek();
assert.strictEqual(StudioState.cash, cashBeforeSubWeek + subFin47.net, "tickWeek() must apply AudioPass weekly net cashflow");
assert.notStrictEqual(StudioState.subscriptionService.subscribers, subsBeforeWeek, "tickWeek() must update subscriber count toward target");

assert.strictEqual(toggleSubscriptionService(14), false, "Second toggle must pause AudioPass cleanly");
assert.strictEqual(StudioState.subscriptionService.active, false);

console.log("=== TEST 48: Rival Studios, Acquisitions, Weekly Dividends & +10% Fan Boost ===");
assert.strictEqual(RIVALS_CATALOG.length, 4, "RIVALS_CATALOG must contain 4 rival studios");
resetTestState(1990, 'de');
StudioState.staff = [];
assert.strictEqual(getRivalFanMultiplier(), 1.0, "Baseline fan multiplier without acquisitions must be 1.0");

StudioState.cash = 10000;
assert.strictEqual(acquireRivalStudio('klangwerk'), false, "Rival acquisition with insufficient cash must fail");

StudioState.cash = 250000;
assert.strictEqual(acquireRivalStudio('klangwerk'), true, "Acquiring klangwerk (180,000 EUR) must succeed");
assert.strictEqual(StudioState.cash, 70000, "Acquisition must deduct 180,000 EUR valuation");
assert.strictEqual(acquireRivalStudio('klangwerk'), false, "Duplicate acquisition of same rival must fail");
assert.strictEqual(getRivalFanMultiplier(), 1.10, "Acquiring any rival must activate 1.10x fan multiplier");

const cashBeforeDivWeek = StudioState.cash;
tickWeek();
assert.strictEqual(StudioState.cash, cashBeforeDivWeek + 750, "tickWeek() must pay klangwerk weekly dividend (+750 EUR)");

// Annual award +10% fan boost & rival reputation delta
StudioState.year = 1990;
StudioState.week = 48;
StudioState.fans = 1000;
StudioState.releasedGames.push({ id: 50, title: "Rival Slayer", year: 1990, score: 90, audioPts: 100 });
tickWeek(); // advances to 1991 week 1, triggers handleAnnualAwards
assert.strictEqual(StudioState.fans, 1000 + 3300 + 880, "GOTY (+3,300) and Audio Award (+880) must reflect +10% rival fan boost");
const klangwerkAfter = StudioState.rivals.find(r => r.id === 'klangwerk');
const polyphonAfter = StudioState.rivals.find(r => r.id === 'polyphon');
assert.strictEqual(klangwerkAfter.reputation, 64, "Acquired subsidiary must gain +2 reputation when studio wins awards");
assert.strictEqual(polyphonAfter.reputation, 69, "Unacquired rival must lose -1 reputation when player wins GOTY");

console.log("=== TEST 49: Studio Achievements (10 Milestones, Predicates, Rewards & Idempotency) ===");
assert.strictEqual(ACHIEVEMENTS_CATALOG.length, 10, "ACHIEVEMENTS_CATALOG must contain 10 milestones");
const expectedAchIds = [
  'first_release', 'hit_80', 'masterpiece_90', 'custom_engine', 'golden_mic',
  'millionaire', 'fan_legend', 'hardware_pioneer', 'media_mogul', 'century_veteran'
];
expectedAchIds.forEach(aid => {
  assert.ok(ACHIEVEMENTS_CATALOG.some(a => a.id === aid), `ACHIEVEMENTS_CATALOG must include ${aid}`);
});

resetTestState(1930, 'de');
assert.deepStrictEqual(checkAchievements(), [], "Fresh studio must unlock 0 achievements");

StudioState.releasedGames = [{ id: 1, title: "Magnum", year: 2029, score: 92, audioPts: 95 }];
StudioState.customEngines.push({ id: 'custom_test_eng', name: 'Test Wave Engine', techLevel: 2, year: 1985 });
StudioState.audioDesignAwards = [{ gameId: 1, title: "Magnum", year: 2029 }];
StudioState.cash = 1000000;
StudioState.fans = 100000;
StudioState.customHardware = [{ id: 'fm_soundcard_8bit', weeklyRoyalty: 900, qualityBonus: 2 }];
StudioState.rivals[0].acquired = true;
StudioState.year = 2030;

const rpBeforeAch = StudioState.rp || 0;
const expectedAchCash = ACHIEVEMENTS_CATALOG.reduce((s, a) => s + (a.rewardCash || 0), 0);
const expectedAchFans = ACHIEVEMENTS_CATALOG.reduce((s, a) => s + (a.rewardFans || 0), 0);
const expectedAchRp = ACHIEVEMENTS_CATALOG.reduce((s, a) => s + (a.rewardRp || 0), 0);

const unlocked49 = checkAchievements();
assert.strictEqual(unlocked49.length, 10, "All 10 milestones must unlock when predicates are satisfied");
assert.strictEqual(StudioState.achievements.length, 10);
assert.strictEqual(StudioState.cash, 1000000 + expectedAchCash, "Achievement cash rewards must be added once");
assert.strictEqual(StudioState.fans, 100000 + expectedAchFans, "Achievement fan rewards must be added once");
assert.strictEqual(StudioState.rp, rpBeforeAch + expectedAchRp, "Achievement RP rewards must be added once");
assert.deepStrictEqual(checkAchievements(), [], "Re-calling checkAchievements() must be idempotent");
assert.strictEqual(StudioState.cash, 1000000 + expectedAchCash, "Idempotent check must not double-pay cash");

console.log("=== TEST 50: Wave 2 Modals, Feature Locks (1975 & 1995), Game-Over Milestones & DE/EN Live Sync ===");
resetTestState(1970, 'de');
applyFeatureUnlocksToUI();
assert.strictEqual(document.getElementById('btn-action-hardware').classList.contains('card-locked'), true, "Hardware card must have card-locked in 1970");
assert.strictEqual(document.getElementById('badge-lock-hardware').style.display, 'inline-block', "Hardware lock badge must be visible in 1970");
assert.strictEqual(document.getElementById('btn-action-subscription').classList.contains('card-locked'), true, "AudioPass card must have card-locked in 1970");
openHardwareModal();
assert.notStrictEqual(document.getElementById('modal-hardware').style.display, 'flex', "Locked Hardware modal must not open in 1970");

StudioState.year = 1975;
applyFeatureUnlocksToUI();
assert.strictEqual(document.getElementById('btn-action-hardware').classList.contains('card-locked'), false, "Hardware card must unlock in 1975");
assert.strictEqual(document.getElementById('badge-lock-hardware').style.display, 'none', "Hardware lock badge must hide in 1975");
assert.strictEqual(document.getElementById('btn-action-subscription').classList.contains('card-locked'), true, "AudioPass card must remain locked in 1975");
openSubscriptionModal();
assert.notStrictEqual(document.getElementById('modal-subscription').style.display, 'flex', "Locked AudioPass modal must not open in 1975");

StudioState.year = 1995;
StudioState.cash = 300000;
StudioState.fans = 20000;
applyFeatureUnlocksToUI();
assert.strictEqual(document.getElementById('btn-action-subscription').classList.contains('card-locked'), false, "AudioPass card must unlock in 1995");
assert.strictEqual(document.getElementById('badge-lock-subscription').style.display, 'none', "AudioPass lock badge must hide in 1995");

openHardwareModal();
assert.strictEqual(document.getElementById('modal-hardware').style.display, 'flex');
assert.strictEqual(document.getElementById('hardware-list').children.length, 4);
handleDevelopCustomHardware('fm_soundcard_8bit');
assert.ok(document.getElementById('hardware-summary').textContent.includes('1 / 4'), "Hardware summary must reflect 1 / 4 built");

openSubscriptionModal();
assert.strictEqual(document.getElementById('modal-subscription').style.display, 'flex');
onSubscriptionPriceChange(19);
assert.strictEqual(StudioState.subscriptionService.price, 19);
handleToggleSubscriptionService();
assert.strictEqual(StudioState.subscriptionService.active, true);
assert.strictEqual(document.getElementById('btn-toggle-subscription').getAttribute('aria-pressed'), 'true');
assert.ok(document.getElementById('subscription-status-panel').innerHTML.length > 0);

openRivalsModal();
assert.strictEqual(document.getElementById('modal-rivals').style.display, 'flex');
assert.strictEqual(document.getElementById('rivals-list').children.length, 4);
handleAcquireRival('klangwerk');
assert.ok(document.getElementById('rivals-summary').innerHTML.includes('1 / 4'), "Rivals summary must reflect 1 / 4 acquired");

openAchievementsModal();
assert.strictEqual(document.getElementById('modal-achievements').style.display, 'flex');
assert.strictEqual(document.getElementById('achievements-list').children.length, 10, "Achievements modal must render all 10 milestones");

showGameOverModal();
assert.ok(document.getElementById('game-over-stats').innerHTML.includes('Meilensteine'), "Game-over stats in DE must show milestones row");

toggleLanguage(); // -> EN
assert.strictEqual(StudioState.language, 'en');
refreshOpenWave2Modals();
showGameOverModal();
assert.ok(document.getElementById('game-over-stats').innerHTML.includes('Milestones'), "Game-over stats in EN must localize milestones row");
toggleLanguage(); // -> DE
closeAllModals();

console.log("=== TEST 51: Wave 2 DE/EN Key Completeness (327+ Keys) & Zero Mojibake Across All UI/System Files ===");
const deKeys51 = Object.keys(TRANSLATIONS.de);
const enKeys51 = Object.keys(TRANSLATIONS.en);
assert(deKeys51.length >= 327, `Expected >= 327 DE keys, got ${deKeys51.length}`);
assert.strictEqual(deKeys51.length, enKeys51.length, "DE and EN translation key counts must match identically");

const wave2RequiredKeys = [
  'remaster_btn', 'remaster_btn_aria',
  'hardware_summary_label', 'hardware_developed_badge', 'hardware_locked_year',
  'hardware_develop_btn', 'hardware_stats_line', 'hardware_modal_opened',
  'audiopass_title', 'subscription_modal_opened', 'subscription_tier_budget',
  'subscription_tier_standard', 'subscription_tier_plus', 'subscription_tier_pro',
  'subscription_tier_ultra', 'subscription_price_tier', 'subscription_status_active',
  'subscription_status_paused', 'subscription_subscribers_label', 'subscription_target_label',
  'subscription_gross_label', 'subscription_upkeep_label', 'subscription_net_label',
  'subscription_pause_btn', 'subscription_activate_btn',
  'rivals_modal_opened', 'rivals_summary_label', 'rivals_fan_boost_active',
  'rival_acquired_badge', 'rival_acquire_btn', 'rival_stats_line',
  'milestones_modal_opened', 'milestones_summary_label', 'milestone_reward_line',
  'milestone_unlocked_badge', 'milestone_locked_badge', 'milestones_title'
];
wave2RequiredKeys.forEach(key => {
  assert.ok(typeof TRANSLATIONS.de[key] === 'string' && TRANSLATIONS.de[key].length > 0, `Wave 2 DE key ${key} must exist`);
  assert.ok(typeof TRANSLATIONS.en[key] === 'string' && TRANSLATIONS.en[key].length > 0, `Wave 2 EN key ${key} must exist`);
});

[
  'www/js/ui/hud.js',
  'www/js/ui/modals.js',
  'www/js/systems/dev_system.js',
  'www/js/systems/simulation_system.js',
  'www/js/systems/staff_system.js',
  'www/js/systems/finance_system.js',
  'www/js/systems/marketing_system.js'
].forEach(relPath => {
  const fileText = fs.readFileSync(relPath, 'utf8');
  mojibakePatterns.forEach(pat => {
    assert.strictEqual(fileText.includes(pat), false, `Mojibake pattern "${pat}" found in ${relPath}`);
  });
});

['modal-hardware', 'modal-subscription', 'modal-rivals', 'modal-achievements',
 'btn-action-hardware', 'btn-action-subscription', 'btn-action-rivals', 'btn-action-achievements'
].forEach(domId => {
  assert.ok(htmlSrc.includes(`id="${domId}"`), `index.html must contain Wave 2 element id="${domId}"`);
});

console.log("=== TEST 52: Save/Load Persistence Roundtrip & Legacy Save Backward Compatibility ===");
localStorage.clear();
resetTestState(2005, 'en');
StudioState.cash = 420000;
StudioState.releasedGames = [{ id: 77, title: "Classic Hit", year: 1992, score: 88, audioPts: 92, remastered: true }];
StudioState.customHardware = [{ ...HARDWARE_CATALOG[0], builtYear: 1980, totalRoyalties: 18000 }];
StudioState.rivals[0].acquired = true;
StudioState.rivals[0].acquiredYear = 2001;
StudioState.subscriptionService = { active: true, price: 19, subscribers: 450 };
StudioState.achievements = ['first_release', 'hardware_pioneer'];
StudioState.staff[0].trait = 'bug_hunter';

saveGame();
resetTestState(1930, 'de');
assert.strictEqual(StudioState.achievements.length, 0);
loadGame();
assert.strictEqual(StudioState.year, 2005);
assert.strictEqual(StudioState.customHardware.length, 1);
assert.strictEqual(StudioState.customHardware[0].id, 'fm_soundcard_8bit');
assert.strictEqual(StudioState.rivals[0].acquired, true);
assert.strictEqual(StudioState.subscriptionService.active, true);
assert.strictEqual(StudioState.subscriptionService.price, 19);
assert.strictEqual(StudioState.subscriptionService.subscribers, 450);
assert.deepStrictEqual(StudioState.achievements, ['first_release', 'hardware_pioneer']);
assert.strictEqual(StudioState.staff[0].trait, 'bug_hunter');
assert.strictEqual(StudioState.releasedGames[0].remastered, true);

// Legacy Wave 1 save without Wave 2 fields must not crash Wave 2 systems/UI
localStorage.clear();
localStorage.setItem('ast_savegame_v4', JSON.stringify({
  studioName: "Legacy Sound",
  year: 1998,
  week: 10,
  cash: 60000,
  fans: 5000,
  staff: [{ id: 1, name: "Founder", role: "sound", skill: 2, fatigue: 0 }],
  releasedGames: []
}));
resetTestState(1930, 'de');
delete StudioState.rivals;
delete StudioState.customHardware;
delete StudioState.subscriptionService;
delete StudioState.achievements;
loadGame();
assert.strictEqual(StudioState.studioName, "Legacy Sound");
assert.ok(Array.isArray(ensureRivalsState()) && ensureRivalsState().length === 4, "ensureRivalsState() must backfill missing rivals");
const legacySubFin = calculateSubscriptionWeeklyFinance();
assert.strictEqual(legacySubFin.active, false, "calculateSubscriptionWeeklyFinance() must safely default missing subscription state");
assert.strictEqual(getOwnedHardwareQualityBonus(), 0, "getOwnedHardwareQualityBonus() must return 0 when customHardware is absent");
assert.deepStrictEqual(checkAchievements(), [], "checkAchievements() must safely initialize missing achievements array");

console.log("\nALL 52 SIMULATION, TYCOON LOOP & TIMELINE INTEGRATION TESTS PASSED 100%!");
process.exit(0);

