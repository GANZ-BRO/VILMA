// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 5; // Feladatok száma egy játékban
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

// --- HIBAÜZENETEK (szintek szerint) ---
const errorMessages = {
  level1: ["Ne csüggedj, próbáld újra, te tudod ezt! 😊", "Hoppá, majdnem jó volt, próbáljuk még egyszer! 😉", "Semmi baj, egy kis gyakorlás, és meglesz! 🌟"],
  level2: ["Ó, ez még nem az, de te vagy a legjobb próbálkozó! 😂", "Ezúttal elszalasztottad, de a következő biztos siker! 😄", "Nem baj, a matek néha tréfál velünk! 😜"],
  level3: ["Jaj, ez már viccesen rossz, de te még mindig szuper vagy! 🤪", "Úgy tűnik, a számok eljátszottak veled, próbáld meg újra! 😂🎉", "Hoppá, ez már szinte művészet, próbáljuk újra nevetve! 😆"]
};

// --- SEGÉDFÜGGVÉNYEK ---
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(num, denom) {
  let d = gcd(Math.abs(num), Math.abs(denom));
  return [num / d, denom / d];
}

// --- FELADATTÍPUSOK ---
const taskTypes = [
  { name: "Összeadás", value: "osszeadas", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
    if (difficulty === "hard") {
      let num3 = getRandomInt(min, max);
      return { display: `<b>${num1}</b> + <b>${num2}</b> + <b>${num3}</b>`, answer: (num1 + num2 + num3).toString(), answerType: "number" };
    }
    return { display: `<b>${num1}</b> + <b>${num2}</b>`, answer: (num1 + num2).toString(), answerType: "number" };
  }},
  { name: "Kivonás", value: "kivonas", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
    if (difficulty === "hard") {
      let num3 = getRandomInt(min, max);
      return { display: `<b>${num1}</b> - <b>${num2}</b> - <b>${num3}</b>`, answer: (num1 - num2 - num3).toString(), answerType: "number" };
    }
    return { display: `<b>${num1}</b> - <b>${num2}</b>`, answer: (num1 - num2).toString(), answerType: "number" };
  }},
  { name: "Szorzás", value: "szorzas", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
    if (difficulty === "hard") {
      let num3 = getRandomInt(Math.floor(min / 2), Math.floor(max / 2));
      return { display: `<b>${num1}</b> × <b>${num2}</b> × <b>${num3}</b>`, answer: (num1 * num2 * num3).toString(), answerType: "number" };
    }
    return { display: `<b>${num1}</b> × <b>${num2}</b>`, answer: (num1 * num2).toString(), answerType: "number" };
  }},
  { name: "Osztás", value: "osztas", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5;
    let maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
    let num2 = getRandomInt(minDivisor, maxDivisor);
    let answer = getRandomInt(min, max);
    if (difficulty === "hard") {
      let num3 = getRandomInt(minDivisor, maxDivisor);
      let num1 = answer * num2 * num3;
      return { display: `<b>${num1}</b> ÷ <b>${num2}</b> ÷ <b>${num3}</b>`, answer: (num1 / num2 / num3).toString(), answerType: "number" };
    }
    return { display: `<b>${num2 * answer}</b> ÷ <b>${num2}</b>`, answer: answer.toString(), answerType: "number" };
  }},
  { name: "Mind a négy művelet", value: "mind_negy_muvelet", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
    const opList = ["+", "-", "×", "÷"];
    let nums = [getRandomInt(min, max)];
    let ops = [];
    let lastVal = nums[0];
    let minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5;
    let maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 100;
    let tryCount = 0;
    let displayExpr, answer;
    while (tryCount < 1000) {
      nums = [getRandomInt(min, max)];
      ops = [];
      lastVal = nums[0];
      for (let j = 0; j < opCount; j++) {
        let op = opList[getRandomInt(0, 3)];
        if (op === "÷") {
          let divisor = getRandomInt(minDivisor, maxDivisor);
          lastVal = lastVal * divisor;
          nums[j + 1] = divisor;
        } else {
          nums[j + 1] = getRandomInt(min, max);
        }
        ops[j] = op;
        lastVal = nums[j + 1];
      }
      displayExpr = nums[0] + ops.map((op, i) => ` ${op} ${nums[i + 1]}`).join('');
      let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
      try {
        answer = eval(evalExpr);
        if (typeof answer === "number" && isFinite(answer) && !isNaN(answer) && answer === Math.round(answer)) break;
      } catch { answer = "?"; }
      tryCount++;
    }
    if (tryCount >= 1000) {
      nums = [getRandomInt(min, max), getRandomInt(min, max)];
      displayExpr = `${nums[0]} + ${nums[1]}`;
      answer = nums[0] + nums[1];
    }
    return { display: displayExpr, answer: answer.toString(), answerType: "number" };
  }},
  { name: "Zárójeles kifejezések", value: "zarojeles_kifejezesek", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 8;
    return generateBracketedExpression(opCount, min, max);
  }},
  { name: "Hatványozás", value: "hatvanyozas", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let base = getRandomInt(-50, 50), exponent = getRandomInt(2, 6);
    if (difficulty === "easy") { base = getRandomInt(1, 10); exponent = getRandomInt(2, 3); }
    else if (difficulty === "medium") { if (base < 0) exponent = 2; }
    else if (base < 0) exponent = getRandomInt(3, 4);
    let answer = Math.pow(base, exponent);
    if (Math.abs(answer) > 1000000) { base = getRandomInt(1, 10); exponent = 2; answer = Math.pow(base, exponent); }
    return { display: `Mennyi <b>${base}<sup>${exponent}</sup></b>?`, answer: answer.toString(), answerType: "number" };
  }},
  { name: "Törtek", value: "tortek", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let minDenom = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
    let maxDenom = difficulty === "easy" ? 8 : difficulty === "medium" ? 15 : 30;
    let b = getRandomInt(minDenom, maxDenom), d = getRandomInt(minDenom, maxDenom);
    let a = getRandomInt(1, b - 1), c = getRandomInt(1, d - 1);
    if (difficulty === "hard") {
      let e = getRandomInt(1, b - 1), f = getRandomInt(minDenom, maxDenom);
      let [num, denom] = simplifyFraction(a * d * f + c * b * f + e * b * d, b * d * f);
      return { display: `${a}/${b} + ${c}/${d} + ${e}/${f}`, answer: `${num}/${denom}`, answerType: "fraction" };
    }
    let [num, denom] = simplifyFraction(a * d + c * b, b * d);
    return { display: `${a}/${b} + ${c}/${d}`, answer: `${num}/${denom}`, answerType: "fraction" };
  }},
  { name: "Százalékszámítás", value: "szazalekszamitas", generate: (difficulty) => {
    let percentArr = difficulty === "easy" ? [10, 20, 50, 100] : difficulty === "medium" ? [5, 15, 25, 50, 75, 100] : [2, 3, 7, 15, 33, 66, 125, 150, 200];
    let baseCandidates = difficulty === "easy" ? Array.from({length: 10}, (_, i) => (i + 1) * 10) : difficulty === "medium" ? Array.from({length: 40}, (_, i) => (i + 1) * 5) : Array.from({length: 50}, (_, i) => (i + 1) * 10);
    let percent = percentArr[getRandomInt(0, percentArr.length - 1)];
    let base = baseCandidates[getRandomInt(0, baseCandidates.length - 1)];
    let result = Math.round(base * percent / 100);
    let rag = ([3, 6, 8].includes(base % 10) || [0, 20, 30, 60, 80].includes(base % 100)) ? "-nak" : "-nek";
    let nevelo = percent.toString().startsWith("5") ? "az" : "a";
    return { display: `Mennyi ${base}${rag} ${nevelo} <span class="blue-percent">${percent}%</span>-a ?`, answer: result.toString(), answerType: "number" };
  }},
  { name: "Egyenletek átrendezése", value: "egyenletek_atrendezese", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    if (difficulty === "hard") {
      let a = getRandomInt(2, 10), b = getRandomInt(2, 10), c = getRandomInt(2, 10), d = getRandomInt(-50, 50);
      let x = getRandomInt(min, max);
      let result = (a * x * b) / c + d;
      return { display: `${a}x × ${b} ÷ ${c} ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${result}    | x`, answer: x.toString(), answerType: "number" };
    }
    let a = getRandomInt(difficulty === "easy" ? 1 : 2, difficulty === "easy" ? 5 : 10);
    let b = getRandomInt(difficulty === "easy" ? -5 : -15, difficulty === "easy" ? 5 : 15);
    let x = getRandomInt(min, max);
    let result = a * x + b;
    return { display: `${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result}    | x`, answer: x.toString(), answerType: "number" };
  }},
  { name: "Villamos mértékegységek", value: "villamos_mertekegysegek", generate: (difficulty) => {
    const ranges = { easy: { mAMin: 100, mAMax: 1000, kOhmMin: 1, kOhmMax: 10, ohmMin: 100, ohmMax: 1000, ampMin: 1, ampMax: 10, mVMin: 100, mVMax: 1000 },
                     medium: { mAMin: 100, mAMax: 3000, kOhmMin: 1, kOhmMax: 15, ohmMin: 100, ohmMax: 3000, ampMin: 1, ampMax: 15, mVMin: 100, mVMax: 3000 },
                     hard: { mAMin: 100, mAMax: 10000, kOhmMin: 1, kOhmMax: 50, ohmMin: 100, ohmMax: 10000, ampMin: 1, ampMax: 50, mVMin: 100, mVMax: 10000 } };
    const { mAMin, mAMax, kOhmMin, kOhmMax, ohmMin, ohmMax, ampMin, ampMax, mVMin, mVMax } = ranges[difficulty];
    const types = [() => ({ display: `<b>${getRandomInt(mAMin, mAMax)} mA</b> = ? A`, answer: (getRandomInt(mAMin, mAMax) / 1000).toString(), answerType: "decimal" }),
                   () => ({ display: `<b>${(getRandomInt(kOhmMin * 10, kOhmMax * 10) / 10).toFixed(1)} kΩ</b> = ? Ω`, answer: (getRandomInt(kOhmMin * 10, kOhmMax * 10) * 100).toString(), answerType: "number" }),
                   () => ({ display: `<b>${getRandomInt(ohmMin, ohmMax)} Ω</b> = ? kΩ`, answer: (getRandomInt(ohmMin, ohmMax) / 1000).toString(), answerType: "decimal" }),
                   () => ({ display: `<b>${(getRandomInt(ampMin * 100, ampMax * 100) / 100).toFixed(2)} A</b> = ? mA`, answer: (getRandomInt(ampMin * 100, ampMax * 100) * 10).toString(), answerType: "number" }),
                   () => ({ display: `<b>${getRandomInt(mVMin, mVMax)} mV</b> = ? V`, answer: (getRandomInt(mVMin, mVMax) / 1000).toString(), answerType: "decimal" })];
    return types[getRandomInt(0, types.length - 1)]();
  }},
  { name: "Ohm-törvény", value: "ohm_torveny", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let maxI = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
    let maxR = difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 200;
    let I = getRandomInt(1, maxI), R = getRandomInt(1, maxR), U = I * R;
    let type = getRandomInt(0, 2);
    if (difficulty === "hard") {
      let R2 = getRandomInt(1, maxR);
      U = I * (R + R2);
      return type === 0 ? { display: `Mennyi a feszültség, ha <b>I = ${I} A</b> és <b>R = ${R} Ω + ${R2} Ω</b>?`, answer: U.toString(), answerType: "number" }
             : type === 1 ? { display: `Mennyi az áram, ha <b>U = ${U} V</b> és <b>R = ${R} Ω + ${R2} Ω</b>?`, answer: I.toString(), answerType: "decimal" }
             : { display: `Mennyi az ellenállás, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`, answer: (R + R2).toString(), answerType: "number" };
    }
    return type === 0 ? { display: `Mennyi a feszültség, ha <b>I = ${I} A</b> és <b>R = ${R} Ω</b>?`, answer: U.toString(), answerType: "number" }
           : type === 1 ? { display: `Mennyi az áram, ha <b>U = ${U} V</b> és <b>R = ${R} Ω</b>?`, answer: I.toString(), answerType: "decimal" }
           : { display: `Mennyi az ellenállás, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`, answer: R.toString(), answerType: "number" };
  }},
  { name: "Teljesítmény", value: "teljesitmeny", generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let maxU = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 200;
    let maxI = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
    let U = getRandomInt(10, maxU), I = getRandomInt(1, maxI), P = U * I;
    if (difficulty === "hard") {
      let I2 = getRandomInt(1, maxI);
      P = U * (I + I2);
      return { display: `Mennyi a teljesítmény, ha <b>U = ${U} V</b>, <b>I₁ = ${I} A</b> és <b>I₂ = ${I2} A</b>?`, answer: P.toString(), answerType: "number" };
    }
    return { display: `Mennyi a teljesítmény, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`, answer: P.toString(), answerType: "number" };
  }}
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
  if (!categorySelect) {
    console.error("Hiba: A categorySelect elem nem található!");
    return;
  }
  try {
    categorySelect.innerHTML = ''; // Töröljük a meglévő opciókat
    taskTypes.forEach(task => {
      const option = document.createElement('option');
      option.value = task.value;
      option.textContent = task.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Hiba a kategóriák betöltésekor:", error);
  }
}

// --- ÁLLAPOTVÁLTOZÓK ---
let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null };
let gameActive = false;
let answerState = { value: "" };
let numpadRendered = false;
let errorCount = 0;

