// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 5;
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 },
  medium: { min: -20, max: 20 },
  hard: { min: -100, max: 100 }
};

// --- MOTIVÁLÓ ÜZENETEK ---
const motivationalMessages = [
  "Szuper munka, igazi matekzseni vagy!",
  "Fantasztikus, így kell ezt csinálni!",
  "Látom, nem lehet téged megállítani, csak így tovább!",
  "Bravó, ezt a nehéz feladatot is megoldottad!",
  "Kiváló, egyre közelebb vagy a csúcshoz!",
  "Hűha, ez egy profi megoldás volt!",
  "Nagyszerű, a matek mestere vagy!",
  "Remekül teljesítesz, folytasd ebben a szellemben!"
];

// --- SEGÉDFÜGGVÉNYEK ---
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function simplifyFraction(num, denom) { let d = gcd(Math.abs(num), Math.abs(denom)); return [num / d, denom / d]; }

// --- FELADATTÍPUSOK ---
const taskTypes = [
  { name: "Összeadás", value: "osszeadas", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n1 = getRandomInt(min, max), n2 = getRandomInt(min, max); return { display: `<b>${n1}</b> + <b>${n2}</b>`, answer: (n1 + n2).toString(), answerType: "number" }; } },
  { name: "Kivonás", value: "kivonas", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n1 = getRandomInt(min, max), n2 = getRandomInt(min, max); return { display: `<b>${n1}</b> - <b>${n2}</b>`, answer: (n1 - n2).toString(), answerType: "number" }; } },
  { name: "Szorzás", value: "szorzas", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n1 = getRandomInt(min, max), n2 = getRandomInt(min, max); return { display: `<b>${n1}</b> × <b>${n2}</b>`, answer: (n1 * n2).toString(), answerType: "number" }; } },
  { name: "Osztás", value: "osztas", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n2 = getRandomInt(1, 10), a = getRandomInt(min, max); return { display: `<b>${n2 * a}</b> ÷ <b>${n2}</b>`, answer: a.toString(), answerType: "number" }; } },
  { name: "Mind a négy művelet", value: "mind_negy_muvelet", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n1 = getRandomInt(min, max), n2 = getRandomInt(min, max); return { display: `<b>${n1}</b> + <b>${n2}</b>`, answer: (n1 + n2).toString(), answerType: "number" }; } },
  { name: "Zárójeles kifejezések", value: "zarojeles_kifejezesek", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n1 = getRandomInt(min, max), n2 = getRandomInt(min, max); return { display: `<b>${n1}</b> + <b>${n2}</b>`, answer: (n1 + n2).toString(), answerType: "number" }; } },
  { name: "Hatványozás", value: "hatvanyozas", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let b = getRandomInt(1, 10), e = 2; return { display: `<b>${b}<sup>${e}</sup></b>`, answer: Math.pow(b, e).toString(), answerType: "number" }; } },
  { name: "Törtek", value: "tortek", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let n1 = 1, d1 = 2; return { display: `<b>${n1}/${d1}</b>`, answer: `${n1}/${d1}`, answerType: "fraction" }; } },
  { name: "Százalékszámítás", value: "szazalekszamitas", generate: (d) => { let b = 100, p = 50; return { display: `Mennyi ${b}-nak a <span class="blue-percent">${p}%</span>-a ?`, answer: Math.round(b * p / 100).toString(), answerType: "number" }; } },
  { name: "Egyenletek átrendezése", value: "egyenletek_atrendezese", generate: (d) => { const { min, max } = DIFFICULTY_SETTINGS[d]; let a = 2, x = getRandomInt(min, max), b = 1; return { display: `${a}x + ${b} = ${a * x + b}    | x`, answer: x.toString(), answerType: "number" }; } },
  { name: "Villamos mértékegységek", value: "villamos_mertekegysegek", generate: (d) => { let mA = 100; return { display: `<b>${mA} mA</b> = ? A`, answer: (mA / 1000).toString(), answerType: "decimal" }; } },
  { name: "Ohm-törvény", value: "ohm_torveny", generate: (d) => { let I = 2, R = 5; return { display: `Mennyi a feszültség, ha <b>I = ${I} A</b> és <b>R = ${R} Ω</b>?`, answer: (I * R).toString(), answerType: "number" }; } },
  { name: "Teljesítmény", value: "teljesitmeny", generate: (d) => { let U = 10, I = 2; return { display: `Mennyi a teljesítmény, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`, answer: (U * I).toString(), answerType: "number" }; } }
];

