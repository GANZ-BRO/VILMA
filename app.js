// Segédfüggvények
function getRandomInt(a, b) {
  // zárt intervallum [a, b]
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function simplifyFraction(num, denom) {
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  let g = gcd(Math.abs(num), Math.abs(denom));
  return [num / g, denom / g];
}

// Nehézségi szintekhez tartozó minimum és maximum számok
const DIFFICULTY_SETTINGS = {
  easy: { min: 1, max: 10 },
  medium: { min: 5, max: 50 },
  hard: { min: 10, max: 100 }
};

let currentQuestion = 0;
let score = 0;
let questions = [];
let best = 0;

const QUESTIONS = 10;
const categorySelect = document.getElementById("categorySelect");
const difficultySelect = document.getElementById("difficultySelect");
const quizContainer = document.getElementById("quizContainer");
const bestContainer = document.getElementById("bestContainer");
const startBtn = document.getElementById("startBtn");

// --- Utolsó választott feladattípus és nehézség tárolása és visszatöltése ---
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

// --- GENERÁLÓ FÜGGVÉNYEK ---
function generateQuestions() {
  const { min, max } = DIFFICULTY_SETTINGS[difficultySelect.value];
  const category = categorySelect.value;
  questions = [];

  // Helper: egyszerű zárójeles kifejezés generálása (könnyű szinthez)
  function simpleParenExpr(min, max) {
    const opList = ["+", "-", "×", "÷"];
    let num1 = getRandomInt(min, max);
    let num2 = getRandomInt(min, max);
    let op = opList[getRandomInt(0, 3)];
    // Mindig egész osztás
    if (op === "÷") {
      num2 = getRandomInt(1, Math.max(2, max));
      num1 = num2 * getRandomInt(min, max);
    }
    let expr = `(${num1} ${op} ${num2})`;
    let evalExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    let answer = Math.round(eval(evalExpr));
    return { expr, answer };
  }

  for (let i = 0; i < QUESTIONS; i++) {
    let q = {};

    // --- ZÁRÓJELES MŰVELETEK ---
    if (category === "Zárójeles műveletek") {
      if (difficultySelect.value === "easy") {
        // Egyetlen zárójeles művelet
        let one = simpleParenExpr(min, max);
        q = { display: one.expr, answer: one.answer };
      } else if (difficultySelect.value === "medium") {
        // 2 vagy 3 zárójeles részkifejezés összeadva vagy kivonva
        let count = getRandomInt(2, 3);
        let exprs = [];
        let ops = [];
        for (let j = 0; j < count; j++) {
          let kifej = simpleParenExpr(min, max);
          exprs.push(kifej.expr);
          ops.push(j === 0 ? "" : (Math.random() < 0.5 ? " + " : " - "));
        }
        let evalExpr = exprs[0];
        let answer = eval(exprs[0].replace(/×/g, '*').replace(/÷/g, '/'));
        for (let j = 1; j < count; j++) {
          evalExpr += ops[j] + exprs[j];
          let op = ops[j].trim();
          let val = eval(exprs[j].replace(/×/g, '*').replace(/÷/g, '/'));
          answer = op === "+" ? answer + val : answer - val;
        }
        q = { display: exprs.map((e, idx) => (idx === 0 ? e : ops[idx] + e)).join(""), answer: Math.round(answer) };
      } else if (difficultySelect.value === "hard") {
        // 4 vagy 5 zárójeles részkifejezés összeadva vagy kivonva
        let count = getRandomInt(4, 5);
        let exprs = [];
        let ops = [];
        for (let j = 0; j < count; j++) {
          let kifej = simpleParenExpr(min, max);
          exprs.push(kifej.expr);
          ops.push(j === 0 ? "" : (Math.random() < 0.5 ? " + " : " - "));
        }
        let evalExpr = exprs[0];
        let answer = eval(exprs[0].replace(/×/g, '*').replace(/÷/g, '/'));
        for (let j = 1; j < count; j++) {
          evalExpr += ops[j] + exprs[j];
          let op = ops[j].trim();
          let val = eval(exprs[j].replace(/×/g, '*').replace(/÷/g, '/'));
          answer = op === "+" ? answer + val : answer - val;
        }
        q = { display: exprs.map((e, idx) => (idx === 0 ? e : ops[idx] + e)).join(""), answer: Math.round(answer) };
      }
    }

    // --- MIND A NÉGY MŰVELET ---
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

// --- LEGNAGYOBB EREDMÉNY TÁROLÁS/BETÖLTÉS ---
function loadBest() {
  const key = "vilma-best-" + categorySelect.value + "-" + difficultySelect.value;
  const bestStr = localStorage.getItem(key);
  best = bestStr ? parseInt(bestStr) : 0;
  bestContainer.textContent = "Legjobb eredmény: " + best + " / " + QUESTIONS;
}
function saveBest() {
  if (score > best) {
    const key = "vilma-best-" + categorySelect.value + "-" + difficultySelect.value;
    localStorage.setItem(key, score);
    loadBest();
  }
}

// --- FELADAT MEGJELENÍTÉSE ---
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

  function submitAnswer() {
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
    } else if (["Zárójeles műveletek","Egyenletek átrendezése","Százalékszámítás"].includes(categorySelect.value)) {
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
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "answer-view";
  input.setAttribute("aria-label", "Válasz");
  input.addEventListener("input", (e) => {
    const filtered = e.target.value.replace(/[^0-9\-\.\/]/g, "");
    if (filtered !== e.target.value) {
      e.target.value = filtered;
    }
    answerState.value = filtered;
  });
  input.addEventListener("keydown", function(e) {
    const allowed = [
      "0","1","2","3","4","5","6","7","8","9","-",".","/","Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter"
    ];
    if (!allowed.includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === "Enter") {
      submitAnswer();
    }
  });
  div.appendChild(input);
  quizContainer.appendChild(div);
  input.focus();
}

// --- JÁTÉK VEGE ---
function finishGame() {
  quizContainer.innerHTML = `<h2>Vége! Eredményed: ${score} / ${QUESTIONS}</h2>
    <button id="restartBtn">Újra</button>`;
  saveBest();
  document.getElementById("restartBtn").onclick = () => {
    score = 0;
    currentQuestion = 0;
    generateQuestions();
    showQuestion(currentQuestion);
  };
}

// --- KEZDÉS ---
startBtn.onclick = () => {
  score = 0;
  currentQuestion = 0;
  generateQuestions();
  showQuestion(currentQuestion);
};
loadLastSelection();
loadBest();