// --- UTOLSÓ VÁLASZTÁS MENTÉSE/BETÖLTÉSE ---
function saveLastSelection() {
  localStorage.setItem("vilma-last-category", categorySelect.value);
  localStorage.setItem("vilma-last-difficulty", difficultySelect.value);
}

function loadLastSelection() {
  const lastCat = localStorage.getItem("vilma-last-category");
  const lastDiff = localStorage.getItem("vilma-last-difficulty");
  if (lastCat) categorySelect.value = lastCat;
  if (lastDiff) difficultySelect.value = lastDiff;
}

categorySelect.addEventListener("change", () => { saveLastSelection(); loadBest(); });
difficultySelect.addEventListener("change", () => { saveLastSelection(); loadBest(); });

// --- LEGJOBB EREDMÉNY MENTÉSE/BETÖLTÉSE ---
function loadBest() {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  try {
    const bestRaw = localStorage.getItem(`vilma-best-${cat}-${diff}`);
    best = bestRaw ? JSON.parse(bestRaw) : { score: 0, time: null };
  } catch { best = { score: 0, time: null }; }
  showBest();
}

function saveBest(newScore, time) {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  if (newScore > best.score || (newScore === best.score && (best.time === null || time < best.time))) {
    best = { score: newScore, time: time };
    localStorage.setItem(`vilma-best-${cat}-${diff}`, JSON.stringify(best));
    showBest();
  }
}

