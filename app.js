// --- ALAPBEÁLLÍTÁSOK ---
const QUESTIONS = 9;
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 },
  medium: { min: -20, max: 20 },
  hard: { min: -100, max: 100 }
};

// --- SEGÉDFÜGGVÉNYEK ---
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(num, denom) {
  const d = gcd(Math.abs(num), Math.abs(denom));
  return [num / d, denom / d];
}

// --- FONTOS JAVÍTÁS: egységes kerekítés és képernyő/érték szinkronizálás ---
function roundTo(value, decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function displayNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  return roundTo(Number(value), decimals);
}

function displayNumberString(value, decimals = 2) {
  const v = displayNumber(value, decimals);
  return Number.isInteger(v) ? String(v) : v.toFixed(decimals).replace('.', ',');
}

function formatNumber(value, unit, difficulty, forceBaseUnit = false) {
  if (isNaN(value)) {
    console.error("Hiba: formatNumber kapott NaN értéket", { value, unit, difficulty });
    return { value: 0, unit };
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
  } else {
    if (unit === 'Ω' && absValue >= 1000) {
      newValue = value / 1000;
      newUnit = 'kΩ';
    } else if (unit === 'A' && absValue < 0.1) {
      newValue = value * 1000;
      newUnit = 'mA';
    }
  }

  if (Number.isInteger(newValue)) {
    newValue = Number(newValue.toFixed(0));
  } else {
    newValue = Number(newValue.toFixed(precision));
  }

  return { value: newValue, unit: newUnit };
}

