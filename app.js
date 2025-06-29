// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 10;
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 },
  medium: { min: -10, max: 20 },
  hard: { min: -50, max: 50 }
};

// --- HTML ELEMEK ---
const quizContainer = document.getElementById("quiz");
const timerDisplay = document.getElementById("timer");
const bestStats = document.getElementById("best-stats");
const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const themeToggle = document.getElementById("theme-toggle");

// --- ÁLLAPOTVÁLTOZÓK ---
let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null };
let gameActive = false;

// --- ÚJ: utolsó választott feladattípus és nehézség tárolása és visszatöltése ---

// Mentsük el a választásokat minden váltáskor
function saveLastSelection() {
  localStorage.setItem("vilma-last-category", categorySelect.value);
  localStorage.setItem("vilma-last-difficulty", difficultySelect.value);
}

// Töltsük vissza induláskor, ha van mentett érték
function loadLastSelection() {
  const lastCat = localStorage.getItem("vilma-last-category");
  const lastDiff = localStorage.getItem("vilma-last-difficulty");
  if (lastCat) categorySelect.value = lastCat;
  if (lastDiff) difficultySelect.value = lastDiff;
}

// Eseménykezelők: minden változáskor mentsük el
categorySelect.addEventListener("change", function () {
  saveLastSelection();
  loadBest();
});
difficultySelect.addEventListener("change", function () {
  saveLastSelection();
  loadBest();
});


// --- LEGJOBB EREDMÉNY MENTÉSE/BETÖLTÉSE ---
function loadBest() {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  try {
    const bestRaw = localStorage.getItem("vilma-best-" + cat + "-" + diff);
    best = bestRaw ? JSON.parse(bestRaw) : { score: 0, time: null };
  } catch { best = { score: 0, time: null }; }
  showBest();
}
function saveBest(newScore, time) {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  if (newScore > best.score || (newScore === best.score && (best.time === null || time < best.time))) {
    best = { score: newScore, time: time };
    localStorage.setItem("vilma-best-" + cat + "-" + diff, JSON.stringify(best));
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
  switch(difficultySelect.value) {
    case "easy": return "Könnyű";
    case "medium": return "Közepes";
    case "hard": return "Nehéz";
    default: return "";
  }
}
function categoryLabel() {
  return categorySelect.options[categorySelect.selectedIndex].textContent;
}

// --- TÉMA VÁLTÁS ---
function applyTheme() {
  const dark = localStorage.getItem("vilma-theme") !== "light";
  document.body.classList.toggle("light", !dark);
}
themeToggle.addEventListener("click", function() {
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("vilma-theme", isLight ? "dark" : "light");
  applyTheme();
});
applyTheme();

// --- NEHÉZSÉG ÉS KATEGÓRIA KEZELÉSE ---
difficultySelect.addEventListener("change", loadBest);
categorySelect.addEventListener("change", loadBest);

// --- IDŐZÍTŐ ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `⏱️ Idő: ${elapsed} mp`;
}

// --- FELADATSOR GENERÁLÁSA ---
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function simplifyFraction(num, denom) {
  let d = gcd(Math.abs(num), Math.abs(denom));
  return [num/d, denom/d];
}