function showBest() {
  if (best.score > 0) {
    bestStats.innerHTML = `🏆 <b>Legjobb eredmény:</b> ${best.time} mp (${categoryLabel()} / ${difficultyLabel()})`;
    bestStats.style.display = "";
  } else {
    bestStats.style.display = "none";
  }
}

function difficultyLabel() {
  return { easy: "Könnyű", medium: "Közepes", hard: "Kihívás" }[difficultySelect.value] || "";
}

function categoryLabel() {
  return categorySelect.options[categorySelect.selectedIndex]?.textContent || "";
}

// --- TÉMA VÁLTÁS ---
function applyTheme() {
  const theme = localStorage.getItem("vilma-theme") || "dark";
  document.body.classList.toggle("light", theme === "light");
}

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("vilma-theme", isLight ? "dark" : "light");
  applyTheme();
});

// --- IDŐZÍTŐ ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed}`;
}

// --- ZÁRÓJELES KIFEJEZÉSEK GENERÁLÁSA ---
function generateBracketedExpression(opCount, min, max) {
  const opList = ["+", "-", "×", "÷"];
  let elements = [], tryCount = 0, maxTries = 100;
  let minDivisor = opCount === 2 ? 1 : opCount === 4 ? 2 : 5;
  let maxDivisor = opCount === 2 ? 10 : opCount === 4 ? 20 : 100;
  do {
    elements = Array(opCount * 2 + 1).fill().map((_, i) => i % 2 === 0 ? getRandomInt(min, max) : opList[getRandomInt(0, 3)]);
    for (let i = 1; i < elements.length; i += 2) if (elements[i] === "÷") elements[i - 1] *= getRandomInt(minDivisor, maxDivisor);
    let parenRanges = [], used = Array(elements.length).fill(false);
    let numParens = getRandomInt(1, Math.floor(opCount / 2));
    for (let i = 0; i < elements.length - 2; i += 2) {
      if (parenRanges.length < numParens && !used[i]) {
        parenRanges.push([i, i + 2]);
        for (let j = i; j <= i + 2; j++) used[j] = true;
      }
    }
    let exprParts = [...elements];
    parenRanges.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
      exprParts.splice(start, 0, "(");
      exprParts.splice(end + 1, 0, ")");
    });
    let displayExpr = exprParts.map((part, i) => ["(", ")"].includes(part) ? part + " " : ["+", "-", "×", "÷"].includes(part) ? ` ${part} ` : part).join('').trim();
    let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
    try { var answer = eval(evalExpr); } catch { var answer = null; }
    tryCount++;
  } while ((typeof answer !== "number" || !isFinite(answer) || isNaN(answer) || answer !== Math.round(answer)) && tryCount < maxTries);
  return { display: displayExpr, answer: Math.round(answer).toString(), answerType: "number" };
}