// --- HTML ELEMEK ---
const quizContainer = document.getElementById("quiz");
const timerDisplay = document.getElementById("time");
const bestStats = document.getElementById("best-stats");
const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");
const startBtn = document.querySelector("button[onclick='startGame()']");
const restartBtn = document.getElementById("restart-btn");
const themeToggle = document.getElementById("theme-toggle");
const numpadContainer = document.getElementById("numpad-container");

// --- KATEGÓRIÁK BETÖLTÉSE ---
function loadCategories() {
  console.log("Loading categories. taskTypes:", taskTypes);
  if (!categorySelect) {
    console.error("categorySelect element not found!");
    return;
  }
  categorySelect.innerHTML = taskTypes.map(task => `<option value="${task.value}">${task.name}</option>`).join('');
  if (categorySelect.options.length > 0) {
    categorySelect.selectedIndex = 0;
    console.log("Categories loaded. Selected value:", categorySelect.value);
  } else {
    console.error("No categories loaded. taskTypes might be empty.");
  }
}

// --- ÁLLAPOTVÁLTOZÓK ---
let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null };
let gameActive = false;
let answerState = { value: "" };

// --- UTOLSÓ VÁLASZTÁS MENTÉSE/BETÖLTÉSE ---
function saveLastSelection() { localStorage.setItem("vilma-last-category", categorySelect.value); localStorage.setItem("vilma-last-difficulty", difficultySelect.value); }
function loadLastSelection() { const lastCat = localStorage.getItem("vilma-last-category"); if (lastCat && taskTypes.some(t => t.value === lastCat)) categorySelect.value = lastCat; const lastDiff = localStorage.getItem("vilma-last-difficulty"); if (lastDiff) difficultySelect.value = lastDiff; }
categorySelect.addEventListener("change", function () { saveLastSelection(); loadBest(); });
difficultySelect.addEventListener("change", function () { saveLastSelection(); loadBest(); });

// --- LEGJOBB EREDMÉNY MENTÉSE/BETÖLTÉSE ---
function loadBest() { const diff = difficultySelect.value; const cat = categorySelect.value; try { const bestRaw = localStorage.getItem("vilma-best-" + cat + "-" + diff); best = bestRaw ? JSON.parse(bestRaw) : { score: 0, time: null }; } catch { best = { score: 0, time: null }; } showBest(); }
function saveBest(newScore, time) { const diff = difficultySelect.value; const cat = categorySelect.value; if (newScore > best.score || (newScore === best.score && (best.time === null || time < best.time))) { best = { score: newScore, time: time }; localStorage.setItem("vilma-best-" + cat + "-" + diff, JSON.stringify(best)); showBest(); } }
function showBest() { if (best.score > 0) { bestStats.innerHTML = `🏆 <b>Legjobb eredmény:</b> ${best.time} mp (${categoryLabel()} / ${difficultyLabel()})`; bestStats.style.display = ""; } else { bestStats.style.display = "none"; } }
function difficultyLabel() { return { easy: "Könnyű", medium: "Közepes", hard: "Kihívás" }[difficultySelect.value] || ""; }
function categoryLabel() { return categorySelect.options[categorySelect.selectedIndex].textContent; }

// --- TÉMA VÁLTÁS ---
function applyTheme() { const theme = localStorage.getItem("vilma-theme") || "dark"; document.body.classList.toggle("light", theme === "light"); }
themeToggle.addEventListener("click", function () { const isLight = document.body.classList.contains("light"); localStorage.setItem("vilma-theme", isLight ? "dark" : "light"); applyTheme(); });

// --- NEHÉZSÉG ÉS KATEGÓRIA KEZELÉSE ---
difficultySelect.addEventListener("change", loadBest);
categorySelect.addEventListener("change", loadBest);

// --- IDŐZÍTŐ ---
function updateTimer() { const elapsed = Math.floor((Date.now() - startTime) / 1000); timerDisplay.textContent = `${elapsed}`; }

// --- ZÁRÓJELES KIFEJEZÉSEK GENERÁLÁSA ---
function generateBracketedExpression(opCount, min, max) { const opList = ["+", "-", "×", "÷"]; let elements = [getRandomInt(min, max), "+", getRandomInt(min, max)]; return { display: elements.join(" "), answer: eval(elements.join("")).toString(), answerType: "number" }; }

// --- FELADATSOR GENERÁLÁSA ---
function generateQuestions() {
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  console.log("Generating questions for category:", category);
  questions = [];
  const taskType = taskTypes.find(t => t.value === category);
  if (!taskType) {
    console.error(`Error: Category "${category}" not found in taskTypes. Available categories:`, taskTypes.map(t => t.value));
    questions.push({ display: "Hiba: kategória nincs implementálva. Kérlek, válassz egy másik kategóriát.", answer: null, answerType: "number" });
    return;
  }
  for (let i = 0; i < QUESTIONS; i++) {
    const task = taskType.generate(difficulty);
    if (!task.answer || task.answer === "?") { task.display = "Hiba: érvénytelen feladat generálódott"; task.answer = null; }
    questions.push(task);
  }
}

