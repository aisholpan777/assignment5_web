
const INITIAL_LIVES = 3;
const MIN_VALUE = 1;
const MAX_VALUE = 100;
const LIFE_SYMBOL = '❤️';
const EMPTY_LIFE_SYMBOL = '🖤';

let lives = INITIAL_LIVES;
let streak = 0;
let bestStreak = 0;
let currentValue = 0;
let isGameOver = false;

const livesEl = document.getElementById('t1-lives');
const streakEl = document.getElementById('t1-streak');
const bestStreakEl = document.getElementById('t1-best-streak');
const currentValueEl = document.getElementById('t1-current-val');
const messageEl = document.getElementById('t1-message');
const btnHigher = document.getElementById('t1-btn-higher');
const btnLower = document.getElementById('t1-btn-lower');
const btnRestart = document.getElementById('t1-btn-restart');

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateUI() {
  currentValueEl.textContent = currentValue;
  streakEl.textContent = streak;
  bestStreakEl.textContent = bestStreak;

  livesEl.textContent =
    LIFE_SYMBOL.repeat(lives) +
    EMPTY_LIFE_SYMBOL.repeat(INITIAL_LIVES - lives);
}

function initGame() {
  lives = INITIAL_LIVES;
  streak = 0;
  isGameOver = false;
  currentValue = getRandomNumber(MIN_VALUE, MAX_VALUE);

  messageEl.textContent = 'Make your choice!';
  messageEl.className = 'message-box';

  btnRestart.classList.add('hidden');
  btnHigher.disabled = false;
  btnLower.disabled = false;

  updateUI();
}

function makeGuess(guess) {
  if (isGameOver || lives <= 0) {
    messageEl.textContent = 'Game is over. Press Play Again!';
    return;
  }

  if (guess !== 'higher' && guess !== 'lower') {
    messageEl.textContent = 'Invalid move! Choose Higher or Lower.';
    messageEl.className = 'message-box error';
    return;
  }

  const nextValue = getRandomNumber(MIN_VALUE, MAX_VALUE);

  const isHigher = nextValue > currentValue;
  const isLower = nextValue < currentValue;
  const isEqual = nextValue === currentValue;

  const isCorrect =
    (guess === 'higher' && isHigher) ||
    (guess === 'lower' && isLower) ||
    isEqual;

  if (isCorrect) {
    streak++;

    if (streak > bestStreak) {
      bestStreak = streak;
    }

    messageEl.textContent =
      `Correct! Next value was ${nextValue}. Keep going!`;
    messageEl.className = 'message-box success';
  } else {
    lives--;
    streak = 0;

    messageEl.textContent =
      `Wrong! Next value was ${nextValue}. Life lost!`;
    messageEl.className = 'message-box error';
  }

  currentValue = nextValue;
  updateUI();

  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  isGameOver = true;

  messageEl.textContent =
    `Game Over! Best streak: ${bestStreak}.`;

  messageEl.className = 'message-box error';

  btnHigher.disabled = true;
  btnLower.disabled = true;
  btnRestart.classList.remove('hidden');
}

btnHigher.addEventListener('click', () => makeGuess('higher'));
btnLower.addEventListener('click', () => makeGuess('lower'));
btnRestart.addEventListener('click', initGame);

initGame();
