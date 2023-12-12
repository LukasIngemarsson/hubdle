/** LEADERBOARD INIT */
const leaderboardContainer = document.getElementById('leaderboard-container')

$.ajax({
    url: '//localhost:3000/php/leaderboard.php',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
        let columnTitles = document.createElement('div')
        columnTitles.className = 'leaderboard-container__item'
        columnTitles.innerHTML = 'RANK - USERNAME - WINS'
        columnTitles.style.fontWeight = 'bold'
        leaderboardContainer.appendChild(columnTitles)
        for (let i = 0; i < data.length; i++) {
            const user = data[i];
            let item = document.createElement('div')
            item.className = 'leaderboard-container__item'
            item.innerHTML = user.rank + ' - ' + user.username + ' - ' + user.wins
            leaderboardContainer.appendChild(item)
        }
    }
})