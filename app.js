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

// --- VÁLASZLEHETŐSÉGEK GENERÁLÁSA ---
function generateOptions(correctAnswer, answerType, difficulty) {
  let options = [correctAnswer];
  const { min, max } = DIFFICULTY_SETTINGS[difficulty];
  const range = max - min;

  if (answerType === "fraction") {
    const [num, denom] = correctAnswer.split('/').map(Number);
    while (options.length < 4) {
      let newNum = num + getRandomInt(-5, 5);
      let newDenom = denom + getRandomInt(-5, 5);
      if (newDenom === 0) newDenom = 1;
      const [simpNum, simpDenom] = simplifyFraction(newNum, newDenom);
      const option = `${simpNum}/${simpDenom}`;
      if (!options.includes(option) && (simpNum !== num || simpDenom !== denom)) {
        options.push(option);
      }
    }
  } else if (answerType === "decimal") {
    const correct = parseFloat(correctAnswer);
    while (options.length < 4) {
      const offset = getRandomInt(-range / 5, range / 5) / 10;
      const option = (correct + offset).toFixed(2);
      if (!options.includes(option) && option !== correctAnswer) {
        options.push(option);
      }
    }
  } else {
    const correct = parseInt(correctAnswer);
    while (options.length < 4) {
      const offset = getRandomInt(-range / 5, range / 5);
      const option = (correct + offset).toString();
      if (!options.includes(option) && option !== correctAnswer) {
        options.push(option);
      }
    }
  }

  // Véletlenszerű keverés
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

// --- FELADATTÍPUSOK ---
const taskTypes = [
  {
    name: "Összeadás",
    value: "osszeadas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      if (difficulty === "hard") {
        let num3 = getRandomInt(min, max);
        const answer = (num1 + num2 + num3).toString();
        return {
          display: `<b>${num1}</b> + <b>${num2}</b> + <b>${num3}</b>`,
          answer: answer,
          answerType: "number",
          options: generateOptions(answer, "number", difficulty)
        };
      }
      const answer = (num1 + num2).toString();
      return {
        display: `<b>${num1}</b> + <b>${num2}</b>`,
        answer: answer,
        answerType: "number",
        options: generateOptions(answer, "number", difficulty)
      };
    }
  },
  {
    name: "Kivonás",
    value: "kivonas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      if (difficulty === "hard") {
        let num3 = getRandomInt(min, max);
        const answer = (num1 - num2 - num3).toString();
        return {
          display: `<b>${num1}</b> - <b>${num2}</b> - <b>${num3}</b>`,
          answer: answer,
          answerType: "number",
          options: generateOptions(answer, "number", difficulty)
        };
      }
      const answer = (num1 - num2).toString();
      return {
        display: `<b>${num1}</b> - <b>${num2}</b>`,
        answer: answer,
        answerType: "number",
        options: generateOptions(answer, "number", difficulty)
      };
    }
  },
  {
    name: "Szorzás",
    value: "szorzas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let num1 = getRandomInt(min, max), num2 = getRandomInt(min, max);
      if (difficulty === "hard") {
        let num3 = getRandomInt(Math.floor(min / 2), Math.floor(max / 2));
        const answer = (num1 * num2 * num3).toString();
        return {
          display: `<b>${num1}</b> × <b>${num2}</b> × <b>${num3}</b>`,
          answer: answer,
          answerType: "number",
          options: generateOptions(answer, "number", difficulty)
        };
      }
      const answer = (num1 * num2).toString();
      return {
        display: `<b>${num1}</b> × <b>${num2}</b>`,
        answer: answer,
        answerType: "number",
        options: generateOptions(answer, "number", difficulty)
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(minDivisor, maxDivisor);
        let num1 = answer * num2 * num3;
        const answerStr = (num1 / num2 / num3).toString();
        return {
          display: `<b>${num1}</b> ÷ <b>${num2}</b> ÷ <b>${num3}</b>`,
          answer: answerStr,
          answerType: "number",
          options: generateOptions(answerStr, "number", difficulty)
        };
      }
      const answerStr = answer.toString();
      return {
        display: `<b>${num2 * answer}</b> ÷ <b>${num2}</b>`,
        answer: answerStr,
        answerType: "number",
        options: generateOptions(answerStr, "number", difficulty)
      };
    }
  },
  {
    name: "Mind a négy művelet",
    value: "mind_negy_muvelet",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
      const opList = ["+", "-", "×", "÷"];
      let nums = [];
      let ops = [];
      let lastVal = getRandomInt(min, max);
      nums.push(lastVal);
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
            nums[j] = lastVal;
            nums[j + 1] = divisor;
          } else {
            nums[j + 1] = getRandomInt(min, max);
          }
          ops[j] = op;
          lastVal = nums[j + 1];
        }
        displayExpr = "" + nums[0];
        for (let j = 0; j < opCount; j++) {
          displayExpr += " " + ops[j] + " " + nums[j + 1];
        }
        let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
        try {
          answer = eval(evalExpr);
          answer = Math.round(answer);
          if (typeof answer === "number" && isFinite(answer) && !isNaN(answer) && answer === Math.round(answer)) {
            break;
          }
        } catch {
          answer = "?";
        }
        tryCount++;
      }
      if (tryCount >= 1000) {
        nums = [getRandomInt(min, max), getRandomInt(min, max)];
        ops = ["+"];
        displayExpr = `${nums[0]} + ${nums[1]}`;
        answer = nums[0] + nums[1];
      }
      const answerStr = answer.toString();
      return {
        display: displayExpr,
        answer: answerStr,
        answerType: "number",
        options: generateOptions(answerStr, "number", difficulty)
      };
    }
  },
  {
    name: "Zárójeles kifejezések",
    value: "zarojeles_kifejezesek",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 8;
      const result = generateBracketedExpression(opCount, min, max);
      return {
        display: result.display,
        answer: result.answer,
        answerType: "number",
        options: generateOptions(result.answer, "number", difficulty)
      };
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
        exponent = getRandomInt(3, 6);
        if (base < 0) exponent = getRandomInt(3, 4);
      }
      answer = Math.pow(base, exponent);
      if (Math.abs(answer) > 1000000) {
        base = getRandomInt(1, 10);
        exponent = 2;
        answer = Math.pow(base, exponent);
      }
      const answerStr = answer.toString();
      return {
        display: `Mennyi <b>${base}<sup>${exponent}</sup></b>?`,
        answer: answerStr,
        answerType: "number",
        options: generateOptions(answerStr, "number", difficulty)
      };
    }
  },
  {
    name: "Törtek",
    value: "tortek",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let minDenom = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
      let maxDenom = difficulty === "easy" ? 8 : difficulty === "medium" ? 15 : 30;
      let b = getRandomInt(minDenom, maxDenom), d = getRandomInt(minDenom, maxDenom);
      let a = getRandomInt(1, b - 1), c = getRandomInt(1, d - 1);
      if (difficulty === "hard") {
        let e = getRandomInt(1, b - 1), f = getRandomInt(minDenom, maxDenom);
        let numerator = (a * d * f + c * b * f + e * b * d);
        let denominator = b * d * f;
        let [num, denom] = simplifyFraction(numerator, denominator);
        const answer = `${num}/${denom}`;
        return {
          display: `${a}/${b} + ${c}/${d} + ${e}/${f}`,
          answer: answer,
          answerType: "fraction",
          options: generateOptions(answer, "fraction", difficulty)
        };
      }
      let numerator = a * d + c * b;
      let denominator = b * d;
      let [num, denom] = simplifyFraction(numerator, denominator);
      const answer = `${num}/${denom}`;
      return {
        display: `${a}/${b} + ${c}/${d}`,
        answer: answer,
        answerType: "fraction",
        options: generateOptions(answer, "fraction", difficulty)
      };
    }
  },
  {
    name: "Százalékszámítás",
    value: "szazalekszamitas",
    generate: (difficulty) => {
      let percentArrEasy = [10, 20, 50, 100];
      let percentArrMedium = [5, 15, 25, 50, 75, 100];
      let percentArrHard = [2, 3, 7, 15, 33, 66, 125, 150, 200];
      let percentArr = difficulty === "easy" ? percentArrEasy : difficulty === "medium" ? percentArrMedium : percentArrHard;
      let baseCandidates = [];
      if (difficulty === "easy") {
        for (let i = 10; i <= 100; i += 10) baseCandidates.push(i);
      } else if (difficulty === "medium") {
        for (let i = 10; i <= 200; i += 5) baseCandidates.push(i);
      } else {
        for (let i = 10; i <= 500; i++) baseCandidates.push(i);
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
      const answer = result.toString();
      return {
        display: `Mennyi ${base}${rag} ${nevelo} <span class="blue-percent">${percent}%</span>-a ?`,
        answer: answer,
        answerType: "number",
        options: generateOptions(answer, "number", difficulty)
      };
    }
  },
  {
    name: "Egyenletek átrendezése",
    value: "egyenletek_atrendezese",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      if (difficulty === "hard") {
        let a = getRandomInt(2, 10);
        let b = getRandomInt(2, 10);
        let c = getRandomInt(2, 10);
        let d = getRandomInt(-50, 50);
        let x = getRandomInt(min, max);
        let result = (a * x * b) / c + d;
        const answer = x.toString();
        return {
          display: `${a}x × ${b} ÷ ${c} ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${result}    | x`,
          answer: answer,
          answerType: "number",
          options: generateOptions(answer, "number", difficulty)
        };
      }
      let aMin = difficulty === "easy" ? 1 : 2;
      let aMax = difficulty === "easy" ? 5 : 10;
      let bMin = difficulty === "easy" ? -5 : -15;
      let bMax = difficulty === "easy" ? 5 : 15;
      let x = getRandomInt(min, max);
      let a = getRandomInt(aMin, aMax);
      let b = getRandomInt(bMin, bMax);
      let result = a * x + b;
      const answer = x.toString();
      return {
        display: `${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result}    | x`,
        answer: answer,
        answerType: "number",
        options: generateOptions(answer, "number", difficulty)
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
        hard: { mAMin: 100, mAMax: 10000, kOhmMin: 1, kOhmMax: 50, ohmMin: 100, ohmMax: 10000, ampMin: 1, ampMax: 50, mVMin: 100, mVMax: 10000 }
      };
      const { mAMin, mAMax, kOhmMin, kOhmMax, ohmMin, ohmMax, ampMin, ampMax, mVMin, mVMax } = ranges[difficulty];
      const types = [
        () => {
          let mA = getRandomInt(mAMin, mAMax);
          const answer = (mA / 1000).toString();
          return {
            display: `<b>${mA} mA</b> = ? A`,
            answer: answer,
            answerType: "decimal",
            options: generateOptions(answer, "decimal", difficulty)
          };
        },
        () => {
          let kOhm = (getRandomInt(kOhmMin * 10, kOhmMax * 10) / 10).toFixed(1);
          const answer = (parseFloat(kOhm) * 1000).toString();
          return {
            display: `<b>${kOhm} kΩ</b> = ? Ω`,
            answer: answer,
            answerType: "number",
            options: generateOptions(answer, "number", difficulty)
          };
        },
        () => {
          let ohm = getRandomInt(ohmMin, ohmMax);
          const answer = (ohm / 1000).toString();
          return {
            display: `<b>${ohm} Ω</b> = ? kΩ`,
            answer: answer,
            answerType: "decimal",
            options: generateOptions(answer, "decimal", difficulty)
          };
        },
        () => {
          let amp = (getRandomInt(ampMin * 100, ampMax * 100) / 100).toFixed(2);
          const answer = (parseFloat(amp) * 1000).toString();
          return {
            display: `<b>${amp} A</b> = ? mA`,
            answer: answer,
            answerType: "number",
            options: generateOptions(answer, "number", difficulty)
          };
        },
        () => {
          let mV = getRandomInt(mVMin, mVMax);
          const answer = (mV / 1000).toString();
          return {
            display: `<b>${mV} mV</b> = ? V`,
            answer: answer,
            answerType: "decimal",
            options: generateOptions(answer, "decimal", difficulty)
          };
        }
      ];
      return types[getRandomInt(0, types.length - 1)]();
    }
  },
  {
    name: "Ohm-törvény",
    value: "ohm_torveny",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let maxI = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
      let maxR = difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 200;
      let I = getRandomInt(1, maxI);
      let R = getRandomInt(1, maxR);
      let U = I * R;
      let type = getRandomInt(0, 2);
      let display, answer, answerType;
      if (difficulty === "hard") {
        let R2 = getRandomInt(1, maxR);
        U = I * (R + R2);
        if (type === 0) {
          display = `Mennyi a feszültség, ha <b>I = ${I} A</b> és <b>R = ${R} Ω + ${R2} Ω</b>?`;
          answer = U.toString();
          answerType = "number";
        } else if (type === 1) {
          display = `Mennyi az áram, ha <b>U = ${U} V</b> és <b>R = ${R} Ω + ${R2} Ω</b>?`;
          answer = I.toString();
          answerType = "decimal";
        } else {
          display = `Mennyi az ellenállás, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`;
          answer = (R + R2).toString();
          answerType = "number";
        }
      } else {
        if (type === 0) {
          display = `Mennyi a feszültség, ha <b>I = ${I} A</b> és <b>R = ${R} Ω</b>?`;
          answer = U.toString();
          answerType = "number";
        } else if (type === 1) {
          display = `Mennyi az áram, ha <b>U = ${U} V</b> és <b>R = ${R} Ω</b>?`;
          answer = I.toString();
          answerType = "decimal";
        } else {
          display = `Mennyi az ellenállás, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`;
          answer = R.toString();
          answerType = "number";
        }
      }
      return {
        display: display,
        answer: answer,
        answerType: answerType,
        options: generateOptions(answer, answerType, difficulty)
      };
    }
  },
  {
    name: "Teljesítmény",
    value: "teljesitmeny",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      let maxU = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 200;
      let maxI = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
      let U = getRandomInt(10, maxU);
      let I = getRandomInt(1, maxI);
      let P = U * I;
      let display, answer;
      if (difficulty === "hard") {
        let I2 = getRandomInt(1, maxI);
        P = U * (I + I2);
        display = `Mennyi a teljesítmény, ha <b>U = ${U} V</b>, <b>I₁ = ${I} A</b> és <b>I₂ = ${I2} A</b>?`;
        answer = P.toString();
      } else {
        display = `Mennyi a teljesítmény, ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`;
        answer = P.toString();
      }
      return {
        display: display,
        answer: answer,
        answerType: "number",
        options: generateOptions(answer, "number", difficulty)
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
let wrongAnswers = 0;

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
  const theme = localStorage.getItem("vilma-theme") || "light";
  const isLight = theme === "light";
  document.body.classList.toggle("dark", !isLight);
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
    themeToggle.addEventListener("touchstart", toggleTheme);
  } else {
    console.error("A #theme-toggle elem nem található.");
  }
  applyTheme();
});