function generateQuestions() {
  const { min, max } = DIFFICULTY_SETTINGS[difficultySelect.value];
  const category = categorySelect.value;
  questions = [];

  // Helper: nem átfedő zárójelezett szakaszok generálása, balról jobbra rendezve
  function generateParenRanges(opCount, minParens, maxParens) {
    let numParens = getRandomInt(minParens, maxParens);
    let tries = 0;
    let ranges = [];
    while (ranges.length < numParens && tries < 100) {
      let start = getRandomInt(0, opCount - 1);
      let end = getRandomInt(start + 1, opCount);
      // Minimum két számot zárjon be
      // Ellenőrizzük, hogy nem fed át mással
      if (!ranges.some(([s, e]) => !(end <= s || start >= e))) {
        ranges.push([start, end]);
      }
      tries++;
    }
    // balról jobbra rendezzük, hogy a beszúrások ne tolódjanak el
    ranges.sort((a, b) => a[0] - b[0]);
    return ranges;
  }

  for (let i = 0; i < QUESTIONS; i++) {
    let q = {};

    if (category === "Zárójeles kifejezések") {
      let opCount = 2, minParens = 1, maxParens = 1;
      if (difficultySelect.value === "medium") {
        opCount = 4; minParens = 2; maxParens = 2;
      }
      if (difficultySelect.value === "hard") {
        opCount = 6; minParens = 3; maxParens = 5;
      }
      const opList = ["+", "-", "×", "÷"];
      let nums = [];
      let ops = [];
      let lastVal = getRandomInt(min, max);
      nums.push(lastVal);
      for (let j = 0; j < opCount; j++) {
        let op = opList[getRandomInt(0, 3)];
        if (op === "÷") {
          let divisor = getRandomInt(1, Math.max(2, max));
          lastVal = lastVal * divisor;
          nums[j] = lastVal;
          nums[j + 1] = divisor;
        } else {
          nums[j + 1] = getRandomInt(min, max);
        }
        ops[j] = op;
        lastVal = nums[j + 1];
      }
      // Kifejezés mint tömb
      let exprParts = [];
      for (let j = 0; j < opCount; j++) {
        exprParts.push(nums[j]);
        exprParts.push(ops[j]);
      }
      exprParts.push(nums[opCount]);

      // Zárójelek helyeinek generálása
      let parenRanges = generateParenRanges(opCount, minParens, maxParens);

      // Zárójelek beszúrása balról jobbra, indexeket követve
      let offset = 0;
      parenRanges.forEach(([s, e]) => {
        exprParts.splice(s * 2 + offset, 0, "(");
        offset++;
        exprParts.splice((e + 1) * 2 + offset - 1, 0, ")");
        offset++;
      });

      let displayExpr = exprParts.join(" ");
      let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');

      let answer;
      try {
        answer = eval(evalExpr);
        answer = Math.round(answer);
      } catch {
        answer = "?";
      }
      q = { display: displayExpr, answer: answer };
    }

    else if (category === "Mind a négy művelet") {
      let opCount = 2;
      if (difficultySelect.value === "medium") opCount = 3;
      if (difficultySelect.value === "hard") opCount = 4;
      const opList = ["+", "-", "×", "÷"];
      let nums = [];
      let ops = [];
      let lastVal = getRandomInt(min, max);
      nums.push(lastVal);
      for (let j = 0; j < opCount; j++) {
        let op = opList[getRandomInt(0, 3)];
        if (op === "÷") {
          let divisor = getRandomInt(1, Math.max(2, max));
          lastVal = lastVal * divisor;
          nums[j] = lastVal;
          nums[j + 1] = divisor;
        } else {
          nums[j + 1] = getRandomInt(min, max);
        }
        ops[j] = op;
        lastVal = nums[j + 1];
      }
      let displayExpr = "" + nums[0];
      for (let j = 0; j < opCount; j++) {
        displayExpr += " " + ops[j] + " " + nums[j + 1];
      }
      let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
      let answer;
      try {
        answer = eval(evalExpr);
        answer = Math.round(answer);
      } catch {
        answer = "?";
      }
      q = { display: displayExpr, answer: answer };
    }

    // --- ÖSSZEADÁS ---
    else if (category === "Összeadás") {
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      q = { num1, num2, operator: "+", answer: num1 + num2, display: `<b>${num1}</b> + <b>${num2}</b>` };
    }

    // --- KIVONÁS ---
    else if (category === "Kivonás") {
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      q = { num1, num2, operator: "-", answer: num1 - num2, display: `<b>${num1}</b> - <b>${num2}</b>` };
    }

    // --- SZORZÁS ---
    else if (category === "Szorzás") {
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      q = { num1, num2, operator: "×", answer: num1 * num2, display: `<b>${num1}</b> × <b>${num2}</b>` };
    }

    // --- OSZTÁS ---
    else if (category === "Osztás") {
      let num2 = getRandomInt(1, max > 1 ? max : 10);
      let answer = getRandomInt(min, max);
      q = { num1: num2 * answer, num2: num2, operator: "÷", answer: answer, display: `<b>${num2 * answer}</b> ÷ <b>${num2}</b>` };
    }

    // --- TÖRTEK ---
    else if (category === "Törtek") {
      let b = getRandomInt(2, 8), d = getRandomInt(2, 8);
      let a = getRandomInt(1, b - 1), c = getRandomInt(1, d - 1);
      let numerator = a * d + c * b;
      let denominator = b * d;
      let [num, denom] = simplifyFraction(numerator, denominator);
      q = {
        display: `${a}/${b} + ${c}/${d}`,
        answer: `${num}/${denom}`
      };
    }

    // --- SZÁZALÉKSZÁMÍTÁS ---
    else if (category === "Százalékszámítás") {
      let percent = [10, 20, 25, 50, 75][getRandomInt(0, 4)];
      let base = getRandomInt(20, 200);
      let result = Math.round(base * percent / 100);
      q = {
        display: `Mennyi ${percent}% <b>${base}</b>-nak/nek?`,
        answer: result
      };
    }

    // --- EGYENLETEK ÁTRENDEZÉSE ---
    else if (category === "Egyenletek átrendezése") {
      let x = getRandomInt(-10, 10), a = getRandomInt(1, 5), b = getRandomInt(-10, 10);
      let result = a * x + b;
      q = {
        display: `${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result}. x = ?`,
        answer: x
      };
    }

    // --- Default fallback ---
    else if (!q.display) {
      q = { display: "Hiba: kategória nincs implementálva", answer: null };
    }

    questions.push(q);
  }
}


