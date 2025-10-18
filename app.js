// Stato dell'app
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 20;
let timerInterval;
let userAnswers = [];
let quizStartTime;

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    console.log('App inizializzata');
    hideLoading();
    loadUserData();
    showScreen('homeScreen');
});

// Gestione schermate
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function showLoading() {
    document.getElementById('loadingScreen').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingScreen').classList.remove('active');
}

// Carica dati utente
function loadUserData() {
    try {
        const userId = getUserId();
        const savedData = localStorage.getItem('quizmania_' + userId);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('userScore').textContent = data.totalScore || 0;
            document.getElementById('userStreak').textContent = data.streak || 0;
        }
    } catch (e) {
        console.log('Nessun dato salvato');
    }
}

// Salva dati utente
function saveUserData(newScore) {
    try {
        const userId = getUserId();
        let data = { totalScore: 0, streak: 0, lastPlayed: null };
        
        const savedData = localStorage.getItem('quizmania_' + userId);
        if (savedData) {
            data = JSON.parse(savedData);
        }
        
        data.totalScore = (data.totalScore || 0) + newScore;
        
        const today = new Date().toDateString();
        if (data.lastPlayed === today) {
            // Già giocato oggi
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (data.lastPlayed === yesterday.toDateString()) {
                data.streak = (data.streak || 0) + 1;
            } else {
                data.streak = 1;
            }
        }
        
        data.lastPlayed = today;
        localStorage.setItem('quizmania_' + userId, JSON.stringify(data));
        
        loadUserData();
    } catch (e) {
        console.log('Errore salvataggio:', e);
    }
}

// Inizia quiz
function startQuiz() {
    showLoading();
    
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    quizStartTime = Date.now();
    
    setTimeout(() => {
        hideLoading();
        showScreen('quizScreen');
        loadQuestion();
    }, 500);
}

// Carica domanda
function loadQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
        showResults();
        return;
    }
    
    const question = quizQuestions[currentQuestionIndex];
    
    // Aggiorna UI
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    
    // Progress bar
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Carica opzioni
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        container.appendChild(button);
    });
    
    // Reset timer
    timeLeft = 20;
    updateTimer();
    startTimer();
}

// Timer
function startTimer() {
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            selectAnswer(-1); // Timeout
        }
    }, 1000);
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeLeft;
    
    if (timeLeft <= 5) {
        timerElement.style.color = '#e74c3c';
    } else {
        timerElement.style.color = '#2ecc71';
    }
}

// Seleziona risposta
function selectAnswer(answerIndex) {
    clearInterval(timerInterval);
    
    const question = quizQuestions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.option-btn');
    
    // Disabilita tutti i bottoni
    buttons.forEach(btn => btn.disabled = true);
    
    // Mostra risposta corretta
    buttons[question.correct].classList.add('correct');
    
    if (answerIndex === question.correct) {
        score++;
        vibrate('medium');
    } else if (answerIndex !== -1) {
        buttons[answerIndex].classList.add('wrong');
        vibrate('heavy');
    }
    
    userAnswers.push({
        question: question.question,
        userAnswer: answerIndex,
        correctAnswer: question.correct,
        isCorrect: answerIndex === question.correct
    });
    
    // Prossima domanda dopo 1.5 secondi
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1500);
}

// Mostra risultati
function showResults() {
    showLoading();
    
    setTimeout(() => {
        const percentage = (score / quizQuestions.length) * 100;
        
        document.getElementById('finalScore').textContent = score + '/' + quizQuestions.length;
        document.getElementById('correctAnswers').textContent = score;
        document.getElementById('totalPoints').textContent = score * 10;
        
        let message = '';
        if (percentage === 100) {
            message = '🌟 Perfetto! Sei un genio!';
        } else if (percentage >= 80) {
            message = '🎉 Eccellente lavoro!';
        } else if (percentage >= 60) {
            message = '👍 Buon risultato!';
        } else if (percentage >= 40) {
            message = '💪 Puoi fare meglio!';
        } else {
            message = '📚 Continua ad allenarti!';
        }
        
        document.getElementById('scoreMessage').textContent = message;
        
        saveUserData(score * 10);
        saveToLeaderboard(score);
        
        hideLoading();
        showScreen('resultsScreen');
    }, 500);
}

// Leaderboard
function saveToLeaderboard(userScore) {
    try {
        const userName = getUserName();
        const userId = getUserId();
        
        let leaderboard = JSON.parse(localStorage.getItem('quizmania_leaderboard') || '[]');
        
        leaderboard.push({
            name: userName,
            id: userId,
            score: userScore,
            date: new Date().toISOString()
        });
        
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 100);
        
        localStorage.setItem('quizmania_leaderboard', JSON.stringify(leaderboard));
    } catch (e) {
        console.log('Errore salvataggio classifica:', e);
    }
}

function showLeaderboard() {
    showLoading();
    
    setTimeout(() => {
        const leaderboard = JSON.parse(localStorage.getItem('quizmania_leaderboard') || '[]');
        const container = document.getElementById('leaderboardList');
        container.innerHTML = '';
        
        if (leaderboard.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nessun punteggio ancora!</p>';
        } else {
            leaderboard.slice(0, 50).forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                else medal = `#${index + 1}`;
                
                item.innerHTML = `
                    <span class="rank">${medal}</span>
                    <span class="player-name">${entry.name}</span>
                    <span class="player-score">${entry.score}/10</span>
                `;
                
                container.appendChild(item);
            });
        }
        
        hideLoading();
        showScreen('leaderboardScreen');
    }, 500);
}

// Condividi
function shareScore() {
    shareToTelegram(score, quizQuestions.length);
}

// Torna home
function goHome() {
    showScreen('homeScreen');
    loadUserData();
}

console.log('App.js caricato correttamente');