function toggleTheme(event) {
  event.preventDefault();
  const body = document.body;
  if (body.classList.contains("dark")) {
    body.classList.remove("dark");
    localStorage.setItem("vilma-theme", "light");
  } else {
    body.classList.add("dark");
    localStorage.setItem("vilma-theme", "dark");
  }
}

// --- NEHÉZSÉG ÉS KATEGÓRIA KEZELÉSE ---
difficultySelect.addEventListener("change", loadBest);
categorySelect.addEventListener("change", loadBest);

// --- IDŐZÍTŐ ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed}`;
}

// --- ZÁRÓJELES KIFEJEZÉSEK GENERÁLÁSA ---
function generateBracketedExpression(opCount, min, max) {
  const opList = ["+", "-", "×", "÷"];
  let elements, exprParts, displayExpr, answer;
  let maxTries = 100;
  let tryCount = 0;
  let minDivisor = opCount === 2 ? 1 : opCount === 4 ? 2 : 5;
  let maxDivisor = opCount === 2 ? 10 : opCount === 4 ? 20 : 100;
  do {
    elements = [];
    for (let i = 0; i < opCount + opCount + 1; i++) {
      if (i % 2 === 0) {
        elements.push(getRandomInt(min, max));
      } else {
        let op = opList[getRandomInt(0, opList.length - 1)];
        if (op === "÷") {
          elements.push(op);
          elements[i - 1] = elements[i - 1] * getRandomInt(minDivisor, maxDivisor);
        } else {
          elements.push(op);
        }
      }
    }
    let possibleParenRanges = [];
    for (let i = 0; i < elements.length - 2; i += 2) {
      possibleParenRanges.push([i, i + 2]);
    }
    let parenRanges = [];
    let used = Array(elements.length).fill(false);
    let numParens = getRandomInt(1, Math.max(1, Math.floor(opCount / 2)));
    let tries = 0;
    while (parenRanges.length < numParens && tries < 50) {
      let idx = getRandomInt(0, possibleParenRanges.length - 1);
      let [start, end] = possibleParenRanges[idx];
      let overlap = false;
      for (let j = start; j <= end; j++) {
        if (used[j]) { overlap = true; break; }
      }
      if (!overlap) {
        parenRanges.push([start, end]);
        for (let j = start; j <= end; j++) used[j] = true;
      }
      tries++;
    }
    parenRanges.sort((a, b) => a[0] - b[0]);
    exprParts = elements.slice();
    let offset = 0;
    for (let [start, end] of parenRanges) {
      exprParts.splice(start + offset, 0, "(");
      offset++;
      exprParts.splice(end + 1 + offset, 0, ")");
      offset++;
    }
    displayExpr = "";
    for (let i = 0; i < exprParts.length; i++) {
      if (exprParts[i] === "(" || exprParts[i] === ")") {
        displayExpr += exprParts[i] + " ";
      } else if (["+", "-", "×", "÷"].includes(exprParts[i])) {
        displayExpr += " " + exprParts[i] + " ";
      } else {
        displayExpr += exprParts[i];
      }
    }
    displayExpr = displayExpr.trim();
    let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
    try {
      answer = eval(evalExpr);
    } catch {
      answer = null;
    }
    tryCount++;
  } while (
    (typeof answer !== "number" || !isFinite(answer) || isNaN(answer) || answer !== Math.round(answer)) 
    && tryCount < maxTries
  );
  return {
    display: displayExpr,
    answer: Math.round(answer).toString(),
    answerType: "number"
  };
}