// --- SZÁMBILLENTYŰZET ---
function renderNumpad(answerState, onChange) {
  const rows = [
    ['1','2','3','/','←'],
    ['4','5','6','.','submit'],
    ['7','8','9','0','-']
  ];
  const numpadDiv = document.createElement('div');
  numpadDiv.className = 'numpad';

  rows.forEach((row) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'numpad-row';
    row.forEach((key) => {
      if (key === 'submit') {
        const enterIcon = `<svg viewBox="0 0 48 48" width="1.2em" height="1.2em" style="display:block;margin:auto;" aria-hidden="true" focusable="false"><path d="M40 6v23H14.83l6.58-6.59L19 20l-10 10 10 10 2.41-2.41L14.83 31H44V6z" fill="currentColor"/></svg>`;
        const submitBtn = document.createElement("button");
        submitBtn.type = "button";
        submitBtn.className = "numpad-btn numpad-submit-btn";
        submitBtn.setAttribute("aria-label", "Küldés (Enter)");
        submitBtn.innerHTML = `<span>${enterIcon}</span>`;
        submitBtn.onclick = () => {
          if (!gameActive) return;
          let val = answerState.value.trim();
          if (val === "" || val === "-") {
            alert("Írj be egy választ!");
            return;
          }
          let correct = false;
          if (categorySelect.value === "Törtek") {
            let [ansNum, ansDen] = (questions[currentQuestion] || {}).answer?.split('/').map(Number);
            let [userNum, userDen] = val.split('/').map(Number);
            if (userNum && userDen) {
              let [simpUserNum, simpUserDen] = simplifyFraction(userNum, userDen);
              if (simpUserNum === ansNum && simpUserDen === ansDen) correct = true;
            }
          } else if (["Zárójeles kifejezések","Egyenletek átrendezése","Százalékszámítás"].includes(categorySelect.value)) {
            if (parseFloat(val) === (questions[currentQuestion] || {}).answer) correct = true;
          } else {
            if (parseFloat(val) === (questions[currentQuestion] || {}).answer) correct = true;
          }
          if (correct) {
            score++;
            currentQuestion++;
            showQuestion(currentQuestion);
          } else {
            alert("Nem jó válasz, próbáld újra!");
          }
        };
        rowDiv.appendChild(submitBtn);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'numpad-btn';
        btn.textContent = key;
        btn.tabIndex = 0;
        btn.onclick = () => {
          if (key === '←') {
            answerState.value = answerState.value.slice(0, -1);
          } else if (key === '-') {
            if (!answerState.value.startsWith('-')) {
              answerState.value = '-' + answerState.value;
            } else {
              answerState.value = answerState.value.substring(1);
            }
          } else if (key === '/') {
            if (!answerState.value.includes('/')) {
              answerState.value += '/';
            }
          } else if (key === '.') {
            if (answerState.value !== "" && !answerState.value.includes('.')) {
              answerState.value += '.';
            }
          } else {
            answerState.value += key;
          }
          onChange(answerState.value);
        };
        rowDiv.appendChild(btn);
      }
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
  div.innerHTML = `<label>${index + 1}. feladat: ${q.display} = </label>`;
  let answerState = { value: "" };
  const answerView = document.createElement("div");
  answerView.className = "answer-view";
  answerView.textContent = "";
  div.appendChild(answerView);

  const numpad = renderNumpad(answerState, function(val) {
    answerView.textContent = val;
  });

  const inputRow = document.createElement('div');
  inputRow.className = 'numpad-container';
  inputRow.appendChild(numpad);
  div.appendChild(inputRow);
  quizContainer.appendChild(div);
}

function startGame() {
  gameActive = true;
  score = 0;
  currentQuestion = 0;
  generateQuestions();
  showQuestion(0);
  startTime = Date.now();
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  restartBtn.style.display = "none";
  startBtn.style.display = "none";
  bestStats.style.opacity = "0.55";
}
function finishGame() {
  gameActive = false;
  clearInterval(timerInterval);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `⏱️ Idő: ${elapsed} mp (Vége)`;
  quizContainer.innerHTML = `<p style="font-size:1.2em;"><b>Gratulálok!</b> ${elapsed} másodperc alatt végeztél.</p>`;
  saveBest(score, elapsed);
  restartBtn.style.display = "";
  startBtn.style.display = "";
  bestStats.style.opacity = "1";
}
restartBtn.onclick = startGame;
startBtn.onclick = startGame;

// --- INDÍTÁS ---
loadLastSelection(); // Először töltsük vissza az utolsó választást!
loadBest();
