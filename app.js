let currentQuestion = 0;
let score = 0;
let timeLeft = 20;
let timerInterval;
let questions = [];
let userAnswers = [];
let quizStartTime;

let userStats = {
    id: getUserId(),
    name: getUserName(),
    streak: 0,
    stars: 100,
    totalGames: 0,
    totalScore: 0,
    bestStreak: 0,
    lastPlayedDate: null,
    achievements: []
};

window.addEventListener('DOMContentLoaded', function() {
    console.log('App caricata!');
    loadUserData();
    loadQuestions();
    setupEventListeners();
    updateCurrentDate();
    setTimeout(() => {
        hideScreen('loading-screen');
        showScreen('home-screen');
    }, 1000);
});

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('it-IT', options);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function hideScreen(screenId) {
    document.getElementById(screenId).classList.remove('active');
}

function backHome() {
    showScreen('home-screen');
    hideBackButton();
    updateStatsDisplay();
}

function loadUserData() {
    const saved = localStorage.getItem('quizmania_user_' + getUserId());
    if (saved) {
        userStats = JSON.parse(saved);
        checkStreak();
    }
    updateStatsDisplay();
}

function saveUserData() {
    localStorage.setItem('quizmania_user_' + getUserId(), JSON.stringify(userStats));
}

function checkStreak() {
    const today = new Date().toDateString();
    const lastPlayed = userStats.lastPlayedDate;
    if (!lastPlayed) {
        userStats.streak = 0;
    } else {
        const lastDate = new Date(lastPlayed);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() !== yesterday.toDateString() && lastDate.toDateString() !== today) {
            userStats.streak = 0;
        }
    }
}

function updateStatsDisplay() {
    document.getElementById('user-streak').textContent = userStats.streak;
    document.getElementById('user-stars').textContent = userStats.stars;
    const rank = Math.max(1, Math.floor(Math.random() * 1000));
    document.getElementById('user-rank').textContent = '#' + rank;
}

async function loadQuestions() {
    questions = [
        { question: "Qual è la capitale d'Italia?", answers: ["Milano", "Roma", "Napoli", "Firenze"], correct: 1, category: "Geografia" },
        { question: "Chi ha scritto 'La Divina Commedia'?", answers: ["Petrarca", "Boccaccio", "Dante Alighieri", "Ariosto"], correct: 2, category: "Letteratura" },
        { question: "Quanti sono i pianeti del sistema solare?", answers: ["7", "8", "9", "10"], correct: 1, category: "Scienza" },
        { question: "In che anno è caduto il Muro di Berlino?", answers: ["1987", "1989", "1991", "1990"], correct: 1, category: "Storia" },
        { question: "Quale squadra ha vinto più scudetti in Serie A?", answers: ["Inter", "Milan", "Juventus", "Roma"], correct: 2, category: "Sport" },
        { question: "Quale elemento chimico ha simbolo 'Au'?", answers: ["Argento", "Oro", "Rame", "Alluminio"], correct: 1, category: "Scienza" },
        { question: "Chi ha dipinto la 'Monna Lisa'?", answers: ["Michelangelo", "Raffaello", "Leonardo da Vinci", "Caravaggio"], correct: 2, category: "Arte" },
        { question: "Qual è l'oceano più grande?", answers: ["Atlantico", "Indiano", "Artico", "Pacifico"], correct: 3, category: "Geografia" },
        { question: "Quanti sono i continenti?", answers: ["5", "6", "7", "8"], correct: 2, category: "Geografia" },
        { question: "In che anno è iniziata la Prima Guerra Mondiale?", answers: ["1912", "1914", "1916", "1918"], correct: 1, category: "Storia" }
    ];
    shuffleArray(questions);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startQuiz() {
    const today = new Date().toDateString();
    if (userStats.lastPlayedDate === today) {
        showAlert('Hai già giocato oggi! Torna domani per un nuovo quiz 😊');
        return;
    }
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    quizStartTime = Date.now();
    vibrate('medium');
    showScreen('quiz-screen');
    showBackButton(backHome);
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        endQuiz();
        return;
    }
    const question = questions[currentQuestion];
    document.getElementById('current-question').textContent = currentQuestion + 1;
    document.getElementById('question-category').textContent = question.category;
    document.getElementById('question-text').textContent = question.question;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(index);
        answersContainer.appendChild(btn);
    });
    timeLeft = 20;
    updateTimerDisplay();
}

function selectAnswer(answerIndex) {
    clearInterval(timerInterval);
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    userAnswers.push({
        questionIndex: currentQuestion,
        userAnswer: answerIndex,
        correct: isCorrect,
        timeSpent: 20 - timeLeft
    });
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correct) {
            btn.classList.add('correct');
        } else if (idx === answerIndex && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    vibrate(isCorrect ? 'heavy' : 'medium');
    if (isCorrect) {
        score++;
    }
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
            startTimer();
        } else {
            endQuiz();
        }
    }, 1500);
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 20;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            selectAnswer(-1);
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timer-value').textContent = timeLeft;
    const timerEl = document.querySelector('.timer');
    if (timeLeft <= 5) {
        timerEl.style.color = '#FF7675';
    } else if (timeLeft <= 10) {
        timerEl.style.color = '#FDCB6E';
    } else {
        timerEl.style.color = '#FDCB6E';
    }
}

function endQuiz() {
    clearInterval(timerInterval);
    const starsEarned = score * 10;
    userStats.stars += starsEarned;
    userStats.totalGames++;
    userStats.totalScore += score;
    userStats.streak
