// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 5;
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 },
  medium: { min: -10, max: 20 },
  hard: { min: -50, max: 50 }
};

// --- FELADATTÍPUSOK ---
const taskTypes = [
  {
    name: "Összeadás",
    value: "osszeadas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      return {
        display: `<b>${num1}</b> + <b>${num2}</b>`,
        answer: (num1 + num2).toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Kivonás",
    value: "kivonas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      return {
        display: `<b>${num1}</b> - <b>${num2}</b>`,
        answer: (num1 - num2).toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Szorzás",
    value: "szorzas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      return {
        display: `<b>${num1}</b> × <b>${num2}</b>`,
        answer: (num1 * num2).toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Osztás",
    value: "osztas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5;
      let maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
      let num2 = getRandomInt(minDivisor, maxDivisor);
      let answer = getRandomInt(min, max);
      return {
        display: `<b>${num2 * answer}</b> ÷ <b>${num2}</b>`,
        answer: answer.toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Mind a négy művelet",
    value: "mind_negy_muvelet",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
      const opList = ["+", "-", "×", "÷"];
      let nums = [];
      let ops = [];
      let lastVal = getRandomInt(min, max);
      nums.push(lastVal);
      let minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5;
      let maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
      for (let j = 0; j < opCount; j++) {
        let op = opList[getRandomInt(0, 3)];
        if (op === "÷") {
          let divisor = getRandomInt(minDivisor, maxDivisor);
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
      return {
        display: displayExpr,
        answer: answer.toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Zárójeles kifejezések",
    value: "zarojeles_kifejezesek",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6;
      return generateBracketedExpression(opCount, min, max);
    }
  },
  {
    name: "Törtek",
    value: "tortek",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let minDenom = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
      let maxDenom = difficulty === "easy" ? 8 : difficulty === "medium" ? 12 : 20;
      let b = getRandomInt(minDenom, maxDenom), d = getRandomInt(minDenom, maxDenom);
      let a = getRandomInt(1, b - 1), c = getRandomInt(1, d - 1);
      let numerator = a * d + c * b;
      let denominator = b * d;
      let [num, denom] = simplifyFraction(numerator, denominator);
      return {
        display: `${a}/${b} + ${c}/${d}`,
        answer: `${num}/${denom}`,
        answerType: "fraction"
      };
    }
  },
  {
    name: "Százalékszámítás",
    value: "szazalekszamitas",
    generate: (difficulty) => {
      let percentArrEasy = [10, 20, 50, 120, 150, 250];
      let percentArrMedium = [5, 10, 20, 25, 50, 75, 120, 125, 150, 250];
      let percentArrHard = [2, 5, 15, 33, 66, 75, 80, 125, 150, 200, 300];
      let percentArr = difficulty === "easy" ? percentArrEasy : difficulty === "medium" ? percentArrMedium : percentArrHard;
      let baseCandidates = [];
      if (difficulty === "easy") {
        for (let i = 10; i <= 200; i += 10) baseCandidates.push(i);
      } else if (difficulty === "medium") {
        for (let i = 10; i <= 200; i += 5) if (i % 5 === 0) baseCandidates.push(i);
      } else {
        for (let i = 10; i <= 200; i++) baseCandidates.push(i);
      }
      let percent = percentArr[getRandomInt(0, percentArr.length - 1)];
      let base = baseCandidates[getRandomInt(0, baseCandidates.length - 1)];
      let result = Math.round(base * percent / 100);
      let lastDigit = base % 10;
      let lastTwoDigits = base % 100;
      let rag = (lastDigit === 3 || lastDigit === 6 || lastDigit === 8 ||
                 lastTwoDigits === 0 || lastTwoDigits === 20 || lastTwoDigits === 30 ||
                 lastTwoDigits === 60 || lastTwoDigits === 80) ? "-nak" : "-nek";
      let percentStr = percent.toString();
      let nevelo = percentStr.startsWith("5") ? "az" : "a";
      return {
        display: `Mennyi ${base}${rag} ${nevelo} <span class="blue-percent">${percent}%</span>-a ?`,
        answer: result.toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Egyenletek átrendezése",
    value: "egyenletek_atrendezese",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let aMin = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
      let aMax = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 20;
      let bMin = difficulty === "easy" ? -5 : difficulty === "medium" ? -15 : -30;
      let bMax = difficulty === "easy" ? 5 : difficulty === "medium" ? 15 : 30;
      let x = getRandomInt(min, max);
      let a = getRandomInt(aMin, aMax);
      let b = getRandomInt(bMin, bMax);
      let result = a * x + b;
      return {
        display: `${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result}    | x`,
        answer: x.toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Villamos mértékegységek",
    value: "villamos_mertekegysegek",
    generate: (difficulty) => {
      const ranges = {
        easy: { mAMin: 100, mAMax: 1000, kOhmMin: 1, kOhmMax: 10, ohmMin: 100, ohmMax: 1000, ampMin: 1, ampMax: 10, mVMin: 100, mVMax: 1000 },
        medium: { mAMin: 100, mAMax: 3000, kOhmMin: 1, kOhmMax: 15, ohmMin: 100, ohmMax: 3000, ampMin: 1, ampMax: 15, mVMin: 100, mVMax: 3000 },
        hard: { mAMin: 100, mAMax: 5000, kOhmMin: 1, kOhmMax: 20, ohmMin: 100, ohmMax: 5000, ampMin: 1, ampMax: 20, mVMin: 100, mVMax: 5000 }
      };
      const { mAMin, mAMax, kOhmMin, kOhmMax, ohmMin, ohmMax, ampMin, ampMax, mVMin, mVMax } = ranges[difficulty];
      const types = [
        () => {
          let mA = getRandomInt(mAMin, mAMax);
          return {
            display: `<b>${mA} mA</b> = ? A`,
            answer: (mA / 1000).toString(),
            answerType: "decimal"
          };
        },
        () => {
          let kOhm = (getRandomInt(kOhmMin, kOhmMax) / 10).toFixed(1);
          return {
            display: `<b>${kOhm} kΩ</b> = ? Ω`,
            answer: (parseFloat(kOhm) * 1000).toString(),
            answerType: "number"
          };
        },
        () => {
          let ohm = getRandomInt(ohmMin, ohmMax);
          return {
            display: `<b>${ohm} Ω</b> = ? kΩ`,
            answer: (ohm / 1000).toString(),
            answerType: "decimal"
          };
        },
        () => {
          let amp = (getRandomInt(ampMin, ampMax) / 100).toFixed(2);
          return {
            display: `<b>${amp} A</b> = ? mA`,
            answer: (parseFloat(amp) * 1000).toString(),
            answerType: "number"
          };
        },
        () => {
          let mV = getRandomInt(mVMin, mVMax);
          return {
            display: `<b>${mV} mV</b> = ? V`,
            answer: (mV / 1000).toString(),
            answerType: "decimal"
          };
        }
      ];
      return types[getRandomInt(0, types.length - 1)]();
    }
  },
  {
    name: "Hatványozás",
    value: "hatvanyozas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let base, exponent, answer;
      if (difficulty === "easy") {
        base = getRandomInt(1, 10);
        exponent = getRandomInt(2, 3);
      } else if (difficulty === "medium") {
        base = getRandomInt(-10, 20);
        exponent = getRandomInt(2, 4);
        if (base < 0) exponent = 2;
      } else {
        base = getRandomInt(-50, 50);
        exponent = getRandomInt(2, 5);
        if (base < 0) exponent = getRandomInt(2, 3);
      }
      answer = Math.pow(base, exponent);
      if (Math.abs(answer) > 100000) {
        base = getRandomInt(1, 10);
        exponent = 2;
        answer = Math.pow(base, exponent);
      }
      return {
        display: `Mennyi <b>${base}<sup>${exponent}</sup></b>?`,
        answer: answer.toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Ohm-törvény",
    value: "ohm_torveny",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let maxI = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
      let maxR = difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 100;
      let I = getRandomInt(1, maxI); // Áram (A)
      let R = getRandomInt(1, maxR); // Ellenállás (Ω)
      let U = I * R; // Feszültség (V)
      let type = getRandomInt(0, 2); // Változó: U, I, vagy R
      if (type === 0) {
        return {
          display: `Mennyi a feszültség, ha <b>I = ${I} A</b> és <b>R = ${R} Ω</b>?`,
          answer: U.toString(),
          answerType: "number"
        };
      } else if (type === 1) {
        return {
          display: `Mennyi az áram, ha <b>U = ${U} V</b> és <b>R = ${R} Ω</b>?`,
          answer: I.toString(),
          answerType: "decimal"
        };
      } else {
        return {
          display: `Mennyi az ellenállás, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`,
          answer: R.toString(),
          answerType: "number"
        };
      }
    }
  },
  {
    name: "Teljesítmény",
    value: "teljesitmeny",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let maxU = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 100;
      let maxI = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
      let U = getRandomInt(10, maxU); // Feszültség (V)
      let I = getRandomInt(1, maxI); // Áram (A)
      let P = U * I; // Teljesítmény (W)
      return {
        display: `Mennyi a teljesítmény, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`,
        answer: P.toString(),
        answerType: "number"
      };
    }
  }
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
  categorySelect.innerHTML = taskTypes.map(task => `<option value="${task.value}">${task.name}</option>`).join('');
}

// --- ÁLLAPOTVÁLTOZÓK ---
let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null };
let gameActive = false;

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
  switch (difficultySelect.value) {
    case "easy": return "Könnyű";
    case "medium": return "Közepes";
    case "hard": return "Kihívás";
    default: return "";
  }
}

function categoryLabel() {
  return categorySelect.options[categorySelect.selectedIndex].textContent;
}

// --- TÉMA VÁLTÁS ---
function applyTheme() {
  const theme = localStorage.getItem("vilma-theme") || "dark";
  const isLight = theme === "light";
  document.body.classList.toggle("light", isLight);
}

themeToggle.addEventListener("click", function () {
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("vilma-theme", isLight ? "dark" : "light");
  applyTheme();
});

// --- NEHÉZSÉG ÉS KATEGÓRIA KEZELÉSE ---
difficultySelect.addEventListener("change", loadBest);
categorySelect.addEventListener("change", loadBest);

// --- IDŐZÍTŐ ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed}`;
}

// --- SEGÉDFÜGGVÉNYEK ---
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function simplifyFraction(num, denom) {
  let d = gcd(Math.abs(num), Math.abs(denom));
  return [num / d, denom / d];
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
    if (!task.answer || task.answer === "?") {
      task.display = "Hiba: érvénytelen feladat generálódott";
      task.answer = null;
    }
    questions.push(task);
  }
}

