// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 9; // Feladatok száma egy játékban
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 }, // Könnyű: kis számok a gyengébb diákok számára
  medium: { min: -20, max: 20 }, // Közepes: negatív számok, nagyobb tartomány
  hard: { min: -100, max: 100 } // Kihívás: nagy számok, egyetemi szint
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
// Véletlenszám generátor egész számokhoz
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// shuffleArray: Egy tömb elemeit véletlenszerűen megkeveri Fisher-Yates algoritmussal
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Legnagyobb közös osztó (törtek egyszerűsítéséhez)
function gcd(a, b) { 
  return b === 0 ? a : gcd(b, a % b); 
}

// Tört egyszerűsítése
function simplifyFraction(num, denom) {
  let d = gcd(Math.abs(num), Math.abs(denom));
  return [num / d, denom / d];
}

// Számformázás mértékegységekkel
function formatNumber(value, unit, difficulty, forceBaseUnit = false) {
  if (isNaN(value)) {
    console.error("Hiba: formatNumber kapott NaN értéket", { value, unit, difficulty });
    return { value: 0, unit: unit };
  }
  let absValue = Math.abs(value);
  let newValue = value;
  let newUnit = unit;
  let precision = difficulty === "hard" ? 5 : 2;

  if (difficulty === "easy" || forceBaseUnit) {
    newValue = value;
    newUnit = unit;
  } else if (difficulty === "medium") {
    if (unit === 'Ω' && absValue >= 1000) {
      newValue = value / 1000;
      newUnit = 'kΩ';
    } else if (unit === 'Ω' && absValue > 100) {
      newValue = value / 1000;
      newUnit = 'kΩ';
    } else if (unit === 'A' && absValue < 0.1) {
      newValue = value * 1000;
      newUnit = 'mA';
    } else if (unit === 'A' && absValue < 1) {
      newValue = value * 1000;
      newUnit = 'mA';
    }
  } else { // Nehéz szint
    if (unit === 'Ω' && absValue >= 1000) {
      newValue = value / 1000;
      newUnit = 'kΩ';
    } else if (unit === 'A' && absValue < 0.1) {
      newValue = value * 1000;
      newUnit = 'mA';
    }
  }

  // Ha az érték egész szám, ne használjunk tizedes törtet
  if (Number.isInteger(newValue)) {
    newValue = Number(newValue.toFixed(0));
  } else {
    newValue = Number(newValue.toFixed(precision));
  }

  return {
    value: newValue,
    unit: newUnit
  };
}

// Válaszlehetőségek generálása
function generateOptions(correctAnswer, answerType, difficulty, unit, precision = 2) {
  console.log("generateOptions called", { correctAnswer, answerType, difficulty, unit, precision });
  if (answerType !== "decimal") return [];
  // Ensure correctAnswer is a number
  const base = Number(correctAnswer);
  if (isNaN(base)) return [];

  // Format correct answer using requested precision
  const correctStr = base.toFixed(precision);

  const options = [correctStr];
  const range = difficulty === "easy" ? 10 : 20;
  const min = Math.max(0, base - range);
  const max = base + range;

  while (options.length < 4) {
    const optionNum = (min + Math.random() * (max - min));
    const option = optionNum.toFixed(precision);
    // Exclude options that are too close to correct answer or duplicates
    if (Math.abs(Number(option) - base) >= Math.pow(10, -precision) && !options.includes(option)) {
      options.push(option);
    }
  }

  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const result = options.map(opt => ({ value: opt, label: `${opt} ${unit}` }));
  console.log("generateOptions result", result);
  return result;
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
        return {
          display: `<b>${num1}</b> + <b>${num2}</b> + <b>${num3}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
          answer: (num1 + num2 + num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num1}</b> + <b>${num2}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(min, max);
        return {
          display: `<b>${num1}</b> - <b>${num2}</b> - <b>${num3}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
          answer: (num1 - num2 - num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num1}</b> - <b>${num2}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(Math.floor(min / 2), Math.floor(max / 2));
        return {
          display: `<b>${num1}</b> • <b>${num2}</b> • <b>${num3}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
          answer: (num1 * num2 * num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num1}</b> • <b>${num2}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(minDivisor, maxDivisor);
        let num1 = answer * num2 * num3;
        return {
          display: `<b>${num1}</b> : <b>${num2}</b> : <b>${num3}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
          answer: (num1 / num2 / num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num2 * answer}</b> : <b>${num2}</b> =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
        answer: answer.toString(),
        answerType: "number"
      };
    }
  },
  
  
// ... (többi tartalom változatlan) ...

