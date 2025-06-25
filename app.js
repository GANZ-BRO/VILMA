const quizContainer = document.getElementById("quiz");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const themeToggle = document.getElementById("theme-toggle");
const restartBtn = document.getElementById("restart");

const QUESTIONS = 10;
let score, startTime, timerInterval, currentQuestion;
let questions = [];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestions() {
  questions = [];
  for (let i = 0; i < QUESTIONS; i++) {
    const num1 = getRandomInt(-10, 10);
    const num2 = getRandomInt(-10, 10);
    questions.push({ num1, num2, answer: num1 + num2 });
  }
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `Eltelt idő: ${elapsed} másodperc`;
}

function showQuestion(index) {
  quizContainer.innerHTML = '';
  if (index >= QUESTIONS) {
    clearInterval(timerInterval);
    timerDisplay.textContent += " (Vége)";
    quizContainer.innerHTML = `<p><strong>Gratulálok!</strong> ${score} pontot szereztél ${timerDisplay.textContent.toLowerCase()}.</p>`;
    restartBtn.style.display = "inline-block";
    return;
  }
  const { num1, num2, answer } = questions[index];
  const div = document.createElement("div");
  div.innerHTML = `
    <label for="answer${index}">${index + 1}. feladat: ${num1} + ${num2} = </label>
    <input id="answer${index}" type="number" autocomplete="off" aria-label="Válasz a(z) ${num1} + ${num2} = kérdésre">
    <button type="button" id="submit${index}">Küldés</button>
  `;
  quizContainer.appendChild(div);

  document.getElementById(`answer${index}`).focus();
  document.getElementById(`submit${index}`).onclick = () => {
    const val = document.getElementById(`answer${index}`).value;
    if (parseInt(val, 10) === answer) {
      score++;
      scoreDisplay.textContent = `Pontszám: ${score}`;
      showQuestion(index + 1);
    } else {
      alert("Nem jó válasz, próbáld újra!");
    }
  };
}

function startQuiz() {
  score = 0;
  currentQuestion = 0;
  scoreDisplay.textContent = `Pontszám: ${score}`;
  startTime = Date.now();
  restartBtn.style.display = "none";
  generateQuestions();
  showQuestion(0);
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  updateTimer();
}

// Theme logic
function applyTheme() {
  const darkMode = localStorage.getItem("theme") !== "light";
  document.body.classList.toggle("light", !darkMode);
}
themeToggle.onclick = function() {
  if (document.body.classList.contains("light")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
  applyTheme();
};
applyTheme();

// Restart logic
restartBtn.onclick = startQuiz;

// Init
window.onload = startQuiz;
