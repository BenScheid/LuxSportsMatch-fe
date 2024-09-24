document.addEventListener("DOMContentLoaded", function () {
    const fetchDataButton = document.getElementById("fetchDataButton");
    fetchDataButton.addEventListener("click", function () {
        let dropDown = document.getElementById("difficulties");
        let difficultyValue = dropDown.value;
        let sizeValue = null;
        let radio = document.querySelectorAll('input[name="board_size"]');
        radio.forEach((radios) => {
            if (radios.checked) {
                sizeValue = radios.value;
            }
        });
        if (sizeValue === null) {
            document.getElementById('errorMessageBox').textContent = 'Please select a board size!';
            return;
        }

        const requestBody = {
            boardWidth: +sizeValue,
            boardHeight: +sizeValue,
            difficulty: +difficultyValue
        };

        fetch('http://api.lsm.scheid.click:8081/game/create', {
            mode: "cors",
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            const gId = data.gameId;
            sessionStorage.setItem('gameId', String(gId));
            const getCardURL = `http://api.lsm.scheid.click:8081/game/getCards?id=${sessionStorage.getItem('gameId')}`;

            return fetch(getCardURL, {
                mode: "cors",
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {          
            sessionStorage.setItem('gameId', data.gameId);
            sessionStorage.setItem('width', data.width);
            sessionStorage.setItem('height', data.height);
            sessionStorage.setItem('difficulty', data.difficulty);
            sessionStorage.setItem('score', data.score);
            sessionStorage.setItem('isActive', data.active);
            sessionStorage.setItem('cards', JSON.stringify(data.responseCard));

            if (requestBody.boardHeight === 4) {
                window.location.replace('memory_game_4x4.html');
            } else {
               window.location.replace('memory_game_4x4.html');
            }
        })
        .catch(error => {
            console.error('Error while fetching ID or cards:', error);
        });
    });
    
});