// --- VÁLASZ KIÉRTÉKELÉS ---
function evaluateExpression(input, correctAnswer, answerType, taskData) {
  if (!input || !correctAnswer) return false;

  let normalizedInput = ('' + input).trim();
  let normalizedCorrect = ('' + correctAnswer).trim();

  function parseMaybeNumber(s) {
    if (typeof s !== 'string') return s;
    const t = s.trim();
    if (t === '') return t;
    const asNum = Number(t.replace(',', '.'));
    return isNaN(asNum) ? t : asNum;
  }

  // Halmazok kezelése
  if (answerType === 'set') {
    function normalizeSet(str) {
      const cleaned = ('' + str).replace(/^\s*\{?\s*/, '').replace(/\s*\}?\s*$/, '').trim();
      if (cleaned === '') return [];
      const parts = cleaned.split(',').map(p => p.trim()).filter(p => p !== '');
      const parsed = parts.map(p => parseMaybeNumber(p));
      const uniq = Array.from(new Set(parsed.map(x => typeof x === 'string' ? `s:${x}` : `n:${x}`)))
        .map(key => {
          if (key.startsWith('n:')) return Number(key.slice(2));
          else return key.slice(2);
        });
      const nums = uniq.filter(x => typeof x === 'number').sort((a,b) => a - b);
      const strs = uniq.filter(x => typeof x === 'string').sort();
      return nums.concat(strs);
    }

    const userSet = normalizeSet(normalizedInput);
    const correctSet = normalizeSet(normalizedCorrect);

    if (userSet.length !== correctSet.length) return false;
    for (let i = 0; i < userSet.length; i++) {
      if (userSet[i] !== correctSet[i]) return false;
    }
    return true;
  }

  // Képletek/számítások
  try {
    // Normalize common multiplication/division symbols and decimal comma
    const exprCandidate = normalizedInput
      .replace(/,/g, '.')
      .replace(/[×•⋅·]/g, '*')
      .replace(/[÷:]/g, '/');

    if (exprCandidate.match(/[\+\-\*\/\(\)]/)) {
      let expression = exprCandidate.replace(/\s/g, '');
      // safety: only allow digits, dot, operators and parentheses
      if (/^[0-9\.\+\-\*\/\(\)\s]+$/.test(expression)) {
        let computed;
        try { computed = eval(expression); } catch (e) { computed = NaN; }
        if (!isNaN(computed) && isFinite(computed)) {
          if (!isNaN(Number(normalizedCorrect.replace(',', '.')))) {
            const correctNum = Number(normalizedCorrect.replace(',', '.'));

            // If the expected answer is decimal with a specific number of decimal places,
            // compare the rounded computed value instead of raw floating point.
            let dp = null;
            if (taskData && taskData.decimalPlaces !== undefined && taskData.decimalPlaces !== null) {
              dp = Number(taskData.decimalPlaces);
            } else {
              const parts = ('' + normalizedCorrect).replace(',', '.').split('.');
              dp = parts[1] ? parts[1].length : 0;
            }

            // Round computed to dp decimals for comparison
            const roundedComputed = Number(computed.toFixed(dp));
            return Math.abs(roundedComputed - correctNum) <= Math.pow(10, -Math.max(6, dp)) ? true : Math.abs(roundedComputed - correctNum) < 1e-9;
          }
        }
      }
    }
  } catch (err) {
    console.warn("evaluateExpression hiba:", err);
  }

  // Törtek
  if (answerType === 'fraction') {
    if (normalizedInput.includes('/')) {
      const [userNum, userDen] = normalizedInput.split('/').map(s => Number(s.trim()));
      if (isNaN(userNum) || isNaN(userDen) || userDen === 0) return false;
      const [ansNum, ansDen] = (''+correctAnswer).split('/').map(s => Number(s.trim()));
      const simplify = (a,b)=>{ const g = (function gcd(x,y){return y?gcd(y,x%y):x})(Math.abs(a),Math.abs(b)); return [a/g,b/g]; };
      const [su, du] = simplify(userNum, userDen);
      const [sa, da] = simplify(ansNum, ansDen);
      return su === sa && du === da;
    } else {
      const [ansNum, ansDen] = (''+correctAnswer).split('/').map(s => Number(s.trim()));
      const correctValue = ansNum / ansDen;
      const userValue = parseFloat(normalizedInput.replace(',', '.'));
      if (isNaN(userValue)) return false;
      return Math.abs(userValue - correctValue) <= 0.005;
    }
  }

  // Normál alak (power)
  if (answerType === 'power') {
    const powerMatchUser = normalizedInput.match(/^([\d\.,]+)×10\^([\d\-]+)$/) || normalizedInput.match(/^([\d\.,]+)\*10\^([\d\-]+)$/);
    const powerMatchAns = (''+correctAnswer).match(/^([\d\.]+)×10\^([\d\-]+)$/) || (''+correctAnswer).match(/^([\d\.]+)\*10\^([\d\-]+)$/);
    if (!powerMatchUser || !powerMatchAns) return false;
    const userCoef = parseFloat(powerMatchUser[1].replace(',', '.'));
    const userExp = parseInt(powerMatchUser[2]);
    const ansCoef = parseFloat(powerMatchAns[1].replace(',', '.'));
    const ansExp = parseInt(powerMatchAns[2]);
    return Math.abs(userCoef - ansCoef) < 0.01 && userExp === ansExp;
  }

  // Számok
  if (answerType === 'number' || answerType === 'decimal') {
    const userNum = Number(normalizedInput.replace(',', '.'));
    const correctNum = Number(normalizedCorrect.replace(',', '.'));
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    const tol = answerType === 'decimal' ? 1e-3 : 1e-6;
    return Math.abs(userNum - correctNum) <= tol;
  }

  return normalizedInput.toLowerCase() === normalizedCorrect.toLowerCase();
}