// --- SZÁMBILLENTYŰZET ---
function renderNumpad(answerState, onChange) {
  const rows = [['1', '2', '3', '/', '←'], ['4', '5', '6', '.', 'submit'], ['7', '8', '9', '0', '-']];
  const numpadDiv = document.createElement('div'); numpadDiv.className = 'numpad active';
  rows.forEach((row) => { const rowDiv = document.createElement('div'); rowDiv.className = 'numpad-row'; row.forEach((key) => { if (key === 'submit') { const submitBtn = document.createElement("button"); submitBtn.type = "button"; submitBtn.className = "numpad-btn numpad-submit-btn"; submitBtn.innerHTML = `<span><svg viewBox="0 0 48 48" width="1.2em" height="1.2em" style="display:block;margin:auto;" aria-hidden="true" focusable="false"><path d="M40 6v23H14.83l6.58-6.59L19 20l-10 10 10 10 2.41-2.41L14.83 31H44V6z" fill="currentColor"/></svg></span>`; submitBtn.onclick = () => { if (!gameActive) return; let val = answerState.value.trim(); if (val === "" || val === "-") { alert("Írj be egy választ!"); return; } let correct = false; const currentTask = questions[currentQuestion] || {}; if (!currentTask.answer) { alert("Hiba: nincs válasz definiálva!"); return; } val = val.replace(',', '.'); if (currentTask.answerType === "number") { if (parseInt(val) === parseInt(currentTask.answer)) correct = true; } if (correct) { score++; currentQuestion++; showQuestion(currentQuestion); } else { alert("Nem jó válasz, próbáld újra!"); } }; rowDiv.appendChild(submitBtn); } else { const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'numpad-btn'; btn.textContent = key; btn.onclick = () => { if (key === '←') answerState.value = answerState.value.slice(0, -1); else if (key === '-') answerState.value = answerState.value.startsWith('-') ? answerState.value.substring(1) : '-' + answerState.value; else if (key === '.') if (!answerState.value.includes('.')) answerState.value += '.'; else answerState.value += key; onChange(answerState.value); }; rowDiv.appendChild(btn); } }); numpadDiv.appendChild(rowDiv); });
  return numpadDiv;
}

// --- JÁTÉK LOGIKA ---
function showQuestion(index) { quizContainer.innerHTML = ""; if (index >= QUESTIONS) { finishGame(); return; } const q = questions[index]; const div = document.createElement("div"); div.className = "question-container"; div.innerHTML = `<div class="question-number">${QUESTIONS} / ${index + 1}. feladat:</div><div class="question-text">${q.display} = </div>`; let answerState = { value: "" }; const answerView = document.createElement("div"); answerView.className = "answer-view"; answerView.textContent = ""; div.appendChild(answerView); const numpad = renderNumpad(answerState, function (val) { answerView.textContent = val; }); numpadContainer.innerHTML = ""; numpadContainer.appendChild(numpad); numpadContainer.classList.add("active"); quizContainer.appendChild(div); div.scrollIntoView({ behavior: "smooth", block: "start" }); }
function startGame() { categorySelect.value = "osszeadas"; console.log("Starting game with category:", categorySelect.value); gameActive = true; score = 0; currentQuestion = 0; generateQuestions(); showQuestion(0); startTime = Date.now(); updateTimer(); clearInterval(timerInterval); timerInterval = setInterval(updateTimer, 1000); categorySelect.disabled = true; difficultySelect.disabled = true; restartBtn.style.display = "none"; startBtn.style.display = "none"; bestStats.style.opacity = "0.55"; }
function finishGame() { gameActive = false; clearInterval(timerInterval); const elapsed = Math.floor((Date.now() - startTime) / 1000); timerDisplay.textContent = `${elapsed} (Vége)`; quizContainer.innerHTML = `<p style="font-size:1.2em;"><b>Gratulálok!</b> ${elapsed} másodperc alatt végeztél.</p>`; numpadContainer.innerHTML = ""; numpadContainer.classList.remove("active"); saveBest(score, elapsed); restartBtn.style.display = ""; startBtn.style.display = ""; bestStats.style.opacity = "1"; categorySelect.disabled = false; difficultySelect.disabled = false; }
restartBtn.onclick = startGame; startBtn.onclick = startGame;

// --- INDÍTÁS ---
document.addEventListener("DOMContentLoaded", function() { console.log("DOM fully loaded, initializing app..."); loadCategories(); loadLastSelection(); loadBest(); applyTheme(); });