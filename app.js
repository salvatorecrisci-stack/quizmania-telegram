let currentQuestion = 0;
let score = 0;
let timeLeft = 20;
let timerInterval;
let questions = [];
let userAnswers = [];

function safeGetUserId() {
    try {
        if (typeof getUserId !== 'undefined') {
            return getUserId();
        }
    } catch(e) {}
    return 'user_' + Date.now();
}

function safeGetUserName() {
    try {
        if (typeof getUserName !== 'undefined') {
            return getUserName();
        }
    } catch(e) {}
    return 'Giocatore';
}

let userStats = {
    id: safeGetUserId(),
    name: safeGetUserName(),
    streak: 0,
    stars: 100,
    totalGames: 0,
    totalScore: 0,
    bestStreak: 0,
    lastPlayedDate: null
};

window.addEventListener('DOMContentLoaded', function() {
    console.log('App caricata!');
    loadUserData();
    loadQuestions();
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
    try { hideBackButton(); } catch(e) {}
    updateStatsDisplay();
}

function loadUserData() {
    const saved = localStorage.getItem('quizmania_user_' + userStats.id);
    if (saved) {
        userStats = JSON.parse(saved);
        checkStreak();
    }
    updateStatsDisplay();
}

function saveUserData() {
    localStorage.setItem('quizmania_user_' + userStats.id, JSON.stringify(userStats));
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

function loadQuestions() {
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
        alert('Hai già giocato oggi! Torna domani per un nuovo quiz 😊');
        return;
    }
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    try { vibrate('medium'); } catch(e) {}
    showScreen('quiz-screen');
    try { showBackButton(backHome); } catch(e) {}
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
    userAnswers.push({ questionIndex: currentQuestion, userAnswer: answerIndex, correct: isCorrect });
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === question.correct) {
            btn.classList.add('correct');
        } else if (idx === answerIndex && !isCorrect) {
            btn.classList.add('wrong');
        }
    });
    try { vibrate(isCorrect ? 'heavy' : 'medium'); } catch(e) {}
    if (isCorrect) score++;
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
    userStats.streak++;
    userStats.lastPlayedDate = new Date().toDateString();
    if (userStats.streak > userStats.bestStreak) {
        userStats.bestStreak = userStats.streak;
    }
    saveUserData();
    showResults();
}

function showResults() {
    showScreen('result-screen');
    let emoji, title;
    if (score >= 9) {
        emoji = '🏆';
        title = 'PERFETTO!';
    } else if (score >= 7) {
        emoji = '🎉';
        title = 'Ottimo!';
    } else if (score >= 5) {
        emoji = '👍';
        title = 'Bene!';
    } else {
        emoji = '💪';
        title = 'Riprova!';
    }
    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('final-score').textContent = score;
    const starsEarned = score * 10;
    document.getElementById('stars-earned').textContent = '+' + starsEarned + '⭐';
    document.getElementById('streak-result').textContent = '🔥 ' + userStats.streak;
    const rank = Math.floor(Math.random() * 1000) + 1;
    document.getElementById('global-rank').textContent = '#' + rank;
    try { vibrate('heavy'); } catch(e) {}
}

function use5050() {
    if (userStats.stars < 100) {
        alert('Non hai abbastanza Stars! (Servono 100⭐)');
        return;
    }
    userStats.stars -= 100;
    saveUserData();
    updateStatsDisplay();
    const question = questions[currentQuestion];
    const buttons = document.querySelectorAll('.answer-btn');
    let wrongAnswers = [];
    buttons.forEach((btn, idx) => {
        if (idx !== question.correct) wrongAnswers.push(idx);
    });
    shuffleArray(wrongAnswers);
    for (let i = 0; i < 2; i++) {
        buttons[wrongAnswers[i]].style.display = 'none';
    }
    document.getElementById('btn-5050').disabled = true;
    document.getElementById('btn-5050').classList.add('disabled');
    alert('50/50 usato! ⚡');
}