// --- NUMPAD MEGJELENÍTÉS ---
function renderNumpad(answerState, onChange) {
  answerState = answerState || { value: "" };
  const currentTask = questions[currentQuestion] || {};
  
  if (!window.numpadState) {
    window.numpadState = { lightningActivated: false, lightningCurrentSymbol: '/', lightningCount: 0 };
  }

  const mode = (typeof categorySelect !== 'undefined' && categorySelect.value === 'halmaz_muveletek') ? 'set' : 'numeric';
  const decimalKey = mode === 'numeric' ? '.' : ',';

  const baseRowsNumeric = [
    ['1', '2', '3', '±', '←'],
    ['4', '5', '6', decimalKey, 'submit'],
    ['7', '8', '9', '0', '⚡️']
  ];
  const extraSetRow = ['{', '}', ',', '∪', '∩'];
  const rows = mode === 'set' ? [extraSetRow].concat(baseRowsNumeric) : baseRowsNumeric;

  const numpadDiv = document.createElement('div');
  numpadDiv.className = 'numpad active';
  let lightningButton = null;

  rows.forEach((row) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'numpad-row';
    row.forEach((key) => {
      if (key === 'submit') {
        const submitBtn = document.createElement("button");
        submitBtn.type = "button";
        submitBtn.className = "numpad-btn numpad-submit-btn";
        submitBtn.textContent = "OK";
        submitBtn.onclick = () => {
          if (!gameActive) return;
          let val = (answerState.value || "").trim();
          if (val === "") { alert("Írj be egy választ!"); return; }

          const currentTask = questions[currentQuestion];
          if (!currentTask || !currentTask.answer) { alert("Hiba: nincs válasz!"); return; }

          let pauseStart = Date.now();
          if (timerInterval) clearInterval(timerInterval);

          // Tört kompatibilitás
          if (currentTask.answerType === 'fraction' && val.includes('/')) {
             const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
             const [userNum, userDen] = val.split('/').map(Number);
             if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
                alert("Érvénytelen tört!"); startTimerAfterPause(pauseStart); return;
             }
             const simplify = (a,b)=>{ const g = (function gcd(x,y){return y?gcd(y,x%y):x})(Math.abs(a),Math.abs(b)); return [a/g,b/g]; };
             const [simpUserNum, simpUserDen] = simplify(userNum, userDen);
             const [simpAnsNum, simpAnsDen] = simplify(ansNum, ansDen);
             
             if (simpUserNum === simpAnsNum && simpUserDen === simpAnsDen) onCorrectAnswer(pauseStart);
             else { alert(`Nem jó! Helyes: ${currentTask.answer}`); onWrongAnswer(pauseStart); }
             return;
          }

          // Normál alak kompatibilitás
          if (currentTask.answerType === 'power') {
            const pm = val.match(/^([\d\.,]+)×10\^([\d\-]+)$/);
            if (!pm) { alert("Érvénytelen formátum (pl. 3,5×10^3)!"); startTimerAfterPause(pauseStart); return; }
          }

          const correct = evaluateExpression(val, currentTask.answer, currentTask.answerType, currentTask);

          if (!correct) {
            let hint = '';
            if (currentTask.answerType === 'set') hint = `Helyes megoldás: {${currentTask.answer}}`;
            else hint = `Nem jó válasz! Helyes érték: ${currentTask.answer} ${currentTask.unit || ''}`;
            alert(hint);
            onWrongAnswer(pauseStart);
          } else {
            onCorrectAnswer(pauseStart);
          }
        };
        rowDiv.appendChild(submitBtn);
      } else {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'numpad-btn';
        btn.textContent = key;
        
        if (key === '⚡️') {
          const isFractionTask = currentTask.answerType === 'fraction';
          if (isFractionTask) {
            btn.dataset.state = '/'; btn.textContent = '/'; btn.dataset.locked = 'true';
          } else {
             if (window.numpadState.lightningActivated) {
               btn.dataset.state = window.numpadState.lightningCurrentSymbol;
               btn.textContent = window.numpadState.lightningCurrentSymbol;
             } else {
               btn.dataset.state = '⚡️';
             }
             btn.dataset.lightningCount = window.numpadState.lightningCount.toString();
          }
          lightningButton = btn;
        }

        btn.onclick = () => {
          btn.classList.add('flash');
          setTimeout(() => btn.classList.remove('flash'), 200);

          if (key !== '⚡️' && lightningButton && lightningButton.dataset.state === '⚡️') {
            window.numpadState.lightningCount = 0;
            lightningButton.dataset.lightningCount = '0';
          }

          if (key === '←') answerState.value = answerState.value.slice(0, -1);
          else if (key === '±') {
             if (!answerState.value.startsWith('-')) answerState.value = '-' + answerState.value;
             else answerState.value = answerState.value.substring(1);
          } else if (key === '⚡️') {
             if (btn.dataset.locked === 'true') { answerState.value += '/'; onChange(answerState.value); return; }
             
             let lc = parseInt(btn.dataset.lightningCount || '0') + 1;
             btn.dataset.lightningCount = lc;
             window.numpadState.lightningCount = lc;
             
             if (lc >= 9 && !window.numpadState.lightningActivated) {
               btn.dataset.state = '/'; btn.textContent = '/';
               window.numpadState.lightningActivated = true;
               window.numpadState.lightningCurrentSymbol = '/';
               lc = 0;
             }
             
             if (btn.dataset.state !== '⚡️') {
               const current = btn.dataset.state;
               const last = answerState.value.slice(-1);
               if (last === '/' || last === '*') answerState.value = answerState.value.slice(0, -1);
               answerState.value += current;
               
               const next = current === '/' ? '*' : '/';
               btn.dataset.state = next; btn.textContent = next;
               window.numpadState.lightningCurrentSymbol = next;
             }
          } else {
             if (key === decimalKey || (key === ',' && mode === 'numeric')) {
               // Tizedespont: csak az AKTUÁLIS számban (utolsó operátor után) tiltsuk a másodikat.
               // Így pl. 0.15*4.5 és 0.15/2.5 is működik.
               if (mode === 'numeric') {
                 const v = answerState.value;
                 // Utolsó operátor pozíciója (* / +), a - csak akkor operátor ha nem a szám elején van
                 let lastOp = -1;
                 for (let i = 0; i < v.length; i++) {
                   const ch = v[i];
                   if (ch === '*' || ch === '/') lastOp = i;
                   else if (ch === '+') lastOp = i;
                   else if (ch === '-' && i > 0 && /[0-9.)]/.test(v[i - 1])) lastOp = i;
                 }
                 const currentNumber = lastOp >= 0 ? v.slice(lastOp + 1) : v;
                 if (!currentNumber.includes('.')) {
                   answerState.value += '.';
                 }
               } else {
                 // set mód: vessző az elemek elválasztója, mindig engedjük
                 answerState.value += ',';
               }
             } else {
               answerState.value += key;
             }
          }
          onChange(answerState.value);
        };
        rowDiv.appendChild(btn);
      }
    });
    numpadDiv.appendChild(rowDiv);
  });

  function onCorrectAnswer(pauseStart) {
    score++; currentQuestion++; showQuestion(currentQuestion);
    const pauseDuration = Date.now() - pauseStart;
    startTime += pauseDuration;
    if (timerInterval) clearInterval(timerInterval);
    if (currentQuestion < QUESTIONS) timerInterval = setInterval(updateTimer, 1000);
    else finishGame();
  }
  function onWrongAnswer(pauseStart) {
    wrongAnswers++;
    const pauseDuration = Date.now() - pauseStart;
    startTime += pauseDuration;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  }
  function startTimerAfterPause(pauseStart) {
    const pauseDuration = Date.now() - pauseStart;
    startTime += pauseDuration;
    timerInterval = setInterval(updateTimer, 1000);
  }
  return numpadDiv;
}

// --- JÁTÉK LOGIKA ---
// (a fájl többi része változatlanul maradt)

// --- INDÍTÁS ---
loadCategories();
loadLastSelection();
loadBest();
