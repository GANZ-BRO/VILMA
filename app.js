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
  

{
  name: "Vegyes műveletek",
  value: "vegyes_muvelet",
  generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
    const opList = ["+", "-", "•", ":"];
    let minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5;
    let maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 100;
    let tryCount = 0;
    let displayExpr, answer;

    // Új, megbízható generálás: a megjelenített kifejezésből számolunk, és csak egész eredményt fogadunk el.
    // Osztásnál a bal oldali számot szorozzuk az osztóval ELŐRE, így a megjelenített számok
    // pontosan azok, amikkel a diák is számol, és az eredmény egész lesz.
    while (tryCount < 1000) {
      let nums = [getRandomInt(min, max)];
      let ops = [];
      for (let j = 0; j < opCount; j++) {
        let op = opList[getRandomInt(0, 3)];
        if (op === ":") {
          let divisor = getRandomInt(minDivisor, maxDivisor);
          // A bal oldali (aktuális utolsó) számot megszorozzuk, hogy az osztás egész legyen
          nums[j] = nums[j] * divisor;
          nums.push(divisor);
        } else {
          nums.push(getRandomInt(min, max));
        }
        ops.push(op);
      }
      // Kifejezés a megjelenített (már módosított) számokból
      displayExpr = "" + nums[0];
      for (let j = 0; j < opCount; j++) {
        displayExpr += " " + ops[j] + " " + nums[j + 1];
      }
      let evalExpr = displayExpr.replace(/•/g, '*').replace(/:/g, '/').replace(/\s/g, '');
      // Negatív számok kezelése: -- → +, +- → -
      evalExpr = evalExpr.replace(/--/g, '+').replace(/\+-/g, '-');
      try {
        let raw = eval(evalExpr);
        if (typeof raw === "number" && isFinite(raw) && !isNaN(raw) && Math.abs(raw - Math.round(raw)) < 1e-9) {
          answer = Math.round(raw);
          break;
        }
      } catch (e) {}
      tryCount++;
    }
    if (tryCount >= 1000) {
      let a = getRandomInt(min, max), b = getRandomInt(min, max);
      displayExpr = a + " + " + b;
      answer = a + b;
    }
    return {
      display: displayExpr + " =<br><small style=\"display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;\">Válasz: egész szám</small>",
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
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 8;
      return generateBracketedExpression(opCount, min, max);
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
        return {
          display: `${a}/${b} + ${c}/${d} + ${e}/${f} =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egyszerűsített tört (pl. 3/4)</small>`,
          answer: `${num}/${denom}`,
          answerType: "fraction"
        };
      }
      let numerator = a * d + c * b;
      let denominator = b * d;
      let [num, denom] = simplifyFraction(numerator, denominator);
      return {
        display: `${a}/${b} + ${c}/${d} =<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egyszerűsített tört (pl. 3/4)</small>`,
        answer: `${num}/${denom}`,
        answerType: "fraction"
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
    let result = Number((base * percent / 100).toFixed(2)); // 2 tizedesjegyre kerekítés
    let lastDigit = base % 10;
    let lastTwoDigits = base % 100;
    let rag = (lastDigit === 3 || lastDigit === 6 || lastDigit === 8 ||
               lastTwoDigits === 0 || lastTwoDigits === 20 || lastTwoDigits === 30 ||
               lastTwoDigits === 60 || lastTwoDigits === 80) ? "-nak" : "-nek";
    let percentStr = percent.toString();
    let nevelo = percentStr.startsWith("5") ? "az" : "a";
    const isInt = Number.isInteger(result);
    const precHint = isInt
      ? `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`
      : `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal</small>`;
    return {
      display: `Mennyi ${base}${rag} ${nevelo} <span class="blue-percent">${percent}%</span>-a ?${precHint}`,
      answer: result.toString(),
      answerType: isInt ? "number" : "decimal"
    };
  }
},
{
  name: "Egyenletek átrendezése",
  value: "egyenletek_atrendezese",
  generate: (difficulty) => {
    const { min, max } = DIFFICULTY_SETTINGS[difficulty];
    // Egységes változó és szín minden szinten
    const variable = 'X'; // Minden szinten X
    const color = '#00CED1'; // Türkiz szín, mindkét témában jól látható
    const formattedVar = `<i>${variable}</i>`;
    const coloredVar = `<span style="color: ${color};">${formattedVar}</span>`;
    
    if (difficulty === "hard") {
      // Segédfüggvény az osztók meghatározására
      const getDivisors = (n) => {
        const divisors = [];
        for (let i = 1; i <= Math.abs(n); i++) {
          if (n % i === 0) {
            divisors.push(i);
            if (i !== Math.abs(n) / i) divisors.push(Math.abs(n / i));
          }
        }
        return divisors.sort((a, b) => a - b);
      };

      let a = getRandomInt(2, 10);
      let b = getRandomInt(2, 10);
      let x = getRandomInt(min, max); // x változó használata
      let product = a * x * b;
      const divisors = getDivisors(product).filter(d => d >= 2 && d <= 10); // c tartomány: [2, 10]
      let c = divisors.length > 0 ? divisors[getRandomInt(0, divisors.length - 1)] : getRandomInt(2, 10);
      let d = getRandomInt(min, max);
      let result = (a * x * b) / c + d;

      // Biztosítjuk, hogy result egész szám legyen
      if (!Number.isInteger(result)) {
        result = Math.round(result);
        d = result - (a * x * b) / c; // d korrigálása
      }

      // Ha result túl nagy, csökkentjük a számokat
      if (Math.abs(result) > 10000) {
        x = getRandomInt(Math.max(min, -50), Math.min(max, 50)); // Szűkítjük x tartományát
        product = a * x * b;
        const newDivisors = getDivisors(product).filter(d => d >= 2 && d <= 10);
        c = newDivisors.length > 0 ? newDivisors[getRandomInt(0, newDivisors.length - 1)] : getRandomInt(2, 10);
        d = getRandomInt(Math.max(min, -50), Math.min(max, 50));
        result = (a * x * b) / c + d;
        if (!Number.isInteger(result)) {
          result = Math.round(result);
          d = result - (a * x * b) / c;
        }
      }

      return {
        display: `${a}${coloredVar} * ${b} / ${c} ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${result} | ${coloredVar}<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (X értéke)</small>`,
        answer: x.toString(),
        answerType: "number"
      };
    }

    let aMin = difficulty === "easy" ? 1 : 2;
    let aMax = difficulty === "easy" ? 5 : 10;
    let bMin = difficulty === "easy" ? -5 : -15;
    let bMax = difficulty === "easy" ? 5 : 15;
    let x = getRandomInt(min, max); // x változó minden szinten
    let a = getRandomInt(aMin, aMax);
    let b = getRandomInt(bMin, bMax);
    let result = a * x + b;

    return {
      display: `${a}${coloredVar} ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result} | ${coloredVar}<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (X értéke)</small>`,
      answer: x.toString(),
      answerType: "number"
    };
  }
},

