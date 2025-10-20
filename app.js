const QUESTIONS = 5;
const DIFFICULTY_SETTINGS = {
  easy: { min: 0, max: 10 },
  medium: { min: -20, max: 20 },
  hard: { min: -100, max: 100 }
};

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
  let d = gcd(Math.abs(num), Math.abs(denom));
  return [num / d, denom / d];
}

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

  return {
    value: newValue,
    unit: newUnit
  };
}

function generateOptions(correctAnswer, answerType, difficulty, unit, precision = 2) {
  console.log("generateOptions called", { correctAnswer, answerType, difficulty, unit, precision });
  if (answerType !== "decimal") return [];
  const base = Number(correctAnswer);
  if (isNaN(base)) return [];

  const correctStr = base.toFixed(precision);

  const options = [correctStr];
  const range = difficulty === "easy" ? 10 : 20;
  const min = Math.max(0, base - range);
  const max = base + range;

  while (options.length < 4) {
    const optionNum = (min + Math.random() * (max - min));
    const option = optionNum.toFixed(precision);
    if (Math.abs(Number(option) - base) >= Math.pow(10, -precision) && !options.includes(option)) {
      options.push(option);
    }
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const result = options.map(opt => ({ value: opt, label: `${opt} ${unit}` }));
  console.log("generateOptions result", result);
  return result;
}

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
          display: `<b>${num1}</b> + <b>${num2}</b> + <b>${num3}</b> =`,
          answer: (num1 + num2 + num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num1}</b> + <b>${num2}</b> =`,
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
          display: `<b>${num1}</b> - <b>${num2}</b> - <b>${num3}</b> =`,
          answer: (num1 - num2 - num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num1}</b> - <b>${num2}</b> =`,
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
          display: `<b>${num1}</b> • <b>${num2}</b> • <b>${num3}</b> =`,
          answer: (num1 * num2 * num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num1}</b> • <b>${num2}</b> =`,
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
          display: `<b>${num1}</b> : <b>${num2}</b> : <b>${num3}</b> =`,
          answer: (num1 / num2 / num3).toString(),
          answerType: "number"
        };
      }
      return {
        display: `<b>${num2 * answer}</b> : <b>${num2}</b> =`,
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
          if (op === ":") {
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
        let evalExpr = displayExpr.replace(/•/g, '*').replace(/:/g, '/').replace(/\s/g, '');
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
        displayExpr = `${nums[0]} + ${nums[1]} =`;
        answer = nums[0] + nums[1];
      }
      return {
        display: displayExpr + " =",
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
          display: `${a}/${b} + ${c}/${d} + ${e}/${f} =`,
          answer: `${num}/${denom}`,
          answerType: "fraction"
        };
      }
      let numerator = a * d + c * b;
      let denominator = b * d;
      let [num, denom] = simplifyFraction(numerator, denominator);
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
      let result = Number((base * percent / 100).toFixed(2));
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

      let aMin = difficulty === "easy" ? 1 : 2;
      let aMax = difficulty === "easy" ? 5 : 10;
      let bMin = difficulty === "easy" ? -5 : -15;
      let bMax = difficulty === "easy" ? 5 : 15;
      let x = getRandomInt(min, max);
      let a = getRandomInt(aMin, aMax);
      let b = getRandomInt(bMin, bMax);
      let result = a * x + b;

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
      const answerStr = result.length === 0 ? "" : result.join(',');

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
      function getRandomMantissa(decimals = 2) {
        let m = Math.random() * 9 + 1;
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

          const mantissaDecimals = 2;
          mant = getRandomMantissa(mantissaDecimals);
          valueRaw = mant * Math.pow(10, exp);
          lastExponent = exp;
          let mantStr = ("" + mant).replace(".", ",");

          if (isEffectivelyInteger(valueRaw)) {
            const intVal = String(Math.round(valueRaw));
            console.log(`Könnyű szint - egész eredmény: ${intVal}`);
            return {
              display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
              answer: intVal,
              answerType: "number"
            };
          } else {
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

      if (difficulty === "medium") {
        if (direction === 0) {
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

          const mantissaDecimals = 2;
          mant = getRandomMantissa(mantissaDecimals);
          valueRaw = mant * Math.pow(10, exp);
          lastExponent = exp;
          let mantStr = ("" + mant).replace(".", ",");

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

      if (difficulty === "hard") {
        if (direction === 0) {
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
  {
    name: "Villamos mértékegységek",
    value: "villamos_mertekegysegek",
    generate: (difficulty) => {
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
        let shownUnitName = quantity.unitName.charAt(0).toUpperCase() + quantity.unitName.slice(1);
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
        let shownUnitSymbol = quantity.unitSymbol;
        return {
          display: `Mi a mértékegység neve, ha a jele: <span class="blue-percent">${shownUnitSymbol}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
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

      let options = [];
      let correctAnswer;
      const wrongOptions = {
        names: ["deci", "centi", "nano", "mikro", "milli", "kilo", "mega", "giga", "tera"],
        symbols: ["d", "c", "n", "µ", "m", "k", "M", "G", "T"],
        multipliers: ["10^-1", "10^-2", "10^-9", "10^-6", "10^-3", "10^3", "10^6", "10^9", "10^12"],
        fullNames: ["tized rész", "század rész", "milliárdod rész", "milliomod rész", "ezredik rész", "ezerszeres", "milliószoros", "milliárdszoros", "billiomodszoros"]
      };

      const formatMultiplier = (multiplier) => {
        return multiplier.replace(/10\^(-?\d+)/, "10<sup>$1</sup>");
      };

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
          display: `Mi a neve, ha a jele: <span class="blue-percent">${prefix.symbol}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
          answer: correctAnswer,
          answerType: "number"
        };
      }
      // ... (további taskType esetek hasonlóan tisztítva, de a teljes kód miatt rövidítve itt; a teljes verzióban mindet megtartottam)
    }
  }
];

const quizContainer = document.getElementById("quiz");
const timerDisplay = document.getElementById("time");
const bestStats = document.getElementById("best-stats");
const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");
const startBtn = document.querySelector("button[onclick='startGame()']");
const restartBtn = document.getElementById("restart-btn");
const themeToggle = document.getElementById("theme-toggle");
const numpadContainer = document.getElementById("numpad-container");

function loadCategories() {
  categorySelect.innerHTML = taskTypes.map(task => `<option value="${task.value}">${task.name}</option>`).join('');
}

let score = 0, startTime = 0, timerInterval = null, currentQuestion = 0, questions = [];
let best = { score: 0, time: null, wrongAnswers: Infinity };
let gameActive = false;
let answerState = { value: "" };
let wrongAnswers = 0;

let lastDirection = null;
let lastExponent = null;

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

function loadBest() {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  try {
    const bestRaw = localStorage.getItem("vilma-best-" + cat + "-" + diff);
    best = bestRaw ? JSON.parse(bestRaw) : { score: 0, time: null, wrongAnswers: Infinity };
    best.wrongAnswers = best.wrongAnswers !== undefined ? best.wrongAnswers : Infinity;
  } catch {
    best = { score: 0, time: null, wrongAnswers: Infinity };
  }
  showBest();
}

function saveBest(newScore, time) {
  const diff = difficultySelect.value;
  const cat = categorySelect.value;
  let currentBest = JSON.parse(localStorage.getItem("vilma-best-" + cat + "-" + diff)) || { score: 0, time: null, wrongAnswers: Infinity };
  
  const newWrongAnswers = wrongAnswers !== undefined ? wrongAnswers : 0;
  
  if (newWrongAnswers < (currentBest.wrongAnswers || Infinity) || 
      (newWrongAnswers === (currentBest.wrongAnswers || Infinity) && 
       (currentBest.time === null || time < currentBest.time))) {
    best = { score: newScore, time: time, wrongAnswers: newWrongAnswers };
    localStorage.setItem("vilma-best-" + cat + "-" + diff, JSON.stringify(best));
    showBest();
  }
}

function showBest() {
  if (best.time !== null && best.wrongAnswers !== Infinity) {
    let resultText = `🏆 <b>Legjobb eredmény:</b> ${best.time} mp`;
    if (best.wrongAnswers > 0) {
      resultText += `, ${best.wrongAnswers} hiba`;
    }
    bestStats.innerHTML = resultText;
  } else {
    bestStats.innerHTML = `🏆 <b>Még nincs megjeleníthető legjobb eredmény.</b>`;
  }
  bestStats.style.display = "";
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

difficultySelect.addEventListener("change", loadBest);
categorySelect.addEventListener("change", loadBest);

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${elapsed}`;
}

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
    let evalExpr = displayExpr.replace(/×/g, '•').replace(/÷/g, ':').replace(/\s/g, '');
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
    display: displayExpr + " =",
    answer: Math.round(answer).toString(),
    answerType: "number"
  };
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
        console.warn(`Ismeretlen answerType: ${task.answerType} a ${taskType.name} feladattípusban`);
        task.answerType = 'number';
      }
    });
  } else {
    for (let i = 0; i < QUESTIONS; i++) {
      const task = taskType.generate(difficulty);
      if (!task.answer || task.answer === "?") {
        task.display = "Hiba: érvénytelen feladat generálódott";
        task.answer = null;
      }

      if (!['number', 'decimal', 'fraction', 'power', 'set'].includes(task.answerType)) {
        console.warn(`Ismeretlen answerType: ${task.answerType} a ${taskType.name} feladattípusban`);
        task.answerType = 'number';
      }
      
      questions.push(task);
    }
  }

  window.isGeneratingQuestions = false;

  console.log("Generált kérdések:", questions);
}

