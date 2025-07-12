// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 5;
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 },
  medium: { min: -10, max: 20 },
  hard: { min: -50, max: 50 }
};

// --- HTML ELEMEK ---
const quizContainer = document.getElementById("quiz");
const timerDisplay = document.getElementById("time");
const bestStats = document.getElementById("best-stats");
const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");
const startBtn = document.querySelector("button[onclick='startGame()']");
const restartBtn = document.getElementById("restart-btn");
const themeToggle = document.getElementById("theme-toggle");

// --- ÁLLAPOTVÁLTOZÓK ---
let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null };
let gameActive = false;

// --- UTOLSÓ VÁLASZTÁS MENTÉSE/BETÖLTÉSE ---
function saveLastSelection() {
  localStorage.setItem("vali-last-category", categorySelect.value);
  localStorage.setItem("vali-last-difficulty", difficultySelect.value);
}

function loadLastSelection() {
  const lastCat = localStorage.getItem("vali-last-category");
  const lastDiff = localStorage.getItem("vali-last-difficulty");
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
    const bestRaw = localStorage.getItem("vali-best-" + cat + "-" + diff);
    best = bestRaw ? JSON.parse(bestRaw) : { score: 0, time: null };
  } catch { best = { score: 0, time: null }; }
  showBest();
}

function saveBest(newScore, time) {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  if (newScore > best.score || (newScore === best.score && (best.time === null || time < best.time))) {
    best = { score: newScore, time: time };
    localStorage.setItem("vali-best-" + cat + "-" + diff, JSON.stringify(best));
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
    case "konnyu": return "Könnyű";
    case "kozepes": return "Közepes";
    case "nehez": return "Nehéz";
    default: return "";
  }
}

function categoryLabel() {
  return categorySelect.options[categorySelect.selectedIndex].textContent;
}

// --- TÉMA VÁLTÁS ---
function applyTheme() {
  const dark = localStorage.getItem("vali-theme") !== "light";
  document.body.classList.toggle("light", !dark);
}