// --- FELADATSOR GENERÁLÁSA ---
function generateQuestions() {
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  questions = [];
  const taskType = taskTypes.find(t => t.value === category);
  if (!taskType) {
    questions.push({ display: "Hiba: kategória nincs implementálva", answer: null, answerType: "number" });
    return;
  }
  for (let i = 0; i < QUESTIONS; i++) {
    const task = taskType.generate(difficulty);
    if (!task.answer || task.answer === "?") task.display = "Hiba: érvénytelen feladat generálódott";
    questions.push(task);
  }
}

// --- SZÁMBILLENTYŰZET ---
function renderNumpad(answerState, onChange) {
  if (numpadRendered) return numpadContainer.firstChild;
  numpadRendered = true;
  const rows = [['1', '2', '3', '/', '←'], ['4', '5', '6', '.', 'submit'], ['7', '8', '9', '0', '-']];
  const numpadDiv = document.createElement('div');
  numpadDiv.className = 'numpad active';
  rows.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'numpad-row';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = key === 'submit' ? 'numpad-btn numpad-submit-btn' : 'numpad-btn';
      btn.textContent = key !== 'submit' ? key : '';
      btn.tabIndex = -1;
      if (key === 'submit') {
        btn.innerHTML = `<span><svg viewBox="0 0 48 48" width="1.2em" height="1.2em" style="display:block;margin:auto;" aria-hidden="true"><path d="M40 6v23H14.83l6.58-6.59L19 20l-10 10 10 10 2.41-2.41L14.83 31H44V6z" fill="currentColor"/></svg></span>`;
        btn.setAttribute("aria-label", "Küldés (Enter)");
        btn.onclick = () => {
          if (!gameActive || btn.disabled) return;
          btn.disabled = true;
          setTimeout(() => btn.disabled = false, 200);
          let val = answerState.value.trim();
          if (!val || val === "-") {
            answerState.value = "";
            onChange(answerState.value);
            numpadContainer.querySelector('.answer-view')?.classList.add('error');
            setTimeout(() => numpadContainer.querySelector('.answer-view')?.classList.remove('error'), 500);
            return;
          }
          let correct = false;
          const currentTask = questions[currentQuestion] || {};
          if (!currentTask.answer) {
            answerState.value = "";
            onChange(answerState.value);
            numpadContainer.querySelector('.answer-view')?.classList.add('error');
            setTimeout(() => numpadContainer.querySelector('.answer-view')?.classList.remove('error'), 500);
            return;
          }
          val = val.replace(',', '.');
          if (currentTask.answerType === "fraction") {
            const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
            const [userNum, userDen] = val.split('/').map(Number);
            if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
              answerState.value = "";
              onChange(answerState.value);
              numpadContainer.querySelector('.answer-view')?.classList.add('error');
              setTimeout(() => numpadContainer.querySelector('.answer-view')?.classList.remove('error'), 500);
              return;
            }
            const [simpUserNum, simpUserDen] = simplifyFraction(userNum, userDen);
            correct = simpUserNum === ansNum && simpUserDen === ansDen;
          } else if (currentTask.answerType === "decimal") {
            correct = Math.abs(parseFloat(val) - parseFloat(currentTask.answer)) < 0.0001;
          } else if (currentTask.answerType === "number") {
            const userAnswer = parseFloat(val), correctAnswer = parseInt(currentTask.answer);
            correct = categorySelect.value === "szazalekszamitas" ? Math.round(userAnswer) === correctAnswer : userAnswer === correctAnswer;
          }
          if (correct) {
            errorCount = 0;
            score++;
            if (difficultySelect.value === "hard") alert(motivationalMessages[getRandomInt(0, motivationalMessages.length - 1)]);
            else if (difficultySelect.value === "medium" && currentQuestion === QUESTIONS - 2) alert("Gratulálok, csak így tovább, mindjárt a végére érsz!");
            currentQuestion++;
            currentQuestion < QUESTIONS ? showQuestion(currentQuestion) : finishGame();
          } else {
            errorCount++;
            answerState.value = "";
            onChange(answerState.value);
            numpadContainer.querySelector('.answer-view')?.classList.add('error');
            const messageLevel = errorCount <= 2 ? "level1" : errorCount <= 4 ? "level2" : "level3";
            const errorMsg = errorMessages[messageLevel][getRandomInt(0, errorMessages[messageLevel].length - 1)];
            const errorMessage = document.createElement("div");
            errorMessage.className = "error-message";
            errorMessage.textContent = errorMsg;
            quizContainer.appendChild(errorMessage);
            setTimeout(() => { errorMessage.remove(); numpadContainer.querySelector('.answer-view')?.classList.remove('error'); }, 1500);
          }
        };
      } else {
        btn.onclick = () => {
          if (btn.disabled) return;
          btn.disabled = true;
          setTimeout(() => btn.disabled = false, 200);
          btn.classList.add('flash');
          setTimeout(() => btn.classList.remove('flash'), 200);
          if (key === '←') answerState.value = answerState.value.slice(0, -1);
          else if (key === '-') answerState.value = answerState.value.startsWith('-') ? answerState.value.substring(1) : '-' + answerState.value;
          else if (key === '/') answerState.value += !answerState.value.includes('/') ? '/' : '';
          else if (key === '.') answerState.value += !answerState.value.includes('.') ? '.' : '';
          else answerState.value += key;
          onChange(answerState.value);
        };
      }
      rowDiv.appendChild(btn);
    });
    numpadDiv.appendChild(rowDiv);
  });
  return numpadDiv;
}