// --- SZÁMBILLENTYŰZET ---
function renderNumpad(answerState, onChange) {
  const rows = [
    ['1', '2', '3', '/', '←'],
    ['4', '5', '6', '.', 'submit'],
    ['7', '8', '9', '0', '-']
  ];
  const numpadDiv = document.createElement('div');
  numpadDiv.className = 'numpad active';

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
          const currentTask = questions[currentQuestion] || {};
          if (!currentTask.answer) {
            alert("Hiba: nincs válasz definiálva!");
            return;
          }

          // Normalizáljuk az inputot: vesszőt tizedes törtet jelző pontra cseréljük
          val = val.replace(',', '.');

          if (currentTask.answerType === "fraction") {
            const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
            const [userNum, userDen] = val.split('/').map(Number);
            if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
              alert("Érvénytelen tört formátum! Írj be egy törtet, pl. '3/4'.");
              return;
            }
            const [simpUserNum, simpUserDen] = simplifyFraction(userNum, userDen);
            if (simpUserNum === ansNum && simpUserDen === ansDen) {
              correct = true;
            }
          } else if (currentTask.answerType === "decimal") {
            const correctAnswer = parseFloat(currentTask.answer);
            const userAnswer = parseFloat(val);
            if (isNaN(userAnswer)) {
              alert("Érvénytelen szám! Írj be egy tizedes törtet, pl. '3.14'.");
              return;
            }
            if (Math.abs(userAnswer - correctAnswer) < 0.0001) {
              correct = true;
            }
          } else if (currentTask.answerType === "number") {
            const correctAnswer = parseInt(currentTask.answer);
            const userAnswer = parseFloat(val);
            if (isNaN(userAnswer)) {
              alert("Érvénytelen szám! Írj be egy egész számot.");
              return;
            }
            if (categorySelect.value === "Százalékszámítás") {
              if (Math.round(userAnswer) === correctAnswer) {
                correct = true;
              }
            } else {
              if (userAnswer === correctAnswer) {
                correct = true;
              }
            }
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
        btn.tabIndex = -1;
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
  div.className = "question-container";
  div.innerHTML =
    `<div class="question-number">${QUESTIONS} / ${index + 1}. feladat:</div>
     <div class="question-text">${q.display} = </div>`;
  let answerState = { value: "" };
  const answerView = document.createElement("div");
  answerView.className = "answer-view";
  answerView.textContent = "";
  div.appendChild(answerView);

  const numpad = renderNumpad(answerState, function (val) {
    answerView.textContent = val;
  });

  numpadContainer.innerHTML = "";
  numpadContainer.appendChild(numpad);
  numpadContainer.classList.add("active");
  quizContainer.appendChild(div);

  div.scrollIntoView({ behavior: "smooth", block: "start" });
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

  categorySelect.disabled = true;
  difficultySelect.disabled = true;

  restartBtn.style.display = "none";
  startBtn.style.display = "none";
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
  saveBest(score, elapsed);

  restartBtn.style.display = "";
  startBtn.style.display = "";
  bestStats.style.opacity = "1";
  categorySelect.disabled = false;
  difficultySelect.disabled = false;
}

restartBtn.onclick = startGame;
startBtn.onclick = startGame;

// --- INDÍTÁS ---
loadCategories();
loadLastSelection();
loadBest();
applyTheme();