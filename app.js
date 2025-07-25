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
      return {
        display: `Mennyi <b>${base}<sup>${exponent}</sup></b>?`,
        answer: answer.toString(),
        answerType: "number"
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
        return {
          display: `${a}x × ${b} ÷ ${c} ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${result}    | x`,
          answer: x.toString(),
          answerType: "number"
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
        hard: { mAMin: 100, mAMax: 10000, kOhmMin: 1, kOhmMax: 50, ohmMin: 100, ohmMax: 10000, ampMin: 1, ampMax: 50, mVMin: 100, mVMax: 10000 }
      };
      const { mAMin, mAMax, kOhmMin, kOhmMax, ohmMin, ohmMax, ampMin, ampMax, mVMin, mVMax } = ranges[difficulty];
      const types = [
        () => {
          let mA = getRandomInt(mAMin, mAMax);
          let answer = mA / 1000;
          const formatted = formatNumber(answer, 'A', difficulty);
          return {
            display: `<b>${mA} mA</b> = ? ${formatted.unit}`,
            answer: formatted.value.toString(),
            answerType: "decimal",
            options: difficulty === "easy" ? generateOptions(formatted.value, "decimal", difficulty, formatted.unit) : []
          };
        },
        () => {
          let kOhm = (getRandomInt(kOhmMin * 10, kOhmMax * 10) / 10).toFixed(1);
          let answer = parseFloat(kOhm) * 1000;
          const formatted = formatNumber(answer, 'Ω', difficulty);
          return {
            display: `<b>${kOhm} kΩ</b> = ? ${formatted.unit}`,
            answer: formatted.value.toString(),
            answerType: "number",
            options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
          };
        },
        () => {
          let ohm = getRandomInt(ohmMin, ohmMax);
          let answer = ohm / 1000;
          const formatted = formatNumber(answer, 'kΩ', difficulty);
          return {
            display: `<b>${ohm} Ω</b> = ? ${formatted.unit}`,
            answer: formatted.value.toString(),
            answerType: "decimal",
            options: difficulty === "easy" ? generateOptions(formatted.value, "decimal", difficulty, formatted.unit) : []
          };
        },
        () => {
          let amp = (getRandomInt(ampMin * 100, ampMax * 100) / 100).toFixed(2);
          let answer = parseFloat(amp) * 1000;
          const formatted = formatNumber(answer, 'mA', difficulty);
          return {
            display: `<b>${amp} A</b> = ? ${formatted.unit}`,
            answer: formatted.value.toString(),
            answerType: "number",
            options: difficulty === "easy" ? generateOptions(formatted.value, "number", difficulty, formatted.unit) : []
          };
        },
        () => {
          let mV = getRandomInt(mVMin, mVMax);
          let answer = mV / 1000;
          const formatted = formatNumber(answer, 'V', difficulty);
          return {
            display: `<b>${mV} mV</b> = ? ${formatted.unit}`,
            answer: formatted.value.toString(),
            answerType: "decimal",
            options: difficulty === "easy" ? generateOptions(formatted.value, "decimal", difficulty, formatted.unit) : []
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
      const ranges = {
        easy: { maxI: 10, maxR: 100, maxU: 24 },
        medium: { maxI: 20, maxR: 1000, maxU: 230 },
        hard: { maxI: 50, maxR: 10000, maxU: 400 }
      };
      const { maxI, maxR, maxU } = ranges[difficulty];
      let I = getRandomInt(1, maxI);
      let R = getRandomInt(1, maxR);
      let U = I * R;
      if (U > maxU) {
        R = Math.floor(maxU / I);
        U = I * R;
      }
      let type = getRandomInt(0, 2);
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
      return Math.round(resistance); // Könnyű szinten egész szám
    }
    let display, answer, answerType, unit;
    if (difficulty === "easy") {
      const numResistors = getRandomInt(2, 3);
      const resistors = [];
      const units = [];
      for (let i = 0; i < numResistors; i++) {
        let resistance = getE12Resistance(minR, maxR);
        let unit = (i < 2 && Math.random() < 0.5) ? 'kΩ' : 'Ω'; // Véletlenszerűen Ω vagy kΩ
        if (unit === 'kΩ') {
          resistance = resistance / 1000; // kΩ-ra konvertálás a kijelzéshez
          resistance = Math.round(resistance * 100) / 100; // 2 tizedesjegy
        }
        resistors.push(resistance);
        units.push(unit);
      }
      // Ellenállások Ω-ban az összeadáshoz
      const resistorsInOhms = resistors.map((r, i) => units[i] === 'kΩ' ? r * 1000 : r);
      const R_eredo = resistorsInOhms.reduce((sum, r) => sum + r, 0);
      const formatted = formatNumber(R_eredo, 'Ω', difficulty);
      answer = formatted.value.toString();
      unit = formatted.unit;
      answerType = Number.isInteger(R_eredo) ? "number" : "decimal";
      // Két különböző mértékegység biztosítása
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
      options: [], // Nincs opciós válasz
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
            if (categorySelect.value === "szazalekszamitas") {
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
            if (difficultySelect.value === "hard") {
              const message = motivationalMessages[getRandomInt(0, motivationalMessages.length - 1)];
              alert(message);
            } else if (difficultySelect.value === "medium" && currentQuestion === QUESTIONS - 2) {
              alert("Gratulálok, csak így tovább, mindjárt a végére érsz!");
            }
            currentQuestion++;
            showQuestion(currentQuestion);
          } else {
            wrongAnswers++; // Helytelen válasz számlálása
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