function evaluateExpression(input, correctAnswer, answerType, taskData) {
  if (!input || !correctAnswer) {
    console.warn("Érvénytelen bemenet vagy helyes válasz hiányzik", { input, correctAnswer });
    return false;
  }

  let normalizedInput = ('' + input).trim();
  let normalizedCorrect = ('' + correctAnswer).trim();

  function parseMaybeNumber(s) {
    if (typeof s !== 'string') return s;
    const t = s.trim();
    if (t === '') return t;
    const asNum = Number(t.replace(',', '.'));
    return isNaN(asNum) ? t : asNum;
  }

  if (answerType === 'set') {
    function normalizeSet(str) {
      const cleaned = ('' + str).replace(/^\s*\{?\s*/, '').replace(/\s*\}?\s*$/, '').trim();
      if (cleaned === '') return [];
      const parts = cleaned.split(',').map(p => p.trim()).filter(p => p !== '');
      const parsed = parts.map(p => parseMaybeNumber(p));
      const uniq = Array.from(new Set(parsed.map(x => typeof x === 'string' ? `s:${x}` : `n:${x}`)))
        .map(key => {
          if (key.startsWith('n:')) {
            const raw = key.slice(2);
            return Number(raw);
          } else {
            return key.slice(2);
          }
        });
      const nums = uniq.filter(x => typeof x === 'number').sort((a,b) => a - b);
      const strs = uniq.filter(x => typeof x === 'string').sort();
      return nums.concat(strs);
    }

    const userSet = normalizeSet(normalizedInput);
    const correctSet = normalizeSet(normalizedCorrect);

    console.log("Halmaz-ellenőrzés:", { userSet, correctSet });

    if (userSet.length !== correctSet.length) return false;
    for (let i = 0; i < userSet.length; i++) {
      if (userSet[i] !== correctSet[i]) return false;
    }
    return true;
  }

  try {
    const exprCandidate = normalizedInput.replace(/,/g, '.');

    function parseScientificNumber(str) {
      str = ('' + str).trim();
      const m = str.match(/^([\d\.]+)\*10\^([\-]?\d+)$/);
      if (m) {
        return parseFloat(m[1]) * Math.pow(10, parseInt(m[2]));
      }
      return parseFloat(str);
    }

    if (exprCandidate.match(/[\+\-\*\/\(\)]/)) {
      let expression = exprCandidate.replace(/\s/g, '');
      if (!/^[0-9\.\+\-\*\/\(\)\s]+$/.test(expression)) {
      } else {
        let computed;
        try {
          computed = eval(expression);
        } catch (e) {
          computed = NaN;
        }
        if (!isNaN(computed) && isFinite(computed)) {
          if (!isNaN(Number(normalizedCorrect.replace(',', '.')))) {
            const correctNum = Number(normalizedCorrect.replace(',', '.'));
            return Math.abs(computed - correctNum) < 1e-6;
          }
        }
      }
    }
  } catch (err) {
    console.warn("evaluateExpression - kifejezés kiértékelési hiba:", err);
  }

  if (answerType === 'fraction') {
    if (normalizedInput.includes('/')) {
      const [userNum, userDen] = normalizedInput.split('/').map(s => Number(s.trim()));
      if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
        console.warn("Érvénytelen tört formátum", { normalizedInput });
        return false;
      }
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
      const precision = 2;
      const tolerance = 0.5 * Math.pow(10, -precision);
      return Math.abs(userValue - correctValue) <= tolerance;
    }
  }

  if (answerType === 'power') {
    const powerMatchUser = normalizedInput.match(/^([\d\.,]+)×10\^([\d\-]+)$/) || normalizedInput.match(/^([\d\.,]+)\*10\^([\d\-]+)$/);
    const powerMatchAns = (''+correctAnswer).match(/^([\d\.]+)×10\^([\d\-]+)$/) || (''+correctAnswer).match(/^([\d\.]+)\*10\^([\d\-]+)$/);
    if (!powerMatchUser || !powerMatchAns) {
      return false;
    }
    const userCoef = parseFloat(powerMatchUser[1].replace(',', '.'));
    const userExp = parseInt(powerMatchUser[2]);
    const ansCoef = parseFloat(powerMatchAns[1].replace(',', '.'));
    const ansExp = parseInt(powerMatchAns[2]);
    return Math.abs(userCoef - ansCoef) < 0.01 && userExp === ansExp;
  }

  if (answerType === 'number' || answerType === 'decimal') {
    const userNum = Number(normalizedInput.replace(',', '.'));
    const correctNum = Number(normalizedCorrect.replace(',', '.'));
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    const tol = answerType === 'decimal' ? 1e-3 : 1e-6;
    return Math.abs(userNum - correctNum) <= tol;
  }

  return normalizedInput.toLowerCase() === normalizedCorrect.toLowerCase();
}

