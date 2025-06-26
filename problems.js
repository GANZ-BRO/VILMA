function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }
function simplifyFraction(num, den) {
  const sign = (num * den) < 0 ? "-" : "";
  num = Math.abs(num); den = Math.abs(den);
  const d = gcd(num, den);
  return sign + (num/d) + "/" + (den/d);
}
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function generateAddition(difficulty) {
  let range = {easy:[1,30], medium:[-20,60], hard:[-100,150]}[difficulty];
  return Array.from({length:10}, () => {
    let a = randInt(...range), b = randInt(...range);
    return { question:`${a} + ${b} = ?`, answer:a+b, explanation:`Az összeadás eredménye: ${a} + ${b} = ${a+b}` };
  });
}
function generateSubtraction(difficulty) {
  let range = {easy:[5,40], medium:[-30,70], hard:[-120,170]}[difficulty];
  return Array.from({length:10}, () => {
    let a = randInt(...range), b = randInt(...range);
    return { question:`${a} - ${b} = ?`, answer:a-b, explanation:`A kivonás eredménye: ${a} - ${b} = ${a-b}` };
  });
}
function generateMultiplication(difficulty) {
  let range = {easy:[2,10], medium:[-10,15], hard:[-20,25]}[difficulty];
  return Array.from({length:10}, () => {
    let a = randInt(...range), b = randInt(...range);
    return { question:`${a} × ${b} = ?`, answer:a*b, explanation:`A szorzás eredménye: ${a} × ${b} = ${a*b}` };
  });
}
function generateDivision(difficulty) {
  let range = {easy:[2,10], medium:[-10,15], hard:[-20,25]}[difficulty];
  return Array.from({length:10}, () => {
    let b = 0; while (b === 0) b = randInt(...range);
    let ans = randInt(-10, 15);
    let a = b * ans;
    return { question:`${a} ÷ ${b} = ?`, answer:ans, explanation:`${a} ÷ ${b} = ${ans}` };
  });
}
function generateMixed(difficulty) {
  const ops = ["+", "-", "×", "÷"];
  let arr = [];
  let ranges = {
    "+": {easy:[1,30], medium:[-20,60], hard:[-100,150]},
    "-": {easy:[5,40], medium:[-30,70], hard:[-120,170]},
    "×": {easy:[2,10], medium:[-10,15], hard:[-20,25]},
    "÷": {easy:[2,10], medium:[-10,15], hard:[-20,25]}
  };
  for (let i = 0; i < 10; i++) {
    let op = ops[randInt(0,3)];
    let a, b, ans, q, expl;
    if (op === "+") {
      a = randInt(...ranges["+"]. [difficulty]); b = randInt(...ranges["+"]. [difficulty]);
      ans = a + b; q = `${a} + ${b} = ?`; expl = `Az összeadás eredménye: ${a} + ${b} = ${ans}`;
    } else if (op === "-") {
      a = randInt(...ranges["-"]. [difficulty]); b = randInt(...ranges["-"]. [difficulty]);
      ans = a - b; q = `${a} - ${b} = ?`; expl = `A kivonás eredménye: ${a} - ${b} = ${ans}`;
    } else if (op === "×") {
      a = randInt(...ranges["×"]. [difficulty]); b = randInt(...ranges["×"]. [difficulty]);
      ans = a * b; q = `${a} × ${b} = ?`; expl = `A szorzás eredménye: ${a} × ${b} = ${ans}`;
    } else {
      b = 0; while (b === 0) b = randInt(...ranges["÷"]. [difficulty]);
      ans = randInt(-10, 15); a = b * ans;
      q = `${a} ÷ ${b} = ?`; expl = `${a} ÷ ${b} = ${ans}`;
    }
    arr.push({question:q, answer:ans, explanation:expl});
  }
  return arr;
}
function generateParentheses(difficulty) {
  let arr = [];
  let r = {easy:[1,10], medium:[-10,20], hard:[-20,30]}[difficulty];
  for(let i=0;i<10;i++){
    let type = randInt(1,3);
    let a = randInt(...r), b = randInt(...r), c = randInt(-5,5);
    let q, ans, expl;
    if(type===1){
      q = `(${a} + ${b}) × ${c} = ?`; ans=(a+b)*c; expl=`Először zárójel: ${a}+${b}=${a+b}, majd szorzás: ${a+b}×${c}=${ans}`;
    } else if(type===2){
      q = `(${a} - ${b}) + ${c} = ?`; ans=(a-b)+c; expl=`Zárójel: ${a}-${b}=${a-b}, majd összeadás: ${a-b}+${c}=${ans}`;
    } else {
      q = `${a} + (${b} × ${c}) = ?`; ans=a+(b*c); expl=`Zárójel: ${b}×${c}=${b*c}, majd összeadás: ${a}+${b*c}=${ans}`;
    }
    arr.push({question:q, answer:ans, explanation:expl});
  }
  return arr;
}
function generateFractions(difficulty) {
  let arr = [];
  for(let i=0;i<10;i++){
    let type = randInt(1,2);
    let n1=randInt(1,9),d1=randInt(2,10),n2=randInt(1,9),d2=randInt(2,10);
    if(type===1){
      let common=d1*d2,num=n1*d2+n2*d1;
      arr.push({
        question:`${n1}/${d1} + ${n2}/${d2} = ?`,
        answer:simplifyFraction(num,common),
        explanation:`Közös nevező: ${d1}×${d2}=${common}, számláló: ${n1}×${d2}+${n2}×${d1}=${n1*d2}+${n2*d1}=${num}, egyszerűsítve: ${simplifyFraction(num,common)}`
      });
    } else {
      let num=n1*n2,den=d1*d2;
      arr.push({
        question:`${n1}/${d1} × ${n2}/${d2} = ?`,
        answer:simplifyFraction(num,den),
        explanation:`Számlálók szorzata: ${n1}×${n2}=${num}, nevezők szorzata: ${d1}×${d2}=${den}, egyszerűsítve: ${simplifyFraction(num,den)}`
      });
    }
  }
  return arr;
}
function generatePercent(difficulty) {
  let arr = [];
  for(let i=0;i<10;i++){
    let base=randInt(10,200),perc=randInt(5,90);
    let askType=randInt(0,1);
    if(askType===0){
      arr.push({
        question:`Mi a ${perc}%-a a ${base}-nak/nek?`,
        answer:Math.round(base*perc/100),
        explanation:`${base} × ${perc}% = ${base} × ${perc}/100 = ${Math.round(base*perc/100)}`
      });
    } else {
      let value=randInt(1,base);
      arr.push({
        question:`A ${base}-nak hány %-a a ${value}?`,
        answer:Math.round((value/base)*100),
        explanation:`${value} ÷ ${base} × 100 = ${Math.round((value/base)*100)}%`
      });
    }
  }
  return arr;
}
function generateEquations(difficulty) {
  let arr = [];
  for(let i=0;i<10;i++){
    let x=randInt(-15,20);
    let type=randInt(0,1);
    if(type===0){
      let a=randInt(-10,10),b=x+a;
      arr.push({
        question:`Oldd meg: x + ${a} = ${b}`,
        answer:x,
        explanation:`x = ${b} - (${a}) = ${b-a}`
      });
    } else {
      let k=randInt(2,8),b=x*k;
      arr.push({
        question:`Oldd meg: ${k}x = ${b}`,
        answer:x,
        explanation:`x = ${b} ÷ ${k} = ${b/k}`
      });
    }
  }
  return arr;
}

function getProblemsByTopicAndDifficulty(topic, difficulty) {
  if (topic==="Összeadás") return generateAddition(difficulty);
  if (topic==="Kivonás") return generateSubtraction(difficulty);
  if (topic==="Szorzás") return generateMultiplication(difficulty);
  if (topic==="Osztás") return generateDivision(difficulty);
  if (topic==="Mind a négy művelet") return generateMixed(difficulty);
  if (topic==="Zárójeles kifejezések") return generateParentheses(difficulty);
  if (topic==="Törtek") return generateFractions(difficulty);
  if (topic==="Százalékszámítás") return generatePercent(difficulty);
  if (topic==="Egyenletek átrendezése") return generateEquations(difficulty);
  return [];
}
