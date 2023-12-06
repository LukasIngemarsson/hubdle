/** GENERAL */
class Player {
  constructor(name) {
    this.name = name;
    this.completionCount = 0;
  }
}

/** GRID INIT */
const gridContainer = document.getElementsByClassName("grid-container")[0]
let gameNames = ['wordle', 
                'ordel', 
                'contexto', 
                'connections',
                'worldle',
                'globle',
                ]
let gameHrefs = ['https://www.nytimes.com/games/wordle/index.html', 
                'https://ordel.se/',
                'https://contexto.me/', 
                'https://www.nytimes.com/games/connections',
                'https://worldle.teuteuf.fr/',
                'https://globle-game.com/',
                ]
for (let i = 0; i < gameNames.length; i++){
  let game = document.createElement('a')
  game.className = 'grid-container__item'
  game.target = '_blank'
  game.href = gameHrefs[i]
  game.innerHTML = gameNames[i].toUpperCase()
  let checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.className = 'grid-container__item__checkbox'
  checkbox.addEventListener('click', () => {
    // increment completion count for player and update leaderboard
  });
  game.appendChild(checkbox)
  gridContainer.appendChild(game)
}

/** LEADERBOARD INIT */
const leaderboardContainer = document.getElementsByClassName('leaderboard-container')[0]
let title = document.createElement('h1')
title.innerHTML = 'LEADERBOARD'
title.className = 'leaderboard-container__title'
leaderboardContainer.appendChild(title)

/** TEXT INPUT INIT */
const textInput = document.getElementsByClassName('text-input')[0]
textInput.addEventListener('focus', () => {
  textInput.placeholder = ''
});
textInput.addEventListener('blur', () => {
  textInput.placeholder = 'Enter your name'
});
textInput.addEventListener('keydown', (event) => {
  console.log(event.code)
  if (event.code == 'Enter') {
    let text = textInput.value
    textInput.value = ''
    let entry = document.createElement('div')
    entry.className = 'leaderboard-container__item'
    entry.innerHTML = text
    document.getElementsByClassName('leaderboard-container')[0].appendChild(entry)
    textInput.blur()
    textInput.disabled = true
    textInput.style.visibility = 'hidden'
  }
});