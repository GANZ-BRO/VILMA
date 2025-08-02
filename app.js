
// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 5; // Feladatok száma egy játékban
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
function formatNumber(value, unit, difficulty) {
  let formattedValue = value;
  let formattedUnit = unit;
  if (unit === 'Ω' && value >= 1000) {
    formattedValue = value / 1000;
    formattedUnit = 'kΩ';
  } else if (unit === 'W' && value >= 1000) {
    formattedValue = value / 1000;
    formattedUnit = 'kW';
  }
  if (Math.abs(formattedValue - Math.round(formattedValue)) < 0.0001) {
    formattedValue = Math.round(formattedValue);
  } else {
    formattedValue = Number(formattedValue.toFixed(2));
  }
  return { value: formattedValue, unit: formattedUnit };
}

// Válaszlehetőségek generálása
function generateOptions(correctAnswer, answerType, difficulty, unit) {
  const options = [correctAnswer];
  const numOptions = 4;
  const rangeFactor = difficulty === 'easy' ? 0.2 : 0.5;
  let correctNum = parseFloat(correctAnswer);
  let minVal = correctNum * (1 - rangeFactor);
  let maxVal = correctNum * (1 + rangeFactor);
  while (options.length < numOptions) {
    let option;
    if (answerType === 'number' || answerType === 'decimal') {
      option = getRandomInt(minVal, maxVal);
      if (answerType === 'decimal') {
        option = (option * (Math.random() < 0.5 ? 0.5 : 1)).toFixed(2);
      }
    }
    if (!options.includes(option) && option !== correctNum && option !== 0) {
      options.push(option);
    }
  }
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options.map(opt => ({ value: opt, unit }));
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
          display: `<b>${num1}</b> + <b>${num2}</b> + <b>${num3}</b>`,
          answer: (num1 + num2 + num3).toString(),
          answerType: "number"
        };
      }
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(min, max);
        return {
          display: `<b>${num1}</b> - <b>${num2}</b> - <b>${num3}</b>`,
          answer: (num1 - num2 - num3).toString(),
          answerType: "number"
        };
      }
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(Math.floor(min / 2), Math.floor(max / 2));
        return {
          display: `<b>${num1}</b> × <b>${num2}</b> × <b>${num3}</b>`,
          answer: (num1 * num2 * num3).toString(),
          answerType: "number"
        };
      }
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
      if (difficulty === "hard") {
        let num3 = getRandomInt(minDivisor, maxDivisor);
        let num1 = answer * num2 * num3;
        return {
          display: `<b>${num1}</b> ÷ <b>${num2}</b> ÷ <b>${num3}</b>`,
          answer: (num1 / num2 / num3).toString(),
          answerType: "number"
        };
      }
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
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5; // Műveletek száma
      const opList = ["+", "-", "×", "÷"];
      let nums = []; // Számok tömbje
      let ops = []; // Operátorok tömbje
      let lastVal = getRandomInt(min, max); // Kezdőérték
      nums.push(lastVal);
      let minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5; // Osztó minimum
      let maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 100; // Osztó maximum
      let tryCount = 0; // Próbálkozások számlálója
      let displayExpr, answer;
      // Addig próbálkozunk, amíg érvényes, egész számú válasz nem születik
      while (tryCount < 1000) {
        nums = [getRandomInt(min, max)];
        ops = [];
        lastVal = nums[0];
        for (let j = 0; j < opCount; j++) {
          let op = opList[getRandomInt(0, 3)];
          if (op === "÷") {
            let divisor = getRandomInt(minDivisor, maxDivisor);
            lastVal = lastVal * divisor; // Egész számú osztás biztosítása
            nums[j] = lastVal;
            nums[j + 1] = divisor;
          } else {
            nums[j + 1] = getRandomInt(min, max);
          }
          ops[j] = op;
          lastVal = nums[j + 1];
        }
        // Kifejezés összeállítása
        displayExpr = "" + nums[0];
        for (let j = 0; j < opCount; j++) {
          displayExpr += " " + ops[j] + " " + nums[j + 1];
        }
        let evalExpr = displayExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
        try {
          answer = eval(evalExpr);
          answer = Math.round(answer); // Kerekítés egész számra
          // Ellenőrizzük, hogy az eredmény érvényes és egész szám
          if (typeof answer === "number" && isFinite(answer) && !isNaN(answer) && answer === Math.round(answer)) {
            break;
          }
        } catch {
          answer = "?"; // Hiba esetén
        }
        tryCount++;
      }
      // Ha 1000 próbálkozás után sem sikerül, egyszerű összeadás generálása
      if (tryCount >= 1000) {
        nums = [getRandomInt(min, max), getRandomInt(min, max)];
        ops = ["+"];
        displayExpr = `${nums[0]} + ${nums[1]}`;
        answer = nums[0] + nums[1];
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
      let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 8;
      return generateBracketedExpression(opCount, min, max);
    }
  },
  /*
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
        display: `<b>${base}<sup>${exponent}</sup></b> = <b>${multiplication}</b>`,
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
      display: `<b>${base}<sup>${exponent}</sup></b>`,
      answer: answer.toString(),
      answerType: "number"
    };
  }
},
*/
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
          display: `${a}/${b} + ${c}/${d} + ${e}/${f}`,
          answer: `${num}/${denom}`,
          answerType: "fraction"
        };
      }
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
    return {
      display: `Mennyi ${base}${rag} ${nevelo} <span class="blue-percent">${percent}%</span>-a ?`,
      answer: result.toString(),
      answerType: "number"
    };
  }
},

