const assert = require('assert');
const fs = require('fs');

// Mock browser globals
global.window = global;
const mockElements = {};
function createMockElement(tag = 'div', id = '') {
  return {
    id,
    tagName: tag.toUpperCase(),
    style: {},
    textContent: '',
    value: '',
    innerHTML: '',
    children: [],
    appendChild(child) {
      this.children.push(child);
      this.innerHTML += `<${child.tagName || 'DIV'} value="${child.value || ''}">${child.textContent || ''}</${child.tagName || 'DIV'}>`;
    },
    setAttribute() {},
    removeAttribute() {},
    getAttribute() { return null; },
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
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
  removeItem(k) { delete this.data[k]; }
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

console.log("\nALL 25 SIMULATION & TIMELINE INTEGRATION TESTS PASSED 100%!");