// --- JÁTÉK LOGIKA ---
function showQuestion(index) {
  quizContainer.innerHTML = "";
  if (index >= QUESTIONS) {
    finishGame();
    return;
  }
  const q = questions[index];
  const div = document.createElement("div");
  div.className = "question-container";
  div.innerHTML = `<div class="question-number">${QUESTIONS} / ${index + 1}. feladat:</div><div class="question-text">${q.display} = </div>`;
  let answerState = { value: "" };
  const answerView = document.createElement("div");
  answerView.className = "answer-view";
  answerView.textContent = "";
  answerView.addEventListener('touchstart', e => e.preventDefault());
  div.appendChild(answerView);
  numpadContainer.innerHTML = "";
  numpadContainer.appendChild(renderNumpad(answerState, val => answerView.textContent = val));
  numpadContainer.classList.add("active");
  quizContainer.appendChild(div);
  const progress = document.querySelector('.progress');
  if (progress) progress.style.width = `${((index + 1) / QUESTIONS) * 100}%`;
  answerView.focus();
  numpadContainer.querySelector('.numpad-btn')?.focus();
  div.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startGame() {
  gameActive = true;
  score = 0;
  currentQuestion = 0;
  errorCount = 0;
  generateQuestions();
  showQuestion(0);
  startTime = Date.now();
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  categorySelect.disabled = difficultySelect.disabled = true;
  restartBtn.style.display = startBtn.style.display = "none";
  bestStats.style.opacity = "0.55";
}

function finishGame() {
  gameActive = false;
  clearInterval(timerInterval);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed} (Vége)`;
  quizContainer.innerHTML = `<p style="font-size:1.2em;"><b>Gratulálok!</b> ${elapsed} másodperc alatt végeztél.</p>`;
  numpadContainer.innerHTML = "";
  numpadContainer.classList.remove("active");
  numpadRendered = false;
  saveBest(score, elapsed);
  restartBtn.style.display = startBtn.style.display = "";
  bestStats.style.opacity = "1";
  categorySelect.disabled = difficultySelect.disabled = false;
}

restartBtn.onclick = startBtn.onclick = startGame;

// --- INDÍTÁS ---
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    loadCategories();
    loadLastSelection();
    loadBest();
    applyTheme();
  }, 500); // Növelt késleltetés iOS kompatibilitás érdekében
});