// --- Add this new task type object into the taskTypes array (insert somewhere among other objects) ---
// Halmazműveletek (két halmaz) — válasz formátuma: elemek vesszővel elválasztva, lehet kapcsos zárójel is
{
  name: "Halmazműveletek",
  value: "halmaz_muveletek",
  generate: (difficulty) => {
    // difficulty can influence range / size
    const sizeByDifficulty = { easy: [3, 4], medium: [4, 6], hard: [5, 8] };
    const rangeByDifficulty = { easy: [1, 10], medium: [ -5, 20 ], hard: [ -20, 50 ] };

    const [minSize, maxSize] = sizeByDifficulty[difficulty] || [3,5];
    const [minVal, maxVal] = rangeByDifficulty[difficulty] || [1, 20];

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function makeUniqueArray(count) {
      const s = new Set();
      const tries = count * 6;
      let i = 0;
      while (s.size < count && i < tries) {
        s.add(getRandomInt(minVal, maxVal));
        i++;
      }
      return Array.from(s).sort((a,b) => a - b);
    }

    const sizeA = getRandomInt(minSize, maxSize);
    const sizeB = getRandomInt(minSize, maxSize);
    const A = makeUniqueArray(sizeA);
    const B = makeUniqueArray(sizeB);

    // choose operation
    const ops = [
      { op: '∪', name: 'unió', fn: (a,b) => Array.from(new Set([...a, ...b])).sort((x,y)=>x-y) },
      { op: '∩', name: 'metszet', fn: (a,b) => a.filter(x => b.includes(x)).sort((x,y)=>x-y) },
      { op: '\\', name: 'különbség A\\B', fn: (a,b) => a.filter(x => !b.includes(x)).sort((x,y)=>x-y) },
      { op: '-', name: 'különbség B\\A', fn: (a,b) => b.filter(x => !a.includes(x)).sort((x,y)=>x-y) },
      { op: 'Δ', name: 'szimmetrikus differencia', fn: (a,b) => {
          const union = Array.from(new Set([...a, ...b]));
          return union.filter(x => (a.includes(x) ^ b.includes(x))).sort((x,y)=>x-y);
        } }
    ];
    const chosen = ops[getRandomInt(0, ops.length - 1)];

    const result = chosen.fn(A, B);
    // answer format: '1,2,3' (no spaces) - validator supports also {1,2,3}
    const answerStr = result.length === 0 ? "" : result.join(',');

    // For display, show sets in curly braces and instruct to separate elements with commas
    const display = `Legyenek a halmazok:<br>A = { ${A.join(', ')} }<br>B = { ${B.join(', ')} }<br>Mennyi A ${chosen.op} B ?<br><small>Válasz formátum: elemek vesszővel elválasztva, pl. {1,2,3} vagy 1,2,3</small>`;

    return {
      display,
      answer: answerStr,
      answerType: "set"
    };
  }
},
  {
  name: "Normál alakos számok",
  value: "normal_alak",
  generate: (difficulty) => {
    // Segédfüggvény: véletlenszerű mantissza generálása (1 ≤ m < 10)
    function getRandomMantissa(decimals = 2) {
      let m = Math.random() * 9 + 1; // 1 - 9.999...
      return Number(m.toFixed(decimals));
    }

    // segédfüggvény: lebegőpontos pontatlanság miatti "gyakorlatilag egész" ellenőrzés
    function isEffectivelyInteger(v) {
      return Math.abs(v - Math.round(v)) < 1e-12;
    }

    // Váltakozó direction: ha az utolsó 0 volt, most 1, ha 1 volt, most 0
    const direction = lastDirection === 0 ? 1 : 0;
    lastDirection = direction; // Frissítjük az utolsó direction-t

    // Könnyű szint (változatlan, mert itt eleve nincs negatív szám)
    if (difficulty === "easy") {
      if (direction === 0) {
        // Szám → normál alak kitevője
        let number, exponent;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          let rand = Math.random();
          if (rand < 0.3333) {
            number = getRandomInt(10, 99);
            exponent = 1;
          } else if (rand < 0.6666) {
            number = getRandomInt(100, 999);
            exponent = 2;
          } else {
            number = getRandomInt(1000, 9999);
            exponent = 3;
          }
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(`Maximális próbálkozások elérve, alapértelmezett kitevő: ${exponent}`);
            break;
          }
        } while (exponent === lastExponent);
        lastExponent = exponent;
        console.log(`Könnyű szint, direction=0: Kérdés: ${number}, Várt kitevő: ${exponent}, Direction: ${direction}, Előző kitevő: ${lastExponent}`);
        return {
          display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
          answer: exponent.toString(),
          answerType: "number"
        };
      } else {
        // Normál alak → érték
        let exp, mant, valueRaw;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          let rand = Math.random();
          if (rand < 0.3333) exp = 1;
          else if (rand < 0.6666) exp = 2;
          else exp = 3;
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(`Maximális próbálkozások elérve, alapértelmezett kitevő: ${exp}`);
            break;
          }
        } while (exp === lastExponent);

        // Mantissza 2 tizedessel az easy szinten (megjegyzés: innen a mantissaDecimals értéke származik)
        const mantissaDecimals = 2;
        mant = getRandomMantissa(mantissaDecimals);
        valueRaw = mant * Math.pow(10, exp);
        lastExponent = exp;
        let mantStr = ("" + mant).replace(".", ",");

        // Ha az érték egész (vagy gyakorlatilag egész), válasz: number, különben decimal a szükséges helyi tizedesjegyszámmal
        if (isEffectivelyInteger(valueRaw)) {
          const intVal = String(Math.round(valueRaw));
          console.log(`Könnyű szint - egész eredmény: ${intVal}`);
          return {
            display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
            answer: intVal,
            answerType: "number"
          };
        } else {
          // Számoljuk ki a szükséges tizedesjegyek számát a mantissza és a kitevő alapján:
          // decimalPlaces = max(0, mantissaDecimals - exp) (ha exp negatív, ez növeli a tizedesjegyek számát)
          const decimalPlaces = Math.max(0, mantissaDecimals - exp);
          const answerStr = valueRaw.toFixed(decimalPlaces).replace(".", ",");
          console.log(`Könnyű szint - tizedes eredmény: ${answerStr} (decimalPlaces=${decimalPlaces})`);
          return {
            display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
            answer: answerStr,
            answerType: "decimal",
            decimalPlaces
          };
        }
      }
    }

    // Közepes szint
    if (difficulty === "medium") {
      if (direction === 0) {
        // Szám → normál alak kitevője
        let number, exponent;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          let rand = Math.random();
          if (rand < 0.25) {
            number = Number((Math.random() * 0.00899 + 0.001).toFixed(4));
            exponent = -3;
          } else if (rand < 0.5) {
            number = Number((Math.random() * 0.089 + 0.01).toFixed(3));
            exponent = -2;
          } else if (rand < 0.75) {
            number = Number((Math.random() * 0.89 + 0.1).toFixed(2));
            exponent = -1;
          } else {
            number = Number((Math.random() * 8.98 + 1.01).toFixed(2));
            exponent = 0;
          }
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(`Maximális próbálkozások elérve, alapértelmezett kitevő: ${exponent}`);
            break;
          }
        } while (exponent === lastExponent);
        lastExponent = exponent;
        console.log(`Közepes szint, direction=0: Kérdés: ${number}, Várt kitevő: ${exponent}, Direction: ${direction}, Előző kitevő: ${lastExponent}`);
        return {
          display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
          answer: exponent.toString(),
          answerType: "number"
        };
      } else {
        // Normál alak → érték
        let exp, mant, valueRaw;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          let rand = Math.random();
          if (rand < 0.25) exp = -3;
          else if (rand < 0.5) exp = -2;
          else if (rand < 0.75) exp = -1;
          else exp = 0;
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(`Maximális próbálkozások elérve, alapértelmezett kitevő: ${exp}`);
            break;
          }
        } while (exp === lastExponent);

        // Mantissza 2 tizedessel a medium szinten
        const mantissaDecimals = 2;
        mant = getRandomMantissa(mantissaDecimals);
        valueRaw = mant * Math.pow(10, exp);
        lastExponent = exp;
        let mantStr = ("" + mant).replace(".", ",");

        // Ha egész, adjuk vissza number-t; különben számoljuk ki a pontos decimalPlaces-értéket
        if (isEffectivelyInteger(valueRaw)) {
          const intVal = String(Math.round(valueRaw));
          console.log(`Közepes szint - egész eredmény: ${intVal}`);
          return {
            display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
            answer: intVal,
            answerType: "number"
          };
        } else {
          const decimalPlaces = Math.max(0, mantissaDecimals - exp);
          const answerStr = valueRaw.toFixed(decimalPlaces).replace(".", ",");
          console.log(`Közepes szint - tizedes eredmény: ${answerStr} (decimalPlaces=${decimalPlaces})`);
          return {
            display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
            answer: answerStr,
            answerType: "decimal",
            decimalPlaces
          };
        }
      }
    }

    // Nehéz szint
    if (difficulty === "hard") {
      if (direction === 0) {
        // Szám → normál alak kitevője
        let number, exponent;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          let rand = Math.random();
          if (rand < 0.1667) {
            number = Number((Math.random() * 0.000089 + 0.00001).toFixed(6));
            exponent = -5;
          } else if (rand < 0.3334) {
            number = Number((Math.random() * 0.00089 + 0.0001).toFixed(5));
            exponent = -4;
          } else if (rand < 0.5) {
            number = Number((Math.random() * 0.0089 + 0.001).toFixed(4));
            exponent = -3;
          } else if (rand < 0.6667) {
            number = getRandomInt(1000, 9999);
            exponent = 3;
          } else if (rand < 0.8334) {
            number = getRandomInt(10000, 99999);
            exponent = 4;
          } else {
            number = getRandomInt(100000, 999999);
            exponent = 5;
          }
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(`Maximális próbálkozások elérve, alapértelmezett kitevő: ${exponent}`);
            break;
          }
        } while (exponent === lastExponent);
        lastExponent = exponent;
        console.log(`Nehéz szint, direction=0: Kérdés: ${number}, Várt kitevő: ${exponent}, Direction: ${direction}, Előző kitevő: ${lastExponent}`);
        return {
          display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
          answer: exponent.toString(),
          answerType: "number"
        };
      } else {
        // Normál alak → érték
        let exp, mant, valueRaw;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          let rand = Math.random();
          if (rand < 0.1667) exp = -5;
          else if (rand < 0.3334) exp = -4;
          else if (rand < 0.5) exp = -3;
          else if (rand < 0.6667) exp = 3;
          else if (rand < 0.8334) exp = 4;
          else exp = 5;
          attempts++;
          if (attempts > maxAttempts) {
            console.warn(`Maximális próbálkozások elérve, alapértelmezett kitevő: ${exp}`);
            break;
          }
        } while (exp === lastExponent);

        // Mantissza 3 tizedessel a hard szinten
        const mantissaDecimals = 3;
        mant = getRandomMantissa(mantissaDecimals);
        valueRaw = mant * Math.pow(10, exp);
        lastExponent = exp;
        let mantStr = ("" + mant).replace(".", ",");

        if (isEffectivelyInteger(valueRaw)) {
          const intVal = String(Math.round(valueRaw));
          console.log(`Nehéz szint - egész eredmény: ${intVal}`);
          return {
            display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
            answer: intVal,
            answerType: "number"
          };
        } else {
          const decimalPlaces = Math.max(0, mantissaDecimals - exp);
          const answerStr = valueRaw.toFixed(decimalPlaces).replace(".", ",");
          console.log(`Nehéz szint - tizedes eredmény: ${answerStr} (decimalPlaces=${decimalPlaces})`);
          return {
            display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
            answer: answerStr,
            answerType: "decimal",
            decimalPlaces
          };
        }
      }
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
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
      // Szorzásként is kiírjuk az easy szinten
      let multiplication = Array(exponent).fill(base).join(' × ');
      answer = Math.pow(base, exponent);
      return {
        display: `<b>${base}<sup>${exponent}</sup></b> = <b>${multiplication}</b><br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
        answer: answer.toString(),
        answerType: "number"
      };
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
    return {
      display: `<b>${base}<sup>${exponent}</sup></b><br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`,
      answer: answer.toString(),
      answerType: "number"
    };
  }
},

  

{
  name: "Mértékegység átváltás",
  value: "mertekegyseg_atvaltas",
  generate: (difficulty) => {
    const ranges = {
      easy: { 
        mAMin: 0, mAMax: 10000, 
        ohmMin: 0, ohmMax: 10000, 
        kOhmMin: 0, kOhmMax: 1000, 
        ampMin: 0, ampMax: 10.00, 
        mVMin: 0, mVMax: 10000, 
        vMin: 0, vMax: 1000, 
        wMin: 0, wMax: 10000, 
        kWMin: 0, kWMax: 3.00 
      },
      medium: { 
        mAMin: 100, mAMax: 3000, 
        ohmMin: 100, ohmMax: 3000, 
        kOhmMin: 1, kOhmMax: 15, 
        mOhmMin: 1, mOhmMax: 15, 
        ampMin: 1, ampMax: 15, 
        microAMin: 100, microAMax: 3000, 
        mVMin: 100, mVMax: 3000, 
        vMin: 100, vMax: 3000, 
        kVMin: 1, kVMax: 15, 
        mWMin: 100, mWMax: 3000, 
        wMin: 100, wMax: 3000, 
        hzMin: 100, hzMax: 3000, 
        kHzMin: 1, kHzMax: 15 
      },
      hard: { 
        mAMin: 100, mAMax: 10000, 
        ohmMin: 100, ohmMax: 10000, 
        kOhmMin: 0.001, kOhmMax: 50, 
        mOhmMin: 0.001, mOhmMax: 50, 
        ampMin: 0.001, ampMax: 50, 
        microAMin: 100, microAMax: 10000, 
        microVMin: 100, microVMax: 10000, 
        mVMin: 100, mVMax: 10000, 
        vMin: 100, vMax: 10000, 
        kVMin: 0.001, kVMax: 50, 
        mWMin: 100, mWMax: 10000, 
        wMin: 100, wMax: 10000, 
        pFMin: 100, pFMax: 1000, 
        nFMin: 100, nFMax: 10000, 
        microFMin: 0.001, microFMax: 50, 
        kHzMin: 0.001, kHzMax: 1000, 
        mHzMin: 0.001, mHzMax: 50 
      }
    };

    const { mAMin, mAMax, ohmMin, ohmMax, kOhmMin, kOhmMax, mOhmMin, mOhmMax, ampMin, ampMax, microAMin, microAMax, mVMin, mVMax, vMin, vMax, kVMin, kVMax, microVMin, microVMax, mWMin, mWMax, wMin, wMax, kWMin, kWMax, pFMin, pFMax, nFMin, nFMax, microFMin, microFMax, hzMin, hzMax, kHzMin, kHzMax, mHzMin, mHzMax } = ranges[difficulty];

    const types = {
      easy: [
        // Kisebbről nagyobbra (osztás)
        { direction: "smallerToLarger", fn: () => {
          let mA = getRandomInt(mAMin, mAMax);
          let answer = mA / 1000;
          const formatted = formatNumber(answer, 'A', difficulty);
          return {
            display: `<b>${mA} mA</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let ohm = getRandomInt(ohmMin, ohmMax);
          let answer = ohm / 1000;
          const formatted = formatNumber(answer, 'kΩ', difficulty);
          return {
            display: `<b>${ohm} Ω</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let mV = getRandomInt(mVMin, mVMax);
          let answer = mV / 1000;
          const formatted = formatNumber(answer, 'V', difficulty);
          return {
            display: `<b>${mV} mV</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let w = getRandomInt(wMin, wMax);
          let answer = w / 1000;
          const formatted = formatNumber(answer, 'kW', difficulty);
          return {
            display: `<b>${w} W</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        // Nagyobbról kisebbre (szorzás)
        { direction: "largerToSmaller", fn: () => {
          let kOhm = getRandomInt(kOhmMin, kOhmMax);
          let answer = kOhm * 1000;
          return {
            display: `<b>${kOhm} kΩ</b> = ? <span class="blue-percent">Ω</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let amp = getRandomInt(ampMin, ampMax);
          let answer = amp * 1000;
          return {
            display: `<b>${amp} A</b> = ? <span class="blue-percent">mA</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let v = getRandomInt(vMin, vMax);
          let answer = v * 1000;
          return {
            display: `<b>${v} V</b> = ? <span class="blue-percent">mV</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let kW = getRandomInt(kWMin, kWMax);
          let answer = kW * 1000;
          return {
            display: `<b>${kW} kW</b> = ? <span class="blue-percent">W</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }}
      ],
      medium: [
        // Kisebbről nagyobbra (osztás)
        { direction: "smallerToLarger", fn: () => {
          let v = getRandomInt(vMin, vMax);
          let answer = v / 1000;
          const formatted = formatNumber(answer, 'kV', difficulty);
          return {
            display: `<b>${v} V</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let microA = getRandomInt(microAMin, microAMax);
          let answer = microA / 1000;
          const formatted = formatNumber(answer, 'mA', difficulty);
          return {
            display: `<b>${microA} µA</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let kOhm = getRandomInt(kOhmMin, kOhmMax);
          let answer = kOhm / 1000;
          const formatted = formatNumber(answer, 'MΩ', difficulty);
          return {
            display: `<b>${kOhm} kΩ</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let hz = getRandomInt(hzMin, hzMax);
          let answer = hz / 1000;
          const formatted = formatNumber(answer, 'kHz', difficulty);
          return {
            display: `<b>${hz} Hz</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        // Nagyobbról kisebbre (szorzás)
        { direction: "largerToSmaller", fn: () => {
          let kV = getRandomInt(kVMin, kVMax);
          let answer = kV * 1000;
          return {
            display: `<b>${kV} kV</b> = ? <span class="blue-percent">V</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let mOhm = getRandomInt(mOhmMin, mOhmMax);
          let answer = mOhm * 1000;
          return {
            display: `<b>${mOhm} MΩ</b> = ? <span class="blue-percent">kΩ</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let w = getRandomInt(wMin, wMax);
          let answer = w * 1000;
          return {
            display: `<b>${w} W</b> = ? <span class="blue-percent">mW</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let kHz = getRandomInt(kHzMin, kHzMax);
          let answer = kHz * 1000;
          return {
            display: `<b>${kHz} kHz</b> = ? <span class="blue-percent">Hz</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        // Extra: kisebbről nagyobbra (teljesítmény)
        { direction: "smallerToLarger", fn: () => {
          let mW = getRandomInt(mWMin, mWMax);
          let answer = mW / 1000;
          const formatted = formatNumber(answer, 'W', difficulty);
          return {
            display: `<b>${mW} mW</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }}
      ],
      hard: [
        // Kisebbről nagyobbra (osztás)
        { direction: "smallerToLarger", fn: () => {
          let microV = getRandomInt(microVMin, microVMax);
          let answer = microV / 1000;
          const formatted = formatNumber(answer, 'mV', difficulty);
          return {
            display: `<b>${microV} µV</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let pF = getRandomInt(pFMin, pFMax);
          let answer = pF / 1000;
          const formatted = formatNumber(answer, 'nF', difficulty);
          return {
            display: `<b>${pF} pF</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let nF = getRandomInt(nFMin, nFMax);
          let answer = nF / 1000;
          const formatted = formatNumber(answer, 'µF', difficulty);
          return {
            display: `<b>${nF} nF</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        { direction: "smallerToLarger", fn: () => {
          let kHz = getRandomInt(kHzMin, kHzMax);
          let answer = kHz / 1000;
          const formatted = formatNumber(answer, 'MHz', difficulty);
          return {
            display: `<b>${kHz} kHz</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        }},
        // Nagyobbról kisebbre (szorzás)
        { direction: "largerToSmaller", fn: () => {
          let microF = getRandomInt(microFMin, microFMax);
          let answer = microF * 1000;
          return {
            display: `<b>${microF} µF</b> = ? <span class="blue-percent">nF</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let mHz = getRandomInt(mHzMin, mHzMax);
          let answer = mHz * 1000;
          return {
            display: `<b>${mHz} MHz</b> = ? <span class="blue-percent">kHz</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        // Extra: nagyobbról kisebbre (áram és ellenállás hozzáadása)
        { direction: "largerToSmaller", fn: () => {
          let mOhm = getRandomInt(mOhmMin, mOhmMax);
          let answer = mOhm * 1000;
          return {
            display: `<b>${mOhm} MΩ</b> = ? <span class="blue-percent">kΩ</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }},
        { direction: "largerToSmaller", fn: () => {
          let amp = getRandomInt(ampMin, ampMax);
          let answer = amp * 1000;
          return {
            display: `<b>${amp} A</b> = ? <span class="blue-percent">mA</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }}
      ]
    };

    // Váltakozó irányok biztosítása
    const selectedTypes = types[difficulty];
    const smallerToLarger = selectedTypes.filter(t => t.direction === "smallerToLarger");
    const largerToSmaller = selectedTypes.filter(t => t.direction === "largerToSmaller");
    
    // A QUESTIONS számától függően váltakozó irányú feladatok generálása
    const generateAlternatingTasks = () => {
      const tasks = [];
      for (let i = 0; i < QUESTIONS; i++) {
        const isEven = i % 2 === 0;
        const typeArray = isEven ? smallerToLarger : largerToSmaller;
        const randomIndex = getRandomInt(0, typeArray.length - 1);
        tasks.push(typeArray[randomIndex].fn());
      }
      return tasks;
    };

    // Ha csak egy feladatot generálunk (pl. teszteléshez), véletlenszerűen választunk
    const singleTask = selectedTypes[getRandomInt(0, selectedTypes.length - 1)].fn();
    
    // Ha a generateQuestions hívja, akkor a teljes váltakozó listát adjuk vissza
    if (window.isGeneratingQuestions) {
      return generateAlternatingTasks();
    }
    
    return singleTask;
  }
},

// --- Mértékegység kerekítés (javított) ---
{
  name: "Mértékegység kerekítés",
  value: "mertekegyseg_kerekites",
  generate: (difficulty) => {
    // (kezdő rész: tartományok ugyanazok mint korábban)
    const ranges = {
      easy: { 
        mAMin: 100, mAMax: 5000, 
        ohmMin: 100, ohmMax: 5000, 
        kOhmMin: 1, kOhmMax: 50, 
        mOhmMin: 1, mOhmMax: 50, 
        ampMin: 1, ampMax: 50, 
        microAMin: 100, microAMax: 5000, 
        mVMin: 100, mVMax: 5000, 
        vMin: 100, vMax: 5000, 
        kVMin: 1, kVMax: 50, 
        mWMin: 100, mWMax: 5000, 
        wMin: 100, wMax: 5000, 
        hzMin: 100, hzMax: 5000, 
        kHzMin: 1, kHzMax: 50 
      },
      medium: { 
        mAMin: 100, mAMax: 1000, 
        ohmMin: 100, ohmMax: 1000, 
        kOhmMin: 1, kOhmMax: 10, 
        ampMin: 1, ampMax: 10, 
        mVMin: 100, mVMax: 1000, 
        vMin: 1, vMax: 100, 
        wMin: 100, wMax: 1000, 
        kWMin: 1, kWMax: 10 
      },
      hard: { 
        mAMin: 100, mAMax: 10000, 
        ohmMin: 100, ohmMax: 10000, 
        kOhmMin: 1, kOhmMax: 50, 
        mOhmMin: 1, mOhmMax: 50, 
        ampMin: 1, ampMax: 50, 
        microAMin: 100, microAMax: 10000, 
        microVMin: 100, microVMax: 10000, 
        mVMin: 100, mVMax: 10000, 
        vMin: 100, vMax: 10000, 
        kVMin: 1, kVMax: 50, 
        mWMin: 100, mWMax: 10000, 
        wMin: 100, wMax: 10000, 
        pFMin: 100, pFMax: 1000, 
        nFMin: 100, nFMax: 10000, 
        microFMin: 1, microFMax: 50, 
        hzMin: 100, hzMax: 10000, 
        kHzMin: 1, kHzMax: 1000, 
        mHzMin: 1, mHzMax: 50 
      }
    };

    const {
      mAMin, mAMax, ohmMin, ohmMax, kOhmMin, kOhmMax, mOhmMin, mOhmMax,
      ampMin, ampMax, microAMin, microAMax, mVMin, mVMax, vMin, vMax,
      kVMin, kVMax, microVMin, microVMax, mWMin, mWMax, wMin, wMax,
      kWMin, kWMax, pFMin, pFMax, nFMin, nFMax, microFMin, microFMax,
      hzMin, hzMax, kHzMin, kHzMax, mHzMin, mHzMax
    } = ranges[difficulty];

    const units = {
      easy: ['mA', 'Ω', 'kΩ', 'mΩ', 'A', 'µA', 'mV', 'V', 'kV', 'mW', 'W', 'Hz', 'kHz'],
      medium: ['mA', 'Ω', 'kΩ', 'A', 'mV', 'V', 'W', 'kW'],
      hard: ['mA', 'Ω', 'kΩ', 'mΩ', 'A', 'µA', 'µV', 'mV', 'V', 'kV', 'mW', 'W', 'pF', 'nF', 'µF', 'Hz', 'kHz', 'MHz']
    };

    const conversionPairs = {
      'mA': 'A',
      'Ω': 'kΩ',
      'kΩ': 'MΩ',
      'mΩ': 'Ω',
      'A': 'kA',
      'µA': 'mA',
      'mV': 'V',
      'V': 'kV',
      'kV': 'MV',
      'µV': 'mV',
      'mW': 'W',
      'W': 'kW',
      'kW': 'MW',
      'pF': 'nF',
      'nF': 'µF',
      'µF': 'mF',
      'Hz': 'kHz',
      'kHz': 'MHz',
      'MHz': 'GHz'
    };

    // Pick unit & prepare value
    const unit = units[difficulty][getRandomInt(0, units[difficulty].length - 1)];
    let minVal, maxVal;
    switch (unit) {
      case 'mA': minVal = mAMin; maxVal = mAMax; break;
      case 'Ω': minVal = ohmMin; maxVal = ohmMax; break;
      case 'kΩ': minVal = kOhmMin; maxVal = kOhmMax; break;
      case 'mΩ': minVal = mOhmMin; maxVal = mOhmMax; break;
      case 'A': minVal = ampMin; maxVal = ampMax; break;
      case 'µA': minVal = microAMin; maxVal = microAMax; break;
      case 'mV': minVal = mVMin; maxVal = mVMax; break;
      case 'V': minVal = vMin; maxVal = vMax; break;
      case 'kV': minVal = kVMin; maxVal = kVMax; break;
      case 'µV': minVal = microVMin; maxVal = microVMax; break;
      case 'mW': minVal = mWMin; maxVal = mWMax; break;
      case 'W': minVal = wMin; maxVal = wMax; break;
      case 'kW': minVal = kWMin; maxVal = kWMax; break;
      case 'pF': minVal = pFMin; maxVal = pFMax; break;
      case 'nF': minVal = nFMin; maxVal = nFMax; break;
      case 'µF': minVal = microFMin; maxVal = microFMax; break;
      case 'Hz': minVal = hzMin; maxVal = hzMax; break;
      case 'kHz': minVal = kHzMin; maxVal = kHzMax; break;
      case 'MHz': minVal = mHzMin; maxVal = mHzMax; break;
      default: minVal = 100; maxVal = 1000; break;
    }

    // Generate raw value (keep some decimal part)
    const decimalPart = Math.random();
    let value = getRandomInt(minVal, maxVal) + decimalPart;
    if (isNaN(value)) value = 100 + Math.random();

    // Determine required decimal places for this question and use it consistently
    let decimalPlaces;
    if (difficulty === 'easy') decimalPlaces = 0;
    else if (difficulty === 'medium') decimalPlaces = getRandomInt(1, 2);
    else decimalPlaces = getRandomInt(1, 3);

    // --- Javított rész: a 'hard' konverziós ágban a válasz tartalmazza a decimalPlaces-t és stabil, determinisztikus kerekítést ---
if (difficulty === 'hard' && conversionPairs[unit]) {
  const targetUnit = conversionPairs[unit];

  // egyértelmű faktor (a jelenlegi implementáció metrikus lépcsőn alapul, 1000)
  const factor = 1000;

  // konvertálás: kisebb előtag -> nagyobb előtag (pl. µV -> mV: osztás 1000)
  const convertedValue = value / factor;

  // határozzuk meg a kerekítendő tizedesjegyek számát (már fent definiált decimalPlaces)
  // (decimalPlaces változó felül van definiálva a függvény elején)
  const pow = Math.pow(10, decimalPlaces);
  // stabil kerekítés (Math.round * pow) + we keep trailing zeros via toFixed
  const roundedNumeric = Math.round(convertedValue * pow) / pow;
  const roundedStr = decimalPlaces === 0 ? String(Math.round(roundedNumeric)) : roundedNumeric.toFixed(decimalPlaces);

  return {
    display: `<b>${value.toFixed(3)} ${unit}</b> átváltva és kerekítve ${decimalPlaces} tizedesjegyre ${targetUnit}-ban = ? <span class="blue-percent">${targetUnit}</span>`,
    answer: roundedStr,
    answerType: decimalPlaces === 0 ? "number" : "decimal",
    decimalPlaces // fontos: a validátor innen veszi az elvárt tizedesjegyszámot
  };
}
    // Easy / Medium: no unit conversion, just rounding to the requested decimalPlaces
    const roundedNum = Number(value.toFixed(decimalPlaces));
// garantáljuk a trailing zero-kat stringben:
// ha decimalPlaces === 0, akkor egész szám formátum
const roundedStr = decimalPlaces === 0 ? String(Math.round(roundedNum)) : roundedNum.toFixed(decimalPlaces);

const displayUnit = unit;
const answerType = decimalPlaces === 0 ? "number" : "decimal";
const options = answerType === "decimal" ? generateOptions(Number(roundedNum), "decimal", difficulty, displayUnit, decimalPlaces) : [];

return {
  display: `<b>${value.toFixed(3)} ${unit}</b> kerekítve ${decimalPlaces === 0 ? 'egészre' : `${decimalPlaces} tizedesjegyre`} = ? <span class="blue-percent">${displayUnit}</span>`,
  answer: roundedStr,
  answerType,
  decimalPlaces, // <-- ide tesszük, hogy a validátor tudja
  options
};
  }
},

  
  {
  name: "Ohm-törvény",
  value: "ohm_torveny",
  generate: (difficulty) => {
    // Fontos elv: a válasz MINDIG a megjelenített értékekből számolódik.

    if (difficulty === "easy") {
      const maxI = 10, maxR = 100, maxU = 100;
      let U, R, I, type, answer, display, answerType = "number";
      type = getRandomInt(0, 2);
      const randomOrder = Math.random() < 0.5;

      if (type === 0) { // U = I * R
        I = getRandomInt(1, maxI);
        R = getRandomInt(1, maxR);
        U = I * R;
        answer = U.toString();
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>R = ${R} <span class="blue-percent">Ω</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>R = ${R} <span class="blue-percent">Ω</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (V)</small>`;
      } else if (type === 1) { // I = U / R
        R = getRandomInt(1, maxR);
        I = getRandomInt(1, maxI);
        U = I * R;
        answer = I.toString();
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">A</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>R = ${R} <span class="blue-percent">Ω</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">A</span>-ban), ha <b>R = ${R} <span class="blue-percent">Ω</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (A)</small>`;
      } else { // R = U / I
        I = getRandomInt(1, maxI);
        R = getRandomInt(1, maxR);
        U = I * R;
        answer = R.toString();
        display = randomOrder
          ? `Mennyi az ellenállás (<span class="blue-percent">Ω</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
          : `Mennyi az ellenállás (<span class="blue-percent">Ω</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (Ω)</small>`;
      }
      return {
        display, answer, answerType,
        options: generateOptions(Number(answer), answerType, difficulty, type === 0 ? "V" : type === 1 ? "A" : "Ω"),
        unit: type === 0 ? "V" : type === 1 ? "A" : "Ω"
      };
    } else if (difficulty === "medium") {
      // Medium: megjelenített értékekből számolunk
      const precision = 2;
      let type = getRandomInt(0, 2);
      const randomOrder = Math.random() < 0.5;
      let display, answer, unit, answerType = "decimal";

      if (type === 0) { // U = I_mA * R_kOhm
        let I_mA = Number((getRandomInt(1, 20) + Math.random()).toFixed(1));
        let R_kOhm = Number((getRandomInt(10, 1000) / 1000).toFixed(2));
        let U = Number((I_mA * R_kOhm).toFixed(precision));
        answer = U.toString();
        unit = "V";
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>I = ${I_mA} <span class="blue-percent">mA</span></b> és <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b> és <b>I = ${I_mA} <span class="blue-percent">mA</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (V)</small>`;
      } else if (type === 1) { // I_mA = U / R_kOhm
        let U = getRandomInt(100, 1000);
        let R_kOhm = Number((getRandomInt(10, 1000) / 1000).toFixed(2));
        let I_mA = Number((U / R_kOhm).toFixed(precision));
        answer = I_mA.toString();
        unit = "mA";
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (mA)</small>`;
      } else { // R_kOhm = U / I_mA
        let U = getRandomInt(100, 1000);
        let I_mA = Number((getRandomInt(1, 20) + Math.random()).toFixed(1));
        let R_kOhm = Number((U / I_mA).toFixed(precision));
        answer = R_kOhm.toString();
        unit = "kΩ";
        display = randomOrder
          ? `Mennyi az ellenállás (<span class="blue-percent">kΩ</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I_mA} <span class="blue-percent">mA</span></b>?`
          : `Mennyi az ellenállás (<span class="blue-percent">kΩ</span>-ban), ha <b>I = ${I_mA} <span class="blue-percent">mA</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (kΩ)</small>`;
      }
      return { display, answer, answerType, options: [], unit };
    } else { // hard – először a megjelenítendő mantissza+kitevő
      const precision = 5;
      let type = getRandomInt(0, 2);
      const randomOrder = Math.random() < 0.5;
      let display, answer, unit, answerType = "decimal";

      function randSci() {
        const exp = getRandomInt(0, 2);
        const mant = Number((getRandomInt(10, 50) / 10).toFixed(1));
        return { mant, exp, value: mant * Math.pow(10, exp) };
      }

      if (type === 0) { // U_kV = (I_mA * R_MOhm) / 1000
        const I = randSci();
        const R = randSci();
        let U_kV = Number(((I.value * R.value) / 1000).toFixed(precision));
        answer = U_kV.toString();
        unit = "kV";
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>I = ${I.mant} × 10<sup>${I.exp}</sup> <span class="blue-percent">mA</span></b> és <b>R = ${R.mant} × 10<sup>${R.exp}</sup> <span class="blue-percent">MΩ</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>R = ${R.mant} × 10<sup>${R.exp}</sup> <span class="blue-percent">MΩ</span></b> és <b>I = ${I.mant} × 10<sup>${I.exp}</sup> <span class="blue-percent">mA</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 5 tizedesjegy pontossággal (kV)</small>`;
      } else if (type === 1) { // I_mA = (U_kV * 1000) / R_MOhm
        const U = randSci();
        const R = randSci();
        let I_mA = Number(((U.value * 1000) / R.value).toFixed(precision));
        answer = I_mA.toString();
        unit = "mA";
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>U = ${U.mant} × 10<sup>${U.exp}</sup> <span class="blue-percent">kV</span></b> és <b>R = ${R.mant} × 10<sup>${R.exp}</sup> <span class="blue-percent">MΩ</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>R = ${R.mant} × 10<sup>${R.exp}</sup> <span class="blue-percent">MΩ</span></b> és <b>U = ${U.mant} × 10<sup>${U.exp}</sup> <span class="blue-percent">kV</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 5 tizedesjegy pontossággal (mA)</small>`;
      } else { // R_MOhm = (U_kV * 1000) / I_mA
        const U = randSci();
        const I = randSci();
        let R_MOhm = Number(((U.value * 1000) / I.value).toFixed(precision));
        answer = R_MOhm.toString();
        unit = "MΩ";
        display = randomOrder
          ? `Mennyi az ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>U = ${U.mant} × 10<sup>${U.exp}</sup> <span class="blue-percent">kV</span></b> és <b>I = ${I.mant} × 10<sup>${I.exp}</sup> <span class="blue-percent">mA</span></b>?`
          : `Mennyi az ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>I = ${I.mant} × 10<sup>${I.exp}</sup> <span class="blue-percent">mA</span></b> és <b>U = ${U.mant} × 10<sup>${U.exp}</sup> <span class="blue-percent">kV</span></b>?`;
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 5 tizedesjegy pontossággal (MΩ)</small>`;
      }
      return { display, answer, answerType, options: [], unit };
    }
  }
},
{
  name: "Teljesítmény számolás",
  value: "teljesitmeny",
  generate: (difficulty) => {
    // Elv: a válasz a megjelenített értékekből számolódik.
    const ranges = {
      easy: { maxP: 100, maxU: 24, maxI: 10 },
      medium: { maxP: 1000, maxU: 120, maxI: 2 },
      hard: { maxP: 10000, maxU: 10000, maxI: 10000 }
    };
    const { maxP, maxU, maxI } = ranges[difficulty];
    const taskType = getRandomInt(0, 2);
    let display, answer, answerType, unit, decimalPlaces;
    const randomOrder = Math.random() < 0.5;

    function toSci(value) {
      if (value === 0) return { str: "0", mant: 0, exp: 0, value: 0 };
      const abs = Math.abs(value);
      const exp = Math.floor(Math.log10(abs));
      const mant = Number((abs / Math.pow(10, exp)).toFixed(2));
      return { str: `${mant} × 10<sup>${exp}</sup>`, mant, exp, value: mant * Math.pow(10, exp) };
    }

    if (taskType === 0) { // P = U * I
      if (difficulty === "easy") {
        let U = getRandomInt(5, maxU);
        let I = getRandomInt(1, maxI);
        let P = U * I;
        const formatted = formatNumber(P, 'W', difficulty);
        display = randomOrder
          ? `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
          : `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        answer = formatted.value.toString();
        answerType = Number.isInteger(P) ? "number" : "decimal";
        unit = formatted.unit;
        decimalPlaces = answerType === "decimal" ? 2 : 0;
      } else if (difficulty === "medium") {
        let U = getRandomInt(10, maxU);
        let I = Number((Math.random() * (maxI - 0.1) + 0.1).toFixed(3));
        let P_kW = Number(((U * I) / 1000).toFixed(2));
        answer = P_kW.toString();
        unit = "kW";
        answerType = "decimal";
        decimalPlaces = 2;
        display = randomOrder
          ? `Mennyi a teljesítmény (<span class="blue-percent">kW</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
          : `Mennyi a teljesítmény (<span class="blue-percent">kW</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
      } else {
        let U_kV_raw = 1 + Math.random() * 18;
        let I_mA_raw = getRandomInt(1000, 9999);
        const U_sci = toSci(U_kV_raw);
        const I_sci = toSci(I_mA_raw);
        let P_kW = Number(((U_sci.value * I_sci.value) / 1000).toFixed(3));
        answer = P_kW.toString();
        unit = "kW";
        answerType = "decimal";
        decimalPlaces = 3;
        display = randomOrder
          ? `Mennyi a teljesítmény (<span class="blue-percent">kW</span>-ban), ha <b>U = ${U_sci.str} <span class="blue-percent">kV</span></b> és <b>I = ${I_sci.str} <span class="blue-percent">mA</span></b>?`
          : `Mennyi a teljesítmény (<span class="blue-percent">kW</span>-ban), ha <b>I = ${I_sci.str} <span class="blue-percent">mA</span></b> és <b>U = ${U_sci.str} <span class="blue-percent">kV</span></b>?`;
      }
    } else if (taskType === 1) { // U = P / I
      if (difficulty === "easy") {
        let P = getRandomInt(10, maxP);
        let I = getRandomInt(1, maxI);
        let U = Number((P / I).toFixed(2));
        const formatted = formatNumber(U, 'V', difficulty);
        answer = formatted.value.toString();
        answerType = Number.isInteger(U) ? "number" : "decimal";
        unit = formatted.unit;
        decimalPlaces = answerType === "decimal" ? 2 : 0;
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
      } else if (difficulty === "medium") {
        let P = getRandomInt(100, maxP);
        let I = Number((Math.random() * (maxI - 0.1) + 0.1).toFixed(3));
        let U_kV = Number(((P / I) / 1000).toFixed(2));
        answer = U_kV.toString();
        unit = "kV";
        answerType = "decimal";
        decimalPlaces = 2;
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
      } else {
        let P_kW_raw = 1 + Math.random() * 29;
        let I_mA_raw = getRandomInt(1000, 9999);
        const P_sci = toSci(P_kW_raw);
        const I_sci = toSci(I_mA_raw);
        let U_kV = Number(((P_sci.value * 1000) / I_sci.value).toFixed(3));
        answer = U_kV.toString();
        unit = "kV";
        answerType = "decimal";
        decimalPlaces = 3;
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>P = ${P_sci.str} <span class="blue-percent">kW</span></b> és <b>I = ${I_sci.str} <span class="blue-percent">mA</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>I = ${I_sci.str} <span class="blue-percent">mA</span></b> és <b>P = ${P_sci.str} <span class="blue-percent">kW</span></b>?`;
      }
    } else { // I = P / U
      if (difficulty === "easy") {
        let P = getRandomInt(10, maxP);
        let U = getRandomInt(5, maxU);
        let I = Number((P / U).toFixed(2));
        const formatted = formatNumber(I, 'A', difficulty);
        answer = formatted.value.toString();
        answerType = Number.isInteger(I) ? "number" : "decimal";
        unit = formatted.unit;
        decimalPlaces = answerType === "decimal" ? 2 : 0;
        display = randomOrder
          ? `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`
          : `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
      } else if (difficulty === "medium") {
        let P = getRandomInt(100, maxP);
        let U = getRandomInt(10, maxU);
        let I_mA = Number(((P / U) * 1000).toFixed(2));
        answer = I_mA.toString();
        unit = "mA";
        answerType = "decimal";
        decimalPlaces = 2;
        display = randomOrder
          ? `Mennyi az áramerősség (<span class="blue-percent">mA</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`
          : `Mennyi az áramerősség (<span class="blue-percent">mA</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
      } else {
        let P_kW_raw = 1 + Math.random() * 29;
        let U_kV_raw = 1 + Math.random() * 9;
        const P_sci = toSci(P_kW_raw);
        const U_sci = toSci(U_kV_raw);
        let I_mA = Number(((P_sci.value / U_sci.value) * 1000).toFixed(3));
        answer = I_mA.toString();
        unit = "mA";
        answerType = "decimal";
        decimalPlaces = 3;
        display = randomOrder
          ? `Mennyi az áramerősség (<span class="blue-percent">mA</span>-ban), ha <b>P = ${P_sci.str} <span class="blue-percent">kW</span></b> és <b>U = ${U_sci.str} <span class="blue-percent">kV</span></b>?`
          : `Mennyi az áramerősség (<span class="blue-percent">mA</span>-ban), ha <b>U = ${U_sci.str} <span class="blue-percent">kV</span></b> és <b>P = ${P_sci.str} <span class="blue-percent">kW</span></b>?`;
      }
    }

    // Pontossági útmutató a megjelenített szöveghez
    if (!display.includes("precision-hint")) {
      if (answerType === "number" || (difficulty === "easy" && Number.isInteger(Number(answer)))) {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (${unit})</small>`;
      } else if (difficulty === "medium") {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (${unit})</small>`;
      } else if (difficulty === "hard") {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 3 tizedesjegy pontossággal (${unit})</small>`;
      } else {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (${unit})</small>`;
      }
    }

    const options = answerType === "decimal"
      ? generateOptions(Number(answer), answerType, difficulty, unit, decimalPlaces || 2)
      : [];

    return {
      display,
      answer,
      answerType,
      decimalPlaces,
      options,
      unit,
      value: "teljesitmeny",
      difficulty
    };
  }
},
  {
  name: "Előtét ellenállás méretezés",
  value: "elotet_ellenallas",
  generate: (difficulty) => {
    // Elv: a válasz a megjelenített értékekből számolódik.
    const precision = difficulty === "easy" ? 0 : difficulty === "medium" ? 2 : 3;
    let display, answer, answerType, unit;

    if (difficulty === "easy") {
      let U_forras = getRandomInt(5, 24);
      let U_fogy = getRandomInt(1, Math.min(U_forras - 1, 12));
      let I_mA = getRandomInt(10, 100);
      let R = Math.round(((U_forras - U_fogy) * 1000) / I_mA);
      answer = R.toString();
      unit = "Ω";
      answerType = "number";
      let parts = [
        `a forrásfeszültség <b>${U_forras} <span class="blue-percent">V</span></b>`,
        `a fogyasztó feszültsége <b>${U_fogy} <span class="blue-percent">V</span></b>`,
        `az áram <b>${I_mA} <span class="blue-percent">mA</span></b>`
      ];
      parts.sort(() => Math.random() - 0.5);
      display = `Mennyi az előtét ellenállás (<span class="blue-percent">${unit}</span>-ban), ha ${parts.join(", ")}?`;
    } else if (difficulty === "medium") {
      let U_forras = getRandomInt(24, 120);
      let U_fogy = getRandomInt(12, Math.min(U_forras - 10, 100));
      let I_A = Number((0.1 + Math.random() * 1.9).toFixed(3));
      let R_kOhm = Number((((U_forras - U_fogy) / I_A) / 1000).toFixed(precision));
      answer = R_kOhm.toString();
      unit = "kΩ";
      answerType = "decimal";
      let parts = [
        `a forrásfeszültség <b>${U_forras} <span class="blue-percent">V</span></b>`,
        `a fogyasztó feszültsége <b>${U_fogy} <span class="blue-percent">V</span></b>`,
        `az áram <b>${I_A} <span class="blue-percent">A</span></b>`
      ];
      parts.sort(() => Math.random() - 0.5);
      display = `Mennyi az előtét ellenállás (<span class="blue-percent">${unit}</span>-ban), ha ${parts.join(", ")}?`;
    } else {
      function randSci(minV, maxV) {
        const raw = minV + Math.random() * (maxV - minV);
        const abs = Math.abs(raw) || 0.1;
        const exp = Math.floor(Math.log10(abs));
        const mant = Number((abs / Math.pow(10, exp)).toFixed(1));
        return { mant, exp, value: mant * Math.pow(10, exp), str: `${mant} × 10<sup>${exp}</sup>` };
      }
      let Uf = randSci(0.1, 10);
      let Ug = randSci(0.05, Math.max(0.1, Uf.value * 0.8));
      if (Ug.value >= Uf.value) {
        Ug = { mant: 0.5, exp: -1, value: 0.05, str: "0.5 × 10<sup>-1</sup>" };
      }
      let I = randSci(10, 5000);
      // R_MOhm = (Uf_kV - Ug_kV) / I_mA   * (because kV/mA = MΩ)
      let R_MOhm = Number(((Uf.value - Ug.value) / I.value).toFixed(precision));
      if (R_MOhm <= 0) R_MOhm = 0.001;
      answer = R_MOhm.toString();
      unit = "MΩ";
      answerType = "decimal";
      let parts = [
        `a forrásfeszültség <b>${Uf.str} <span class="blue-percent">kV</span></b>`,
        `a fogyasztó feszültsége <b>${Ug.str} <span class="blue-percent">kV</span></b>`,
        `az áram <b>${I.str} <span class="blue-percent">mA</span></b>`
      ];
      parts.sort(() => Math.random() - 0.5);
      display = `Mennyi az előtét ellenállás (<span class="blue-percent">${unit}</span>-ban), ha ${parts.join(", ")}?`;
    }

    // Pontossági útmutató
    if (!display.includes("precision-hint")) {
      if (answerType === "number") {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (${unit})</small>`;
      } else if (difficulty === "medium") {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (${unit})</small>`;
      } else {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 3 tizedesjegy pontossággal (${unit})</small>`;
      }
    }
    return {
      display,
      answer,
      answerType,
      options: generateOptions(Number(answer), answerType, difficulty, unit),
      unit
    };
  }
},
{
  name: "Ellenállások kapcsolása",
  value: "ellenallasok_kapcsolasa",
  generate: (difficulty) => {
    const e12Values = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
    const ranges = {
      easy: { minR: 10, maxR: 1000 },
      medium: { minR: 100, maxR: 10000 },
      hard: { minR: 1000, maxR: 100000 }
    };
    const { minR, maxR } = ranges[difficulty];
    function getE12Resistance(min, max) {
      const maxMultiplier = Math.floor(Math.log10(max / 10));
      const minMultiplier = Math.ceil(Math.log10(min / 82));
      const multiplier = Math.pow(10, getRandomInt(minMultiplier, maxMultiplier));
      const baseValue = e12Values[getRandomInt(0, e12Values.length - 1)];
      let resistance = baseValue * multiplier;
      resistance = Math.max(min, Math.min(max, resistance));
      return Math.round(resistance);
    }
    let display, answer, answerType, unit, resistors = [], displayResistors = [];

    if (difficulty === "easy") {
      const numResistors = getRandomInt(2, 3);
      const units = [];
      for (let i = 0; i < numResistors; i++) {
        let resistance = getE12Resistance(minR, maxR);
        let unit = (i < 2 && Math.random() < 0.5) ? 'kΩ' : 'Ω';
        if (unit === 'kΩ') {
          resistance = resistance / 1000;
          resistance = Math.round(resistance * 100) / 100; // 2 tizedesjegy
        } else {
          resistance = Math.round(resistance); // Egész szám Ω-ban
        }
        resistors.push(resistance);
        units.push(unit);
        displayResistors.push(`<b>R${i + 1} = ${resistance} <span class="blue-percent">${unit}</span></b>`);
      }
      const resistorsInOhms = resistors.map((r, i) => units[i] === 'kΩ' ? r * 1000 : r);
      let R_eredo = resistorsInOhms.reduce((sum, r) => sum + r, 0);
      const formatted = formatNumber(R_eredo, 'Ω', difficulty);
      answer = Math.round(formatted.value).toString(); // Egész szám
      unit = formatted.unit;
      answerType = "number";
      if (numResistors === 3 && units[0] === units[1]) {
        units[2] = units[0] === 'Ω' ? 'kΩ' : 'Ω';
        resistors[2] = units[2] === 'kΩ' ? resistorsInOhms[2] / 1000 : resistorsInOhms[2];
        resistors[2] = Math.round(resistors[2] * 100) / 100;
        displayResistors[2] = `<b>R₃ = ${resistors[2]} <span class="blue-percent">${units[2]}</span></b>`;
      }
      display = `Mennyi az eredő ellenállás (<span class="blue-percent">${unit}</span>-ban), ha az ellenállások sorosan vannak kapcsolva: ${displayResistors.join(numResistors === 3 ? ', ' : ', ')}?`;
    } else if (difficulty === "medium") {
      const numResistors = getRandomInt(2, 3);
      for (let i = 0; i < numResistors; i++) {
        let resistance = getE12Resistance(minR, maxR);
        resistors.push(resistance);
        displayResistors.push(`<b>R${i + 1} = ${resistance} <span class="blue-percent">Ω</span></b>`);
      }
      let R_eredo;
      if (numResistors === 2) {
        R_eredo = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]);
      } else {
        R_eredo = 1 / resistors.reduce((sum, r) => sum + 1 / r, 0);
      }
      R_eredo = Math.round(R_eredo * 100) / 100; // 2 tizedesjegy
      unit = 'kΩ';
      answer = (R_eredo / 1000).toFixed(2); // kΩ-ban, 2 tizedesjegy
      answerType = "decimal";
      display = `Mennyi az eredő ellenállás (<span class="blue-percent">${unit}</span>-ban), ha az ellenállások párhuzamosan vannak kapcsolva: ${displayResistors.join(numResistors === 3 ? ', ' : ', ')}?`;
    } else { // Nehéz szint – a megjelenített sci értékből számolunk
      const type = getRandomInt(0, 6); // 0-6 típusok
      const numResistors = [0, 1, 2].includes(type) ? 3 : type === 3 || type === 5 ? 2 : 3;
      for (let i = 0; i < numResistors; i++) {
        let resistance = getE12Resistance(minR, maxR) / 1000; // kΩ-ban
        resistance = Math.round(resistance * 100) / 100; // 2 tizedesjegy
        const exponent = Math.floor(Math.log10(Math.abs(resistance) || 1));
        const mantissa = Number((resistance / Math.pow(10, exponent)).toFixed(2));
        // FONTOS: a resistors tömbbe a MEGJELENÍTETT értéket tesszük, nem a nyers resistance-t
        const displayedValue = mantissa * Math.pow(10, exponent);
        resistors.push(displayedValue);
        displayResistors.push(`${mantissa} × 10<sup>${exponent}</sup>`);
      }
      let R_eredo;
      if (type === 0) { // R₁ és R₂ párhuzamosan, majd R₃ sorosan
        R_eredo = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]) + resistors[2];
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> párhuzamosan, <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b> pedig sorosan van kötve?`;
      } else if (type === 1) { // R₂ és R₃ párhuzamosan, majd R₁ sorosan
        R_eredo = resistors[0] + (resistors[1] * resistors[2]) / (resistors[1] + resistors[2]);
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b> párhuzamosan, <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> pedig sorosan van kötve?`;
      } else if (type === 2) { // R₁ és R₂ sorosan, majd R₃ párhuzamosan
        const R_series = resistors[0] + resistors[1];
        R_eredo = (R_series * resistors[2]) / (R_series + resistors[2]);
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> sorosan, <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b> pedig párhuzamosan van kötve?`;
      } else if (type === 3) { // 2 ellenállás sorosan (könnyű szintről)
        R_eredo = resistors[0] + resistors[1];
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> sorosan van kötve?`;
      } else if (type === 4) { // 3 ellenállás sorosan (könnyű szintről)
        R_eredo = resistors[0] + resistors[1] + resistors[2];
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b>, <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b> sorosan van kötve?`;
      } else if (type === 5) { // 2 ellenállás párhuzamosan (közepes szintről)
        R_eredo = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]);
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> párhuzamosan van kötve?`;
      } else { // type === 6: 3 ellenállás párhuzamosan (közepes szintről)
        R_eredo = 1 / (1 / resistors[0] + 1 / resistors[1] + 1 / resistors[2]);
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b>, <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b> párhuzamosan van kötve?`;
      }
      R_eredo = Math.round(R_eredo * 100) / 100; // 2 tizedesjegy
      unit = 'MΩ';
      answer = (R_eredo / 1000).toFixed(2); // MΩ-ban, 2 tizedesjegy
      answerType = "decimal";
    }

    // Pontossági útmutató
    if (!display.includes("precision-hint")) {
      if (answerType === "number") {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám (${unit})</small>`;
      } else {
        display += `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: 2 tizedesjegy pontossággal (${unit})</small>`;
      }
    }
    return {
      display,
      answer,
      answerType,
      options: generateOptions(Number(answer), answerType, difficulty, unit),
      resistors,
      unit
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
let best = { score: 0, time: null, wrongAnswers: Infinity };
let gameActive = false;
let answerState = { value: "" }; // Válasz állapota a numpadhoz
let wrongAnswers = 0; // Helytelen válaszok száma

let lastDirection = null; // Az utolsó kérdéstípus tárolása (0 vagy 1)
let lastExponent = null; // Az utolsó kitevő tárolása

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

// --- LEGJOBB EREDMÉNY MENTÉSE/BETÖLTÉSE (JAVÍTOTT) ---
function loadBest() {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  try {
    const bestRaw = localStorage.getItem("vilma-best-" + cat + "-" + diff);
    if (bestRaw) {
      best = JSON.parse(bestRaw);
      // Régi adatok konvertálása, ha nincs benne wrongAnswers
      if (best.wrongAnswers === undefined) best.wrongAnswers = Infinity;
    } else {
      best = { score: 0, time: null, wrongAnswers: Infinity };
    }
  } catch {
    best = { score: 0, time: null, wrongAnswers: Infinity };
  }
  showBest();
}

function saveBest(newScore, time) {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  
  // Jelenlegi legjobb betöltése összehasonlításhoz
  let currentBest;
  try {
    const raw = localStorage.getItem("vilma-best-" + cat + "-" + diff);
    currentBest = raw ? JSON.parse(raw) : { score: 0, time: null, wrongAnswers: Infinity };
    if (currentBest.wrongAnswers === undefined) currentBest.wrongAnswers = Infinity; 
  } catch {
    currentBest = { score: 0, time: null, wrongAnswers: Infinity };
  }
  
  const newWrongAnswers = wrongAnswers !== undefined ? wrongAnswers : 0;
  
  // Logika: Ha kevesebb a hiba, az mindig jobb. Ha a hiba egyenlő, akkor a gyorsabb idő a jobb.
  const isBetterAnswers = newWrongAnswers < currentBest.wrongAnswers;
  const isSameAnswersBetterTime = (newWrongAnswers === currentBest.wrongAnswers) && 
                                  (currentBest.time === null || time < currentBest.time);

  if (isBetterAnswers || isSameAnswersBetterTime) {
    best = { score: newScore, time: time, wrongAnswers: newWrongAnswers };
    localStorage.setItem("vilma-best-" + cat + "-" + diff, JSON.stringify(best));
    console.log("Új rekord mentve!", best);
  }
  
  // Képernyő frissítése mindenképp
  showBest();
}


function showBest() {
  // 1. Legjobb eredmény HTML összeállítása
  let bestHtml = "";
  if (best.time !== null && best.wrongAnswers !== Infinity) {
    bestHtml = `
      <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">
        🏆 <b>Rekord:</b> ${best.time} mp 
        <span style="font-size: 0.9em; color: ${best.wrongAnswers === 0 ? '#2ecc71' : '#e74c3c'}">
          (${best.wrongAnswers} hiba)
        </span>
      </div>`;
  } else {
    bestHtml = `<div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">🏆 Még nincs rekord</div>`;
  }

  // 2. Átlagok hozzáadása (U3,U6,U9)
  let averagesHTML = "";
  try {
    averagesHTML = getAveragesHTML();
  } catch (e) {
    console.warn("Hiba az átlagok megjelenítésekor:", e);
    averagesHTML = "";
  }

  // 3. Ikon gombok a jobb oldalon (egyszerű, nincs magyarázó szöveg)
  const controlsHtml = `
    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:6px; align-items:center;">
      <button id="clear-best-btn" aria-label="Rekord törlése" title="Rekord törlése" style="background:none;border:0;padding:4px;cursor:pointer;font-size:1.2em;line-height:1;">
        <span style="display:inline-block; transform:translateY(-1px); text-decoration:line-through;">🏆</span>
      </button>
      <button id="clear-history-btn" aria-label="U3/U6/U9 törlése" title="U3/U6/U9 törlése" style="background:none;border:0;padding:4px;cursor:pointer;font-weight:600;font-size:0.95em;line-height:1;">
        <span style="display:inline-block; text-decoration:line-through;">U3</span>
      </button>
    </div>
  `;

  bestStats.innerHTML = bestHtml + averagesHTML + controlsHtml;
  bestStats.style.display = "";

  // 4. Eseménykezelők csatolása
  const clearBestBtn = document.getElementById("clear-best-btn");
  if (clearBestBtn) {
    clearBestBtn.onclick = () => {
      clearBestForCurrent();
    };
  }
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = () => {
      clearHistoryForCurrent();
    };
  }
}

// --- Törli a jelenlegi kategória+nehézség rekordját (vilma-best-...) ---
function clearBestForCurrent() {
  const cat = categorySelect.value;
  const diff = difficultySelect.value;
  const key = "vilma-best-" + cat + "-" + diff;

  if (!localStorage.getItem(key)) {
    alert("Nincs mentett rekord ezen a kategórián és nehézségen.");
    return;
  }

  const ok = confirm(`Biztosan törlöd a rekordot a kategória: "${categoryLabel()}", nehézség: "${difficultyLabel()}" esetén?`);
  if (!ok) return;

  try {
    localStorage.removeItem(key);
    best = { score: 0, time: null, wrongAnswers: Infinity };
    showBest();
    // rövid visszajelzés (nem szükséges, de hasznos)
    // alert("A rekord törölve.");
  } catch (e) {
    console.error("clearBestForCurrent hiba:", e);
    alert("Hiba történt a rekord törlése közben. Nézd meg a konzolt.");
  }
}

// --- Törli a jelenlegi kategória+nehézség history-ját (vilma-history-...), ezzel U3/U6/U9 visszaáll ---
function clearHistoryForCurrent() {
  const cat = categorySelect.value;
  const diff = difficultySelect.value;
  const key = getHistoryKey(cat, diff);

  if (!localStorage.getItem(key)) {
    alert("Nincs mentett history ezen a kategórián és nehézségben.");
    return;
  }

  const ok = confirm(`Biztosan törlöd az összes history bejegyzést (U3/U6/U9 adatok) a kategóriához: "${categoryLabel()}", nehézséghez: "${difficultyLabel()}"?`);
  if (!ok) return;

  try {
    localStorage.removeItem(key);
    showBest();
    // alert("A history törölve.");
  } catch (e) {
    console.error("clearHistoryForCurrent hiba:", e);
    alert("Hiba történt a history törlése közben. Nézd meg a konzolt.");
  }
}
// --- STATISZTIKA ÉS ÁTLAG SZÁMÍTÁS (JAVÍTOTT) ---

function getHistoryKey(cat, diff) {
  return `vilma-history-${cat}-${diff}`;
}

function saveToHistory(scoreValue, timeSeconds, wrong) {
  try {
    const cat = categorySelect.value;
    const diff = difficultySelect.value;
    const key = getHistoryKey(cat, diff);
    const raw = localStorage.getItem(key);
    let hist = raw ? JSON.parse(raw) : [];
    
    // Új elem elejére
    hist.unshift({
      score: Number(scoreValue),
      time: Number(timeSeconds),
      wrong: Number(wrong || 0),
      ts: Date.now()
    });
    
    // Limit: csak az utolsó 50 játékot őrizzük meg
    if (hist.length > 50) hist = hist.slice(0, 50);
    localStorage.setItem(key, JSON.stringify(hist));
  } catch (err) {
    console.warn("saveToHistory hiba:", err);
  }
}

function loadHistory(cat, diff, maxItems = 50) {
  try {
    const key = getHistoryKey(cat, diff);
    const raw = localStorage.getItem(key);
    const hist = raw ? JSON.parse(raw) : [];
    return hist.slice(0, maxItems);
  } catch (err) {
    console.warn("loadHistory hiba:", err);
    return [];
  }
}

// Átlagos idő ÉS átlagos hiba számítása egyszerre
function computeAvgStats(hist, n) {
  if (!Array.isArray(hist) || hist.length < n) return null;
  
  const slice = hist.slice(0, n);
  
  const totalTime = slice.reduce((acc, item) => acc + (Number(item.time) || 0), 0);
  const totalWrong = slice.reduce((acc, item) => acc + (Number(item.wrong) || 0), 0);
  
  return {
    avgTime: Math.round(totalTime / slice.length), // Kerekített másodperc
    avgWrong: (totalWrong / slice.length).toFixed(1) // Tizedes pontosságú hibaátlag (pl. 1.3)
  };
}

function getAveragesHTML() {
  const cat = categorySelect.value;
  const diff = difficultySelect.value;
  const hist = loadHistory(cat, diff, 50);
  
  // CSAK AZ U3-at számoljuk (U6, U9 kivéve)
  const u3 = computeAvgStats(hist, 3);
  
  // Formázó segédfüggvény: Idő + (Hiba)
  const fmt = (stats) => {
    if (!stats) return '<span style="opacity:0.6; font-size:0.9em;">-</span>';
    
    // Színkódolás a hibaátlaghoz: Ha 0, akkor zöld, ha > 2, akkor pirosas
    const color = stats.avgWrong == 0 ? "#27ae60" : (stats.avgWrong > 2 ? "#c0392b" : "#7f8c8d");
    
    return `<b>${stats.avgTime} mp</b> <span style="font-size:0.85em; color:${color};">(${stats.avgWrong} hiba)</span>`;
  };

  // CSAK AZ U3-at jelenítjük meg
  return `<div style="margin-top:4px; font-size:0.95em; line-height:1.4;">
    <div style="display:flex; justify-content:space-between;"><span>U3 (utolsó 3):</span> ${fmt(u3)}</div>
  </div>`;
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

// --- IDŐZÍTŐ ---
function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed}`;
}

// --- ZÁRÓJELES KIFEJEZÉSEK GENERÁLÁSA ---
function generateBracketedExpression(opCount, min, max) {
  const opList = ["+", "-", "•", ":"];
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
        if (op === ":") {
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
      } else if (["+", "-", "•", ":"].includes(exprParts[i])) {
        displayExpr += " " + exprParts[i] + " ";
      } else {
        displayExpr += exprParts[i];
      }
    }
    displayExpr = displayExpr.trim();
    let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/•/g, '*').replace(/:/g, '/').replace(/\s/g, '');
    evalExpr = evalExpr.replace(/--/g, '+').replace(/\+-/g, '-');
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
    display: displayExpr + " =<br><small style=\"display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;\">Válasz: egész szám</small>",
    answer: Math.round(answer).toString(),
    answerType: "number"
  };
}

// --- FELADATSOR GENERÁLÁSA ---
// --- Pontossági útmutató hozzáadása a feladat szövegéhez, ha még nincs
function ensurePrecisionHint(task, difficulty) {
  if (!task || !task.display) return task;
  
  // NE duplázzuk, ha már van útmutató (saját hint vagy a kerekítés szövege)
  if (task.display.includes("precision-hint") ||
      task.display.includes("<small") ||  // ← FONTOS: ellenőrizzük az összes <small> taget
      task.display.includes("tizedesjegy") ||
      task.display.includes("egészre") ||
      task.display.includes("egész szám") ||  // ← ADD HÁ
      task.display.includes("Válasz formátum")) return task;
  
  const at = task.answerType || "number";
  let hint = "";
  if (at === "fraction") {
    hint = `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egyszerűsített tört (pl. 3/4)</small>`;
  } else if (at === "set") {
    // already has format instruction
    hint = "";
  } else if (at === "number") {
    hint = `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`;
  } else if (at === "decimal") {
    // Use decimalPlaces if available, otherwise infer from difficulty / answer string
    let dp = task.decimalPlaces;
    if (dp === undefined || dp === null) {
      const ans = String(task.answer || "");
      if (ans.includes(".") || ans.includes(",")) {
        const parts = ans.replace(",", ".").split(".");
        dp = parts[1] ? parts[1].length : 2;
      } else {
        dp = difficulty === "hard" ? 3 : 2;
      }
    }
    if (dp === 0) {
      hint = `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: egész szám</small>`;
    } else {
      hint = `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: ${dp} tizedesjegy pontossággal</small>`;
    }
  } else if (at === "power") {
    hint = `<br><small style="display:block;margin-top:6px;font-size:0.85em;opacity:0.85;color:#3498db;">Válasz: normál alak (pl. 3,5×10^3)</small>`;
  }
  if (hint) task.display += hint;
  return task;
}


function generateQuestions() {
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  questions = [];
  const taskType = taskTypes.find(t => t.value === category);
  if (!taskType) {
    questions.push({ display: "Hiba: kategória nincs implementálva", answer: null, answerType: "number" });
    return;
  }

  window.isGeneratingQuestions = true;

  if (category === "mertekegyseg_atvaltas") {
    questions = taskType.generate(difficulty);
    questions.forEach(task => {
      if (!task.answer || task.answer === "?") {
        task.display = "Hiba: érvénytelen feladat generálódott";
        task.answer = null;
      }
      if (!['number', 'decimal', 'fraction', 'power', 'set'].includes(task.answerType)) {
        console.warn(`Ismeretlen answerType: ${task.answerType}`);
        task.answerType = 'number';
      }
      ensurePrecisionHint(task, difficulty);
    });
  } else {
    for (let i = 0; i < QUESTIONS; i++) {
      const task = taskType.generate(difficulty);
      if (!task.answer || task.answer === "?") {
        task.display = "Hiba: érvénytelen feladat generálódott";
        task.answer = null;
      }
      if (!['number', 'decimal', 'fraction', 'power', 'set'].includes(task.answerType)) {
        console.warn(`Ismeretlen answerType: ${task.answerType}`);
        task.answerType = 'number';
      }
      ensurePrecisionHint(task, difficulty);
      questions.push(task);
    }
  }

  window.isGeneratingQuestions = false;
  console.log("Generált kérdések:", questions);
}


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

// Számok (JAVÍTOTT)
if (answerType === 'number' || answerType === 'decimal') {
  const userNum = Number(normalizedInput.replace(',', '.'));
  const correctNum = Number(normalizedCorrect.replace(',', '.'));
  if (isNaN(userNum) || isNaN(correctNum)) return false;
  
  // Tolerancia a decimalPlaces alapján
  let tol = 1e-9; // Nagyon szigorú alapérték
  
  if (answerType === 'decimal') {
    // Határozd meg az elvárt tizedesjegyek számát
    let expectedDP = 2; // Alapértelmezett
    
    if (taskData && taskData.decimalPlaces !== undefined && taskData.decimalPlaces !== null) {
      expectedDP = Number(taskData.decimalPlaces);
    } else {
      // Fallback: számold ki a correctAnswer reprezentációjából
      const parts = ('' + normalizedCorrect).replace(',', '.').split('.');
      expectedDP = parts[1] ? parts[1].length : 2;
    }
    
    // A tolerancia az utolsó számjegynél 0.5-szerese legyen
    // pl. 2 tizedesjegy → 0.5 * 10^-2 = 0.005
    tol = 0.5 * Math.pow(10, -expectedDP);
  }
  
  return Math.abs(userNum - correctNum) <= tol;
}
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
function showQuestion(index) {
  quizContainer.innerHTML = "";
  if (index >= QUESTIONS) { finishGame(); return; }

  const q = questions[index];
  const div = document.createElement("div");
  div.className = "question-container";
  div.innerHTML = `
    <div class="progress-bar">
      <div class="progress"></div>
      <div class="progress-wrong"></div>
    </div>
    <div class="question-text">${q.display}</div>`;
  
  let answerStateLocal = { value: "" };
  const answerView = document.createElement("div");
  answerView.className = "answer-view";
  div.appendChild(answerView);

  const numpad = renderNumpad(answerStateLocal, function (val) {
    answerView.textContent = val;
  });

  numpadContainer.innerHTML = "";
  numpadContainer.appendChild(numpad);
  numpadContainer.classList.add("active");
  quizContainer.appendChild(div);

  const progress = div.querySelector('.progress');
  const progressWrong = div.querySelector('.progress-wrong');
  if (progress && progressWrong) {
    progress.style.width = `${(score / QUESTIONS) * 100}%`;
    progressWrong.style.width = `${(wrongAnswers / QUESTIONS) * 100}%`;
    progressWrong.style.left = `${(score / QUESTIONS) * 100}%`;
  }
  div.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startGame() {
  window.numpadState = { lightningActivated: false, lightningCurrentSymbol: '/', lightningCount: 0 };
  gameActive = true;
  score = 0;
  currentQuestion = 0;
  wrongAnswers = 0;
  generateQuestions();
  showQuestion(0);
  startTime = Date.now();
  updateTimer();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  categorySelect.disabled = true;
  difficultySelect.disabled = true;
  
  // Restart gombot NEM kezeljük (kivettük)
  startBtn.style.display = "none";
  bestStats.style.opacity = "0.55";
}

function finishGame() {
  gameActive = false;
  clearInterval(timerInterval);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed} (Vége)`;

  saveToHistory(score, elapsed, wrongAnswers);
  saveBest(score, elapsed);

  quizContainer.innerHTML = `<p style="font-size:1.2em;"><b>Gratulálok!</b> ${elapsed} másodperc alatt végeztél.<br>Helytelen válaszok száma: ${wrongAnswers}</p>`;
  numpadContainer.innerHTML = "";
  numpadContainer.classList.remove("active");

  loadBest();

  // Restart gombot NEM kezeljük (kivettük)
  startBtn.style.display = ""; // Csak a start gomb jelenik meg újra
  bestStats.style.opacity = "1";
  categorySelect.disabled = false;
  difficultySelect.disabled = false;
}

// CSAK a start gomb eseménykezelője maradt
startBtn.onclick = startGame;

// --- INDÍTÁS ---
loadCategories();
loadLastSelection();
loadBest();
