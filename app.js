
// Pes Vres - English Edition (client-side JS)
let cards = [];
let currentCard = null;
let timerInterval = null;
let timeLeft = 60;
let scores = [];
let activeRound = false;

async function loadCards() {
  const resp = await fetch('cards.json');
  cards = await resp.json();
}

function el(id){return document.getElementById(id)}

function shuffle(a){ for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a }

function renderScores() {
  const container = el('teamScores');
  container.innerHTML = '';
  scores.forEach((s,i)=>{
    const div = document.createElement('div');
    div.className = 'scoreCard';
    div.innerHTML = `<div>Team ${i+1}</div><div style="font-weight:700;font-size:1.1rem">${s}</div>`;
    container.appendChild(div);
  });
  // activeTeam select
  const at = el('activeTeam');
  at.innerHTML = '';
  for(let i=0;i<scores.length;i++){
    const o = document.createElement('option'); o.value=i; o.textContent=`Team ${i+1}`; at.appendChild(o);
  }
}

function newCard() {
  if(cards.length === 0) return;
  currentCard = JSON.parse(JSON.stringify(cards[Math.floor(Math.random()*cards.length)]));
  // shuffle answers order but keep list
  currentCard.answers = shuffle(currentCard.answers.slice());
  renderCard();
}

function renderCard(){
  el('category').textContent = currentCard.category;
  const answersDiv = el('answers');
  answersDiv.innerHTML = '';
  currentCard.answers.forEach((a, idx)=>{
    const d = document.createElement('div');
    d.className = 'answer';
    d.dataset.idx = idx;
    d.textContent = a;
    d.addEventListener('click', ()=>{
      d.classList.toggle('revealed');
    });
    answersDiv.appendChild(d);
  });
}

function revealAll(){
  document.querySelectorAll('.answer').forEach(a=>a.classList.add('revealed'));
}

function startTimer(){
  if(!currentCard) return alert('Load a card first.');
  if(activeRound) return;
  timeLeft = parseInt(el('roundTime').value,10) || 60;
  el('timer').textContent = timeLeft;
  activeRound = true;
  timerInterval = setInterval(()=>{
    timeLeft--;
    el('timer').textContent = timeLeft;
    if(timeLeft<=0){ stopTimer(); alert('Time is up!'); }
  },1000);
}

function stopTimer(){
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  activeRound = false;
}

function applyPoints(){
  const pts = parseInt(el('turnPoints').value,10) || 0;
  const team = parseInt(el('activeTeam').value,10) || 0;
  scores[team] += pts;
  renderScores();
  log(`Team ${team+1} received ${pts} points.`);
  checkWinner();
}

function checkWinner(){
  const target = parseInt(el('targetScore').value,10) || 30;
  for(let i=0;i<scores.length;i++){
    if(scores[i] >= target){
      alert(`Team ${i+1} reached ${scores[i]} points and wins!`);
      stopTimer();
    }
  }
}

function stealReveal(){
  // reveal unrevealed and let host assign steals.
  revealAll();
  log('Steal round: remaining answers revealed.');
}

function log(msg){
  const l = el('log');
  const ts = new Date().toLocaleTimeString();
  l.innerHTML = `<div>[${ts}] ${msg}</div>` + l.innerHTML;
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadCards();
  el('startGame').addEventListener('click', ()=>{
    const teams = parseInt(el('teamCount').value,10) || 2;
    scores = Array.from({length:teams},()=>0);
    el('setup').hidden = true;
    document.querySelector('.game').hidden = false;
    renderScores();
    newCard();
  });
  el('nextCard').addEventListener('click', ()=> newCard());
  el('revealAll').addEventListener('click', revealAll);
  el('startRound').addEventListener('click', startTimer);
  el('stopRound').addEventListener('click', stopTimer);
  el('applyPoints').addEventListener('click', applyPoints);
  el('steal').addEventListener('click', stealReveal);
});