// Válaszlehetőségek generálása
function generateOptions(correctAnswer, answerType, difficulty, unit, precision = 2) {
  if (answerType !== "decimal") return [];
  const base = Number(correctAnswer);
  if (isNaN(base)) return [];

  const correctStr = base.toFixed(precision);
  const options = [correctStr];
  const range = difficulty === "easy" ? 10 : 20;
  const min = Math.max(0, base - range);
  const max = base + range;

  while (options.length < 4) {
    const optionNum = min + Math.random() * (max - min);
    const option = optionNum.toFixed(precision);
    if (Math.abs(Number(option) - base) >= Math.pow(10, -precision) && !options.includes(option)) {
      options.push(option);
    }
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options.map(opt => ({ value: opt, label: `${opt} ${unit}` }));
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
        const raw = num1 + num2 + num3;
        return {
          display: `<b>${num1}</b> + <b>${num2}</b> + <b>${num3}</b> =`,
          answer: String(raw),
          answerType: "number"
        };
      }
      const raw = num1 + num2;
      return {
        display: `<b>${num1}</b> + <b>${num2}</b> =`,
        answer: String(raw),
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
        const raw = num1 - num2 - num3;
        return {
          display: `<b>${num1}</b> - <b>${num2}</b> - <b>${num3}</b> =`,
          answer: String(raw),
          answerType: "number"
        };
      }
      const raw = num1 - num2;
      return {
        display: `<b>${num1}</b> - <b>${num2}</b> =`,
        answer: String(raw),
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
        const raw = num1 * num2 * num3;
        return {
          display: `<b>${num1}</b> • <b>${num2}</b> • <b>${num3}</b> =`,
          answer: String(raw),
          answerType: "number"
        };
      }
      const raw = num1 * num2;
      return {
        display: `<b>${num1}</b> • <b>${num2}</b> =`,
        answer: String(raw),
        answerType: "number"
      };
    }
  },
  {
    name: "Osztás",
    value: "osztas",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      const minDivisor = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 5;
      const maxDivisor = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
      const num2 = getRandomInt(minDivisor, maxDivisor);
      const answerBase = getRandomInt(min, max);

      if (difficulty === "hard") {
        const num3 = getRandomInt(minDivisor, maxDivisor);
        const num1 = answerBase * num2 * num3;
        const raw = num1 / num2 / num3;
        return {
          display: `<b>${num1}</b> : <b>${num2}</b> : <b>${num3}</b> =`,
          answer: String(raw),
          answerType: "number"
        };
      }

      const raw = answerBase;
      return {
        display: `<b>${num2 * answerBase}</b> : <b>${num2}</b> =`,
        answer: String(raw),
        answerType: "number"
      };
    }
  },
  {
    name: "Zárójeles kifejezések",
    value: "zarojeles_kifejezesek",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      const opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 8;
      return generateBracketedExpression(opCount, min, max);
    }
  },
  {
    name: "Törtek",
    value: "tortek",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      const minDenom = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5;
      const maxDenom = difficulty === "easy" ? 8 : difficulty === "medium" ? 15 : 30;
      let b = getRandomInt(minDenom, maxDenom), d = getRandomInt(minDenom, maxDenom);
      let a = getRandomInt(1, b - 1), c = getRandomInt(1, d - 1);

      if (difficulty === "hard") {
        const e = getRandomInt(1, b - 1), f = getRandomInt(minDenom, maxDenom);
        const numerator = (a * d * f + c * b * f + e * b * d);
        const denominator = b * d * f;
        const [num, denom] = simplifyFraction(numerator, denominator);
        return {
          display: `${a}/${b} + ${c}/${d} + ${e}/${f} =`,
          answer: `${num}/${denom}`,
          answerType: "fraction"
        };
      }
      const numerator = a * d + c * b;
      const denominator = b * d;
      const [num, denom] = simplifyFraction(numerator, denominator);
      return {
        display: `${a}/${b} + ${c}/${d} =`,
        answer: `${num}/${denom}`,
        answerType: "fraction"
      };
    }
  },
  {
    name: "Százalékszámítás",
    value: "szazalekszamitas",
    generate: (difficulty) => {
      const percentArrEasy = [10, 20, 50, 100];
      const percentArrMedium = [5, 15, 25, 50, 75, 100];
      const percentArrHard = [2, 3, 7, 15, 33, 66, 125, 150, 200];
      const percentArr = difficulty === "easy" ? percentArrEasy : difficulty === "medium" ? percentArrMedium : percentArrHard;

      let baseCandidates = [];
      if (difficulty === "easy") {
        for (let i = 10; i <= 100; i += 10) baseCandidates.push(i);
      } else if (difficulty === "medium") {
        for (let i = 10; i <= 200; i += 5) baseCandidates.push(i);
      } else {
        for (let i = 10; i <= 500; i++) baseCandidates.push(i);
      }

      const percent = percentArr[getRandomInt(0, percentArr.length - 1)];
      const base = baseCandidates[getRandomInt(0, baseCandidates.length - 1)];
      const raw = base * percent / 100;
      const displayed = displayNumber(raw, 2);
      const lastDigit = base % 10;
      const lastTwoDigits = base % 100;
      const rag = (lastDigit === 3 || lastDigit === 6 || lastDigit === 8 ||
        lastTwoDigits === 0 || lastTwoDigits === 20 || lastTwoDigits === 30 ||
        lastTwoDigits === 60 || lastTwoDigits === 80) ? "-nak" : "-nek";
      const percentStr = percent.toString();
      const nevelo = percentStr.startsWith("5") ? "az" : "a";

      return {
        display: `Mennyi ${base}${rag} ${nevelo} <span class="blue-percent">${percent}%</span>-a ?`,
        answer: String(displayed),
        answerType: "number"
      };
    }
  },
  {
    name: "Egyenletek átrendezése",
    value: "egyenletek_atrendezese",
    generate: (difficulty) => {
      const { min, max } = DIFFICULTY_SETTINGS[difficulty];
      const variable = 'X';
      const color = '#00CED1';
      const formattedVar = `<i>${variable}</i>`;
      const coloredVar = `<span style="color: ${color};">${formattedVar}</span>`;

      if (difficulty === "hard") {
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
        let x = getRandomInt(min, max);
        let product = a * x * b;
        const divisors = getDivisors(product).filter(d => d >= 2 && d <= 10);
        let c = divisors.length > 0 ? divisors[getRandomInt(0, divisors.length - 1)] : getRandomInt(2, 10);
        let d = getRandomInt(min, max);
        let result = (a * x * b) / c + d;

        if (!Number.isInteger(result)) {
          result = Math.round(result);
          d = result - (a * x * b) / c;
        }

        if (Math.abs(result) > 10000) {
          x = getRandomInt(Math.max(min, -50), Math.min(max, 50));
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
          display: `${a}${coloredVar} * ${b} / ${c} ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${result} | ${coloredVar}`,
          answer: x.toString(),
          answerType: "number"
        };
      }

      const aMin = difficulty === "easy" ? 1 : 2;
      const aMax = difficulty === "easy" ? 5 : 10;
      const bMin = difficulty === "easy" ? -5 : -15;
      const bMax = difficulty === "easy" ? 5 : 15;
      const x = getRandomInt(min, max);
      const a = getRandomInt(aMin, aMax);
      const b = getRandomInt(bMin, bMax);
      const result = a * x + b;

      return {
        display: `${a}${coloredVar} ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result} | ${coloredVar}`,
        answer: x.toString(),
        answerType: "number"
      };
    }
  },
  {
    name: "Halmazműveletek",
    value: "halmaz_muveletek",
    generate: (difficulty) => {
      const sizeByDifficulty = { easy: [3, 4], medium: [4, 6], hard: [5, 8] };
      const rangeByDifficulty = { easy: [1, 10], medium: [-5, 20], hard: [-20, 50] };

      const [minSize, maxSize] = sizeByDifficulty[difficulty] || [3, 5];
      const [minVal, maxVal] = rangeByDifficulty[difficulty] || [1, 20];

      function makeUniqueArray(count) {
        const s = new Set();
        const tries = count * 6;
        let i = 0;
        while (s.size < count && i < tries) {
          s.add(getRandomInt(minVal, maxVal));
          i++;
        }
        return Array.from(s).sort((a, b) => a - b);
      }

      const sizeA = getRandomInt(minSize, maxSize);
      const sizeB = getRandomInt(minSize, maxSize);
      const A = makeUniqueArray(sizeA);
      const B = makeUniqueArray(sizeB);

      const ops = [
        { op: '∪', fn: (a, b) => Array.from(new Set([...a, ...b])).sort((x, y) => x - y) },
        { op: '∩', fn: (a, b) => a.filter(x => b.includes(x)).sort((x, y) => x - y) },
        { op: '\\', fn: (a, b) => a.filter(x => !b.includes(x)).sort((x, y) => x - y) },
        { op: '-', fn: (a, b) => b.filter(x => !a.includes(x)).sort((x, y) => x - y) },
        { op: 'Δ', fn: (a, b) => {
            const union = Array.from(new Set([...a, ...b]));
            return union.filter(x => (a.includes(x) ^ b.includes(x))).sort((x, y) => x - y);
          } }
      ];

      const chosen = ops[getRandomInt(0, ops.length - 1)];
      const result = chosen.fn(A, B);
      const answerStr = result.length === 0 ? "" : result.join(',');

      const display = `Legyenek a halmazok:<br>A = { ${A.join(', ')} }<br>B = { ${B.join(', ')} }<br>Mennyi A ${chosen.op} B ?<br><small>Válasz formátum: elemek vesszővel elválasztva, pl. {1,2,3} vagy 1,2,3</small>`;

      return { display, answer: answerStr, answerType: "set" };
    }
  },
  {
    name: "Normál alakos számok",
    value: "normal_alak",
    generate: (difficulty) => {
      function getRandomMantissa(decimals = 2) {
        const m = Math.random() * 9 + 1;
        return Number(m.toFixed(decimals));
      }

      function isEffectivelyInteger(v) {
        return Math.abs(v - Math.round(v)) < 1e-12;
      }

      const direction = lastDirection === 0 ? 1 : 0;
      lastDirection = direction;

      if (difficulty === "easy") {
        if (direction === 0) {
          let number, exponent;
          let attempts = 0;
          do {
            const rand = Math.random();
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
          } while (exponent === lastExponent && attempts < 10);
          lastExponent = exponent;

          return {
            display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
            answer: exponent.toString(),
            answerType: "number"
          };
        } else {
          let exp, mant, valueRaw;
          do {
            const rand = Math.random();
            if (rand < 0.3333) exp = 1;
            else if (rand < 0.6666) exp = 2;
            else exp = 3;
          } while (exp === lastExponent);

          const mantissaDecimals = 2;
          mant = getRandomMantissa(mantissaDecimals);
          valueRaw = mant * Math.pow(10, exp);
          lastExponent = exp;
          const mantStr = ("" + mant).replace(".", ",");

          if (isEffectivelyInteger(valueRaw)) {
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: String(Math.round(valueRaw)),
              answerType: "number"
            };
          } else {
            const decimalPlaces = Math.max(0, mantissaDecimals - exp);
            const answerStr = valueRaw.toFixed(decimalPlaces).replace(".", ",");
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: answerStr,
              answerType: "decimal",
              decimalPlaces
            };
          }
        }
      }

      if (difficulty === "medium") {
        if (direction === 0) {
          let number, exponent;
          do {
            const rand = Math.random();
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
          } while (exponent === lastExponent);
          lastExponent = exponent;

          return {
            display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
            answer: exponent.toString(),
            answerType: "number"
          };
        } else {
          let exp, mant, valueRaw;
          do {
            const rand = Math.random();
            if (rand < 0.25) exp = -3;
            else if (rand < 0.5) exp = -2;
            else if (rand < 0.75) exp = -1;
            else exp = 0;
          } while (exp === lastExponent);

          const mantissaDecimals = 2;
          mant = getRandomMantissa(mantissaDecimals);
          valueRaw = mant * Math.pow(10, exp);
          lastExponent = exp;
          const mantStr = ("" + mant).replace(".", ",");

          if (isEffectivelyInteger(valueRaw)) {
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: String(Math.round(valueRaw)),
              answerType: "number"
            };
          } else {
            const decimalPlaces = Math.max(0, mantissaDecimals - exp);
            const answerStr = valueRaw.toFixed(decimalPlaces).replace(".", ",");
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: answerStr,
              answerType: "decimal",
              decimalPlaces
            };
          }
        }
      }

      if (difficulty === "hard") {
        if (direction === 0) {
          let number, exponent;
          do {
            const rand = Math.random();
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
          } while (exponent === lastExponent);
          lastExponent = exponent;

          return {
            display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
            answer: exponent.toString(),
            answerType: "number"
          };
        } else {
          let exp, mant, valueRaw;
          do {
            const rand = Math.random();
            if (rand < 0.1667) exp = -5;
            else if (rand < 0.3334) exp = -4;
            else if (rand < 0.5) exp = -3;
            else if (rand < 0.6667) exp = 3;
            else if (rand < 0.8334) exp = 4;
            else exp = 5;
          } while (exp === lastExponent);

          const mantissaDecimals = 3;
          mant = getRandomMantissa(mantissaDecimals);
          valueRaw = mant * Math.pow(10, exp);
          lastExponent = exp;
          const mantStr = ("" + mant).replace(".", ",");

          if (isEffectivelyInteger(valueRaw)) {
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: String(Math.round(valueRaw)),
              answerType: "number"
            };
          } else {
            const decimalPlaces = Math.max(0, mantissaDecimals - exp);
            const answerStr = valueRaw.toFixed(decimalPlaces).replace(".", ",");
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: answerStr,
              answerType: "decimal",
              decimalPlaces
            };
          }
        }
      }

      return {
        display: "Hiba a normál alak generálásában",
        answer: "0",
        answerType: "number"
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
        answer = Math.pow(base, exponent);
        return {
          display: `<b>${base}<sup>${exponent}</sup></b> = <b>${Array(exponent).fill(base).join(' × ')}</b>`,
          answer: String(answer),
          answerType: "number"
        };
      }

      if (difficulty === "medium") {
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
        answer: String(answer),
        answerType: "number"
      };
    }
  },
  {
    name: "Villamos mértékegységek",
    value: "villamos_mertekegysegek",
    generate: (difficulty) => {
      const quantities = {
        easy: [
          { name: "Áramerősség", symbol: "I", unitName: "amper", unitSymbol: "A" },
          { name: "Feszültség", symbol: "U", unitName: "volt", unitSymbol: "V" },
          { name: "Ellenállás", symbol: "R", unitName: "ohm", unitSymbol: "Ω" },
          { name: "Teljesítmény", symbol: "P", unitName: "watt", unitSymbol: "W" }
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

      const selectedQuantities = quantities[difficulty];
      const quantity = selectedQuantities[getRandomInt(0, selectedQuantities.length - 1)];
      const taskType = getRandomInt(0, 4);

      let options = [];
      let correctAnswer;

      const wrongOptions = {
        names: ["Áramerősség", "Feszültség", "Ellenállás", "Elektromos töltés", "Teljesítmény", "Frekvencia", "Energia", "Kapacitás", "Induktivitás", "Mágneses fluxus", "Mágneses fluxussűrűség", "Fázisszög"],
        symbols: ["I", "U", "R", "Q", "P", "f", "E", "C", "L", "Φ", "B", "θ"],
        unitNames: ["amper", "volt", "ohm", "coulomb", "watt", "hertz", "joule", "farad", "henry", "weber", "tesla", "radian"],
        unitSymbols: ["A", "V", "Ω", "C", "W", "Hz", "J", "F", "H", "Wb", "T", "rad"]
      };

      if (taskType === 0) {
        options = [quantity.name];
        const wrongNames = wrongOptions.names.filter(name => name !== quantity.name && selectedQuantities.some(q => q.name === name));
        while (options.length < 3) {
          const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
          if (!options.includes(wrongName)) options.push(wrongName);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(quantity.name) + 1).toString();
        return {
          display: `Mi a neve, ha a jele: <span class="blue-percent">${quantity.symbol}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else if (taskType === 1) {
        options = [quantity.name];
        const wrongNames = wrongOptions.names.filter(name => name !== quantity.name && selectedQuantities.some(q => q.name === name));
        while (options.length < 3) {
          const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
          if (!options.includes(wrongName)) options.push(wrongName);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(quantity.name) + 1).toString();
        const shownUnitName = quantity.unitName.charAt(0).toUpperCase() + quantity.unitName.slice(1);
        return {
          display: `Mi a neve, ha a mértékegysége: <span class="blue-percent">${shownUnitName}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else if (taskType === 2) {
        options = [quantity.symbol];
        const wrongSymbols = wrongOptions.symbols.filter(symbol => symbol !== quantity.symbol && selectedQuantities.some(q => q.symbol === symbol));
        while (options.length < 3) {
          const wrongSymbol = wrongSymbols[getRandomInt(0, wrongSymbols.length - 1)];
          if (!options.includes(wrongSymbol)) options.push(wrongSymbol);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(quantity.symbol) + 1).toString();
        return {
          display: `Mi a jele, ha a neve: <span class="blue-percent">${quantity.name}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else if (taskType === 3) {
        options = [quantity.unitSymbol];
        const wrongUnitSymbols = wrongOptions.unitSymbols.filter(unitSymbol => unitSymbol !== quantity.unitSymbol && selectedQuantities.some(q => q.unitSymbol === unitSymbol));
        while (options.length < 3) {
          const wrongUnitSymbol = wrongUnitSymbols[getRandomInt(0, wrongUnitSymbols.length - 1)];
          if (!options.includes(wrongUnitSymbol)) options.push(wrongUnitSymbol);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(quantity.unitSymbol) + 1).toString();
        return {
          display: `Mi a mértékegysége, ha a neve: <span class="blue-percent">${quantity.name}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else {
        options = [quantity.unitName];
        const wrongUnitNames = wrongOptions.unitNames.filter(unitName => unitName !== quantity.unitName && selectedQuantities.some(q => q.unitName === unitName));
        while (options.length < 3) {
          const wrongUnitName = wrongUnitNames[getRandomInt(0, wrongUnitNames.length - 1)];
          if (!options.includes(wrongUnitName)) options.push(wrongUnitName);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(quantity.unitName) + 1).toString();
        return {
          display: `Mi a mértékegység neve, ha a jele: <span class="blue-percent">${quantity.unitSymbol}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      }
    }
  },
  {
    name: "Mértékegység előtagok",
    value: "mertekegyseg_elotagok",
    generate: (difficulty) => {
      const prefixes = {
        easy: [
          { name: "deci", symbol: "d", multiplier: "10^-1", fullName: "tized rész" },
          { name: "centi", symbol: "c", multiplier: "10^-2", fullName: "század rész" },
          { name: "milli", symbol: "m", multiplier: "10^-3", fullName: "ezredik rész" },
          { name: "kilo", symbol: "k", multiplier: "10^3", fullName: "ezerszeres" }
        ],
        medium: [
          { name: "deci", symbol: "d", multiplier: "10^-1", fullName: "tized rész" },
          { name: "centi", symbol: "c", multiplier: "10^-2", fullName: "század rész" },
          { name: "mikro", symbol: "µ", multiplier: "10^-6", fullName: "milliomod rész" },
          { name: "milli", symbol: "m", multiplier: "10^-3", fullName: "ezredik rész" },
          { name: "kilo", symbol: "k", multiplier: "10^3", fullName: "ezerszeres" },
          { name: "mega", symbol: "M", multiplier: "10^6", fullName: "milliószoros" }
        ],
        hard: [
          { name: "deci", symbol: "d", multiplier: "10^-1", fullName: "tized rész" },
          { name: "centi", symbol: "c", multiplier: "10^-2", fullName: "század rész" },
          { name: "nano", symbol: "n", multiplier: "10^-9", fullName: "milliárdod rész" },
          { name: "mikro", symbol: "µ", multiplier: "10^-6", fullName: "milliomod rész" },
          { name: "milli", symbol: "m", multiplier: "10^-3", fullName: "ezredik rész" },
          { name: "kilo", symbol: "k", multiplier: "10^3", fullName: "ezerszeres" },
          { name: "mega", symbol: "M", multiplier: "10^6", fullName: "milliószoros" },
          { name: "giga", symbol: "G", multiplier: "10^9", fullName: "milliárdszoros" },
          { name: "tera", symbol: "T", multiplier: "10^12", fullName: "billiomodszoros" }
        ]
      };

      const selectedPrefixes = prefixes[difficulty];
      const prefix = selectedPrefixes[getRandomInt(0, selectedPrefixes.length - 1)];
      const taskType = getRandomInt(0, 4);

      const wrongOptions = {
        names: ["deci", "centi", "nano", "mikro", "milli", "kilo", "mega", "giga", "tera"],
        symbols: ["d", "c", "n", "µ", "m", "k", "M", "G", "T"],
        multipliers: ["10^-1", "10^-2", "10^-9", "10^-6", "10^-3", "10^3", "10^6", "10^9", "10^12"],
        fullNames: ["tized rész", "század rész", "milliárdod rész", "milliomod rész", "ezredik rész", "ezerszeres", "milliószoros", "milliárdszoros", "billiomodszoros"]
      };

      const formatMultiplier = (multiplier) => multiplier.replace(/10\^(-?\d+)/, "10<sup>$1</sup>");

      let options = [];
      let correctAnswer;

      if (taskType === 0) {
        options = [prefix.name];
        const wrongNames = wrongOptions.names.filter(name => name !== prefix.name && selectedPrefixes.some(p => p.name === name));
        while (options.length < 3) {
          const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
          if (!options.includes(wrongName)) options.push(wrongName);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(prefix.name) + 1).toString();
        return {
          display: `Mi a neve, ha a jele: <span class="blue-percent">${prefix.symbol}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${options[0]}<br>2.&nbsp;&nbsp;&nbsp;${options[1]}<br>3.&nbsp;&nbsp;&nbsp;${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else if (taskType === 1) {
        options = [prefix.symbol];
        const wrongSymbols = wrongOptions.symbols.filter(symbol => symbol !== prefix.symbol && selectedPrefixes.some(p => p.symbol === symbol));
        while (options.length < 3) {
          const wrongSymbol = wrongSymbols[getRandomInt(0, wrongSymbols.length - 1)];
          if (!options.includes(wrongSymbol)) options.push(wrongSymbol);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(prefix.symbol) + 1).toString();
        return {
          display: `Mi a jele az előtagnak, ha a neve: <span class="blue-percent">${prefix.name}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${options[0]}<br>2.&nbsp;&nbsp;&nbsp;${options[1]}<br>3.&nbsp;&nbsp;&nbsp;${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else if (taskType === 2) {
        options = [prefix.multiplier];
        const wrongMultipliers = wrongOptions.multipliers.filter(multiplier => multiplier !== prefix.multiplier && selectedPrefixes.some(p => p.multiplier === multiplier));
        while (options.length < 3) {
          const wrongMultiplier = wrongMultipliers[getRandomInt(0, wrongMultipliers.length - 1)];
          if (!options.includes(wrongMultiplier)) options.push(wrongMultiplier);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(prefix.multiplier) + 1).toString();
        const formattedOptions = options.map(opt => formatMultiplier(opt));
        return {
          display: `Mi a szorzó értéke, ha a neve: <span class="blue-percent">${prefix.name}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${formattedOptions[0]}<br>2.&nbsp;&nbsp;&nbsp;${formattedOptions[1]}<br>3.&nbsp;&nbsp;&nbsp;${formattedOptions[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else if (taskType === 3) {
        options = [prefix.fullName];
        const wrongFullNames = wrongOptions.fullNames.filter(fullName => fullName !== prefix.fullName && selectedPrefixes.some(p => p.fullName === fullName));
        while (options.length < 3) {
          const wrongFullName = wrongFullNames[getRandomInt(0, wrongFullNames.length - 1)];
          if (!options.includes(wrongFullName)) options.push(wrongFullName);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(prefix.fullName) + 1).toString();
        return {
          display: `Mi a jelentése, ha a neve: <span class="blue-percent">${prefix.name}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${options[0]}<br>2.&nbsp;&nbsp;&nbsp;${options[1]}<br>3.&nbsp;&nbsp;&nbsp;${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      } else {
        options = [prefix.name];
        const wrongNames = wrongOptions.names.filter(name => name !== prefix.name && selectedPrefixes.some(p => p.name === name));
        while (options.length < 3) {
          const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
          if (!options.includes(wrongName)) options.push(wrongName);
        }
        options = shuffleArray(options);
        correctAnswer = (options.indexOf(prefix.name) + 1).toString();
        return {
          display: `Mi a neve, ha a szorzó értéke: <span class="blue-percent">${formatMultiplier(prefix.multiplier)}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${options[0]}<br>2.&nbsp;&nbsp;&nbsp;${options[1]}<br>3.&nbsp;&nbsp;&nbsp;${options[2]}`,
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
        'mA': 'A', 'Ω': 'kΩ', 'kΩ': 'MΩ', 'mΩ': 'Ω', 'A': 'kA',
        'µA': 'mA', 'mV': 'V', 'V': 'kV', 'kV': 'MV', 'µV': 'mV',
        'mW': 'W', 'W': 'kW', 'kW': 'MW', 'pF': 'nF', 'nF': 'µF',
        'µF': 'mF', 'Hz': 'kHz', 'kHz': 'MHz', 'MHz': 'GHz'
      };

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

      const rawValue = Number((getRandomInt(Math.floor(minVal), Math.floor(maxVal)) + Math.random()).toFixed(5));
      let decimalPlaces = 0;
      if (difficulty === "easy") decimalPlaces = 0;
      else if (difficulty === "medium") decimalPlaces = getRandomInt(1, 2);
      else decimalPlaces = getRandomInt(1, 3);

      const displayedValue = displayNumber(rawValue, decimalPlaces);

      if (difficulty === "hard" && conversionPairs[unit]) {
        const targetUnit = conversionPairs[unit];
        const convertedValue = displayedValue / 1000;
        const roundedStr = decimalPlaces === 0 ? String(Math.round(convertedValue)) : convertedValue.toFixed(decimalPlaces);

        return {
          display: `<b>${rawValue.toFixed(3)} ${unit}</b> átváltva és kerekítve ${decimalPlaces} tizedesjegyre ${targetUnit}-ban = ? <span class="blue-percent">${targetUnit}</span>`,
          answer: roundedStr,
          answerType: decimalPlaces === 0 ? "number" : "decimal",
          decimalPlaces
        };
      }

      const roundedStr = decimalPlaces === 0 ? String(Math.round(displayedValue)) : displayedValue.toFixed(decimalPlaces);
      const answerType = decimalPlaces === 0 ? "number" : "decimal";
      const options = answerType === "decimal" ? generateOptions(Number(roundedStr), "decimal", difficulty, unit, decimalPlaces) : [];

      return {
        display: `<b>${rawValue.toFixed(3)} ${unit}</b> kerekítve ${decimalPlaces === 0 ? 'egészre' : `${decimalPlaces} tizedesjegyre`} = ? <span class="blue-percent">${unit}</span>`,
        answer: roundedStr,
        answerType,
        decimalPlaces,
        options
      };
    }
  },
  {
    name: "Ohm-törvény",
    value: "ohm_torveny",
    generate: (difficulty) => {
      if (difficulty === "easy") {
        const maxI = 10;
        const maxR = 100;
        const maxU = 100;
        let U, R, I, type, answer, display, answerType = "number", unit;
        type = getRandomInt(0, 2);
        const randomOrder = Math.random() < 0.5;

        if (type === 0) {
          I = getRandomInt(1, maxI);
          R = getRandomInt(1, maxR);
          U = I * R;
          answer = String(U);
          unit = "V";
          display = randomOrder
            ? `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>R = ${R} <span class="blue-percent">Ω</span></b>?`
            : `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>R = ${R} <span class="blue-percent">Ω</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`;
        } else if (type === 1) {
          U = getRandomInt(1, maxU);
          R = getRandomInt(1, maxR);
          I = Math.round(U / R);
          if (I === 0) I = 1;
          U = I * R;
          answer = String(I);
          unit = "A";
          display = randomOrder
            ? `Mennyi az áram (<span class="blue-percent">A</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>R = ${R} <span class="blue-percent">Ω</span></b>?`
            : `Mennyi az áram (<span class="blue-percent">A</span>-ban), ha <b>R = ${R} <span class="blue-percent">Ω</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        } else {
          I = getRandomInt(1, maxI);
          U = getRandomInt(1, maxU);
          R = Math.round(U / I);
          if (R === 0) R = 1;
          U = I * R;
          answer = String(R);
          unit = "Ω";
          display = randomOrder
            ? `Mennyi az ellenállás (<span class="blue-percent">Ω</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
            : `Mennyi az ellenállás (<span class="blue-percent">Ω</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        }

        return {
          display,
          answer,
          answerType,
          options: generateOptions(Number(answer), answerType, difficulty, unit),
          unit
        };
      }

      if (difficulty === "medium") {
        const maxI = 20;
        const maxR = 1000;
        const maxU = 1000;
        const precision = 2;
        let type, answer, display, answerType = "decimal", unit;
        type = getRandomInt(0, 2);
        const randomOrder = Math.random() < 0.5;

        let I_mA, I, R_kOhm, R, U;

        if (type === 0) {
          I_mA = Number((getRandomInt(1, maxI) + Math.random()).toFixed(1));
          I = I_mA / 1000;
          R_kOhm = Number((getRandomInt(10, maxR) / 1000).toFixed(2));
          R = R_kOhm * 1000;
          U = I * R;
          answer = Number(U.toFixed(precision)).toString();
          unit = "V";
          display = randomOrder
            ? `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>I = ${I_mA} <span class="blue-percent">mA</span></b> és <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b>?`
            : `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b> és <b>I = ${I_mA} <span class="blue-percent">mA</span></b>?`;
        } else if (type === 1) {
          U = Number(getRandomInt(100, maxU).toFixed(0));
          R_kOhm = Number((getRandomInt(10, maxR) / 1000).toFixed(2));
          R = R_kOhm * 1000;
          I = U / R;
          I_mA = Number((I * 1000).toFixed(precision));
          answer = I_mA.toString();
          unit = "mA";
          display = randomOrder
            ? `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b>?`
            : `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        } else {
          U = Number(getRandomInt(100, maxU).toFixed(0));
          I_mA = Number((getRandomInt(1, maxI) + Math.random()).toFixed(1));
          I = I_mA / 1000;
          R = U / I;
          R_kOhm = Number((R / 1000).toFixed(precision));
          answer = R_kOhm.toString();
          unit = "kΩ";
          display = randomOrder
            ? `Mennyi az ellenállás (<span class="blue-percent">kΩ</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I_mA} <span class="blue-percent">mA</span></b>?`
            : `Mennyi az ellenállás (<span class="blue-percent">kΩ</span>-ban), ha <b>I = ${I_mA} <span class="blue-percent">mA</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
        }

        return {
          display,
          answer,
          answerType,
          options: [],
          unit
        };
      }

      const maxI = 50;
      const maxR = 10000;
      const maxU = 5000;
      const precision = 5;
      let U_kV, R_MOhm, I_mA, type, answer, display, answerType = "decimal", unit;
      type = getRandomInt(0, 2);
      const randomOrder = Math.random() < 0.5;

      if (type === 0) {
        const exponentI = getRandomInt(0, 2);
        const mantissaI = Number((getRandomInt(10, 50) / 10).toFixed(1));
        I_mA = mantissaI * Math.pow(10, exponentI);
        const I = I_mA / 1000;

        const exponentR = getRandomInt(0, 2);
        const mantissaR = Number((getRandomInt(10, 50) / 10).toFixed(1));
        R_MOhm = mantissaR * Math.pow(10, exponentR);
        const R = R_MOhm * 1000000;
        const U = I * R;

        U_kV = Number((U / 1000).toFixed(precision));
        answer = U_kV.toString();
        unit = "kV";
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>I = ${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span></b> és <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b> és <b>I = ${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span></b>?`;
      } else if (type === 1) {
        const exponentU = getRandomInt(0, 2);
        const mantissaU = Number((getRandomInt(10, 50) / 10).toFixed(1));
        U_kV = mantissaU * Math.pow(10, exponentU);
        const U = U_kV * 1000;

        const exponentR = getRandomInt(0, 2);
        const mantissaR = Number((getRandomInt(10, 50) / 10).toFixed(1));
        R_MOhm = mantissaR * Math.pow(10, exponentR);
        const R = R_MOhm * 1000000;

        const I = U / R;
        I_mA = Number((I * 1000).toFixed(precision));
        answer = I_mA.toString();
        unit = "mA";
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>U = ${mantissaU} × 10<sup>${exponentU}</sup> <span class="blue-percent">kV</span></b> és <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b> és <b>U = ${mantissaU} × 10<sup>${exponentU}</sup> <span class="blue-percent">kV</span></b>?`;
      } else {
        const exponentU = getRandomInt(0, 2);
        const mantissaU = Number((getRandomInt(10, 50) / 10).toFixed(1));
        U_kV = mantissaU * Math.pow(10, exponentU);
        const U = U_kV * 1000;

        const exponentI = getRandomInt(0, 2);
        const mantissaI = Number((getRandomInt(10, 50) / 10).toFixed(1));
        I_mA = mantissaI * Math.pow(10, exponentI);
        const I = I_mA / 1000;

        const R = U / I;
        R_MOhm = Number((R / 1000000).toFixed(precision));
        answer = R_MOhm.toString();
        unit = "MΩ";
        display = randomOrder
          ? `Mennyi az ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>U = ${mantissaU} × 10<sup>${exponentU}</sup> <span class="blue-percent">kV</span></b> és <b>I = ${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span></b>?`
          : `Mennyi az ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>I = ${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span></b> és <b>U = ${mantissaU} × 10<sup>${exponentU}</sup> <span class="blue-percent">kV</span></b>?`;
      }

      return {
        display,
        answer,
        answerType,
        options: [],
        unit
      };
    }
  },
  {
    name: "Teljesítmény számolás",
    value: "teljesitmeny",
    generate: (difficulty) => {
      const ranges = {
        easy: { maxP: 100, maxU: 24, maxI: 10 },
        medium: { maxP: 1000, maxU: 120, maxI: 2 },
        hard: { maxP: 10000, maxU: 10000, maxI: 10000 }
      };
      const { maxP, maxU, maxI } = ranges[difficulty];
      const taskType = getRandomInt(0, 2);
      let display, answer, answerType, unit, P, U, I;
      const randomOrder = Math.random() < 0.5;

      function toScientificNotation(value) {
        if (value === 0) return "0";
        const absValue = Math.abs(value);
        const exponent = Math.floor(Math.log10(absValue));
        const mantissa = Number((absValue / Math.pow(10, exponent)).toFixed(2));
        return `${mantissa} × 10<sup>${exponent}</sup>`;
      }

      if (taskType === 0) {
        if (difficulty === "easy") {
          U = getRandomInt(5, maxU);
          I = getRandomInt(1, maxI);
          P = U * I;
          const formatted = formatNumber(P, 'W', difficulty);
          display = randomOrder
            ? `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
            : `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
          answer = String(formatted.value);
          answerType = Number.isInteger(P) ? "number" : "decimal";
          unit = formatted.unit;
        } else if (difficulty === "medium") {
          U = getRandomInt(10, maxU);
          I = Number((Math.random() * (maxI - 0.1) + 0.1).toFixed(3));
          P = U * I;
          const formatted = formatNumber(P / 1000, 'kW', difficulty);
          display = randomOrder
            ? `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
            : `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
          answer = String(displayNumber(formatted.value, 2));
          answerType = "decimal";
          unit = formatted.unit;
        } else {
          U = getRandomInt(1000, maxU);
          I = getRandomInt(1000, maxI);
          P = U * (I / 1000);
          const formatted = formatNumber(P / 1000, 'kW', difficulty);
          const U_scientific = toScientificNotation(U / 1000);
          const I_scientific = toScientificNotation(I);
          display = randomOrder
            ? `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U_scientific} <span class="blue-percent">kV</span></b> és <b>I = ${I_scientific} <span class="blue-percent">mA</span></b>?`
            : `Mennyi a teljesítmény (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I_scientific} <span class="blue-percent">mA</span></b> és <b>U = ${U_scientific} <span class="blue-percent">kV</span></b>?`;
          answer = String(displayNumber(formatted.value, 2));
          answerType = "decimal";
          unit = formatted.unit;
        }
      } else if (taskType === 1) {
        if (difficulty === "easy") {
          P = getRandomInt(10, maxP);
          I = getRandomInt(1, maxI);
          U = P / I;
          const formatted = formatNumber(U, 'V', difficulty);
          display = randomOrder
            ? `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
            : `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
          answer = String(formatted.value);
          answerType = Number.isInteger(U) ? "number" : "decimal";
          unit = formatted.unit;
        } else if (difficulty === "medium") {
          P = getRandomInt(100, maxP);
          I = Number((Math.random() * (maxI - 0.1) + 0.1).toFixed(3));
          U = P / I;
          const formatted = formatNumber(U / 1000, 'kV', difficulty);
          display = randomOrder
            ? `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
            : `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
          answer = String(displayNumber(formatted.value, 2));
          answerType = "decimal";
          unit = formatted.unit;
        } else {
          P = getRandomInt(1000, maxP);
          I = getRandomInt(1000, maxI);
          U = (P / 1000) / (I / 1000);
          const formatted = formatNumber(U, 'kV', difficulty);
          const P_scientific = toScientificNotation(P / 1000);
          const I_scientific = toScientificNotation(I);
          display = randomOrder
            ? `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P_scientific} <span class="blue-percent">kW</span></b> és <b>I = ${I_scientific} <span class="blue-percent">mA</span></b>?`
            : `Mennyi a feszültség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>I = ${I_scientific} <span class="blue-percent">mA</span></b> és <b>P = ${P_scientific} <span class="blue-percent">kW</span></b>?`;
          answer = String(displayNumber(formatted.value, 2));
          answerType = "decimal";
          unit = formatted.unit;
        }
      } else {
        if (difficulty === "easy") {
          P = getRandomInt(10, maxP);
          U = getRandomInt(5, maxU);
          I = P / U;
          const formatted = formatNumber(I, 'A', difficulty);
          display = randomOrder
            ? `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`
            : `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
          answer = String(formatted.value);
          answerType = Number.isInteger(I) ? "number" : "decimal";
          unit = formatted.unit;
        } else if (difficulty === "medium") {
          P = getRandomInt(100, maxP);
          U = getRandomInt(10, maxU);
          I = P / U;
          const formatted = formatNumber(I * 1000, 'mA', difficulty);
          display = randomOrder
            ? `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P} <span class="blue-percent">W</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`
            : `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>P = ${P} <span class="blue-percent">W</span></b>?`;
          answer = String(displayNumber(formatted.value, 2));
          answerType = "decimal";
          unit = formatted.unit;
        } else {
          P = getRandomInt(1000, maxP);
          U = getRandomInt(1000, maxU);
          I = (P / 1000) / (U / 1000);
          const formatted = formatNumber(I * 1000, 'mA', difficulty);
          const P_scientific = toScientificNotation(P / 1000);
          const U_scientific = toScientificNotation(U / 1000);
          display = randomOrder
            ? `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>P = ${P_scientific} <span class="blue-percent">kW</span></b> és <b>U = ${U_scientific} <span class="blue-percent">kV</span></b>?`
            : `Mennyi az áramerősség (<span class="blue-percent">${formatted.unit}</span>-ban), ha <b>U = ${U_scientific} <span class="blue-percent">kV</span></b> és <b>P = ${P_scientific} <span class="blue-percent">kW</span></b>?`;
          answer = String(displayNumber(formatted.value, 2));
          answerType = "decimal";
          unit = formatted.unit;
        }
      }

      const options = answerType === "decimal" ? generateOptions(Number(answer), "decimal", difficulty, unit) : [];
      return {
        display,
        answer,
        answerType,
        options,
        unit,
        P,
        U,
        I
      };
    }
  },
  {
    name: "Előtét ellenállás méretezés",
    value: "elotet_ellenallas",
    generate: (difficulty) => {
      const ranges = {
        easy: {
          maxU_forrás: 24,
          minU_forrás: 5,
          maxU_fogyasztó: 12,
          minU_fogyasztó: 1,
          maxI: 100,
          minI: 10
        },
        medium: {
          maxU_forrás: 120,
          minU_forrás: 24,
          maxU_fogyasztó: 100,
          minU_fogyasztó: 12,
          maxI: 2,
          minI: 0.1
        },
        hard: {
          maxU_forrás: 10000,
          minU_forrás: 100,
          maxU_fogyasztó: 9000,
          minU_fogyasztó: 50,
          maxI: 10000,
          minI: 1
        }
      };

      const { maxU_forrás, minU_forrás, maxU_fogyasztó, minU_fogyasztó, maxI, minI } = ranges[difficulty];
      const precision = difficulty === "easy" ? 0 : difficulty === "medium" ? 2 : 3;
      let display, answer, answerType, unit;

      let U_forrás = difficulty === "easy" || difficulty === "medium"
        ? getRandomInt(minU_forrás, maxU_forrás)
        : Number((minU_forrás + Math.random() * (maxU_forrás - minU_forrás)).toFixed(2));

      let U_fogyasztó = difficulty === "easy"
        ? getRandomInt(minU_fogyasztó, Math.min(U_forrás - 1, maxU_fogyasztó))
        : difficulty === "medium"
          ? getRandomInt(minU_fogyasztó, Math.min(U_forrás - 10, maxU_fogyasztó))
          : Number((minU_fogyasztó + Math.random() * (Math.min(U_forrás - 10, maxU_fogyasztó) - minU_fogyasztó)).toFixed(2));

      let I = difficulty === "easy"
        ? getRandomInt(minI, maxI)
        : difficulty === "medium"
          ? Number((minI + Math.random() * (maxI - minI)).toFixed(3))
          : getRandomInt(minI, maxI);

      let I_A = difficulty === "easy" ? I / 1000 : difficulty === "medium" ? I : I / 1000;

      let R_s = (U_forrás - U_fogyasztó) / I_A;

      if (R_s <= 0 || isNaN(R_s)) {
        U_fogyasztó = Math.max(minU_fogyasztó, U_forrás - (difficulty === "easy" ? 1 : 10));
        R_s = (U_forrás - U_fogyasztó) / I_A;
      }

      const formatted = formatNumber(R_s, 'Ω', difficulty);
      let displayAnswer = Number(formatted.value.toFixed(precision));
      answer = String(displayAnswer);
      unit = formatted.unit;

      if (difficulty === "medium") {
        unit = "kΩ";
        answer = String(displayNumber(R_s / 1000, precision));
      }

      if (difficulty === "hard" && unit === "Ω") {
        unit = "MΩ";
        answer = String(displayNumber(R_s / 1000000, precision));
      }

      let display_U_forrás, display_U_fogyasztó, display_I;
      if (difficulty === "hard") {
        const U_forrás_kV = Number((U_forrás / 1000).toFixed(3));
        const U_fogyasztó_kV = Number((U_fogyasztó / 1000).toFixed(3));
        const I_mA = Number(I.toFixed(1));
        const exponentU_forrás = Math.floor(Math.log10(Math.abs(U_forrás_kV)));
        const mantissaU_forrás = Number((U_forrás_kV / Math.pow(10, exponentU_forrás)).toFixed(1));
        const exponentU_fogyasztó = Math.floor(Math.log10(Math.abs(U_fogyasztó_kV)));
        const mantissaU_fogyasztó = Number((U_fogyasztó_kV / Math.pow(10, exponentU_fogyasztó)).toFixed(1));
        const exponentI = Math.floor(Math.log10(Math.abs(I_mA)));
        const mantissaI = Number((I_mA / Math.pow(10, exponentI)).toFixed(1));
        display_U_forrás = `${mantissaU_forrás} × 10<sup>${exponentU_forrás}</sup>`;
        display_U_fogyasztó = `${mantissaU_fogyasztó} × 10<sup>${exponentU_fogyasztó}</sup>`;
        display_I = `${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span>`;
      } else {
        display_U_forrás = U_forrás;
        display_U_fogyasztó = U_fogyasztó;
        display_I = difficulty === "easy"
          ? `${I} <span class="blue-percent">mA</span>`
          : `${I} <span class="blue-percent">A</span>`;
      }

      const order = ["U_forrás", "U_fogyasztó", "I"].sort(() => Math.random() - 0.5);
      const displayParts = [];
      order.forEach(param => {
        if (param === "U_forrás") displayParts.push(`a forrásfeszültség <b>${display_U_forrás} <span class="blue-percent">${difficulty === "hard" ? "kV" : "V"}</span></b>`);
        if (param === "U_fogyasztó") displayParts.push(`a fogyasztó feszültsége <b>${display_U_fogyasztó} <span class="blue-percent">${difficulty === "hard" ? "kV" : "V"}</span></b>`);
        if (param === "I") displayParts.push(`az áram <b>${display_I}</b>`);
      });

      display = `Mennyi az előtét ellenállás (<span class="blue-percent">${unit}</span>-ban), ha ${displayParts.join(", ")}?`;

      answerType = precision === 0 ? "number" : "decimal";

      return {
        display,
        answer,
        answerType,
        options: generateOptions(Number(answer), answerType, difficulty, unit),
        unit,
        U_forrás,
        U_fogyasztó,
        I: I_A
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
          let unitName = (i < 2 && Math.random() < 0.5) ? 'kΩ' : 'Ω';
          if (unitName === 'kΩ') {
            resistance = resistance / 1000;
            resistance = Math.round(resistance * 100) / 100;
          } else {
            resistance = Math.round(resistance);
          }
          resistors.push(resistance);
          units.push(unitName);
          displayResistors.push(`<b>R${i + 1} = ${resistance} <span class="blue-percent">${unitName}</span></b>`);
        }
        const resistorsInOhms = resistors.map((r, i) => units[i] === 'kΩ' ? r * 1000 : r);
        let R_eredo = resistorsInOhms.reduce((sum, r) => sum + r, 0);
        const formatted = formatNumber(R_eredo, 'Ω', difficulty);
        answer = String(Math.round(formatted.value));
        unit = formatted.unit;
        answerType = "number";
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">${unit}</span>-ban), ha az ellenállások sorosan vannak kapcsolva: ${displayResistors.join(', ')}?`;
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
        R_eredo = Math.round(R_eredo * 100) / 100;
        unit = 'kΩ';
        answer = (R_eredo / 1000).toFixed(2);
        answerType = "decimal";
        display = `Mennyi az eredő ellenállás (<span class="blue-percent">${unit}</span>-ban), ha az ellenállások párhuzamosan vannak kapcsolva: ${displayResistors.join(', ')}?`;
      } else {
        const type = getRandomInt(0, 6);
        const numResistors = [0, 1, 2].includes(type) ? 3 : type === 3 || type === 5 ? 2 : 3;
        for (let i = 0; i < numResistors; i++) {
          let resistance = getE12Resistance(minR, maxR) / 1000;
          resistance = Math.round(resistance * 100) / 100;
          resistors.push(resistance);
          const exponent = Math.floor(Math.log10(Math.abs(resistance)));
          const mantissa = Number((resistance / Math.pow(10, exponent)).toFixed(2));
          displayResistors.push(`${mantissa} × 10<sup>${exponent}</sup>`);
        }
        let R_eredo;
        if (type === 0) {
          R_eredo = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]) + resistors[2];
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b>?`;
        } else if (type === 1) {
          R_eredo = resistors[0] + (resistors[1] * resistors[2]) / (resistors[1] + resistors[2]);
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b>?`;
        } else if (type === 2) {
          const R_series = resistors[0] + resistors[1];
          R_eredo = (R_series * resistors[2]) / (R_series + resistors[2]);
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b>?`;
        } else if (type === 3) {
          R_eredo = resistors[0] + resistors[1];
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b>?`;
        } else if (type === 4) {
          R_eredo = resistors[0] + resistors[1] + resistors[2];
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b>, <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b>?`;
        } else if (type === 5) {
          R_eredo = (resistors[0] * resistors[1]) / (resistors[0] + resistors[1]);
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b> és <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b>?`;
        } else {
          R_eredo = 1 / (1 / resistors[0] + 1 / resistors[1] + 1 / resistors[2]);
          display = `Mennyi az eredő ellenállás (<span class="blue-percent">MΩ</span>-ban), ha <b>R₁ = ${displayResistors[0]} <span class="blue-percent">kΩ</span></b>, <b>R₂ = ${displayResistors[1]} <span class="blue-percent">kΩ</span></b> és <b>R₃ = ${displayResistors[2]} <span class="blue-percent">kΩ</span></b>?`;
        }

        R_eredo = Math.round(R_eredo * 100) / 100;
        unit = 'MΩ';
        answer = (R_eredo / 1000).toFixed(2);
        answerType = "decimal";
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
const numpadContainer = document.getElementById("numpad-container");

// -- KATEGÓRIÁK BETÖLTÉSE --
function loadCategories() {
  categorySelect.innerHTML = taskTypes.map(task => `<option value="${task.value}">${task.name}</option>`).join("");
}

// -- ÁLLAPOTVÁLTOZÓK --
let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null, wrongAnswers: Infinity };
let gameActive = false;
let wrongAnswers = 0;
let lastDirection = null;
let lastExponent = null;

// -- UTOLSÓ KIVÁLASZTÁS MENTÉSE --
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

// -- BEST / HISTORY --
function loadBest() {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  try {
    const bestRaw = localStorage.getItem("vilma-best-" + cat + "-" + diff);
    if (bestRaw) {
      best = JSON.parse(bestRaw);
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

  let currentBest;
  try {
    const raw = localStorage.getItem("vilma-best-" + cat + "-" + diff);
    currentBest = raw ? JSON.parse(raw) : { score: 0, time: null, wrongAnswers: Infinity };
    if (currentBest.wrongAnswers === undefined) currentBest.wrongAnswers = Infinity;
  } catch {
    currentBest = { score: 0, time: null, wrongAnswers: Infinity };
  }

  const newWrongAnswers = wrongAnswers !== undefined ? wrongAnswers : 0;
  const isBetterAnswers = newWrongAnswers < currentBest.wrongAnswers;
  const isSameAnswersBetterTime = (newWrongAnswers === currentBest.wrongAnswers) && (currentBest.time === null || time < currentBest.time);

  if (isBetterAnswers || isSameAnswersBetterTime) {
    best = { score: newScore, time: time, wrongAnswers: newWrongAnswers };
    localStorage.setItem("vilma-best-" + cat + "-" + diff, JSON.stringify(best));
  }

  showBest();
}

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

    hist.unshift({
      score: Number(scoreValue),
      time: Number(timeSeconds),
      wrong: Number(wrong || 0),
      ts: Date.now()
    });

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
    return [];
  }
}

function computeAvgStats(hist, n) {
  if (!Array.isArray(hist) || hist.length < n) return null;
  const slice = hist.slice(0, n);
  const totalTime = slice.reduce((acc, item) => acc + (Number(item.time) || 0), 0);
  const totalWrong = slice.reduce((acc, item) => acc + (Number(item.wrong) || 0), 0);
  return {
    avgTime: Math.round(totalTime / slice.length),
    avgWrong: (totalWrong / slice.length).toFixed(1)
  };
}

function getAveragesHTML() {
  const cat = categorySelect.value;
  const diff = difficultySelect.value;
  const hist = loadHistory(cat, diff, 50);
  const u3 = computeAvgStats(hist, 3);

  const fmt = (stats) => {
    if (!stats) return '<span style="opacity:0.6; font-size:0.9em;">-</span>';
    const color = stats.avgWrong == 0 ? "#27ae60" : (stats.avgWrong > 2 ? "#c0392b" : "#7f8c8d");
    return `<b>${stats.avgTime} mp</b> <span style="font-size:0.85em; color:${color};">(${stats.avgWrong} hiba)</span>`;
  };

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

function showBest() {
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

  let averagesHTML = "";
  try {
    averagesHTML = getAveragesHTML();
  } catch {
    averagesHTML = "";
  }

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

  const clearBestBtn = document.getElementById("clear-best-btn");
  if (clearBestBtn) clearBestBtn.onclick = () => clearBestForCurrent();

  const clearHistoryBtn = document.getElementById("clear-history-btn");
  if (clearHistoryBtn) clearHistoryBtn.onclick = () => clearHistoryForCurrent();
}

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

  localStorage.removeItem(key);
  best = { score: 0, time: null, wrongAnswers: Infinity };
  showBest();
}

function clearHistoryForCurrent() {
  const cat = categorySelect.value;
  const diff = difficultySelect.value;
  const key = getHistoryKey(cat, diff);

  if (!localStorage.getItem(key)) {
    alert("Nincs mentett history ezen a kategórián és nehézségben.");
    return;
  }

  const ok = confirm(`Biztosan törlöd az összes history bejegyzést a kategóriához: "${categoryLabel()}", nehézséghez: "${difficultyLabel()}"?`);
  if (!ok) return;

  localStorage.removeItem(key);
  showBest();
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

// --- ZÁRÓJELES KIFEJEZÉSEK ---
function generateBracketedExpression(opCount, min, max) {
  const opList = ["+", "-", "•", ":"];
  let elements, exprParts, displayExpr, answer;
  let maxTries = 100;
  let tryCount = 0;

  do {
    elements = [];
    for (let i = 0; i < opCount + opCount + 1; i++) {
      if (i % 2 === 0) {
        elements.push(getRandomInt(min, max));
      } else {
        const op = opList[getRandomInt(0, opList.length - 1)];
        elements.push(op);
        if (op === ":") {
          elements[i - 1] = elements[i - 1] * getRandomInt(1, 10);
        }
      }
    }

    let possibleParenRanges = [];
    for (let i = 0; i < elements.length - 2; i += 2) {
      possibleParenRanges.push([i, i + 2]);
    }

    let parenRanges = [];
    let used = Array(elements.length).fill(false);
    const numParens = getRandomInt(1, Math.max(1, Math.floor(opCount / 2)));
    let tries = 0;

    while (parenRanges.length < numParens && tries < 50) {
      const idx = getRandomInt(0, possibleParenRanges.length - 1);
      const [start, end] = possibleParenRanges[idx];
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

    for (const [start, end] of parenRanges) {
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
    let evalExpr = displayExpr.replace(/×/g, '•').replace(/÷/g, ':').replace(/\s/g, '');

    try {
      answer = eval(evalExpr);
    } catch {
      answer = null;
    }

    tryCount++;
  } while (
    (typeof answer !== "number" || !isFinite(answer) || isNaN(answer) || answer !== Math.round(answer)) &&
    tryCount < maxTries
  );

  return {
    display: displayExpr + " =",
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

  window.isGeneratingQuestions = true;

  if (category === "mertekegyseg_atvaltas") {
    questions = taskType.generate(difficulty);
    questions.forEach(task => {
      if (!task.answer || task.answer === "?") {
        task.display = "Hiba: érvénytelen feladat generálódott";
        task.answer = null;
      }
      if (!["number", "decimal", "fraction", "power", "set"].includes(task.answerType)) {
        console.warn(`Ismeretlen answerType: ${task.answerType}`);
        task.answerType = "number";
      }
    });
  } else {
    for (let i = 0; i < QUESTIONS; i++) {
      const task = taskType.generate(difficulty);
      if (!task.answer || task.answer === "?") {
        task.display = "Hiba: érvénytelen feladat generálódott";
        task.answer = null;
      }
      if (!["number", "decimal", "fraction", "power", "set"].includes(task.answerType)) {
        console.warn(`Ismeretlen answerType: ${task.answerType}`);
        task.answerType = "number";
      }
      questions.push(task);
    }
  }

  window.isGeneratingQuestions = false;
}

// --- VÁLASZ KIÉRTÉKELÉS ---
function evaluateExpression(input, correctAnswer, answerType, taskData) {
  if (!input || !correctAnswer) return false;

  let normalizedInput = ("" + input).trim();
  let normalizedCorrect = ("" + correctAnswer).trim();

  function parseMaybeNumber(s) {
    if (typeof s !== "string") return s;
    const t = s.trim();
    if (t === "") return t;
    const asNum = Number(t.replace(",", "."));
    return isNaN(asNum) ? t : asNum;
  }

  if (answerType === "set") {
    function normalizeSet(str) {
      const cleaned = ("" + str).replace(/^\s*\{?\s*/, "").replace(/\s*\}?\s*$/, "").trim();
      if (cleaned === "") return [];
      const parts = cleaned.split(",").map(p => p.trim()).filter(p => p !== "");
      const parsed = parts.map(p => parseMaybeNumber(p));
      const uniq = Array.from(new Set(parsed.map(x => typeof x === "string" ? `s:${x}` : `n:${x}`)))
        .map(key => {
          if (key.startsWith("n:")) return Number(key.slice(2));
          else return key.slice(2);
        });

      const nums = uniq.filter(x => typeof x === "number").sort((a, b) => a - b);
      const strs = uniq.filter(x => typeof x === "string").sort();
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

  try {
    const exprCandidate = normalizedInput.replace(/,/g, ".");
    if (exprCandidate.match(/[\\+\\-\\*\\/\\(\\)]/)) {
      let expression = exprCandidate.replace(/\\s/g, "");
      if (/^[0-9\\.\\+\\-\\*\\/\\(\\)\\s]+$/.test(expression)) {
        let computed;
        try { computed = eval(expression); } catch { computed = NaN; }
        if (!isNaN(computed) && isFinite(computed)) {
          if (!isNaN(Number(normalizedCorrect.replace(",", ".")))) {
            const correctNum = Number(normalizedCorrect.replace(",", "."));
            return Math.abs(computed - correctNum) < 1e-6;
          }
        }
      }
    }
  } catch (err) {
    console.warn("evaluateExpression hiba:", err);
  }

  if (answerType === "fraction") {
    if (normalizedInput.includes("/")) {
      const [userNum, userDen] = normalizedInput.split("/").map(s => Number(s.trim()));
      if (isNaN(userNum) || isNaN(userDen) || userDen === 0) return false;
      const [ansNum, ansDen] = ("" + correctAnswer).split("/").map(s => Number(s.trim()));
      const simplify = (a, b) => {
        const g = (function gcd(x, y) { return y ? gcd(y, x % y) : x; })(Math.abs(a), Math.abs(b));
        return [a / g, b / g];
      };
      const [su, du] = simplify(userNum, userDen);
      const [sa, da] = simplify(ansNum, ansDen);
      return su === sa && du === da;
    } else {
      const [ansNum, ansDen] = ("" + correctAnswer).split("/").map(s => Number(s.trim()));
      const correctValue = ansNum / ansDen;
      const userValue = parseFloat(normalizedInput.replace(",", "."));
      if (isNaN(userValue)) return false;
      return Math.abs(userValue - correctValue) <= 0.005;
    }
  }

  if (answerType === "power") {
    const powerMatchUser = normalizedInput.match(/^([\\d\\.,]+)×10\\^([\\d\\-]+)$/) || normalizedInput.match(/^([\\d\\.,]+)\\*10\\^([\\d\\-]+)$/);
    const powerMatchAns = ("" + correctAnswer).match(/^([\\d\\.]+)×10\\^([\\d\\-]+)$/) || ("" + correctAnswer).match(/^([\\d\\.]+)\\*10\\^([\\d\\-]+)$/);
    if (!powerMatchUser || !powerMatchAns) return false;
    const userCoef = parseFloat(powerMatchUser[1].replace(",", "."));
    const userExp = parseInt(powerMatchUser[2]);
    const ansCoef = parseFloat(powerMatchAns[1].replace(",", "."));
    const ansExp = parseInt(powerMatchAns[2]);
    return Math.abs(userCoef - ansCoef) < 0.01 && userExp === ansExp;
  }

  if (answerType === "number" || answerType === "decimal") {
    const userNum = Number(normalizedInput.replace(",", "."));
    const correctNum = Number(normalizedCorrect.replace(",", "."));
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    const tol = answerType === "decimal" ? 1e-3 : 1e-6;
    return Math.abs(userNum - correctNum) <= tol;
  }

  return normalizedInput.toLowerCase() === normalizedCorrect.toLowerCase();
}

// --- NUMPAD ---
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

          if (currentTask.answerType === 'fraction' && val.includes('/')) {
            const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
            const [userNum, userDen] = val.split('/').map(Number);
            if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
              alert("Érvénytelen tört!");
              startTimerAfterPause(pauseStart);
              return;
            }
            const simplify = (a, b) => {
              const g = (function gcd(x, y) { return y ? gcd(y, x % y) : x; })(Math.abs(a), Math.abs(b));
              return [a / g, b / g];
            };
            const [simpUserNum, simpUserDen] = simplify(userNum, userDen);
            const [simpAnsNum, simpAnsDen] = simplify(ansNum, ansDen);

            if (simpUserNum === simpAnsNum && simpUserDen === simpAnsDen) onCorrectAnswer(pauseStart);
            else { alert(`Nem jó! Helyes: ${currentTask.answer}`); onWrongAnswer(pauseStart); }
            return;
          }

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
            btn.dataset.state = '/';
            btn.textContent = '/';
            btn.dataset.locked = 'true';
          } else {
            if (window.numpadState.lightningActivated) {
              btn.dataset.state = window.numpadState.lightningCurrentSymbol;
              btn.textContent = window.numpadState.lightningCurrentSymbol;
            } else {
              btn.dataset.state = '⚡️';
            }
            btn.dataset.lightningCount = String(window.numpadState.lightningCount);
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
            if (btn.dataset.locked === 'true') {
              answerState.value += '/';
              onChange(answerState.value);
              return;
            }

            let lc = parseInt(btn.dataset.lightningCount || '0') + 1;
            btn.dataset.lightningCount = String(lc);
            window.numpadState.lightningCount = lc;

            if (lc >= 9 && !window.numpadState.lightningActivated) {
              btn.dataset.state = '/';
              btn.textContent = '/';
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
              btn.dataset.state = next;
              btn.textContent = next;
              window.numpadState.lightningCurrentSymbol = next;
            }
          } else {
            if (key === decimalKey) {
              if (mode === 'numeric') {
                if (!answerState.value.includes('.')) answerState.value += '.';
              } else {
                answerState.value += ',';
              }
            } else if (key === ',' && mode === 'numeric') {
              if (!answerState.value.includes('.')) answerState.value += '.';
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
    score++;
    currentQuestion++;
    showQuestion(currentQuestion);

    const pauseDuration = Date.now() - pauseStart;
    startTime += pauseDuration;
    if (timerInterval) clearInterval(timerInterval);

    if (currentQuestion < QUESTIONS) {
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      finishGame();
    }
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
  startBtn.style.display = "";
  bestStats.style.opacity = "1";
  categorySelect.disabled = false;
  difficultySelect.disabled = false;
}

// --- INICIALIZÁLÁS ---
startBtn.onclick = startGame;
loadCategories();
loadLastSelection();
loadBest();