themeToggle.addEventListener("click", function () {
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("vali-theme", isLight ? "dark" : "light");
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

// --- SEGÉDFÜGGVÉNYEK ---
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- FELADATSOR GENERÁLÁSA ---
function generateQuestions() {
  const { min, max } = DIFFICULTY_SETTINGS[difficultySelect.value];
  const category = categorySelect.value;
  questions = [];

  for (let i = 0; i < QUESTIONS; i++) {
    let q = {};

    // --- ALAPFOGALMAK (Mértékegység átváltások) ---
    if (category === "alapfogalmak") {
      const types = [
        () => {
          let mA = getRandomInt(100, difficultySelect.value === "easy" ? 1000 : difficultySelect.value === "medium" ? 2000 : 5000);
          return {
            display: `<b>${mA} mA</b> = ? A`,
            answer: (mA / 1000).toString()
          };
        },
        () => {
          let kOhm = (getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 50 : 100) / 10).toFixed(1);
          return {
            display: `<b>${kOhm} kΩ</b> = ? Ω`,
            answer: (parseFloat(kOhm) * 1000).toString()
          };
        },
        () => {
          let ohm = getRandomInt(100, difficultySelect.value === "easy" ? 1000 : difficultySelect.value === "medium" ? 2000 : 5000);
          return {
            display: `<b>${ohm} Ω</b> = ? kΩ`,
            answer: (ohm / 1000).toString()
          };
        },
        () => {
          let amp = (getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 50 : 100) / 100).toFixed(2);
          return {
            display: `<b>${amp} A</b> = ? mA`,
            answer: (parseFloat(amp) * 1000).toString()
          };
        },
        () => {
          let mV = getRandomInt(500, difficultySelect.value === "easy" ? 1000 : difficultySelect.value === "medium" ? 2000 : 5000);
          return {
            display: `<b>${mV} mV</b> = ? V`,
            answer: (mV / 1000).toString()
          };
        }
      ];
      q = types[getRandomInt(0, types.length - 1)]();
    }

    // --- ELEKTRONIKAI ALKATRÉSZEK ---
    else if (category === "elektronikai_alkatreszek") {
      let value = getRandomInt(min, max);
      let unit = getRandomInt(0, 1) ? "Ω" : "μF";
      q = {
        display: `Mekkora egy <b>${Math.abs(value)} ${unit}</b> ${unit === "Ω" ? "ellenállás" : "kondenzátor"} értéke?`,
        answer: Math.abs(value).toString()
      };
    }

    // --- SOROS - PÁRHUZAMOS KAPCSOLÁSOK ---
    else if (category === "soros_parhuzamos") {
      let r1 = getRandomInt(10, difficultySelect.value === "easy" ? 50 : difficultySelect.value === "medium" ? 100 : 200);
      let r2 = getRandomInt(10, difficultySelect.value === "easy" ? 50 : difficultySelect.value === "medium" ? 100 : 200);
      let type = getRandomInt(0, 1) ? "soros" : "párhuzamos";
      let answer = type === "soros" ? r1 + r2 : Math.round((r1 * r2) / (r1 + r2));
      q = {
        display: `Két ellenállás ${type} kapcsolásban: <b>${r1} Ω</b> és <b>${r2} Ω</b>. Mi az eredő ellenállás?`,
        answer: answer.toString()
      };
    }

    // --- OHM TÖRVÉNY ---
    else if (category === "ohm_torveny") {
      let i = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 50 : 100) / 100;
      let r = getRandomInt(10, difficultySelect.value === "easy" ? 50 : difficultySelect.value === "medium" ? 100 : 200);
      let u = Math.round(i * r);
      q = {
        display: `Számítsd ki a feszültséget! I = <b>${i.toFixed(2)} A</b>, R = <b>${r} Ω</b>`,
        answer: u.toString()
      };
    }

    // --- HUROK TÖRVÉNY ---
    else if (category === "hurok_torveny") {
      let u1 = getRandomInt(5, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50);
      let u2 = getRandomInt(5, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50);
      let u_total = u1 + u2;
      q = {
        display: `Huroktörvény: Két feszültségforrás: <b>${u1} V</b> és <b>${u2} V</b>. Mi az összesített feszültség?`,
        answer: u_total.toString()
      };
    }

    // --- CSOMÓPONTI TÖRVÉNY ---
    else if (category === "csomoponti_torveny") {
      let i1 = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50) / 100;
      let i2 = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50) / 100;
      let i_total = i1 + i2;
      q = {
        display: `Csomóponti törvény: Két áram: <b>${i1.toFixed(2)} A</b> és <b>${i2.toFixed(2)} A</b>. Mi az eredő áram?`,
        answer: i_total.toFixed(2).toString()
      };
    }

    // --- MIND A HÁROM ---
    else if (category === "mind_a_harom") {
      const subCategories = ["ohm_torveny", "hurok_torveny", "csomoponti_torveny"];
      let subCategory = subCategories[getRandomInt(0, subCategories.length - 1)];
      if (subCategory === "ohm_torveny") {
        let i = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 50 : 100) / 100;
        let r = getRandomInt(10, difficultySelect.value === "easy" ? 50 : difficultySelect.value === "medium" ? 100 : 200);
        let u = Math.round(i * r);
        q = {
          display: `Ohm törvény: I = <b>${i.toFixed(2)} A</b>, R = <b>${r} Ω</b>. Mi a feszültség?`,
          answer: u.toString()
        };
      } else if (subCategory === "hurok_torveny") {
        let u1 = getRandomInt(5, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50);
        let u2 = getRandomInt(5, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50);
        let u_total = u1 + u2;
        q = {
          display: `Huroktörvény: <b>${u1} V</b> és <b>${u2} V</b>. Mi az összesített feszültség?`,
          answer: u_total.toString()
        };
      } else {
        let i1 = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50) / 100;
        let i2 = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50) / 100;
        let i_total = i1 + i2;
        q = {
          display: `Csomóponti törvény: <b>${i1.toFixed(2)} A</b> és <b>${i2.toFixed(2)} A</b>. Mi az eredő áram?`,
          answer: i_total.toFixed(2).toString()
        };
      }
    }

    // --- PRÓBA PANEL BEKÖTÉS ---
    else if (category === "proba_panel") {
      let u = getRandomInt(5, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50);
      let i = getRandomInt(1, difficultySelect.value === "easy" ? 10 : difficultySelect.value === "medium" ? 20 : 50) / 100;
      let r = Math.round(u / i);
      q = {
        display: `Próba panel: <b>${u} V</b> feszültséghez <b>${i.toFixed(2)} A</b> áram szükséges. Mekkora ellenállást köss be?`,
        answer: r.toString()
      };
    }

    // --- DEFAULT FALLBACK ---
    else {
      q = { display: "Hiba: kategória nincs implementálva", answer: null };
    }

    questions.push(q);
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
          if (["alapfogalmak", "csomoponti_torveny"].includes(categorySelect.value)) {
            let correctAnswer = (questions[currentQuestion] || {}).answer.replace(',', '.');
            let userAnswer = val.replace(',', '.');
            if (parseFloat(userAnswer) === parseFloat(correctAnswer)) correct = true;
          } else {
            if (parseFloat(val) === parseFloat((questions[currentQuestion] || {}).answer)) correct = true;
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
  timerDisplay.textContent = `⏱️ Idő: ${elapsed} mp (Vége)`;
  quizContainer.innerHTML = `<p style="font-size:1.2em;"><b>Gratulálok!</b> ${elapsed} másodperc alatt végeztél.</p>`;
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
loadLastSelection();
loadBest();