{
  name: "Normál alakos számok",
  value: "normal_alak",
  generate: (difficulty) => {
    const ranges = {
      easy: { minValue: 1, maxValue: 9999, maxDecimals: 0, minExp: 0, maxExp: 5 },
      medium: { minValue: 0.1, maxValue: 999999, maxDecimals: 1, minExp: -1, maxExp: 10 },
      hard: { minValue: 0.00001, maxValue: 999999999, maxDecimals: 3, minExp: -5, maxExp: 15 }
    };
    const { minValue, maxValue, maxDecimals, minExp, maxExp } = ranges[difficulty];
    const taskType = Math.random() < 0.5 ? 'writeAsPower' : 'convertToNumber';
    let number, coefficient, exponent, display, answer;

    if (taskType === 'writeAsPower') {
      number = (Math.random() * (maxValue - minValue) + minValue).toFixed(maxDecimals);
      number = parseFloat(number);
      let logValue = Math.log10(Math.abs(number));
      exponent = Math.floor(logValue);
      exponent = Math.max(minExp, Math.min(maxExp, exponent));
      coefficient = number / Math.pow(10, exponent);
      coefficient = Number(coefficient.toFixed(maxDecimals));
      while (coefficient >= 10 || coefficient < 1) {
        exponent += (coefficient >= 10) ? 1 : -1;
        coefficient = number / Math.pow(10, exponent);
        coefficient = Number(coefficient.toFixed(maxDecimals));
      }
      display = `<b>${number}</b> normál alakban (pl. a × 10^b formában, ahol 1 ≤ |a| < 10) = ?`;
      answer = `${coefficient}×10^${exponent}`; // Pl. "3.5×10^3"
    } else {
      coefficient = Number((Math.random() * 9 + 1).toFixed(maxDecimals));
      exponent = getRandomInt(minExp, maxExp);
      number = coefficient * Math.pow(10, exponent);
      display = `<b>${coefficient} × 10^${exponent}</b> mennyi az értéke? = ?`;
      answer = number.toString(); // Pl. "3500"
    }

    return {
      display: display,
      answer: answer,
      answerType: taskType === 'writeAsPower' ? "power" : "number"
    };
  }
},


