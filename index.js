const game = {
  // options
  width: 5,
  height: 5,
  // state
  playing: false, // are we playing?
  lastNumber: 0, // last number player picked from the field
  timeStarted: null, // time when game started
  timeFinished: null  //time when game finished
}

class Record {	
  constructor(timeFinished, timePassedMs, timePassedStr){
    this.timeFinished = timeFinished,
    this.timePassedMs = timePassedMs,
    this.timePassedStr = timePassedStr
  }
}

class Timer {
  constructor(html, mi, ss){
  this.html = html,
  this.mi = mi || 0,
  this.ss = ss || 0

  this.html.innerHTML = timerToStr(this.mi, this.ss)

  //[TODO] START destroy this
  this.interval = setInterval(
      this.addSs.bind(this),
      1000
    )
  }
  //[TODO] END destroy this
	
  addSs() {
	this.ss = this.ss + 1
	if (this.ss == 60){
      this.ss = 0;
      this.mi++;
	}
	this.html.innerHTML = timerToStr(this.mi, this.ss)
  }
}

function timerToStr(mi, ss){
  return padTo2Digits(mi) + ':' + padTo2Digits(ss);
}

var records = []

const playfield = document.querySelector('.playfield')
const startButton = document.querySelector('.start-button')

const widthInput = document.querySelector('#width-input')
const heightInput = document.querySelector('#height-input')
const widthDisplay = document.querySelector('.width-value')
const heightDisplay = document.querySelector('.height-value')

const rulesModal = document.querySelector('.rules-backdrop')
const rulesButton = document.querySelector('.rules-button')
const rulesOkButton = document.querySelector('.rules-ok-button')

// Knuth shuffle
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }
}

// make playfield card from a number
// returns a HTML-string
function makeElement(number, width) {
  return `<div data-number="${number}" class="playcard playcard-${width}">${number}</div>`
}

function createField() {
  const size = game.width * game.height
  // create numbers
  const numbers = []
  for (let i = 1; i <= size; i++) {
    numbers.push(i)
  }

  // scramble numbers
  shuffle(numbers)

  // turn numbers into elements
  const elements = []
  for (let number of numbers) {
    elements.push(makeElement(number, game.width))
  }

  // string representation of the field
  return elements.join('')
}

// starts new game
function startGame() {
  // create a new field
  const fieldString = createField()
  playfield.innerHTML = fieldString

  // reset gamestate
  game.playing = true
  game.lastNumber = 0
  game.timeStarted = Date.now()
  
  var timer = new Timer(document.querySelector('#timer'), 0, 0, 0)
}

// handler for clicking on the field
function handlePlayfieldClick(e) {
  // if we are not playing, no effect
  if (!game.playing) {
    return
  }

  // get the card & its number
  const card = e.target.closest('.playcard')
  // proofcheck, just in case
  if (!card) {
    return
  }
  const number = +card.dataset.number

  // if card already hit, do nothing
  if (number <= game.lastNumber) {
    return
  }

  if (game.lastNumber + 1 === number) {
    // if we hit
    card.classList.add('hit')
    game.lastNumber += 1
	if (game.lastNumber === game.width * game.height){
	  game.timeFinished = Date.now()
	  let timePassedMs = game.timeFinished - game.timeStarted
	  let timePassedStr = convertMsToMinutesSeconds(timePassedMs)
	  let record = new Record(game.timeFinished, timePassedMs, timePassedStr)
	  records.push(record)
	  alert('Congratulations! Your time: ' + timePassedStr)
	  game.playing = false
	}
  } else {
    // if we miss
    card.classList.add('miss')
    setTimeout(() => {
      card.classList.remove('miss')
    }, 1000)
  }
}

// function to read and update width and height
function updateDimensions() {
  const width = +widthInput.value
  const height = +heightInput.value

  // update gameState
  game.width = width
  game.height = height

  // display new
  widthDisplay.textContent = width
  heightDisplay.textContent = height
}

// display or hide rules
function toggleRules() {
  rulesModal.classList.toggle('active')
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0')
}

function convertMsToMinutesSeconds(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.round((milliseconds % 60000) / 1000)
  const milliseconds_left = milliseconds % 1000

  return minutes + ' minutes, ' + seconds + ' seconds, ' + milliseconds_left + ' milliseconds'
}

playfield.addEventListener('click', handlePlayfieldClick)
widthInput.addEventListener('change', updateDimensions)
heightInput.addEventListener('change', updateDimensions)
updateDimensions() // initial dimensions
startButton.addEventListener('click', startGame)
rulesButton.addEventListener('click', toggleRules)
rulesOkButton.addEventListener('click', toggleRules)
