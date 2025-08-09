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
function generateOptions(correctAnswer, answerType, difficulty, unit) {
  console.log("generateOptions called", { correctAnswer, answerType, difficulty, unit });
  if (answerType !== "decimal") return [];
  const options = [correctAnswer.toFixed(2)];
  const range = difficulty === "easy" ? 10 : 20;
  const min = Math.max(0, correctAnswer - range);
  const max = correctAnswer + range;
  
  while (options.length < 4) {
    const option = (min + Math.random() * (max - min)).toFixed(2);
    if (Math.abs(option - correctAnswer) >= 0.1 && !options.includes(option)) {
      options.push(option);
    }
  }
  
  // Véletlenszerű keverés
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
    let opCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 5; // Műveletek száma
    const opList = ["+", "-", "•", ":"];
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
        if (op === ":") {
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
      let evalExpr = displayExpr.replace(/•/g, '*').replace(/:/g, '/').replace(/\s/g, '');
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
    let result = Number((base * percent / 100).toFixed(2)); // 2 tizedesjegyre kerekítés
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
        display: `${a}${coloredVar} * ${b} / ${c} ${d >= 0 ? "+" : "-"} ${Math.abs(d)} = ${result} | ${coloredVar}`,
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
      display: `${a}${coloredVar} ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${result} | ${coloredVar}`,
      answer: x.toString(),
      answerType: "number"
    };
  }
},
{
  name: "Normál alakos számok",
  value: "normal_alak",
  generate: (difficulty) => {
    // A mantisszát mindig 1 ≤ m < 10 közé generáljuk mindenhol!
    function getRandomMantissa(decimals = 2) {
      let m = Math.random() * 9 + 1; // 1 - 9.999...
      return Number(m.toFixed(decimals));
    }

    // A direction-től függően (0: szám → normál alak kitevője, 1: normál alak → érték)
    const direction = Math.random() < 0.5 ? 0 : 1;

    // Könnyű szint
    if (difficulty === "easy") {
      if (direction === 0) {
        // Szám → normál alak kitevője
        // 60% kétjegyű, 35% háromjegyű, 5% négyjegyű
        let rand = Math.random();
        let number;
        if (rand < 0.60) {
          number = getRandomInt(10, 99); // kétjegyű
        } else if (rand < 0.95) {
          number = getRandomInt(100, 999); // háromjegyű
        } else {
          number = getRandomInt(1000, 9999); // négyjegyű
        }
        // néha generálhat tizedes törtet is (pl. 0.37, 2.1, 36.5)
        if (Math.random() < 0.15) {
          let base = getRandomInt(1, 99);
          let d = Math.random() < 0.5 ? 1 : 2;
          number = Number((base / Math.pow(10, d)).toFixed(d));
        }
        let absNumber = Math.abs(number);
        let exponent = absNumber === 0 ? 0 : Math.floor(Math.log10(absNumber));
        exponent = Math.max(1, Math.min(4, exponent));
        return {
          display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
          answer: exponent.toString(),
          answerType: "number"
        };
      } else {
        // Normál alak → érték
        // 80% pozitív kitevő, 20% negatív (legkisebb: -1)
        let exp;
        if (Math.random() < 0.8) {
          exp = getRandomInt(1, 4);
        } else {
          exp = getRandomInt(-1, -1);
        }
        let mant = getRandomMantissa(2);
        let value = mant * Math.pow(10, exp);
        value = exp > 0 ? Math.round(value) : Number(value.toFixed(2));
        let mantStr = ("" + mant).replace(".", ",");
        return {
          display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
          answer: value.toString(),
          answerType: exp > 0 ? "number" : "decimal"
        };
      }
    }

    // Közepes szint
    if (difficulty === "medium") {
      if (direction === 0) {
        // Szám → normál alak kitevője
        // 30% 0,xx - 0,999; 20% 1,xx - 9,99; 30% 10-999; 20% 1000-99999
        let rand = Math.random();
        let number;
        if (rand < 0.3) {
          number = Number((Math.random() * 0.9 + 0.1).toFixed(2)); // 0,10 - 0,99
        } else if (rand < 0.5) {
          number = Number((Math.random() * 9.89 + 1.01).toFixed(2)); // 1,01 - 10,9
        } else if (rand < 0.8) {
          number = getRandomInt(10, 999);
        } else {
          number = getRandomInt(1000, 99999);
        }
        // néha mínuszos számot generál
        if (Math.random() < 0.12) number *= -1;
        let absNumber = Math.abs(number);
        let exponent = absNumber === 0 ? 0 : Math.floor(Math.log10(absNumber));
        exponent = Math.max(-2, Math.min(6, exponent));
        return {
          display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
          answer: exponent.toString(),
          answerType: "number"
        };
      } else {
        // Normál alak → érték
        // 50% pozitív kitevő (0-6), 50% negatív (-2 - -1)
        let exp = Math.random() < 0.5 ? getRandomInt(0, 6) : getRandomInt(-2, -1);
        let mant = getRandomMantissa(2);
        let value = mant * Math.pow(10, exp);
        value = exp >= 0 ? Number(value.toFixed(2)) : Number(value.toFixed(4));
        if (Math.random() < 0.2) value *= -1;
        let mantStr = ("" + mant).replace(".", ",");
        return {
          display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
          answer: value.toString(),
          answerType: exp >= 0 ? "decimal" : "decimal"
        };
      }
    }

    // Kihívás szint
    if (difficulty === "hard") {
      if (direction === 0) {
        // Szám → normál alak kitevője
        // 20% 0,000xx - 0,0999; 20% 0,1 - 0,99; 20% 1-9,99; 20% 10-9999; 20% 1e5 - 1e9
        let rand = Math.random();
        let number;
        if (rand < 0.2) {
          number = Number((Math.random() * 0.0999 + 0.0001).toFixed(5));
        } else if (rand < 0.4) {
          number = Number((Math.random() * 0.89 + 0.1).toFixed(3));
        } else if (rand < 0.6) {
          number = Number((Math.random() * 8.99 + 1.01).toFixed(2));
        } else if (rand < 0.8) {
          number = getRandomInt(10, 9999);
        } else {
          number = getRandomInt(100000, 999999999);
        }
        // néha mínuszos számot generál
        if (Math.random() < 0.18) number *= -1;
        let absNumber = Math.abs(number);
        let exponent = absNumber === 0 ? 0 : Math.floor(Math.log10(absNumber));
        exponent = Math.max(-5, Math.min(10, exponent));
        return {
          display: `Milyen kitevő szerepel a 10 hatványaként a következő szám normál alakjában:<br><span class="blue-percent">${number}</span> ?`,
          answer: exponent.toString(),
          answerType: "number"
        };
      } else {
        // Normál alak → érték
        // 60% pozitív kitevő (0-10), 40% negatív (-5 - -1)
        let exp = Math.random() < 0.6 ? getRandomInt(0, 10) : getRandomInt(-5, -1);
        let mant = getRandomMantissa(3);
        let value = mant * Math.pow(10, exp);
        value = exp >= 0 ? Number(value.toFixed(3)) : Number(value.toFixed(8));
        if (Math.random() < 0.25) value *= -1;
        let mantStr = ("" + mant).replace(".", ",");
        return {
          display: `Mennyi a következő normál alakú szám értéke:<br><span class="blue-percent">${mantStr}×10<sup>${exp}</sup></span> ?`,
          answer: value.toString(),
          answerType: "decimal"
        };
      }
    }

    // Helper
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
},


{
  name: "Villamos mértékegységek",
  value: "villamos_mertekegysegek",
  generate: (difficulty) => {
    // Villamos mennyiségek és adataik
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
    const taskType = getRandomInt(0, 4); // 0-4, hogy mind az 5 kérdéstípus előforduljon

    let options = [];
    let correctAnswer;
    const wrongOptions = {
      names: ["Áramerősség", "Feszültség", "Ellenállás", "Elektromos töltés", "Teljesítmény", "Frekvencia", "Energia", "Kapacitás", "Induktivitás", "Mágneses fluxus", "Mágneses fluxussűrűség", "Fázisszög"],
      symbols: ["I", "U", "R", "Q", "P", "f", "E", "C", "L", "Φ", "B", "θ"],
      unitNames: ["amper", "volt", "ohm", "coulomb", "watt", "hertz", "joule", "farad", "henry", "weber", "tesla", "radian"],
      unitSymbols: ["A", "V", "Ω", "C", "W", "Hz", "J", "F", "H", "Wb", "T", "rad"]
    };

    if (taskType === 0) { // Mi a neve, ha a jele: ...
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
    } else if (taskType === 1) { // Mi a neve, ha a mértékegysége: ...
      options = [quantity.name];
      const wrongNames = wrongOptions.names.filter(name => name !== quantity.name && selectedQuantities.some(q => q.name === name));
      while (options.length < 3) {
        const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
        if (!options.includes(wrongName)) options.push(wrongName);
      }
      options = shuffleArray(options);
      correctAnswer = (options.indexOf(quantity.name) + 1).toString();
      // magyarosított unitName-et írj ki
      let shownUnitName = quantity.unitName.charAt(0).toUpperCase() + quantity.unitName.slice(1);
      return {
        display: `Mi a neve, ha a mértékegysége: <span class="blue-percent">${shownUnitName}</span> ?<br>1. ${options[0]}<br>2. ${options[1]}<br>3. ${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else if (taskType === 2) { // Mi a jele, ha neve: ...
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
    } else if (taskType === 3) { // Mi a mértékegysége, ha a neve: ...
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
    } else { // Mi a mértékegység neve, ha a jele: ...
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
    // Mértékegység előtagok és adataik normál alakkal
    const prefixes = {
      easy: [
        { name: "deci", symbol: "d", multiplier: "10^-1", fullName: "tized rész" },
        { name: "centi", symbol: "c", multiplier: "10^-2", fullName: "század rész" },
        { name: "milli", symbol: "m", multiplier: "10^-3", fullName: "ezredik rész" },
        { name: "kilo", symbol: "k", multiplier: "10^3", fullName: "ezerszeres" },
        { name: "alapegység", symbol: "", multiplier: "10^0", fullName: "alapegység" }
      ],
      medium: [
        { name: "deci", symbol: "d", multiplier: "10^-1", fullName: "tized rész" },
        { name: "mikro", symbol: "µ", multiplier: "10^-6", fullName: "milliomod rész" },
        { name: "milli", symbol: "m", multiplier: "10^-3", fullName: "ezredik rész" },
        { name: "kilo", symbol: "k", multiplier: "10^3", fullName: "ezerszeres" },
        { name: "mega", symbol: "M", multiplier: "10^6", fullName: "milliószoros" },
        { name: "alapegység", symbol: "", multiplier: "10^0", fullName: "alapegység" }
      ],
      hard: [
        { name: "nano", symbol: "n", multiplier: "10^-9", fullName: "milliárdod rész" },
        { name: "mikro", symbol: "µ", multiplier: "10^-6", fullName: "milliomod rész" },
        { name: "milli", symbol: "m", multiplier: "10^-3", fullName: "ezredik rész" },
        { name: "kilo", symbol: "k", multiplier: "10^3", fullName: "ezerszeres" },
        { name: "mega", symbol: "M", multiplier: "10^6", fullName: "milliószoros" },
        { name: "giga", symbol: "G", multiplier: "10^9", fullName: "milliárdszoros" },
        { name: "tera", symbol: "T", multiplier: "10^12", fullName: "billiomodszoros" },
        { name: "alapegység", symbol: "", multiplier: "10^0", fullName: "alapegység" }
      ]
    };

    const selectedPrefixes = prefixes[difficulty];
    const prefix = selectedPrefixes[getRandomInt(0, selectedPrefixes.length - 1)];
    const taskType = getRandomInt(0, 4); // 0-4, hogy mind az 5 kérdéstípus előforduljon

    let options = [];
    let correctAnswer;
    const wrongOptions = {
      names: ["nano", "mikro", "milli", "centi", "deci", "alapegység", "kilo", "mega", "giga", "tera"],
      symbols: ["n", "µ", "m", "c", "d", "", "k", "M", "G", "T"],
      multipliers: ["10^-9", "10^-6", "10^-3", "10^-2", "10^-1", "10^0", "10^3", "10^6", "10^9", "10^12"],
      fullNames: ["milliárdod rész", "milliomod rész", "ezredik rész", "század rész", "tized rész", "alapegység", "ezerszeres", "milliószoros", "milliárdszoros", "billiomodszoros"]
    };

    // Segédfüggvény a szorzó formázására HTML felső indexszel
    const formatMultiplier = (multiplier) => {
      return multiplier.replace(/10\^(-?\d+)/, "10<sup>$1</sup>");
    };

    if (taskType === 0) { // Mi a neve, ha a jele: ...
      options = [prefix.name];
      const wrongNames = wrongOptions.names.filter(name => name !== prefix.name && selectedPrefixes.some(p => p.name === name));
      while (options.length < 3) {
        const wrongName = wrongNames[getRandomInt(0, wrongNames.length - 1)];
        if (!options.includes(wrongName)) options.push(wrongName);
      }
      options = shuffleArray(options);
      correctAnswer = (options.indexOf(prefix.name) + 1).toString();
      const displaySymbol = prefix.symbol || "(nincs előtag)";
      return {
        display: `Mi a neve, ha a jele: <span class="blue-percent">${displaySymbol}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${options[0]}<br>2.&nbsp;&nbsp;&nbsp;${options[1]}<br>3.&nbsp;&nbsp;&nbsp;${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else if (taskType === 1) { // Mi a jele az előtagnak, ha a neve: ...
      options = [prefix.symbol || "(nincs előtag)"];
      const wrongSymbols = wrongOptions.symbols.filter(symbol => symbol !== prefix.symbol && selectedPrefixes.some(p => p.symbol === symbol));
      while (options.length < 3) {
        const wrongSymbol = wrongSymbols[getRandomInt(0, wrongSymbols.length - 1)];
        const displaySymbol = wrongSymbol || "(nincs előtag)";
        if (!options.includes(displaySymbol)) options.push(displaySymbol);
      }
      options = shuffleArray(options);
      correctAnswer = (options.indexOf(prefix.symbol || "(nincs előtag)") + 1).toString();
      return {
        display: `Mi a jele az előtagnak, ha a neve: <span class="blue-percent">${prefix.name}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${options[0]}<br>2.&nbsp;&nbsp;&nbsp;${options[1]}<br>3.&nbsp;&nbsp;&nbsp;${options[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else if (taskType === 2) { // Mi a szorzó értéke, ha a neve: ...
      options = [prefix.multiplier];
      const wrongMultipliers = wrongOptions.multipliers.filter(multiplier => multiplier !== prefix.multiplier && selectedPrefixes.some(p => p.multiplier === multiplier));
      while (options.length < 3) {
        const wrongMultiplier = wrongMultipliers[getRandomInt(0, wrongMultipliers.length - 1)];
        if (!options.includes(wrongMultiplier)) options.push(wrongMultiplier);
      }
      options = shuffleArray(options);
      correctAnswer = (options.indexOf(prefix.multiplier) + 1).toString();
      // Formázott válaszlehetőségek felső indexszel
      const formattedOptions = options.map(opt => formatMultiplier(opt));
      return {
        display: `Mi a szorzó értéke, ha a neve: <span class="blue-percent">${prefix.name}</span> ?<br>1.&nbsp;&nbsp;&nbsp;${formattedOptions[0]}<br>2.&nbsp;&nbsp;&nbsp;${formattedOptions[1]}<br>3.&nbsp;&nbsp;&nbsp;${formattedOptions[2]}`,
        answer: correctAnswer,
        answerType: "number"
      };
    } else if (taskType === 3) { // Mi a jelentése, ha a neve: ...
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
    } else { // Mi a neve, ha a szorzó értéke: ...
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
    console.log("Ohm-törvény generate called", { difficulty });

    if (difficulty === "easy") {
      const maxI = 10; // Max áram (A)
      const maxR = 100; // Max ellenállás (Ω)
      const maxU = 100; // Max feszültség (V)
      let U, R, I, type, answer, display, answerType = "number";
      type = getRandomInt(0, 2); // 0: U, 1: I, 2: R
      const randomOrder = Math.random() < 0.5;

      if (type === 0) { // Feszültség számítás (U = I * R)
        I = getRandomInt(1, maxI); // Egész szám A-ban
        R = getRandomInt(1, maxR); // Egész szám Ω-ban
        U = I * R; // Egész szám V-ban
        answer = U.toString();
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>R = ${R} <span class="blue-percent">Ω</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>R = ${R} <span class="blue-percent">Ω</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`;
      } else if (type === 1) { // Áram számítás (I = U / R)
        U = getRandomInt(1, maxU); // Egész szám V-ban
        R = getRandomInt(1, maxR); // Egész szám Ω-ban
        I = Math.round(U / R); // Egész számra kerekítés A-ban
        if (I === 0) I = 1;
        U = I * R; // Visszaszámolás a kerekített I-vel
        answer = I.toString();
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">A</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>R = ${R} <span class="blue-percent">Ω</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">A</span>-ban), ha <b>R = ${R} <span class="blue-percent">Ω</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
      } else { // Ellenállás számítás (R = U / I)
        I = getRandomInt(1, maxI); // Egész szám A-ban
        U = getRandomInt(1, maxU); // Egész szám V-ban
        R = Math.round(U / I); // Egész számra kerekítés Ω-ban
        if (R === 0) R = 1;
        U = I * R; // Visszaszámolás a kerekített R-rel
        answer = R.toString();
        display = randomOrder
          ? `Mennyi az ellenállás (<span class="blue-percent">Ω</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>I = ${I} <span class="blue-percent">A</span></b>?`
          : `Mennyi az ellenállás (<span class="blue-percent">Ω</span>-ban), ha <b>I = ${I} <span class="blue-percent">A</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
      }
      return {
        display,
        answer,
        answerType,
        options: generateOptions(Number(answer), answerType, difficulty, type === 0 ? "V" : type === 1 ? "A" : "Ω"),
        unit: type === 0 ? "V" : type === 1 ? "A" : "Ω",
        U: type === 0 ? null : U,
        R: type === 2 ? null : R,
        I: type === 1 ? null : I
      };
    } else if (difficulty === "medium") {
      const maxI = 20; // Max áram (mA)
      const maxR = 1000; // Max ellenállás (kΩ → Ω)
      const maxU = 1000; // Max feszültség (V)
      const precision = 2; // Kerekítési pontosság
      let U, R, I, type, answer, display, answerType = "decimal", unit;
      type = getRandomInt(0, 2); // 0: U, 1: I, 2: R
      const randomOrder = Math.random() < 0.5;

      if (type === 0) { // Feszültség számítás (U = I * R)
        I_mA = Number((getRandomInt(1, maxI) + Math.random()).toFixed(1)); // mA-ban, 1 tizedesjegy
        I = I_mA / 1000; // A-ban
        R_kOhm = Number((getRandomInt(10, maxR) / 1000).toFixed(2)); // kΩ-ban, 2 tizedesjegy
        R = R_kOhm * 1000; // Ω-ban
        U = I * R; // V-ban
        answer = Number(U.toFixed(precision)).toString();
        unit = "V";
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>I = ${I_mA} <span class="blue-percent">mA</span></b> és <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">V</span>-ban), ha <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b> és <b>I = ${I_mA} <span class="blue-percent">mA</span></b>?`;
      } else if (type === 1) { // Áram számítás (I = U / R)
        U = Number(getRandomInt(100, maxU).toFixed(0)); // Egész szám V-ban
        R_kOhm = Number((getRandomInt(10, maxR) / 1000).toFixed(2)); // kΩ-ban, 2 tizedesjegy
        R = R_kOhm * 1000; // Ω-ban
        I = U / R; // A-ban
        I_mA = Number((I * 1000).toFixed(precision)); // mA-ban
        answer = I_mA.toString();
        unit = "mA";
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>U = ${U} <span class="blue-percent">V</span></b> és <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>R = ${R_kOhm} <span class="blue-percent">kΩ</span></b> és <b>U = ${U} <span class="blue-percent">V</span></b>?`;
      } else { // Ellenállás számítás (R = U / I)
        U = Number(getRandomInt(100, maxU).toFixed(0)); // Egész szám V-ban
        I_mA = Number((getRandomInt(1, maxI) + Math.random()).toFixed(1)); // mA-ban, 1 tizedesjegy
        I = I_mA / 1000; // A-ban
        R = U / I; // Ω-ban
        R_kOhm = Number((R / 1000).toFixed(precision)); // kΩ-ban
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
        unit,
        U: type === 0 ? null : U,
        R: type === 2 ? null : R_kOhm,
        I: type === 1 ? null : I_mA
      };
    } else { // Nehéz
      const maxI = 50; // Max áram (mA)
      const maxR = 10000; // Max ellenállás (MΩ → Ω)
      const maxU = 5000; // Max feszültség (kV → V)
      const precision = 5; // Kerekítési pontosság
      let U_kV, R_MOhm, I_mA, type, answer, display, answerType = "decimal", unit;
      type = getRandomInt(0, 2); // 0: U, 1: I, 2: R
      const randomOrder = Math.random() < 0.5;

      if (type === 0) { // Feszültség számítás (U = I * R)
        // Normál alakú értékek generálása
        const exponentI = getRandomInt(0, 2); // Kitevő 0-2
        const mantissaI = Number((getRandomInt(10, 50) / 10).toFixed(1)); // 1.0-5.0
        I_mA = mantissaI * Math.pow(10, exponentI); // mA-ban
        I = I_mA / 1000; // A-ban
        const exponentR = getRandomInt(0, 2); // Kitevő 0-2
        const mantissaR = Number((getRandomInt(10, 50) / 10).toFixed(1)); // 1.0-5.0
        R_MOhm = mantissaR * Math.pow(10, exponentR); // MΩ-ban
        R = R_MOhm * 1000000; // Ω-ban
        U = I * R; // V-ban
        U_kV = Number((U / 1000).toFixed(precision)); // kV-ban
        answer = U_kV.toString();
        unit = "kV";
        display = randomOrder
          ? `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>I = ${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span></b> és <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b>?`
          : `Mennyi a feszültség (<span class="blue-percent">kV</span>-ban), ha <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b> és <b>I = ${mantissaI} × 10<sup>${exponentI}</sup> <span class="blue-percent">mA</span></b>?`;
      } else if (type === 1) { // Áram számítás (I = U / R)
        const exponentU = getRandomInt(0, 2); // Kitevő 0-2
        const mantissaU = Number((getRandomInt(10, 50) / 10).toFixed(1)); // 1.0-5.0
        U_kV = mantissaU * Math.pow(10, exponentU); // kV-ban
        U = U_kV * 1000; // V-ban
        const exponentR = getRandomInt(0, 2); // Kitevő 0-2
        const mantissaR = Number((getRandomInt(10, 50) / 10).toFixed(1)); // 1.0-5.0
        R_MOhm = mantissaR * Math.pow(10, exponentR); // MΩ-ban
        R = R_MOhm * 1000000; // Ω-ban
        I = U / R; // A-ban
        I_mA = Number((I * 1000).toFixed(precision)); // mA-ban
        answer = I_mA.toString();
        unit = "mA";
        display = randomOrder
          ? `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>U = ${mantissaU} × 10<sup>${exponentU}</sup> <span class="blue-percent">kV</span></b> és <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b>?`
          : `Mennyi az áram (<span class="blue-percent">mA</span>-ban), ha <b>R = ${mantissaR} × 10<sup>${exponentR}</sup> <span class="blue-percent">MΩ</span></b> és <b>U = ${mantissaU} × 10<sup>${exponentU}</sup> <span class="blue-percent">kV</span></b>?`;
      } else { // Ellenállás számítás (R = U / I)
        const exponentU = getRandomInt(0, 2); // Kitevő 0-2
        const mantissaU = Number((getRandomInt(10, 50) / 10).toFixed(1)); // 1.0-5.0
        U_kV = mantissaU * Math.pow(10, exponentU); // kV-ban
        U = U_kV * 1000; // V-ban
        const exponentI = getRandomInt(0, 2); // Kitevő 0-2
        const mantissaI = Number((getRandomInt(10, 50) / 10).toFixed(1)); // 1.0-5.0
        I_mA = mantissaI * Math.pow(10, exponentI); // mA-ban
        I = I_mA / 1000; // A-ban
        R = U / I; // Ω-ban
        R_MOhm = Number((R / 1000000).toFixed(precision)); // MΩ-ban
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
        unit,
        U: type === 0 ? null : U_kV,
        R: type === 2 ? null : R_MOhm,
        I: type === 1 ? null : I_mA
      };
    }
  }
},
  // --- TELJESÍTMÉNY GENERÁTOR JAVÍTVA ---
{
  name: "Teljesítmény számolás",
  value: "teljesitmeny",
  generate: (difficulty) => {
    const ranges = {
      easy: { maxU: 24, maxI: 10, maxP: 100 },
      medium: { maxU: 230, maxI: 20, maxP: 2000 },
      hard: { maxU: 5000, maxI: 50, maxP: 10000 }
    };
    const { maxU, maxI, maxP } = ranges[difficulty];
    const precision = difficulty === "hard" ? 5 : 2;
    let U, I, P, type, answer, display, answerType, unit;
    let display_U, display_U_unit, display_I, display_I_unit, display_P, display_P_unit;

    type = getRandomInt(0, 2); // 0: P, 1: U, 2: I
    const randomOrder = Math.random() < 0.5;

    // --- TELJESÍTMÉNY SZÁMÍTÁS (P = U * I) ---
    if (type === 0) {
      if (difficulty === "easy") {
        U = Number((getRandomInt(10, maxU) + Math.random()).toFixed(1));
        I = Number((getRandomInt(1, maxI) + Math.random()).toFixed(1));
        P = U * I;
        display_U = U;
        display_U_unit = "V";
        display_I = I;
        display_I_unit = "A";
        display_P = Number(P.toFixed(2));
        display_P_unit = "W";
        answer = display_P.toString();
        answerType = Number.isInteger(display_P) ? "number" : "decimal";
        unit = display_P_unit;
      } else if (difficulty === "medium") {
        U = Number((getRandomInt(10, maxU) + Math.random()).toFixed(1));
        let I_kA = Number(((getRandomInt(1, maxI) + Math.random()) / 1000).toFixed(3));
        I = Number((I_kA * 1000).toFixed(1));
        P = U * (I / 1000);
        display_U = U;
        display_U_unit = "V";
        display_I = I_kA;
        display_I_unit = "kA";
        display_P = Number(P.toFixed(2));
        display_P_unit = "kW";
        answer = display_P.toString();
        answerType = "decimal";
        unit = display_P_unit;
      } else {
        let U_kV = Number((getRandomInt(1, maxU/1000) + Math.random()).toFixed(3));
        let I_mA = Number((getRandomInt(1, maxI*100) + Math.random()).toFixed(1));
        U = U_kV;
        I = I_mA;
        P = U_kV * 1000 * (I_mA / 1000);
        display_U = U_kV;
        display_U_unit = "kV";
        display_I = I_mA;
        display_I_unit = "mA";
        display_P = Number(P.toFixed(precision));
        display_P_unit = "W";
        answer = display_P.toString();
        answerType = "decimal";
        unit = display_P_unit;
      }
      display = randomOrder
        ? `Mennyi a teljesítmény (<span class="blue-percent">${unit}</span>-ban), ha <b>U = ${display_U} <span class="blue-percent">${display_U_unit}</span></b> és <b>I = ${display_I} <span class="blue-percent">${display_I_unit}</span></b>?`
        : `Mennyi a teljesítmény (<span class="blue-percent">${unit}</span>-ban), ha <b>I = ${display_I} <span class="blue-percent">${display_I_unit}</span></b> és <b>U = ${display_U} <span class="blue-percent">${display_U_unit}</span></b>?`;

      return {
        display,
        answer,
        answerType,
        options: [],
        unit,
        display_U, display_U_unit,
        display_I, display_I_unit,
        display_P, display_P_unit,
        value: "teljesitmeny",
        difficulty
      };
    }

    // --- FESZÜLTSÉG SZÁMÍTÁS (U = P / I) ---
    if (type === 1) {
      if (difficulty === "easy") {
        P = Number((getRandomInt(10, maxP) + Math.random()).toFixed(1));
        I = Number((getRandomInt(1, maxI) + Math.random()).toFixed(1));
        U = P / I;
        display_P = P;
        display_P_unit = "W";
        display_I = I;
        display_I_unit = "A";
        display_U = Number(U.toFixed(2));
        display_U_unit = "V";
        answer = display_U.toString();
        answerType = Number.isInteger(display_U) ? "number" : "decimal";
        unit = display_U_unit;
      } else if (difficulty === "medium") {
        let P_kW = Number(((getRandomInt(1, maxP / 1000) + Math.random())).toFixed(3));
        let I_kA = Number(((getRandomInt(1, maxI) + Math.random()) / 1000).toFixed(3));
        P = P_kW * 1000;
        I = I_kA * 1000;
        U = P / (I_kA * 1000);
        display_P = P_kW;
        display_P_unit = "kW";
        display_I = I_kA;
        display_I_unit = "kA";
        display_U = Number(U.toFixed(2));
        display_U_unit = "V";
        answer = display_U.toString();
        answerType = "decimal";
        unit = display_U_unit;
      } else {
        let P_kW = Number(((getRandomInt(1, maxP / 1000) + Math.random())).toFixed(3));
        let I_mA = Number((getRandomInt(1, maxI*100) + Math.random()).toFixed(1));
        P = P_kW * 1000;
        I = I_mA;
        U = P / (I_mA / 1000);
        display_P = P_kW;
        display_P_unit = "kW";
        display_I = I_mA;
        display_I_unit = "mA";
        display_U = Number(U.toFixed(precision));
        display_U_unit = "V";
        answer = display_U.toString();
        answerType = "decimal";
        unit = display_U_unit;
      }
      display = randomOrder
        ? `Mennyi a feszültség (<span class="blue-percent">${unit}</span>-ban), ha <b>P = ${display_P} <span class="blue-percent">${display_P_unit}</span></b> és <b>I = ${display_I} <span class="blue-percent">${display_I_unit}</span></b>?`
        : `Mennyi a feszültség (<span class="blue-percent">${unit}</span>-ban), ha <b>I = ${display_I} <span class="blue-percent">${display_I_unit}</span></b> és <b>P = ${display_P} <span class="blue-percent">${display_P_unit}</span></b>?`;

      return {
        display,
        answer,
        answerType,
        options: [],
        unit,
        display_P, display_P_unit,
        display_I, display_I_unit,
        display_U, display_U_unit,
        value: "teljesitmeny",
        difficulty
      };
    }

    // --- ÁRAMERŐSSÉG SZÁMÍTÁS (I = P / U) ---
    if (type === 2) {
      if (difficulty === "easy") {
        P = Number((getRandomInt(10, maxP) + Math.random()).toFixed(1));
        U = Number((getRandomInt(10, maxU) + Math.random()).toFixed(1));
        I = P / U;
        display_P = P;
        display_P_unit = "W";
        display_U = U;
        display_U_unit = "V";
        display_I = Number(I.toFixed(2));
        display_I_unit = "A";
        answer = display_I.toString();
        answerType = Number.isInteger(display_I) ? "number" : "decimal";
        unit = display_I_unit;
      } else if (difficulty === "medium") {
        let P_kW = Number(((getRandomInt(1, maxP / 1000) + Math.random())).toFixed(3));
        let U = Number((getRandomInt(10, maxU) + Math.random()).toFixed(1));
        P = P_kW * 1000;
        I = P / U;
        display_P = P_kW;
        display_P_unit = "kW";
        display_U = U;
        display_U_unit = "V";
        display_I = Number(I.toFixed(2));
        display_I_unit = "A";
        answer = display_I.toString();
        answerType = "decimal";
        unit = display_I_unit;
      } else {
        let P_kW = Number(((getRandomInt(1, maxP / 1000) + Math.random())).toFixed(3));
        let U_kV = Number((getRandomInt(1, maxU / 1000) + Math.random()).toFixed(3));
        P = P_kW * 1000;
        U = U_kV * 1000;
        I = P / U;
        display_P = P_kW;
        display_P_unit = "kW";
        display_U = U_kV;
        display_U_unit = "kV";
        display_I = Number((I * 1000).toFixed(2));
        display_I_unit = "mA";
        answer = display_I.toString();
        answerType = "decimal";
        unit = display_I_unit;
      }
      display = randomOrder
        ? `Mennyi az áramerősség (<span class="blue-percent">${unit}</span>-ban), ha <b>P = ${display_P} <span class="blue-percent">${display_P_unit}</span></b> és <b>U = ${display_U} <span class="blue-percent">${display_U_unit}</span></b>?`
        : `Mennyi az áramerősség (<span class="blue-percent">${unit}</span>-ban), ha <b>U = ${display_U} <span class="blue-percent">${display_U_unit}</span></b> és <b>P = ${display_P} <span class="blue-percent">${display_P_unit}</span></b>?`;

      return {
        display,
        answer,
        answerType,
        options: [],
        unit,
        display_P, display_P_unit,
        display_U, display_U_unit,
        display_I, display_I_unit,
        value: "teljesitmeny",
        difficulty
      };
    }
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
        maxI: 100, // mA
        minI: 10 // mA
      },
      medium: {
        maxU_forrás: 120,
        minU_forrás: 24,
        maxU_fogyasztó: 100,
        minU_fogyasztó: 12,
        maxI: 2, // A
        minI: 0.1 // A
      },
      hard: {
        maxU_forrás: 10000,
        minU_forrás: 100,
        maxU_fogyasztó: 9000,
        minU_fogyasztó: 50,
        maxI: 10000, // mA
        minI: 1 // mA
      }
    };
    const { maxU_forrás, minU_forrás, maxU_fogyasztó, minU_fogyasztó, maxI, minI } = ranges[difficulty];
    const precision = difficulty === "easy" ? 0 : difficulty === "medium" ? 2 : 3; // Pontosság növelése
    let display, answer, answerType, unit;

    // Feszültségek és áram generálása
    let U_forrás = difficulty === "easy" || difficulty === "medium"
      ? getRandomInt(minU_forrás, maxU_forrás) // Egész szám
      : Number((minU_forrás + Math.random() * (maxU_forrás - minU_forrás)).toFixed(2)); // Normál alakhoz
    let U_fogyasztó = difficulty === "easy"
      ? getRandomInt(minU_fogyasztó, Math.min(U_forrás - 1, maxU_fogyasztó))
      : difficulty === "medium"
      ? getRandomInt(minU_fogyasztó, Math.min(U_forrás - 10, maxU_fogyasztó))
      : Number((minU_fogyasztó + Math.random() * (Math.min(U_forrás - 10, maxU_fogyasztó) - minU_fogyasztó)).toFixed(2));
    let I = difficulty === "easy"
      ? getRandomInt(minI, maxI) // mA-ban
      : difficulty === "medium"
      ? Number((minI + Math.random() * (maxI - minI)).toFixed(3)) // A-ban, 3 tizedesjegy
      : getRandomInt(minI, maxI); // mA-ban nehéz szinten
    let I_A = difficulty === "easy" ? I / 1000 : difficulty === "medium" ? I : I / 1000; // Áram A-ban

    // Előtét ellenállás számítása: R_s = (U_forrás - U_fogyasztó) / I
    let R_s = (U_forrás - U_fogyasztó) / I_A; // Ω-ban

    // Nulla vagy negatív ellenállás kezelése
    if (R_s <= 0 || isNaN(R_s)) {
      U_fogyasztó = Math.max(minU_fogyasztó, U_forrás - (difficulty === "easy" ? 1 : 10));
      R_s = (U_forrás - U_fogyasztó) / I_A;
    }

    // Mértékegység formázása
    let formatted = formatNumber(R_s, 'Ω', difficulty);
    answer = Number(formatted.value.toFixed(precision)).toString();
    unit = formatted.unit;

    // Közepes szinten mindig kΩ-ban kérjük a választ
    if (difficulty === "medium") {
      unit = "kΩ";
      answer = Number((R_s / 1000).toFixed(precision)).toString();
    }
    // Nehéz szinten mindig MΩ-ban kérjük a választ
    if (difficulty === "hard" && unit === "Ω") {
      unit = "MΩ";
      answer = Number((R_s / 1000000).toFixed(precision)).toString();
    }

    // Normál alak nehéz szinten a teljesítmény számolás stílusával
    let display_U_forrás, display_U_fogyasztó, display_I;
    if (difficulty === "hard") {
      const U_forrás_kV = Number((U_forrás / 1000).toFixed(3)); // kV-ban
      const U_fogyasztó_kV = Number((U_fogyasztó / 1000).toFixed(3)); // kV-ban
      const I_mA = Number(I.toFixed(1)); // mA-ban
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

    // Változatos sorrend a kérdésben
    const order = ["U_forrás", "U_fogyasztó", "I"].sort(() => Math.random() - 0.5);
    let displayParts = [];
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
      I: I_A // Áram A-ban
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
    if (!['number', 'decimal', 'fraction', 'power'].includes(task.answerType)) {
      console.warn(`Ismeretlen answerType: ${task.answerType} a ${taskType.name} feladattípusban`);
      task.answerType = 'number'; // Alapértelmezett típus
    }
    questions.push(task);
  }
}

// Kifejezések kiértékelésére szolgáló függvény, amely ellenőrzi, hogy a felhasználó válasza helyes-e
function evaluateExpression(input, correctAnswer, answerType, taskData) {
  if (!input || !correctAnswer) {
    return false;
  }

  let normalizedInput = input.replace(',', '.').replace('×', '*').trim();

  // Ha a bemenet nem tartalmaz műveleti jelet, egyszerű számként kezeljük
  if (!normalizedInput.includes('/') && !normalizedInput.includes('*')) {
    const userAnswer = parseFloat(normalizedInput);
    if (isNaN(userAnswer)) {
      return false;
    }

    if (answerType === 'decimal') {
      const precision = taskData && taskData.value === 'mertekegyseg_kerekites'
        ? parseInt(taskData.display.match(/kerekítve (\d) tizedesjegyre|kerekítve egészre/)?.[1] || 2)
        : (taskData && taskData.value === 'teljesitmeny' && taskData.difficulty === 'hard' ? 5 : 2);
      return Math.abs(userAnswer - parseFloat(correctAnswer)) < Math.pow(10, -precision);
    } else if (answerType === 'number') {
      return Math.abs(userAnswer - parseFloat(correctAnswer)) < 0.01;
    }
    return false;
  }

  // Normál alakú számok kezelése
  function parseScientificNumber(str) {
    str = str.trim();
    const scientificMatch = str.match(/^([\d\.]+)\*10\^([\-]?\d+)$/);
    if (scientificMatch) {
      const mantissa = parseFloat(scientificMatch[1]);
      const exponent = parseInt(scientificMatch[2]);
      return mantissa * Math.pow(10, exponent);
    }
    return parseFloat(str);
  }

  try {
    let computedResult;
    let resultUnit = taskData && taskData.unit ? taskData.unit : '';

    if (normalizedInput.includes('/')) {
      const [left, right] = normalizedInput.split('/').map(s => parseScientificNumber(s.trim()));
      if (isNaN(left) || isNaN(right) || right === 0) {
        return false;
      }
      computedResult = left / right;
    } else if (normalizedInput.includes('*')) {
      const parts = normalizedInput.split('*').map(s => parseScientificNumber(s.trim()));
      if (parts.some(isNaN)) {
        return false;
      }
      computedResult = parts.reduce((acc, val) => acc * val, 1);

      // Teljesítmény számolás specifikus kezelése
      if (taskData && taskData.value === 'teljesitmeny') {
        let expectedLeft = taskData.U; // Feszültség (V vagy kV)
        let expectedRight = taskData.I; // Áram (A vagy mA)
        let I_factor = 1, U_factor = 1;

        if (taskData.difficulty === 'medium') {
          I_factor = 0.001; // kA → A
        } else if (taskData.difficulty === 'hard') {
          U_factor = 1000; // kV → V
          I_factor = 0.001; // mA → A
        }

        expectedLeft *= U_factor;
        expectedRight *= I_factor;

        // Ellenőrizzük, hogy a számított eredmény közel van-e a várt értékhez
        const expectedResult = expectedLeft * expectedRight;
        const formatted = formatNumber(expectedResult, 'W', taskData.difficulty);
        computedResult = formatted.value;
        resultUnit = formatted.unit;

        // Összehasonlítjuk a felhasználó által számított eredményt a helyes válasszal
        const precision = taskData.difficulty === 'hard' ? 5 : 2;
        return Math.abs(computedResult - parseFloat(correctAnswer)) < Math.pow(10, -precision);
      }
    } else {
      return false;
    }

    // Összehasonlítás a helyes válasszal
    const precision = answerType === 'decimal'
      ? (taskData && taskData.value === 'mertekegyseg_kerekites'
        ? parseInt(taskData.display.match(/kerekítve (\d) tizedesjegyre|kerekítve egészre/)?.[1] || 2)
        : (taskData && taskData.value === 'teljesitmeny' && taskData.difficulty === 'hard' ? 5 : 2))
      : 0;

    return Math.abs(computedResult - parseFloat(correctAnswer)) < Math.pow(10, -precision);
  } catch {
    return false;
  }
}
// Segédfüggvény normál alakhoz
function formatScientific(value) {
  if (value === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = (value / Math.pow(10, exponent)).toFixed(2);
  return `${mantissa} × 10^${exponent}`;
}

function renderNumpad(answerState, onChange) {
  const currentTask = questions[currentQuestion] || {};

  // **ÚJ**: Globális állapot mentése a speciális gombokhoz
  if (!window.numpadState) {
    window.numpadState = {
      lightningActivated: false,
      lightningCurrentSymbol: '/',
      lightningCount: 0
    };
  }

  // Számláló a villám gomb egymást követő lenyomásainak követésére
  let lightningCount = window.numpadState.lightningCount;

  const rows = [
    ['1', '2', '3', '±', '←'],
    ['4', '5', '6', '.', 'submit'],
    ['7', '8', '9', '0', '⚡️']
  ];
  const numpadDiv = document.createElement('div');
  numpadDiv.className = 'numpad active';

  // Referencia a villám gombra a számláló kezeléséhez
  let lightningButton = null;

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
          const currentTask = questions[currentQuestion];

          if (!currentTask.answer) {
            alert("Hiba: nincs válasz definiálva!");
            return;
          }

          // Időzítő szüneteltetése
          let pauseStart = Date.now();
          if (timerInterval) {
            clearInterval(timerInterval);
          }

          // Válasz ellenőrzése
          if (currentTask.answerType === 'fraction') {
            if (val.includes('/')) {
              const [ansNum, ansDen] = currentTask.answer.split('/').map(Number);
              const [userNum, userDen] = val.split('/').map(Number);
              if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
                alert("Érvénytelen tört formátum! Ellenőrizd, hogy helyes törtet írtál-e, pl. '3/4'.");
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
              alert(`Nem jó a válasz! A helyes válaszhoz hasonló érték: ${ansNum}/${ansDen} vagy ${(ansNum / ansDen).toFixed(2)}.`);
            }
          } else if (currentTask.answerType === 'power') {
            const powerMatch = val.match(/^([\d\.]+)×10\^([\d\-]+)$/);
            if (!powerMatch) {
              alert("Érvénytelen normál alak! Használj 'a×10^b' formát, pl. '3,5×10^3'.");
              return;
            }
            const [_, userCoef, userExp] = powerMatch;
            const [__, ansCoef, ansExp] = currentTask.answer.match(/^([\d\.]+)×10\^([\d\-]+)$/) || [];
            correct = Math.abs(parseFloat(userCoef.replace(',', '.')) - parseFloat(ansCoef)) < 0.01 && parseInt(userExp) === parseInt(ansExp);
            if (!correct) {
              alert(`Nem jó a normál alak! A helyes válaszhoz hasonló érték: ${ansCoef}×10^${ansExp}. Ellenőrizd a kitevő és az együttható értékét!`);
            }
          } else {
            correct = evaluateExpression(val, currentTask.answer, currentTask.answerType, currentTask);
            if (!correct) {
              let hint = '';
              const userAnswer = parseFloat(val.replace(',', '.'));
              const correctAnswer = parseFloat(currentTask.answer);
              if (!isNaN(userAnswer)) {
                if (currentTask.value === 'ohm_torveny') {
                  if (currentTask.U && currentTask.R) { // I = U / R
                    hint = userAnswer < correctAnswer
                      ? `Túl kicsi a válasz! Az áramot ${currentTask.unit}-ban számold: I = U / R, ahol U = ${currentTask.U} V, R = ${currentTask.R} ${currentTask.unit === 'mA' ? 'MΩ' : 'kΩ'}.`
                      : `Túl nagy a válasz! Az áramot ${currentTask.unit}-ban számold: I = U / R, ahol U = ${currentTask.U} V, R = ${currentTask.R} ${currentTask.unit === 'mA' ? 'MΩ' : 'kΩ'}.`;
                  } else if (currentTask.I && currentTask.R) { // U = I * R
                    hint = userAnswer < correctAnswer
                      ? `Túl kicsi a válasz! A feszültséget V-ban számold: U = I * R, ahol I = ${currentTask.I} ${currentTask.unit === 'V' ? 'mA' : 'A'}, R = ${currentTask.R} ${currentTask.unit === 'V' ? 'MΩ' : 'kΩ'}.`
                      : `Túl nagy a válasz! A feszültséget V-ban számold: U = I * R, ahol I = ${currentTask.I} ${currentTask.unit === 'V' ? 'mA' : 'A'}, R = ${currentTask.R} ${currentTask.unit === 'V' ? 'MΩ' : 'kΩ'}.`;
                  } else if (currentTask.U && currentTask.I) { // R = U / I
                    hint = userAnswer < correctAnswer
                      ? `Túl kicsi a válasz! Az ellenállást ${currentTask.unit}-ban számold: R = U / I, ahol U = ${currentTask.U} V, I = ${currentTask.I} ${currentTask.unit === 'kΩ' || currentTask.unit === 'MΩ' ? 'mA' : 'A'}.`
                      : `Túl nagy a válasz! Az ellenállást ${currentTask.unit}-ban számold: R = U / I, ahol U = ${currentTask.U} V, I = ${currentTask.I} ${currentTask.unit === 'kΩ' || currentTask.unit === 'MΩ' ? 'mA' : 'A'}.`;
                  }
                } else {
                  hint = userAnswer < correctAnswer
                    ? `Túl kicsi a válasz! Próbálj nagyobb értéket, közel ${correctAnswer.toFixed(2)} ${currentTask.unit || ''}-hoz.`
                    : `Túl nagy a válasz! Próbálj kisebb értéket, közel ${correctAnswer.toFixed(2)} ${currentTask.unit || ''}-hoz.`;
                }
              } else {
                hint = `Érvénytelen válasz! Ellenőrizd a formátumot, pl. '123', '0,93', vagy '${currentTask.answerType === 'fraction' ? '3/4' : '320/460'}'.`;
              }
              alert(hint);
            }
          }

          // Szüneteltetés időtartamának kiszámítása
          const pauseEnd = Date.now();
          const pauseDuration = pauseEnd - pauseStart;

          if (correct) {
            score++;
            currentQuestion++;
            showQuestion(currentQuestion);
            if (currentQuestion >= QUESTIONS) {
              finishGame();
            } else {
              // Időzítő folytatása a szüneteltetés figyelembevételével
              startTime += pauseDuration; // startTime korrigálása
              timerInterval = setInterval(updateTimer, 1000);
            }
          } else {
            wrongAnswers++;
            // Időzítő folytatása a szüneteltetés figyelembevételével
            startTime += pauseDuration; // startTime korrigálása
            timerInterval = setInterval(updateTimer, 1000);
          }
        };
        rowDiv.appendChild(submitBtn);
      } else {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = 'numpad-btn';
        btn.textContent = key;
        btn.tabIndex = -1;

        // Speciális gomb inicializálása
        if (key === '⚡️') {
          // **MÓDOSÍTOTT**: Állapot visszaállítása a mentett értékekből
          if (window.numpadState.lightningActivated) {
            btn.dataset.state = window.numpadState.lightningCurrentSymbol;
            btn.textContent = window.numpadState.lightningCurrentSymbol;
          } else {
            btn.dataset.state = '⚡️'; // Kezdeti állapot: villám
          }
          btn.dataset.lightningCount = window.numpadState.lightningCount.toString();
          lightningButton = btn; // Referencia tárolása a villám gombra
        } else if (key === '/') {
          btn.dataset.state = '/'; // Kezdeti állapot: /
        }

        btn.onclick = () => {
          btn.classList.add('flash');
          setTimeout(() => btn.classList.remove('flash'), 200);

          // Ha nem a villám gombot nyomták meg, és a villám gomb még villám állapotban van, visszaállítjuk a számlálót
          if (key !== '⚡️' && lightningButton && lightningButton.dataset.state === '⚡️') {
            lightningCount = 0;
            window.numpadState.lightningCount = 0; // **ÚJ**: Globális állapot frissítése
            lightningButton.dataset.lightningCount = '0';
            console.log('Más gomb lenyomva, villám számláló visszaállítva:', { lightningCount, currentValue: answerState.value });
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
            // Villám gomb kezelése
            lightningCount = parseInt(btn.dataset.lightningCount || '0') + 1;
            btn.dataset.lightningCount = lightningCount.toString();
            window.numpadState.lightningCount = lightningCount; // **ÚJ**: Globális állapot frissítése
            console.log('Villám gomb lenyomva:', { lightningCount, currentValue: answerState.value });

            if (lightningCount >= 9 && !window.numpadState.lightningActivated) {
              // **MÓDOSÍTOTT**: Kilenc egymást követő lenyomás után váltás / jelre
              btn.dataset.state = '/';
              btn.textContent = '/';
              window.numpadState.lightningActivated = true; // **ÚJ**: Aktiválás jelzése
              window.numpadState.lightningCurrentSymbol = '/'; // **ÚJ**: Aktuális szimbólum mentése
              lightningCount = 0; // Számláló visszaállítása
              window.numpadState.lightningCount = 0; // **ÚJ**: Globális állapot frissítése
              btn.dataset.lightningCount = '0';
              console.log('Villám gomb átváltva / jelre:', { newState: '/', newText: btn.textContent });
            }

            // Ha még villám állapotban van, nem adunk hozzá semmit
            if (btn.dataset.state === '⚡️') {
              console.log('Villám gomb még nem váltott, nincs bevitel.');
              return;
            }

            // Ha már / vagy * jelre váltott, a speciális viselkedését követi
            const currentState = btn.dataset.state;
            const lastChar = answerState.value.slice(-1);
            console.log('Speciális gomb kezelése:', { currentState, lastChar, currentValue: answerState.value });

            // Ha az utolsó karakter '/' vagy '*', eltávolítjuk
            if (lastChar === '/' || lastChar === '*') {
              answerState.value = answerState.value.slice(0, -1);
            }

            // Aktuális jel hozzáadása
            answerState.value += currentState;

            // Váltás a másik jelre
            const newState = currentState === '/' ? '*' : '/';
            btn.dataset.state = newState;
            btn.textContent = newState;
            window.numpadState.lightningCurrentSymbol = newState; // **ÚJ**: Új szimbólum mentése
            console.log('Speciális gomb frissítve:', { newState, buttonText: btn.textContent, newValue: answerState.value });
          } else if (key === '.') {
            if (answerState.value !== "" && !answerState.value.includes('.')) {
              answerState.value += ','; // Vessző a magyar billentyűzethez
            }
          } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
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
    progressWrong.style.left = `${(score / QUESTIONS) * 100}%`; // Hibás sáv a helyes sáv után
  }

  div.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- JÁTÉK INDITÁS ---
function startGame() {
  // **ÚJ**: Numpad állapot visszaállítása új játéknál
  window.numpadState = {
    lightningActivated: false,
    lightningCurrentSymbol: '/',
    lightningCount: 0
  };
  
  gameActive = true;
  score = 0;
  currentQuestion = 0;
  wrongAnswers = 0; // Helytelen válaszok inicializálása
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