// --- FELADATSOR GENERÁLÁSA ---
function generateQuestions() {
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  questions = [];
  const taskType = taskTypes.find(t => t.value === category);
  if (!taskType) {
    questions.push({ display: "Hiba: kategória nincs implementálva", answer: null, answerType: "number", options: [] });
    return;
  }
  for (let i = 0; i < QUESTIONS; i++) {
    const task = taskType.generate(difficulty);
    if (!task.answer || task.answer === "?") {
      task.display = "Hiba: érvénytelen feladat generálódott";
      task.answer = null;
      task.options = [];
    }
    questions.push(task);
  }
}

// --- VÁLASZGOMBOK MEGJELENÍTÉSE ---
function renderAnswerButtons(options, correctAnswer, answerType) {
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'answer-buttons active';

  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer-btn';
    btn.textContent = option;
    btn.tabIndex = 0;
    btn.onclick = () => {
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 200);

      if (!gameActive) return;
      const currentTask = questions[currentQuestion] || {};
      if (!currentTask.answer) {
        alert("Hiba: nincs válasz definiálva!");
        return;
      }

      let correct = false;
      if (answerType === "fraction") {
        const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
        const [userNum, userDen] = option.split('/').map(Number);
        const [simpUserNum, simpUserDen] = simplifyFraction(userNum, userDen);
        if (simpUserNum === ansNum && simpUserDen === ansDen) {
          correct = true;
        }
      } else if (answerType === "decimal") {
        const correctAnswerNum = parseFloat(currentTask.answer);
        const userAnswer = parseFloat(option);
        if (Math.abs(userAnswer - correctAnswerNum) < 0.0001) {
          correct = true;
        }
      } else {
        const correctAnswerNum = parseInt(currentTask.answer);
        const userAnswer = parseFloat(option);
        if (categorySelect.value === "szazalekszamitas") {
          if (Math.round(userAnswer) === correctAnswerNum) {
            correct = true;
          }
        } else {
          if (userAnswer === correctAnswerNum) {
            correct = true;
          }
        }
      }

      if (correct) {
        score++;
        if (difficultySelect.value === "hard") {
          const message = motivationalMessages[getRandomInt(0, motivationalMessages.length - 1)];
          alert(message);
        } else if (difficultySelect.value === "medium" && currentQuestion === QUESTIONS - 2) {
          alert("Gratulálok, csak így tovább, mindjárt a végére érsz!");
        }
        currentQuestion++;
        showQuestion(currentQuestion);
      } else {
        wrongAnswers++;
        alert("Nem jó válasz, próbáld újra!");
      }
    };
    buttonsDiv.appendChild(btn);
  });

  return buttonsDiv;
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
  div.innerHTML = `
    <div class="progress-bar">
      <div class="progress"></div>
    </div>
    <div class="question-text">${q.display} = </div>`;

  const answerButtons = renderAnswerButtons(q.options, q.answer, q.answerType);
  numpadContainer.innerHTML = "";
  numpadContainer.appendChild(answerButtons);
  numpadContainer.classList.add("active");
  quizContainer.appendChild(div);

  const progress = div.querySelector('.progress');
  if (progress) progress.style.width = `${((index + 1) / QUESTIONS) * 100}%`;

  div.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startGame() {
  gameActive = true;
  score = 0;
  currentQuestion = 0;
  wrongAnswers = 0;
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
  quizContainer.innerHTML = `<p style="font-size:1.2em;"><b>Gratulálok!</b> ${elapsed} másodperc alatt végeztél.<br>Helytelen válaszok száma: ${wrongAnswers}</p>`;
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