const leaderboardContainer = document.getElementById('leaderboard-container')
$.ajax({
    url: '//localhost:3000/php/leaderboard.php',
    method: 'GET',
    dataType: 'json',
    success: function (data) {
        table = document.createElement('table');
        table.className = 'leaderboard-container__table';
        columnTitles = ['Rank', 'Username', 'Wins'];
        row = document.createElement('tr');
        for (let i = 0; i < columnTitles.length; i++) {
            let item = document.createElement('th');
            item.innerHTML = columnTitles[i];
            row.appendChild(item);
        }
        table.appendChild(row);

        for (let i = 0; i < data.length; i++) {
            row = document.createElement('tr');
            for (let j = 0; j < columnTitles.length; j++) {
                let item = document.createElement('td');
                if (j == 0) {
                    item.innerHTML = i + 1; // rank
                }
                else {
                    item.innerHTML = data[i][columnTitles[j].toLowerCase()];
                }
                row.appendChild(item);
            }
            table.appendChild(row);
        }
        leaderboardContainer.appendChild(table);
    }
})