{
  name: "Villamos mértékegységek",
  value: "villamos_mertekegysegek",
  generate: (difficulty) => {
    // Villamos mennyiségek és adataik (név, jelölés, mértékegység név, mértékegység jele)
    const quantities = {
      easy: [
        { name: "Áramerősség", symbol: "I", unitName: "amper", unitSymbol: "A" },
        { name: "Feszültség", symbol: "U", unitName: "volt", unitSymbol: "V" },
        { name: "Ellenállás", symbol: "R", unitName: "ohm", unitSymbol: "Ω" },
        { name: "Elektromos töltés", symbol: "Q", unitName: "coulomb", unitSymbol: "C" }
      ],
      medium: [
        { name: "Áramerősség", symbol: "I", unitName: "amper", unitSymbol: "A" },
        { name: "Feszültség", symbol: "U", unitName: "volt", unitSymbol: "V" },
        { name: "Ellenállás", symbol: "R", unitName: "ohm", unitSymbol: "Ω" },
        { name: "Teljesítmény", symbol: "P", unitName: "watt", unitSymbol: "W" },
        { name: "Frekvencia", symbol: "f", unitName: "hertz", unitSymbol: "Hz" },
        { name: "Energia", symbol: "E", unitName: "joule", unitSymbol: "J" },
        { name: "Elektromos töltés", symbol: "Q", unitName: "coulomb", unitSymbol: "C" }
      ],
      hard: [
        { name: "Áramerősség", symbol: "I", unitName: "amper", unitSymbol: "A" },
        { name: "Feszültség", symbol: "U", unitName: "volt", unitSymbol: "V" },
        { name: "Ellenállás", symbol: "R", unitName: "ohm", unitSymbol: "Ω" },
        { name: "Teljesítmény", symbol: "P", unitName: "watt", unitSymbol: "W" },
        { name: "Frekvencia", symbol: "f", unitName: "hertz", unitSymbol: "Hz" },
        { name: "Kapacitás", symbol: "C", unitName: "farad", unitSymbol: "F" },
        { name: "Induktivitás", symbol: "L", unitName: "henry", unitSymbol: "H" },
        { name: "Mágneses fluxus", symbol: "Φ", unitName: "weber", unitSymbol: "Wb" },
        { name: "Mágneses fluxussűrűség", symbol: "B", unitName: "tesla", unitSymbol: "T" },
        { name: "Fázisszög", symbol: "θ", unitName: "radian", unitSymbol: "rad" }
      ]
    };

    // Véletlenszerűen kiválasztott mennyiség a nehézségi szint alapján
    const selectedQuantities = quantities[difficulty];
    const quantity = selectedQuantities[getRandomInt(0, selectedQuantities.length - 1)];
    const taskType = getRandomInt(0, 3); // 0: Név, 1: Jelölés, 2: Mértékegység név, 3: Mértékegység jele

    // Válaszlehetőségek generálása a taskType alapján
    let options = [];
    let correctAnswer;
    const wrongOptions = {
      names: ["Áramerősség", "Feszültség", "Ellenállás", "Elektromos töltés", "Teljesítmény", "Frekvencia", "Energia", "Kapacitás", "Induktivitás", "Mágneses fluxus", "Mágneses fluxussűrűség", "Fázisszög"],
      symbols: ["I", "U", "R", "Q", "P", "f", "E", "C", "L", "Φ", "B", "θ"],
      unitNames: ["amper", "volt", "ohm", "coulomb", "watt", "hertz", "joule", "farad", "henry", "weber", "tesla", "radian"],
      unitSymbols: ["A", "V", "Ω", "C", "W", "Hz", "J", "F", "H", "Wb", "T", "rad"]
    };

    if (taskType === 0) { // Név
      options = [quantity.name];
      const wrongNames = wrongOptions.names.filter(name => name !== quantity.name && selectedQuantities.some(q => q.name === name));
      while (options.length < 3) {
        const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
        if (!options.includes(wrongName)) {
          options.push(wrongName);
        }
      }
      correctAnswer = (options.indexOf(quantity.name) + 1).toString();
      options = shuffleArray(options); // Véletlenszerű sorrend
      return {
        display: `Mi a neve (<span class="blue-percent">${quantity.name}</span>)?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else if (taskType === 1) { // Jelölés
      options = [quantity.symbol];
      const wrongSymbols = wrongOptions.symbols.filter(symbol => symbol !== quantity.symbol && selectedQuantities.some(q => q.symbol === symbol));
      while (options.length < 3) {
        const wrongSymbol = wrongSymbols[getRandomInt(0, wrongSymbols.length - 1)];
        if (!options.includes(wrongSymbol)) {
          options.push(wrongSymbol);
        }
      }
      correctAnswer = (options.indexOf(quantity.symbol) + 1).toString();
      options = shuffleArray(options); // Véletlenszerű sorrend
      return {
        display: `Mi a jele (<span class="blue-percent">${quantity.name}</span>)?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else if (taskType === 2) { // Mértékegység név
      options = [quantity.unitName];
      const wrongUnitNames = wrongOptions.unitNames.filter(unitName => unitName !== quantity.unitName && selectedQuantities.some(q => q.unitName === unitName));
      while (options.length < 3) {
        const wrongUnitName = wrongUnitNames[getRandomInt(0, wrongUnitNames.length - 1)];
        if (!options.includes(wrongUnitName)) {
          options.push(wrongUnitName);
        }
      }
      correctAnswer = (options.indexOf(quantity.unitName) + 1).toString();
      options = shuffleArray(options); // Véletlenszerű sorrend
      return {
        display: `Mi a ${quantity.name.toLowerCase()} mértékegysége?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else { // Mértékegység jele
      options = [quantity.unitSymbol];
      const wrongUnitSymbols = wrongOptions.unitSymbols.filter(unitSymbol => unitSymbol !== quantity.unitSymbol && selectedQuantities.some(q => q.unitSymbol === unitSymbol));
      while (options.length < 3) {
        const wrongUnitSymbol = wrongUnitSymbols[getRandomInt(0, wrongUnitSymbols.length - 1)];
        if (!options.includes(wrongUnitSymbol)) {
          options.push(wrongUnitSymbol);
        }
      }
      correctAnswer = (options.indexOf(quantity.unitSymbol) + 1).toString();
      options = shuffleArray(options); // Véletlenszerű sorrend
      return {
        display: `Mi a ${quantity.name.toLowerCase()} mértékegységének jele?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    }
  }
},
{
  name: "Mértékegység átváltás",
  value: "mertekegyseg_atvaltas",
  generate: (difficulty) => {
    const ranges = {
      easy: { 
        mAMin: 100, mAMax: 1000, 
        ohmMin: 100, ohmMax: 1000, 
        kOhmMin: 1, kOhmMax: 10, 
        ampMin: 1, ampMax: 10, 
        mVMin: 100, mVMax: 1000, 
        vMin: 1, vMax: 100, 
        wMin: 100, wMax: 1000, 
        kWMin: 1, kWMax: 10 
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
        kHzMin: 1, kHzMax: 1000, 
        mHzMin: 1, mHzMax: 50 
      }
    };
    const { mAMin, mAMax, ohmMin, ohmMax, kOhmMin, kOhmMax, mOhmMin, mOhmMax, ampMin, ampMax, microAMin, microAMax, mVMin, mVMax, vMin, vMax, kVMin, kVMax, microVMin, microVMax, mWMin, mWMax, wMin, wMax, kWMin, kWMax, pFMin, pFMax, nFMin, nFMax, microFMin, microFMax, hzMin, hzMax, kHzMin, kHzMax, mHzMin, mHzMax } = ranges[difficulty];

    const types = {
      easy: [
        () => {
          let mA = getRandomInt(mAMin, mAMax);
          let answer = mA / 1000;
          const formatted = formatNumber(answer, 'A', difficulty);
          return {
            display: `<b>${mA} mA</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(), // Pontos érték, pl. 0.236
            answerType: "decimal" // Tizedes, mert átváltás történhet
          };
        },
        () => {
          let ohm = getRandomInt(ohmMin, ohmMax);
          let answer = ohm / 1000;
          const formatted = formatNumber(answer, 'kΩ', difficulty);
          return {
            display: `<b>${ohm} Ω</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(), // Pontos érték
            answerType: "decimal"
          };
        },
        () => {
          let kOhm = getRandomInt(kOhmMin, kOhmMax);
          let answer = kOhm * 1000;
          return {
            display: `<b>${kOhm} kΩ</b> = ? <span class="blue-percent">Ω</span>`,
            answer: answer.toString(),
            answerType: "number" // Egész szám, mert szorzás
          };
        },
        () => {
          let amp = getRandomInt(ampMin, ampMax);
          let answer = amp * 1000;
          return {
            display: `<b>${amp} A</b> = ? <span class="blue-percent">mA</span>`,
            answer: answer.toString(),
            answerType: "number" // Egész szám
          };
        },
        () => {
          let mV = getRandomInt(mVMin, mVMax);
          let answer = mV / 1000;
          const formatted = formatNumber(answer, 'V', difficulty);
          return {
            display: `<b>${mV} mV</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(), // Pontos érték
            answerType: "decimal"
          };
        },
        () => {
          let v = getRandomInt(vMin, vMax);
          let answer = v * 1000;
          return {
            display: `<b>${v} V</b> = ? <span class="blue-percent">mV</span>`,
            answer: answer.toString(),
            answerType: "number" // Egész szám
          };
        },
        () => {
          let w = getRandomInt(wMin, wMax);
          let answer = w / 1000; // kW-ra váltás
          const formatted = formatNumber(answer, 'kW', difficulty);
          return {
            display: `<b>${w} W</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(), // Pontos érték, pl. 0.236
            answerType: "decimal" // Tizedes, mert kW átváltás tizedes törtet ad
          };
        },
        () => {
          let kW = getRandomInt(kWMin, kWMax);
          let answer = kW * 1000;
          return {
            display: `<b>${kW} kW</b> = ? <span class="blue-percent">W</span>`,
            answer: answer.toString(),
            answerType: "number" // Egész szám
          };
        }
      ],
      medium: [
        () => {
          let v = getRandomInt(vMin, vMax);
          let answer = v / 1000;
          const formatted = formatNumber(answer, 'kV', difficulty);
          return {
            display: `<b>${v} V</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let kV = getRandomInt(kVMin, kVMax);
          let answer = kV * 1000;
          return {
            display: `<b>${kV} kV</b> = ? <span class="blue-percent">V</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        },
        () => {
          let microA = getRandomInt(microAMin, microAMax);
          let answer = microA / 1000;
          const formatted = formatNumber(answer, 'mA', difficulty);
          return {
            display: `<b>${microA} µA</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let kOhm = getRandomInt(kOhmMin, kOhmMax);
          let answer = kOhm / 1000;
          const formatted = formatNumber(answer, 'MΩ', difficulty);
          return {
            display: `<b>${kOhm} kΩ</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let mOhm = getRandomInt(mOhmMin, mOhmMax);
          let answer = mOhm * 1000;
          return {
            display: `<b>${mOhm} MΩ</b> = ? <span class="blue-percent">kΩ</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        },
        () => {
          let mW = getRandomInt(mWMin, mWMax);
          let answer = mW / 1000;
          const formatted = formatNumber(answer, 'W', difficulty);
          return {
            display: `<b>${mW} mW</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let w = getRandomInt(wMin, wMax);
          let answer = w * 1000;
          return {
            display: `<b>${w} W</b> = ? <span class="blue-percent">mW</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        },
        () => {
          let hz = getRandomInt(hzMin, hzMax);
          let answer = hz / 1000;
          const formatted = formatNumber(answer, 'kHz', difficulty);
          return {
            display: `<b>${hz} Hz</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let kHz = getRandomInt(kHzMin, kHzMax);
          let answer = kHz * 1000;
          return {
            display: `<b>${kHz} kHz</b> = ? <span class="blue-percent">Hz</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }
      ],
      hard: [
        () => {
          let microV = getRandomInt(microVMin, microVMax);
          let answer = microV / 1000;
          const formatted = formatNumber(answer, 'mV', difficulty);
          return {
            display: `<b>${microV} µV</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let pF = getRandomInt(pFMin, pFMax);
          let answer = pF / 1000;
          const formatted = formatNumber(answer, 'nF', difficulty);
          return {
            display: `<b>${pF} pF</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let nF = getRandomInt(nFMin, nFMax);
          let answer = nF / 1000;
          const formatted = formatNumber(answer, 'µF', difficulty);
          return {
            display: `<b>${nF} nF</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let microF = getRandomInt(microFMin, microFMax);
          let answer = microF * 1000;
          return {
            display: `<b>${microF} µF</b> = ? <span class="blue-percent">nF</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        },
        () => {
          let kHz = getRandomInt(kHzMin, kHzMax);
          let answer = kHz / 1000;
          const formatted = formatNumber(answer, 'MHz', difficulty);
          return {
            display: `<b>${kHz} kHz</b> = ? <span class="blue-percent">${formatted.unit}</span>`,
            answer: answer.toString(),
            answerType: "decimal"
          };
        },
        () => {
          let mHz = getRandomInt(mHzMin, mHzMax);
          let answer = mHz * 1000;
          return {
            display: `<b>${mHz} MHz</b> = ? <span class="blue-percent">kHz</span>`,
            answer: answer.toString(),
            answerType: "number"
          };
        }
      ]
    };

    return types[difficulty][getRandomInt(0, types[difficulty].length - 1)]();
  }
},
{
  name: "Mértékegység kerekítés",
  value: "mertekegyseg_kerekites",
  generate: (difficulty) => {
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
    const { mAMin, mAMax, ohmMin, ohmMax, kOhmMin, kOhmMax, mOhmMin, mOhmMax, ampMin, ampMax, microAMin, microAMax, mVMin, mVMax, vMin, vMax, kVMin, kVMax, microVMin, microVMax, mWMin, mWMax, wMin, wMax, kWMin, kWMax, pFMin, pFMax, nFMin, nFMax, microFMin, microFMax, hzMin, hzMax, kHzMin, kHzMax, mHzMin, mHzMax } = ranges[difficulty];

    // Lehetséges egységek a nehézségi szint alapján
    const units = {
      easy: ['mA', 'Ω', 'kΩ', 'mΩ', 'A', 'µA', 'mV', 'V', 'kV', 'mW', 'W', 'Hz', 'kHz'],
      medium: ['mA', 'Ω', 'kΩ', 'A', 'mV', 'V', 'W', 'kW'],
      hard: ['mA', 'Ω', 'kΩ', 'mΩ', 'A', 'µA', 'µV', 'mV', 'V', 'kV', 'mW', 'W', 'pF', 'nF', 'µF', 'Hz', 'kHz', 'MHz']
    };

    // Egységpárok az átváltáshoz (hard szinten, kisebb egységből nagyobbba)
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

    // Véletlenszerű egység kiválasztása
    const unit = units[difficulty][getRandomInt(0, units[difficulty].length - 1)];
    let value, convertedValue, targetUnit, decimalPlaces;

    // Egységhez tartozó tartomány kiválasztása és pontos tizedes generálás
    const decimalPart = Math.random(); // 0-1 közötti véletlen szám
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
      default: minVal = 100; maxVal = 1000; break; // Alapértelmezett tartomány hibás esetre
    }
    value = getRandomInt(minVal, maxVal) + decimalPart;
    if (isNaN(value)) {
      value = 100 + Math.random(); // Hibakezelés: alapértelmezett érték
    }

    // Kerekítési pontosság meghatározása
    if (difficulty === 'easy') {
      decimalPlaces = 0; // Egészre kerekítés
    } else if (difficulty === 'medium') {
      decimalPlaces = getRandomInt(1, 2); // 1 vagy 2 tizedesjegy
    } else if (difficulty === 'hard') {
      decimalPlaces = getRandomInt(1, 3); // 1, 2 vagy 3 tizedesjegy
    }

    // Hard szinten mértékegység-átváltás és kerekítés
    if (difficulty === 'hard') {
      targetUnit = conversionPairs[unit];
      switch (unit) {
        case 'mA': convertedValue = value / 1000; break; // mA -> A
        case 'Ω': convertedValue = value / 1000; break; // Ω -> kΩ
        case 'kΩ': convertedValue = value / 1000; break; // kΩ -> MΩ
        case 'mΩ': convertedValue = value / 1000; break; // mΩ -> Ω
        case 'A': convertedValue = value / 1000; break; // A -> kA
        case 'µA': convertedValue = value / 1000; break; // µA -> mA
        case 'mV': convertedValue = value / 1000; break; // mV -> V
        case 'V': convertedValue = value / 1000; break; // V -> kV
        case 'kV': convertedValue = value / 1000; break; // kV -> MV
        case 'µV': convertedValue = value / 1000; break; // µV -> mV
        case 'mW': convertedValue = value / 1000; break; // mW -> W
        case 'W': convertedValue = value / 1000; break; // W -> kW
        case 'kW': convertedValue = value / 1000; break; // kW -> MW
        case 'pF': convertedValue = value / 1000; break; // pF -> nF
        case 'nF': convertedValue = value / 1000; break; // nF -> µF
        case 'µF': convertedValue = value / 1000; break; // µF -> mF
        case 'Hz': convertedValue = value / 1000; break; // Hz -> kHz
        case 'kHz': convertedValue = value / 1000; break; // kHz -> MHz
        case 'MHz': convertedValue = value / 1000; break; // MHz -> GHz
      }
      const rounded = Number(convertedValue.toFixed(decimalPlaces));
      return {
        display: `<b>${value.toFixed(3)} ${unit}</b> átváltva és kerekítve ${decimalPlaces} tizedesjegyre ${targetUnit}-ban = ? <span class="blue-percent">${targetUnit}</span>`,
        answer: rounded.toString(),
        answerType: "decimal"
      };
    }

    // Easy és Medium szintek: csak kerekítés
    const rounded = Number(value.toFixed(decimalPlaces));
    return {
      display: `<b>${value.toFixed(3)} ${unit}</b> kerekítve ${decimalPlaces === 0 ? 'egészre' : `${decimalPlaces} tizedesjegyre`} = ? <span class="blue-percent">${unit}</span>`,
      answer: rounded.toString(),
      answerType: "decimal"
    };
  }
},
  {
  name: "Ohm-törvény",
  value: "ohm_torveny",
  generate: (difficulty) => {
    const ranges = {
      easy: { maxI: 10, maxR: 100, maxU: 24 },
      medium: { maxI: 20, maxR: 1000, maxU: 230 },
      hard: { maxI: 50, maxR: 10000, maxU: 400 }
    };
    const { maxI, maxR, maxU } = ranges[difficulty];
    let I, R, U, type, maxTries = 10; // Maximum próbálkozások száma
    for (let tryCount = 0; tryCount < maxTries; tryCount++) {
      I = getRandomInt(1, maxI);
      R = getRandomInt(1, maxR);
      U = I * R;
      if (U <= maxU) break; // Elfogadható kombináció esetén kilépünk
      if (tryCount === maxTries - 1) {
        // Ha nem sikerül, alapértelmezett értékekkel inicializálunk
        I = 2;
        R = 10;
        U = I * R;
      }
    }
    type = getRandomInt(0, 2);
    if (difficulty === "hard") {
      let R2 = getRandomInt(1, maxR);
      U = I * (R + R2);
      if (U > maxU) {
        R2 = Math.floor((maxU - I * R) / I);
        U = I * (R + R2);
      }
      if (type === 0) {
        const formatted = formatNumber(U, 'V', difficulty);
        return {
          display: `Mennyi a feszültség (${formatted.unit}-ban), ha <b>I = ${I} A</b> és <b>R = ${R} Ω + ${R2} Ω</b>?`,
          answer: formatted.value.toString(),
          answerType: "number",
          options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
        };
      } else if (type === 1) {
        const formatted = formatNumber(I, 'A', difficulty);
        return {
          display: `Mennyi az áram (${formatted.unit}-ban), ha <b>U = ${U} V</b> és <b>R = ${R} Ω + ${R2} Ω</b>?`,
          answer: formatted.value.toString(),
          answerType: "decimal",
          options: difficulty === "easy" ? generateOptions(formatted.value, "decimal", difficulty, formatted.unit) : []
        };
      } else {
        const formatted = formatNumber(R + R2, 'Ω', difficulty);
        return {
          display: `Mennyi az ellenállás (${formatted.unit}-ban), ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`,
          answer: formatted.value.toString(),
          answerType: "number",
          options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
        };
      }
    }
    if (type === 0) {
      const formatted = formatNumber(U, 'V', difficulty);
      return {
        display: `Mennyi a feszültség (${formatted.unit}-ban), ha <b>I = ${I} A</b> és <b>R = ${R} Ω</b>?`,
        answer: formatted.value.toString(),
        answerType: "number",
        options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
      };
    } else if (type === 1) {
      const formatted = formatNumber(I, 'A', difficulty);
      return {
        display: `Mennyi az áram (${formatted.unit}-ban), ha <b>U = ${U} V</b> és <b>R = ${R} Ω</b>?`,
        answer: formatted.value.toString(),
        answerType: "decimal",
        options: difficulty === "easy" ? generateOptions(formatted.value, "decimal", difficulty, formatted.unit) : []
      };
    } else {
      const formatted = formatNumber(R, 'Ω', difficulty);
      return {
        display: `Mennyi az ellenállás (${formatted.unit}-ban), ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`,
        answer: formatted.value.toString(),
        answerType: "number",
        options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
      };
    }
  }
},
  {
    name: "Teljesítmény",
    value: "teljesitmeny",
    generate: (difficulty) => {
      const ranges = {
        easy: { maxU: 24, maxI: 10 },
        medium: { maxU: 230, maxI: 20 },
        hard: { maxU: 400, maxI: 50 }
      };
      const { maxU, maxI } = ranges[difficulty];
      let U = getRandomInt(10, maxU);
      let I = getRandomInt(1, maxI);
      let P = U * I;
      if (difficulty === "hard") {
        let I2 = getRandomInt(1, maxI);
        P = U * (I + I2);
        const formatted = formatNumber(P, 'W', difficulty);
        return {
          display: `Mennyi a teljesítmény (${formatted.unit}-ban), ha <b>U = ${U} V</b>, <b>I₁ = ${I} A</b> és <b>I₂ = ${I2} A</b>?`,
          answer: formatted.value.toString(),
          answerType: "number",
          options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
        };
      }
      const formatted = formatNumber(P, 'W', difficulty);
      return {
        display: `Mennyi a teljesítmény (${formatted.unit}-ban), ha <b>U = ${U} V</b> és <b>I = ${I} A</b>?`,
        answer: formatted.value.toString(),
        answerType: "number",
        options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
      };
    }
  },
  {
    name: "Előtét ellenállás méretezés",
    value: "elotet_ellenallas",
    generate: (difficulty) => {
      const ranges = {
        easy: { maxU_forrás: 24, minU_forrás: 3, maxU_fogyasztó: 5, minU_fogyasztó: 1, maxI: 100, minI: 1 },
        medium: { maxU_forrás: 230, minU_forrás: 24, maxU_fogyasztó: 200, minU_fogyasztó: 12, maxI: 5, minI: 0.1 },
        hard: { maxU_forrás: 400, minU_forrás: 100, maxU_fogyasztó: 350, minU_fogyasztó: 50, maxI: 50, minI: 1 }
      };
      const { maxU_forrás, minU_forrás, maxU_fogyasztó, minU_fogyasztó, maxI, minI } = ranges[difficulty];
      let display, answer, answerType, unit;
      if (difficulty === "easy") {
        let U_forrás = getRandomInt(minU_forrás, maxU_forrás);
        let U_fogyasztó = getRandomInt(minU_fogyasztó, Math.min(U_forrás - 1, maxU_fogyasztó));
        let I = getRandomInt(minI, maxI);
        let R_s = (U_forrás - U_fogyasztó) / (I / 1000);
        if (!Number.isInteger(R_s) && Math.abs(R_s - Math.round(R_s)) > 0.25) {
          U_forrás = Math.round(R_s * (I / 1000)) + U_fogyasztó;
          R_s = (U_forrás - U_fogyasztó) / (I / 1000);
        }
        const formatted = formatNumber(R_s, 'Ω', difficulty);
        answer = formatted.value.toString();
        unit = formatted.unit;
        display = `Mennyi az előtét ellenállás (${unit}-ban), ha a forrásfeszültség <b>${U_forrás} V</b>, a fogyasztó feszültsége <b>${U_fogyasztó} V</b> és az áram <b>${I} mA</b>?`;
        answerType = Number.isInteger(R_s) ? "number" : "decimal";
      } else if (difficulty === "medium") {
        let U_forrás = getRandomInt(minU_forrás, maxU_forrás);
        let U_fogyasztó = getRandomInt(minU_fogyasztó, Math.min(U_forrás - 10, maxU_fogyasztó));
        let I = getRandomInt(minI * 1000, maxI * 1000) / 1000;
        let R_s = (U_forrás - U_fogyasztó) / I;
        if (!Number.isInteger(R_s) && Math.abs(R_s - Math.round(R_s)) > 0.25) {
          U_forrás = Math.round(R_s * I) + U_fogyasztó;
          R_s = (U_forrás - U_fogyasztó) / I;
        }
        const formatted = formatNumber(R_s, 'Ω', difficulty);
        answer = formatted.value.toString();
        unit = formatted.unit;
        display = `Mennyi az előtét ellenállás (${unit}-ban), ha a forrásfeszültség <b>${U_forrás} V</b>, a fogyasztó feszültsége <b>${U_fogyasztó} V</b> és az áram <b>${I} A</b>?`;
        answerType = Number.isInteger(R_s) ? "number" : "decimal";
      } else {
        let U_forrás = getRandomInt(minU_forrás, maxU_forrás);
        let U_fogyasztó = getRandomInt(minU_fogyasztó, Math.min(U_forrás - 50, maxU_fogyasztó));
        let I = getRandomInt(minI * 1000, maxI * 1000) / 1000;
        let R_s = (U_forrás - U_fogyasztó) / I;
        if (!Number.isInteger(R_s) && Math.abs(R_s - Math.round(R_s)) > 0.25) {
          U_forrás = Math.round(R_s * I) + U_fogyasztó;
          R_s = (U_forrás - U_fogyasztó) / I;
        }
        const formatted = formatNumber(R_s, 'Ω', difficulty);
        answer = formatted.value.toString();
        unit = formatted.unit;
        display = `Mennyi az előtét ellenállás (${unit}-ban), ha a forrásfeszültség <b>${U_forrás} V</b>, a fogyasztó feszültsége <b>${U_fogyasztó} V</b> és az áram <b>${I} A</b>?`;
        answerType = Number.isInteger(R_s) ? "number" : "decimal";
      }
      return {
        display,
        answer,
        answerType,
        options: difficulty === "easy" ? generateOptions(answer, answerType, difficulty, unit) : []
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
      hard: { minR: 100, maxR: 100000 }
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
    let display, answer, answerType, unit;
    if (difficulty === "easy") {
      const numResistors = getRandomInt(2, 3);
      const resistors = [];
      const units = [];
      for (let i = 0; i < numResistors; i++) {
        let resistance = getE12Resistance(minR, maxR);
        let unit = (i < 2 && Math.random() < 0.5) ? 'kΩ' : 'Ω';
        if (unit === 'kΩ') {
          resistance = resistance / 1000;
          resistance = Math.round(resistance * 100) / 100;
        }
        resistors.push(resistance);
        units.push(unit);
      }
      const resistorsInOhms = resistors.map((r, i) => units[i] === 'kΩ' ? r * 1000 : r);
      const R_eredo = resistorsInOhms.reduce((sum, r) => sum + r, 0);
      const formatted = formatNumber(R_eredo, 'Ω', difficulty);
      answer = formatted.value.toString();
      unit = formatted.unit;
      // Ha a válasz kΩ-ban van, akkor decimal típusú
      answerType = (unit === 'kΩ') ? "decimal" : (Number.isInteger(R_eredo) ? "number" : "decimal");
      let displayResistors = resistors.map((r, i) => `<b>R${i + 1} = ${r} ${units[i]}</b>`);
      if (numResistors === 3 && units[0] === units[1]) {
        units[2] = units[0] === 'Ω' ? 'kΩ' : 'Ω';
        resistors[2] = units[2] === 'kΩ' ? resistorsInOhms[2] / 1000 : resistorsInOhms[2];
        resistors[2] = Math.round(resistors[2] * 100) / 100;
        displayResistors[2] = `<b>R₃ = ${resistors[2]} ${units[2]}</b>`;
      }
      display = `Mennyi az eredő ellenállás (${unit}-ban), ha az ellenállások sorosan vannak kapcsolva: ${displayResistors.join(numResistors === 3 ? ', ' : ', ')}?`;
    } else if (difficulty === "medium") {
      const numResistors = getRandomInt(2, 3);
      const resistors = [];
      for (let i = 0; i < numResistors; i++) {
        resistors.push(getE12Resistance(minR, maxR));
      }
      let R_eredo;
      if (numResistors === 2) {
        R_eredo = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]);
      } else {
        R_eredo = 1 / resistors.reduce((sum, r) => sum + 1 / r, 0);
      }
      R_eredo = Math.round(R_eredo * 100) / 100;
      const formatted = formatNumber(R_eredo, 'Ω', difficulty);
      answer = formatted.value.toString();
      unit = formatted.unit;
      display = `Mennyi az eredő ellenállás (${unit}-ban), ha az ellenállások párhuzamosan vannak kapcsolva: <b>R₁ = ${resistors[0]} Ω${numResistors > 2 ? `, R₂ = ${resistors[1]} Ω, R₃ = ${resistors[2]} Ω` : `, R₂ = ${resistors[1]} Ω`}</b>?`;
      answerType = Number.isInteger(R_eredo) ? "number" : "decimal";
    } else {
      const type = getRandomInt(0, 1);
      const resistors = [getE12Resistance(minR, maxR), getE12Resistance(minR, maxR), getE12Resistance(minR, maxR)];
      let R_eredo;
      if (type === 0) {
        const R_parallel = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]);
        R_eredo = R_parallel + resistors[2];
        R_eredo = Math.round(R_eredo * 100) / 100;
        const formatted = formatNumber(R_eredo, 'Ω', difficulty);
        answer = formatted.value.toString();
        unit = formatted.unit;
        display = `Mennyi az eredő ellenállás (${unit}-ban), ha <b>R₁ = ${resistors[0]} Ω</b> és <b>R₂ = ${resistors[1]} Ω</b> párhuzamosan, majd <b>R₃ = ${resistors[2]} Ω</b> sorosan van kapcsolva?`;
        answerType = Number.isInteger(R_eredo) ? "number" : "decimal";
      } else {
        const R_parallel = (resistors[1] * resistors[2]) / (resistors[1] + resistors[2]);
        R_eredo = resistors[0] + R_parallel;
        R_eredo = Math.round(R_eredo * 100) / 100;
        const formatted = formatNumber(R_eredo, 'Ω', difficulty);
        answer = formatted.value.toString();
        unit = formatted.unit;
        display = `Mennyi az eredő ellenállás (${unit}-ban), ha <b>R₁ = ${resistors[0]} Ω</b> sorosan, majd <b>R₂ = ${resistors[1]} Ω</b> és <b>R₃ = ${resistors[2]} Ω</b> párhuzamosan van kapcsolva?`;
        answerType = Number.isInteger(R_eredo) ? "number" : "decimal";
      }
    }
    return {
      display,
      answer,
      answerType,
      options: [],
      hadWrongAnswer: false
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
let answerState = { value: "" }; // Válasz állapota a numpadhoz
let wrongAnswers = 0; // Helytelen válaszok száma

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
  const theme = localStorage.getItem("vilma-theme") || "light"; // Alapértelmezett: világos téma
  const isLight = theme === "light";
  document.body.classList.toggle("dark", !isLight); // .dark osztály használata
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
    themeToggle.addEventListener("touchstart", toggleTheme); // iPhone-kompatibilitás
  } else {
    console.error("A #theme-toggle elem nem található.");
  }
  applyTheme(); // Téma alkalmazása betöltéskor
});

function toggleTheme(event) {
  event.preventDefault(); // Megakadályozza az iOS dupla érintési problémákat
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
// --- SZÁMBILLENTYŰZET ---
function renderNumpad(answerState, onChange) {
  const currentTask = questions[currentQuestion] || {};
  const specialKey = currentTask.value === "normal_alak" ? '×' : (currentTask.answerType === "fraction" ? '/' : '^');

  const rows = [
    ['1', '2', '3', specialKey, '←'],
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
          if (val === "") {
            alert("Írj be egy választ!");
            return;
          }
          let correct = false;
          if (!currentTask.answer) {
            alert("Hiba: nincs válasz definiálva!");
            return;
          }

          if (currentTask.answerType === "fraction") {
            if (!val.includes('/')) {
              alert("Érvénytelen tört formátum! Írj be egy törtet, pl. '3/4'.");
              return;
            }
            const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
            const [userNum, userDen] = val.split('/').map(Number);
            if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
              alert("Érvénytelen tört formátum!");
              return;
            }
            const [simpUserNum, simpUserDen] = simplifyFraction(userNum, userDen);
            if (simpUserNum === ansNum && simpUserDen === ansDen) {
              correct = true;
            }
          } else if (currentTask.answerType === "power") {
            const powerMatch = val.match(/^([\d\.]+)×10\^([\d\-]+)$/);
            if (!powerMatch) {
              alert("Érvénytelen normál alak! Használj 'a×10^b' formát, pl. '3.5×10^3'.");
              return;
            }
            const [_, userCoef, userExp] = powerMatch;
            const [ansCoef, ansExp] = currentTask.answer.match(/^([\d\.]+)×10\^([\d\-]+)$/) || [];
            if (Math.abs(parseFloat(userCoef) - parseFloat(ansCoef)) < 0.01 && parseInt(userExp) === parseInt(ansExp)) {
              correct = true;
            }
          } else if (currentTask.answerType === "decimal") {
            const correctAnswer = parseFloat(currentTask.answer);
            const userAnswer = parseFloat(val);
            if (isNaN(userAnswer)) {
              alert("Érvénytelen szám! Írj be egy tizedes törtet, pl. '3.14'.");
              return;
            }
            const roundedUser = Number(userAnswer.toFixed(2));
            const roundedCorrect = Number(correctAnswer.toFixed(2));
            if (Math.abs(roundedUser - roundedCorrect) < 0.01) {
              correct = true;
            }
          } else { // number
            const correctAnswer = parseFloat(currentTask.answer);
            const userAnswer = parseFloat(val);
            if (isNaN(userAnswer)) {
              alert("Érvénytelen szám! Írj be egy egész vagy tizedes számot.");
              return;
            }
            if (Math.abs(Math.round(userAnswer) - Math.round(correctAnswer)) < 0.01) {
              correct = true;
            }
          }

          let pauseStart = null;
          if (timerInterval) {
            clearInterval(timerInterval); // Biztosítjuk, hogy az előző intervallum törölve legyen
            pauseStart = Date.now();
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
            if (timerInterval) {
              clearInterval(timerInterval); // Hiba esetén is állítsuk le
            }
            timerInterval = setInterval(updateTimer, 1000); // Folytassuk az időzítést
          }

          if (gameActive && currentQuestion < QUESTIONS) {
            if (pauseStart) {
              const pauseDuration = Date.now() - pauseStart;
              startTime += pauseDuration; // Frissítjük a startTime-ot
            }
            timerInterval = setInterval(updateTimer, 1000); // Újraindítjuk az időzítőt
          } else if (currentQuestion >= QUESTIONS) {
            finishGame(); // Ha vége a játéknak, állítsuk le az időzítőt
          }
        };
        rowDiv.appendChild(submitBtn);
      } else {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'numpad-btn';
        btn.textContent = key;
        btn.tabIndex = -1;
        btn.onclick = () => {
          btn.classList.add('flash');
          setTimeout(() => btn.classList.remove('flash'), 200);
          if (key === '←') {
            answerState.value = answerState.value.slice(0, -1);
          } else if (key === '-') {
            if (!answerState.value.startsWith('-')) {
              answerState.value = '-' + answerState.value;
            } else {
              answerState.value = answerState.value.substring(1);
            }
          } else if (key === specialKey) {
            if (!answerState.value.includes(specialKey)) {
              answerState.value += specialKey;
            }
          } else if (key === '.') {
            if (answerState.value !== "" && !answerState.value.includes('.')) {
              answerState.value += '.';
            }
          } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
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
  div.innerHTML = `
    <div class="progress-bar">
      <div class="progress"></div>
      <div class="progress-wrong"></div>
    </div>
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

  const progress = div.querySelector('.progress');
  const progressWrong = div.querySelector('.progress-wrong');
  if (progress && progressWrong) {
    progress.style.width = `${(score / QUESTIONS) * 100}%`;
    progressWrong.style.width = `${(wrongAnswers / QUESTIONS) * 100}%`;
    progressWrong.style.left = `${(score / QUESTIONS) * 100}%`; // Hibás sáv a helyes sáv után
  }

  div.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- JÁTÉK INDITÁS ---
function startGame() {
  gameActive = true;
  score = 0;
  currentQuestion = 0;
  wrongAnswers = jakab = 0; // Helytelen válaszok inicializálása
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