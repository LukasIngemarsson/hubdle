const gridContainer = document.getElementById('grid-container')
let gameNames = ['wordle', 
                'ordel', 
                'contexto', 
                'connections',
                'worldle',
                'globle',
                'wordless',
                'tetris',
                'nerdle',
                ]
let gameHrefs = ['https://www.nytimes.com/games/wordle/index.html', 
                'https://ordel.se/',
                'https://contexto.me/', 
                'https://www.nytimes.com/games/connections',
                'https://worldle.teuteuf.fr/',
                'https://globle-game.com/',
                'https://lessgames.com/wordless/',
                'https://tetris.com/play-tetris',
                'https://nerdlegame.com/',
                ]

for (let i = 0; i < gameNames.length; i++) {
  let game = document.createElement('a');
  game.className = 'button';
  game.target = '_blank';
  game.href = gameHrefs[i];
  game.innerHTML = gameNames[i].toUpperCase();
  let checkboxForm = document.createElement('form');
  checkboxForm.action = '../php/home.php';
  checkboxForm.method = 'post';
  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'button__checkbox';
  checkbox.addEventListener('click', (event) => {
    event.target.checked = true;
  });
  checkbox.addEventListener('change', () => {
    checkboxForm.submit();
  });
  checkboxForm.appendChild(checkbox);
  game.appendChild(checkboxForm);
  gridContainer.appendChild(game);
}