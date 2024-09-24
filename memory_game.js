document.addEventListener('DOMContentLoaded', function() {
    
    document.getElementById('settingsButton').addEventListener('click', function(){
        window.location.replace('settings_page.html');
    });
    
    const apiUrl = 'http://api.lsm.scheid.click:8081/game/checkCard';
    let cardsData = JSON.parse(sessionStorage.getItem('cards'));
    let gameId = sessionStorage.getItem('gameId');

    if (!cardsData) {
        console.error('No cards data found in sessionStorage.');
        return;
    }

    if (!gameId) {
        console.error('No game ID found in sessionStorage.');
        return;
    }

    const cards = document.querySelectorAll('.card');
    let flippedCards = [];

    let startTime;
    let timerInterval;

    function startGame() {
        initializeCards();
        setupEventListeners();
        startTimer();
    }

    function initializeCards() {
        cards.forEach((card, index) => {
            if (cardsData[index]) {
                card.setAttribute('data-framework', cardsData[index].fieldId);
                card.id = index;  
                const infoElement = card.querySelector('.info');
                if (infoElement) {
                    infoElement.textContent = cardsData[index].fieldId;
                }
            } else {
                console.error(`No card data found for index ${index}`);
            }
        });
    }

    function setupEventListeners() {
        cards.forEach(card => {
            card.addEventListener('click', () => {
                flipCard(card);
            });
        });
    }

    function flipCard(card) {
        if (!canFlipCard(card)) return;
    
        card.classList.add('flipped');
        flippedCards.push(card);
    
        if (flippedCards.length === 2) {
            isProcessing = true;
            const index1 = parseInt(flippedCards[0].id, 10);
            const index2 = parseInt(flippedCards[1].id, 10);
    
            if (isNaN(index1) || isNaN(index2)) {
                console.error('Invalid card indices:', index1, index2);
                flippedCards = [];
                isProcessing = false;
                return;
            }
    
            const payload = { gameId, index1, index2 };
    
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                const { addedPoints, totalScore, isFinished, cardsMatch } = data;
    
                updateScore(totalScore, addedPoints);
    
                if (cardsMatch) {
                    flippedCards.forEach(card => {
                        card.removeEventListener('click', () => {});
                    });
                } else {
                    setTimeout(() => {
                        flippedCards.forEach(card => card.classList.remove('flipped'));
                        flippedCards = [];
                        isProcessing = false; 
                    }, 1500); 
                    return;  
                }
    
                flippedCards = [];
                isProcessing = false;
    
                if (isFinished) {
                    stopTimer();
                    displayPopupWithTime();
                }
            })
            .catch(error => {
                console.error('Error checking cards:', error.message);
                flippedCards.forEach(card => card.classList.remove('flipped'));
                flippedCards = [];
                isProcessing = false;
            });
        }
    }
    

    function canFlipCard(card) {
        return flippedCards.length < 2 && !card.classList.contains('flipped');
    }

    function updateScore(totalScore, addedPoints) {
        const totalScoreElement = document.querySelector('.totalScore');
        const pointsGainedElement = document.querySelector('.pointsGained');

        if (totalScoreElement) {
            totalScoreElement.textContent = `Total Score: ${totalScore}`;
        }

        if (pointsGainedElement) {
            pointsGainedElement.textContent = `Points gained: ${addedPoints}`;
        }
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const timerElement = document.querySelector('.timer');
        if (timerElement) {
            const min = Math.floor(elapsedTime / 60);
            const sec = elapsedTime % 60;
            timerElement.textContent = `Time: ${min} min ${sec} sec`;
        }
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function displayPopupWithTime() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        alert(`Congratulations! You finished the game in ${Math.floor(elapsedTime / 60)} minutes ${elapsedTime & 60} seconds.`);
    }

    startGame();
});