function useExtraTime() {
    if (userStats.stars < 150) {
        alert('Non hai abbastanza Stars! (Servono 150⭐)');
        return;
    }
    userStats.stars -= 150;
    saveUserData();
    updateStatsDisplay();
    timeLeft += 10;
    updateTimerDisplay();
    document.getElementById('btn-time').disabled = true;
    document.getElementById('btn-time').classList.add('disabled');
    alert('+10 secondi! ⏰');
}

function shareResult() {
    try {
        shareToTelegram(score, questions.length);
    } catch(e) {
        alert('Condividi il tuo risultato: ' + score + '/10!');
    }
}

function challengeFriend() {
    if (userStats.totalGames === 0) {
        alert('Gioca almeno un quiz prima di sfidare gli amici!');
        return;
    }
    try {
        challengeFriendTelegram(score);
    } catch(e) {
        alert('Sfida i tuoi amici!');
    }
}

function showLeaderboard() {
    showScreen('leaderboard-screen');
    try { showBackButton(backHome); } catch(e) {}
    loadLeaderboard('today');
}

function showLeaderboardPeriod(period) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    loadLeaderboard(period);
}

function loadLeaderboard(period) {
    const mockLeaderboard = generateMockLeaderboard();
    const listEl = document.getElementById('leaderboard-list');
    listEl.innerHTML = '';
    mockLeaderboard.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        item.innerHTML = `
            <div class="rank-badge ${rankClass}">${index + 1}</div>
            <div class="leader-info">
                <div class="leader-name">${player.name}</div>
                <div class="leader-score">${player.games} quiz giocati</div>
            </div>
            <div class="leader-points">${player.score} pts</div>
        `;
        listEl.appendChild(item);
    });
    showUserPosition();
}

function generateMockLeaderboard() {
    const names = ['Marco', 'Giulia', 'Luca', 'Sara', 'Andrea', 'Elena', 'Paolo', 'Chiara'];
    const leaderboard = [];
    for (let i = 0; i < 20; i++) {
        leaderboard.push({
            name: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100),
            score: Math.floor(Math.random() * 100) + (20 - i) * 10,
            games: Math.floor(Math.random() * 50) + 10
        });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    return leaderboard;
}

function showUserPosition() {
    const userPosEl = document.getElementById('user-position');
    const userRank = Math.floor(Math.random() * 100) + 1;
    userPosEl.innerHTML = `
        <div class="rank-badge">#${userRank}</div>
        <div class="leader-info">
            <div class="leader-name">${userStats.name} (Tu)</div>
            <div class="leader-score">${userStats.totalGames} quiz giocati</div>
        </div>
        <div class="leader-points">${userStats.totalScore} pts</div>
    `;
}

function showProfile() {
    showScreen('profile-screen');
    try { showBackButton(backHome); } catch(e) {}
    loadProfile();
}

function loadProfile() {
    document.getElementById('user-name').textContent = userStats.name;
    document.getElementById('total-games').textContent = userStats.totalGames;
    const avgScore = userStats.totalGames > 0 ? (userStats.totalScore / userStats.totalGames).toFixed(1) : 0;
    document.getElementById('avg-score').textContent = avgScore;
    document.getElementById('best-streak').textContent = userStats.bestStreak;
    loadAchievements();
}

function loadAchievements() {
    const achievements = [
        { icon: '🎯', name: 'Primo Quiz', unlocked: userStats.totalGames >= 1 },
        { icon: '🔥', name: 'Streak 3', unlocked: userStats.bestStreak >= 3 },
        { icon: '🔥🔥', name: 'Streak 7', unlocked: userStats.bestStreak >= 7 },
        { icon: '💯', name: 'Quiz Perfetto', unlocked: userStats.totalScore >= 10 },
        { icon: '⭐', name: 'Veterano', unlocked: userStats.totalGames >= 10 },
        { icon: '👑', name: 'Maestro', unlocked: userStats.totalGames >= 30 }
    ];
    const listEl = document.getElementById('achievements-list');
    listEl.innerHTML = '';
    achievements.forEach(ach => {
        const card = document.createElement('div');
        card.className = 'achievement-card' + (ach.unlocked ? '' : ' locked');
        card.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-name">${ach.name}</div>
        `;
        listEl.appendChild(card);
    });
}

console.log('App.js caricato!');
