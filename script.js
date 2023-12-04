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
  gridContainer.appendChild(game)
}
