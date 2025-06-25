function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}
function simplifyFraction(num, den) {
  const sign = (num * den) < 0 ? "-" : "";
  num = Math.abs(num);
  den = Math.abs(den);
  const d = gcd(num, den);
  return sign + (num/d) + "/" + (den/d);
}
function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Összeadás
function generateAddition() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let a = randInt(-50, 100), b = randInt(-50, 100);
    arr.push({
      topic: "Összeadás",
      question: `${a} + ${b} = ?`,
      answer: a + b
    });
  }
  return arr;
}

// Kivonás
function generateSubtraction() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let a = randInt(-50, 100), b = randInt(-50, 100);
    arr.push({
      topic: "Kivonás",
      question: `${a} - ${b} = ?`,
      answer: a - b
    });
  }
  return arr;
}

// Szorzás
function generateMultiplication() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let a = randInt(-15, 20), b = randInt(-15, 20);
    arr.push({
      topic: "Szorzás",
      question: `${a} × ${b} = ?`,
      answer: a * b
    });
  }
  return arr;
}

// Osztás
function generateDivision() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let b = 0;
    while (b === 0) b = randInt(-20, 20);
    let answer = randInt(-10, 10);
    let a = b * answer;
    arr.push({
      topic: "Osztás",
      question: `${a} ÷ ${b} = ?`,
      answer: answer
    });
  }
  return arr;
}

// Mind a négy művelet (egyszerű vegyes)
function generateMixed() {
  const ops = ["+", "-", "×", "÷"];
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let op = ops[randInt(0, 3)];
    let a = randInt(-20, 50), b = randInt(-20, 50);
    let question = "";
    let answer;
    if (op === "+") {
      question = `${a} + ${b} = ?`;
      answer = a + b;
    } else if (op === "-") {
      question = `${a} - ${b} = ?`;
      answer = a - b;
    } else if (op === "×") {
      question = `${a} × ${b} = ?`;
      answer = a * b;
    } else {
      while (b === 0) b = randInt(-20, 50);
      answer = randInt(-10, 10);
      a = b * answer;
      question = `${a} ÷ ${b} = ?`;
    }
    arr.push({
      topic: "Mind a négy művelet",
      question,
      answer
    });
  }
  return arr;
}

// Zárójeles kifejezések
function generateParentheses() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let type = randInt(1, 3);
    let a = randInt(-10, 20), b = randInt(-10, 20), c = randInt(-5, 5);
    let question = "";
    let answer;
    if (type === 1) {
      question = `(${a} + ${b}) × ${c} = ?`;
      answer = (a + b) * c;
    } else if (type === 2) {
      question = `(${a} - ${b}) + ${c} = ?`;
      answer = (a - b) + c;
    } else {
      question = `${a} + (${b} × ${c}) = ?`;
      answer = a + (b * c);
    }
    arr.push({
      topic: "Zárójeles kifejezések",
      question,
      answer
    });
  }
  return arr;
}

// Törtek (egyszerű összeadás, szorzás)
function generateFractions() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let type = randInt(1, 2);
    let n1 = randInt(1, 9), d1 = randInt(2, 10), n2 = randInt(1, 9), d2 = randInt(2, 10);
    if (type === 1) {
      let common = d1 * d2;
      let num = n1 * d2 + n2 * d1;
      arr.push({
        topic: "Törtek",
        question: `${n1}/${d1} + ${n2}/${d2} = ?`,
        answer: simplifyFraction(num, common)
      });
    } else {
      let num = n1 * n2;
      let den = d1 * d2;
      arr.push({
        topic: "Törtek",
        question: `${n1}/${d1} × ${n2}/${d2} = ?`,
        answer: simplifyFraction(num, den)
      });
    }
  }
  return arr;
}

// Százalékszámítás
function generatePercent() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let base = randInt(10, 200);
    let perc = randInt(5, 90);
    let askType = randInt(0, 1);
    if (askType === 0) {
      arr.push({
        topic: "Százalékszámítás",
        question: `Mi a ${perc}%-a a ${base}-nak/nek?`,
        answer: Math.round((base * perc) / 100)
      });
    } else {
      let value = randInt(1, base);
      arr.push({
        topic: "Százalékszámítás",
        question: `A ${base}-nak hány %-a a ${value}?`,
        answer: Math.round((value / base) * 100)
      });
    }
  }
  return arr;
}

// Egyenletek átrendezése (egyszerű egyismeretlenes)
function generateEquations() {
  let arr = [];
  for (let i = 0; i < 10; i++) {
    let x = randInt(-15, 20);
    let type = randInt(0, 1);
    if (type === 0) {
      let a = randInt(-10, 10);
      let b = x + a;
      arr.push({
        topic: "Egyenletek átrendezése",
        question: `Oldd meg: x + ${a} = ${b}`,
        answer: x
      });
    } else {
      let k = randInt(2, 8);
      let b = x * k;
      arr.push({
        topic: "Egyenletek átrendezése",
        question: `Oldd meg: ${k}x = ${b}`,
        answer: x
      });
    }
  }
  return arr;
}

// Fő függvény
function getProblemsByTopic(topic) {
  if (topic === "Összeadás") return generateAddition();
  if (topic === "Kivonás") return generateSubtraction();
  if (topic === "Szorzás") return generateMultiplication();
  if (topic === "Osztás") return generateDivision();
  if (topic === "Mind a négy művelet") return generateMixed();
  if (topic === "Zárójeles kifejezések") return generateParentheses();
  if (topic === "Törtek") return generateFractions();
  if (topic === "Százalékszámítás") return generatePercent();
  if (topic === "Egyenletek átrendezése") return generateEquations();
  return [];
}