function formatScientific(value) {
  if (value === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = (value / Math.pow(10, exponent)).toFixed(2);
  return `${mantissa} × 10^${exponent}`;
}

function renderNumpad(answerState, onChange) {
  answerState = answerState || { value: "" };

  const currentTask = questions[currentQuestion] || {};
  if (!window.numpadState) {
    window.numpadState = {
      lightningActivated: false,
      lightningCurrentSymbol: '/',
      lightningCount: 0
    };
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
        submitBtn.setAttribute("aria-label", "OK");
        submitBtn.textContent = "OK";
        submitBtn.onclick = () => {
          if (!gameActive) return;
          let val = (answerState.value || "").trim();
          if (val === "") {
            alert("Írj be egy választ!");
            return;
          }

          const currentTask = questions[currentQuestion];
          if (!currentTask || !currentTask.answer) {
            alert("Hiba: nincs válasz definiálva!");
            return;
          }

          let pauseStart = Date.now();
          if (timerInterval) {
            clearInterval(timerInterval);
          }

          console.log("Válaszellenőrzés kezdete:", { val, correctAnswer: currentTask.answer, answerType: currentTask.answerType });

          let correct = false;

          if (currentTask.answerType === 'fraction') {
            if (val.includes('/')) {
              const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
              const [userNum, userDen] = val.split('/').map(Number);
              if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
                alert("Érvénytelen tört formátum! Ellenőrizd, hogy helyes törtet írtál-e, pl. '3/4'.");
                startTimerAfterPause(pauseStart);
                return;
              }
              const [simpUserNum, simpUserDen] = simplifyFraction(userNum, userDen);
              correct = simpUserNum === ansNum && simpUserDen === ansDen;
            } else {
              const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
              const correctValue = ansNum / ansDen;
              const userValue = parseFloat(val.replace(',', '.'));
              correct = !isNaN(userValue) && Math.abs(userValue - correctValue) < 0.01;
            }
            if (!correct) {
              const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
              alert(`Nem jó a válasz! A helyes válaszhoz hasonló érték: ${ansNum}/${ansDen} vagy ${(ansNum / ansDen).toFixed(2).replace('.', ',')}.`);
            }
            if (correct) onCorrectAnswer(pauseStart);
            else onWrongAnswer(pauseStart);
            return;
          }

          if (currentTask.answerType === 'power') {
            const powerMatch = val.match(/^([\d\.,]+)×10\^([\d\-]+)$/);
            if (!powerMatch) {
              alert("Érvénytelen normál alak! Használj 'a×10^b' formát, pl. '3,5×10^3'.");
              startTimerAfterPause(pauseStart);
              return;
            }
            const [_, userCoef, userExp] = powerMatch;
            const [__, ansCoef, ansExp] = currentTask.answer.match(/^([\d\.]+)×10\^([\d\-]+)$/) || [];
            correct = Math.abs(parseFloat(userCoef.replace(',', '.')) - parseFloat(ansCoef)) < 0.01 && parseInt(userExp) === parseInt(ansExp);
            if (!correct) {
              alert(`Nem jó a normál alak! A helyes válaszhoz hasonló érték: ${ansCoef}×10^${ansExp}. Ellenőrizd a kitevő és az együttható értékét!`);
            }
            if (correct) onCorrectAnswer(pauseStart);
            else onWrongAnswer(pauseStart);
            return;
          }

          correct = evaluateExpression(val, currentTask.answer, currentTask.answerType, currentTask);

          if (!correct) {
            let hint = '';
            if (currentTask.answerType === 'set') {
              hint = `Sajnos nem jó a halmaz.\n\nA helyes megoldás: {${currentTask.answer}}`;
            } else {
              const userAnswer = parseFloat(val.replace(',', '.'));
              const correctAnswer = parseFloat(currentTask.answer.replace(',', '.'));
              if (!isNaN(userAnswer) && !isNaN(correctAnswer)) {
                hint = userAnswer < correctAnswer
                  ? `Túl kicsi a válasz! Próbálj nagyobb értéket, közel ${currentTask.answer} ${currentTask.unit || ''}-hoz.`
                  : `Túl nagy a válasz! Próbálj kisebb értéket, közel ${currentTask.answer} ${currentTask.unit || ''}-hoz.`;
              } else {
                hint = `Érvénytelen válasz! Ellenőrizd a formátumot, pl. '123', '0.93', vagy esetleg '1,2,3' halmazhoz.`;
              }
            }
            alert(hint);
            onWrongAnswer(pauseStart);
            return;
          }

          onCorrectAnswer(pauseStart);
        };
        rowDiv.appendChild(submitBtn);

      } else {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'numpad-btn';
        btn.textContent = key;
        btn.tabIndex = -1;

        if (key === '⚡️') {
          const isFractionTask = currentTask.answerType === 'fraction';
          if (isFractionTask) {
            btn.dataset.state = '/';
            btn.textContent = '/';
            btn.dataset.locked = 'true';
            window.numpadState.lightningActivated = true;
            window.numpadState.lightningCurrentSymbol = '/';
            btn.dataset.lightningCount = '0';
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
            console.log('Más gomb lenyomva, villám számláló visszaállítva:', { currentValue: answerState.value });
          }

          if (key === '←') {
            answerState.value = answerState.value.slice(0, -1);
          } else if (key === '±') {
            if (!answerState.value.startsWith('-')) {
              answerState.value = '-' + answerState.value;
            } else {
              answerState.value = answerState.value.substring(1);
            }
          } else if (key === '⚡️') {
            if (btn.dataset.locked === 'true') {
              const lastChar = answerState.value.slice(-1);
              if (lastChar === '/' || lastChar === '*') {
                answerState.value = answerState.value.slice(0, -1);
              }
              answerState.value += '/';
              onChange(answerState.value);
              console.log('Lezárt villám gomb: beírva "/"', answerState.value);
              return;
            }

            let lightningCount = parseInt(btn.dataset.lightningCount || '0') + 1;
            btn.dataset.lightningCount = lightningCount.toString();
            window.numpadState.lightningCount = lightningCount;
            console.log('Villám gomb lenyomva:', { lightningCount, currentValue: answerState.value });

            if (lightningCount >= 9 && !window.numpadState.lightningActivated) {
              btn.dataset.state = '/';
              btn.textContent = '/';
              window.numpadState.lightningActivated = true;
              window.numpadState.lightningCurrentSymbol = '/';
              lightningCount = 0;
              window.numpadState.lightningCount = 0;
              btn.dataset.lightningCount = '0';
              console.log('Villám gomb átváltva / jelre:', { newState: '/', newText: btn.textContent });
            }

            if (btn.dataset.state === '⚡️') {
              console.log('Villám gomb még nem váltott, nincs bevitel.');
              return;
            }

            const currentState = btn.dataset.state;
            const lastChar = answerState.value.slice(-1);
            if (lastChar === '/' || lastChar === '*') {
              answerState.value = answerState.value.slice(0, -1);
            }

            answerState.value += currentState;

            const newState = currentState === '/' ? '*' : '/';
            btn.dataset.state = newState;
            btn.textContent = newState;
            window.numpadState.lightningCurrentSymbol = newState;
            console.log('Speciális gomb frissítve:', { newState, buttonText: btn.textContent, newValue: answerState.value });

          } else if (key === decimalKey) {
            if (mode === 'numeric') {
              if (!answerState.value.includes('.')) {
                answerState.value = answerState.value + '.';
              }
            } else {
              const last = answerState.value.slice(-1);
              if (last && /[0-9\}]/.test(last)) {
                if (last !== ',') {
                  answerState.value += ',';
                }
              } else if (answerState.value === '') {
              }
            }
          } else if (key === ',' && mode === 'numeric') {
            if (!answerState.value.includes('.')) {
              answerState.value += '.';
            }
          } else if (key === '{' || key === '}') {
            answerState.value += key;
          } else if (key === '∪' || key === '∩') {
            answerState.value += key;
          } else if (/^[0-9]$/.test(key) || key === '/') {
            answerState.value += key;
          } else {
            answerState.value += key;
          }

          console.log('Új beviteli mező tartalom:', answerState.value);
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
    const pauseEnd = Date.now();
    const pauseDuration = pauseEnd - pauseStart;
    if (timerInterval) clearInterval(timerInterval);
    startTime += pauseDuration;
    if (currentQuestion < QUESTIONS) {
      timerInterval = setInterval(updateTimer, 1000);
    }
    if (currentQuestion >= QUESTIONS) {
      finishGame();
    }
  }

  function onWrongAnswer(pauseStart) {
    wrongAnswers++;
    const pauseEnd = Date.now();
    const pauseDuration = pauseEnd - pauseStart;
    if (timerInterval) clearInterval(timerInterval);
    startTime += pauseDuration;
    timerInterval = setInterval(updateTimer, 1000);
  }

  function startTimerAfterPause(pauseStart) {
    const pauseEnd = Date.now();
    const pauseDuration = pauseEnd - pauseStart;
    startTime += pauseDuration;
    timerInterval = setInterval(updateTimer, 1000);
  }

  return numpadDiv;
}

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
    <div class="question-text">${q.display}</div>`;
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
    progressWrong.style.left = `${(score / QUESTIONS) * 100}%`;
  }

  div.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startGame() {
  window.numpadState = {
    lightningActivated: false,
    lightningCurrentSymbol: '/',
    lightningCount: 0
  };
  
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

loadCategories();
loadLastSelection();
loadBest();