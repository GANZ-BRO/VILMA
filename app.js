// --- State ---
let problems=[], answers=[], score=0, timerInt=null, startTime=0;
let bestStats={};

// --- UI Elements ---
const $problems = document.getElementById("problems");
const $category = document.getElementById("category");
const $difficulty = document.getElementById("difficulty");
const $username = document.getElementById("username");
const $score = document.getElementById("score");
const $timer = document.getElementById("timer");
const $start = document.getElementById("start-btn");
const $restart = document.getElementById("restart-btn");
const $summary = document.getElementById("summary");
const $best = document.getElementById("best-stats");

// --- Best results storage and display ---
function bestKey() {
  return "math-best-"+$category.value+"-"+$difficulty.value+"-"+($username.value.trim()||"anon");
}
function loadBest() {
  let b = localStorage.getItem(bestKey());
  bestStats = b ? JSON.parse(b) : {score:0,time:null};
  if(bestStats.score>0) {
    $best.textContent = `🏆 Legjobb: ${bestStats.score}/10 pont, ${bestStats.time} mp (${($username.value||"anon")})`;
    $best.style.display = "";
  } else {
    $best.style.display = "none";
  }
}
function saveBestIfNeeded(score, elapsed) {
  if(score > (bestStats.score||0) || (score === bestStats.score && (bestStats.time === null || elapsed < bestStats.time))) {
    bestStats = {score, time:elapsed};
    localStorage.setItem(bestKey(), JSON.stringify(bestStats));
    loadBest();
  }
}

// --- Timer ---
function startTimer() {
  startTime = Date.now();
  $timer.textContent = "⏱️ 0 mp";
  if(timerInt) clearInterval(timerInt);
  timerInt = setInterval(()=>{
    let elapsed = Math.floor((Date.now()-startTime)/1000);
    $timer.textContent = `⏱️ ${elapsed} mp`;
  }, 1000);
}
function stopTimer() {
  if(timerInt) clearInterval(timerInt);
}

// --- Numpad ---
function renderNumpad(answerState, onChange) {
  const keys = ['1','2','3','4','5','6','7','8','9','-','0','←'];
  const numpadDiv = document.createElement('div');
  numpadDiv.className = 'numpad';
  keys.forEach(key => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'numpad-btn';
    btn.textContent = key;
    btn.tabIndex = 0;
    btn.onclick = () => {
      if (key === '←') {
        answerState.value = answerState.value.slice(0, -1);
      } else if (key === '-') {
        if (!answerState.value.startsWith('-')) answerState.value = '-' + answerState.value;
        else answerState.value = answerState.value.substring(1);
      } else {
        answerState.value += key;
      }
      onChange(answerState.value);
    };
    numpadDiv.appendChild(btn);
  });
  return numpadDiv;
}

// --- Problem rendering and interaction ---
function renderProblems() {
  $problems.innerHTML = "";
  $summary.innerHTML = "";
  answers = Array(problems.length).fill("");
  score = 0;
  $score.textContent = "🏅 0";
  problems.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "problem-card";
    // Question
    const label = document.createElement("label");
    label.className = "problem-label";
    label.textContent = `${i+1}. ${p.question}`;
    card.appendChild(label);
    // "Virtuális input"
    let answerState = {value:""};
    const answerView = document.createElement("div");
    answerView.className = "answer-view";
    answerView.textContent = "";
    card.appendChild(answerView);
    // Numpad
    card.appendChild(renderNumpad(answerState, val => { answerView.textContent = val; }));
    // Feedback
    const feedback = document.createElement("div");
    feedback.className = "feedback";
    card.appendChild(feedback);
    // Ellenőrző/küldés gomb
    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.textContent = "Ellenőrzés";
    checkBtn.className = "numpad-btn";
    checkBtn.onclick = ()=>{
      if (answerState.value === "" || answerState.value === "-") {
        feedback.textContent = "Írj be választ!";
        feedback.className = "feedback wrong";
        return;
      }
      let correct = false;
      if ($category.value==="Törtek") {
        const normalize = s => s.replace(/\s/g,"").replace(/^-0+/, "-").replace(/^0+/, "");
        correct = normalize(answerState.value) === normalize(p.answer);
      } else {
        correct = (parseFloat(answerState.value.replace(",", ".")) == p.answer);
      }
      if (correct) {
        feedback.textContent = "✅ Helyes!";
        feedback.className = "feedback correct";
        answers[i] = "good";
        checkBtn.disabled = true;
        answerView.style.background = "#2d5230";
        score++;
        $score.textContent = `🏅 ${score}`;
        if (answers.filter(x=>x==="good").length === problems.length) finishPractice();
      } else {
        feedback.textContent = `❌ Hibás! Helyes: ${p.answer}\n${p.explanation||""}`;
        feedback.className = "feedback wrong";
        answers[i] = "wrong";
        answerView.style.background = "#4c2323";
      }
    };
    card.appendChild(checkBtn);
    $problems.appendChild(card);
  });
}

// --- Summary at the end ---
function finishPractice() {
  stopTimer();
  let elapsed = Math.floor((Date.now()-startTime)/1000);
  $summary.innerHTML =
    `<div class="summary"><h2>Eredmény összegzés</h2>
    <b>Pontszám:</b> ${score}/10<br>
    <b>Idő:</b> ${elapsed} mp
    <ul class="summary-list">
    ${problems.map((p,i)=>answers[i]==="good"
      ? `<li>✅ ${p.question}</li>`
      : `<li>❌ ${p.question} <span style="color:#79ec7d;">Helyes: ${p.answer}</span></li>`
    ).join("")}
    </ul>
    </div>`;
  saveBestIfNeeded(score, elapsed);
  $restart.style.display = "";
}

// --- Start/restart logic ---
function startPractice() {
  $summary.innerHTML = "";
  problems = getProblemsByTopicAndDifficulty($category.value, $difficulty.value);
  renderProblems();
  score = 0;
  $score.textContent = "🏅 0";
  $start.style.display = "none";
  $restart.style.display = "none";
  $timer.textContent = "⏱️ 0 mp";
  startTimer();
  loadBest();
}
$start.onclick = startPractice;
$restart.onclick = startPractice;

// --- Update best on change ---
[$category, $difficulty, $username].forEach(el=>{
  el.addEventListener("change", loadBest);
  el.addEventListener("input", loadBest);
});

// --- Initial state ---
loadBest();
